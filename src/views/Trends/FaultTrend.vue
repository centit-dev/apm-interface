<script lang="ts">
interface Props {
  snapshotId: string
  granularity?: number
}

interface ChartDataItem {
  time: Date
  value: number
  type: string
}
</script>

<script setup lang="ts">
import { TraceApi, type SpanSubSnapshotRequest, type TimeWindow } from '@/api'
import { configuration } from '@/utils/http'
import { MonitorOutlined, ProfileOutlined, ZoomInOutlined } from '@ant-design/icons-vue'
import { Chart, MASK_CLASS_NAME } from '@antv/g2'
import { from, useSubscription } from '@vueuse/rxjs'
import { theme } from 'ant-design-vue'
import { addSeconds, isAfter, isBefore } from 'date-fns'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { filter, finalize } from 'rxjs/operators'
import { computed, onActivated, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'showDiagnosis', data: SpanSubSnapshotRequest): void
  (e: 'goToDetail', data: SpanSubSnapshotRequest): void
}>()

const chartElement = ref<HTMLDivElement>()
const showAction = ref(false)
const actionPositionLeft = ref(0)
const filteredDateRange = ref<TimeWindow>()
const filteredChartData = ref<ChartDataItem[]>([])

const traceApi = new TraceApi(configuration)
const { data, loading, refresh } = useRequest(
  () => traceApi.getSpanFaultTrend(props.snapshotId, props.granularity),
  {
    debounceInterval: 100,
    refreshDeps: [() => props.snapshotId, () => props.granularity],
    refreshDepsAction() {
      refresh()
    }
  }
)
const { useToken } = theme
const { token } = useToken()

const chartData = computed(() => {
  if (!data.value) {
    return []
  }

  const { fromTime, granularity, values } = data.value.data.data

  const result: ChartDataItem[] = []
  let date = new Date(fromTime)

  values.forEach((value) => {
    date = addSeconds(date, granularity)

    result.push({
      time: date,
      value: value.systemFaultCount,
      type: '系统失败'
    })

    result.push({
      time: date,
      value: value.businessFaultCount,
      type: '业务失败'
    })

    result.push({
      time: date,
      value: value.successCount || 0,
      type: '成功'
    })
  })

  return result
})

const chart$ = new BehaviorSubject<Chart | undefined>(undefined)

const drawChart = (container: HTMLDivElement) => {
  const chart = new Chart({
    container,
    autoFit: true
  })

  chart
    .area()
    .data([])
    .transform([{ type: 'stackY' }])
    .axis({
      x: {
        title: false
      },
      y: {
        title: false
      }
    })
    .encode('x', 'time')
    .encode('y', 'value')
    .encode('color', 'type')
    .scale('color', {
      type: 'ordinal',
      range: ['#F5222D', '#FA8C16', '#52C41A']
    })
    .encode('shape', 'smooth')
    .interaction('brushXHighlight', true)
    .legend('color', {
      position: 'top',
      itemMarker: 'circle',
      itemLabelFontSize: 14
    })

  chart.on('brush:start', () => {
    chart.emit('tooltip:disable')

    showAction.value = false
  })

  chart.on('brush:end', (e) => {
    const { canvas } = chart.getContext()
    if (!canvas) {
      return
    }

    const [mask] = canvas.document.getElementsByClassName(MASK_CLASS_NAME)

    const bounds = mask.getBounds()

    const [minDate, maxDate] = e.data.selection[0]
    if (!minDate || !maxDate) {
      return
    }

    const filtered = chartData.value.filter((value) => {
      return (
        (isAfter(value.time, minDate) && isBefore(value.time, maxDate)) ||
        value.time.getTime() === minDate.getTime() ||
        value.time.getTime() === maxDate.getTime()
      )
    })

    showAction.value = true

    actionPositionLeft.value = bounds.max[0] + 10

    filteredDateRange.value = {
      fromTime: minDate.getTime(),
      toTime: maxDate.getTime()
    }
    filteredChartData.value = filtered
  })

  chart.on('brush:remove', () => {
    chart.emit('tooltip:enable')

    showAction.value = false
  })

  chart.on('plot:dblclick', () => {
    if (filteredChartData.value && filteredChartData.value.length > 0) {
      chart.changeData(chartData.value)

      filteredChartData.value = []
    }
  })

  chart.render()

  return chart
}

onActivated(() => {
  chart$.value?.forceFit()
})

useSubscription(
  combineLatest([
    from(chartElement, { immediate: true }).pipe(filter((element) => !!element)),
    from(chartData, { immediate: true })
  ])
    .pipe(
      finalize(() => {
        chart$.value?.destroy()
      })
    )
    .subscribe(([container, data]) => {
      if (data && data.length > 0) {
        if (container?.classList.contains('hide')) {
          container.classList.remove('hide')
        }

        setTimeout(() => {
          if (!chart$.value) {
            const chart = drawChart(container!)

            chart$.next(chart)
          }

          chart$.value?.changeData(data || [])
        }, 0)
      }
    })
)

function brushFilter() {
  chart$.value?.changeData(filteredChartData.value)

  showAction.value = false
}

function goToDetail() {
  emit('goToDetail', {
    timeWindow: filteredDateRange.value
  })
}

function showDiagnosis() {
  if (!filteredDateRange.value) {
    return
  }

  emit('showDiagnosis', {
    timeWindow: filteredDateRange.value
  })
}
</script>

<template>
  <div style="position: relative; width: 100%; height: 100%">
    <a-spin
      v-if="loading"
      size="large"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"
    />

    <div
      ref="chartElement"
      :class="{
        hide: chartData.length === 0
      }"
    ></div>

    <a-empty
      :class="{
        hide: chartData.length > 0
      }"
    />

    <div
      v-if="chartData.length > 0 && showAction"
      class="actions"
      :style="{
        left: actionPositionLeft + 'px'
      }"
    >
      <ZoomInOutlined @click="brushFilter" />

      <ProfileOutlined @click="goToDetail" />

      <MonitorOutlined @click="showDiagnosis" />
    </div>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  top: 50px;
}

.actions .anticon {
  cursor: pointer;
  font-size: 20px;
}
</style>
