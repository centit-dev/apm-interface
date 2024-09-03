<script lang="ts">
interface Props {
  snapshotId: string
  type?: 'cluster' | 'span'
  granularity?: number
  showLegend?: boolean
}

type ItemType = 'success' | 'businessFault' | 'systemFault'
interface ChartDataItem {
  time: Date
  duration: number
  value: number
  type: ItemType
}
</script>

<script setup lang="ts">
import {
  DefaultApi,
  TraceApi,
  type DurationRange,
  type GraphPointData,
  type SpanSubSnapshotRequest,
  type TimeWindow
} from '@/api'
import { format } from '@/utils/date'
import { configuration } from '@/utils/http'
import { MonitorOutlined, ProfileOutlined, ZoomInOutlined } from '@ant-design/icons-vue'
import { Chart, MASK_CLASS_NAME } from '@antv/g2'
import { from, useSubscription } from '@vueuse/rxjs'
import { addSeconds, isAfter, isBefore } from 'date-fns'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { filter, finalize } from 'rxjs/operators'
import { computed, onActivated, reactive, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = withDefaults(defineProps<Props>(), {
  type: 'span',
  showLegend: true,
  typeLegendPostion: 'left'
})
const emit = defineEmits<{
  (e: 'showDiagnosis', data: SpanSubSnapshotRequest): void
  (e: 'goToDetail', data: SpanSubSnapshotRequest): void
}>()

const chartElement = ref<HTMLDivElement>()
const showAction = ref(false)
const actionPosition = ref({ left: 0, top: 0 })
const filterByTypeData = reactive({
  success: true,
  businessFault: true,
  systemFault: true
})
const filteredChartData = ref<ChartDataItem[]>([])
const filteredDateRange = ref<TimeWindow>()
const filteredDurationRange = ref<DurationRange>()

const traceApi = new TraceApi(configuration)
const defaultApi = new DefaultApi(configuration)
const { data, loading, refresh } = useRequest(
  () => {
    if (props.type === 'span') {
      return traceApi.getSpanHeatmap(props.snapshotId, props.granularity)
    }

    return defaultApi.getClusterHeatmap(props.snapshotId, props.granularity)
  },
  {
    debounceInterval: 100,
    refreshDeps: [() => props.snapshotId, () => props.granularity],
    refreshDepsAction() {
      refresh()
    }
  }
)

const timeGranularity = computed(() => {
  return data.value?.data.data?.timeGranularity || 0
})

const durationGranularity = computed(() => {
  return data.value?.data.data?.durationGranularity || 0
})

const originalChartData = computed(() => {
  if (!data.value || !data.value.data || !data.value.data.data) {
    return []
  }

  const { fromTime, timeGranularity, durationGranularity, fromDuration, toDuration, values } =
    data.value.data.data

  if (!fromTime || !timeGranularity) {
    return []
  }

  const result: ChartDataItem[] = []
  const date = new Date(fromTime)

  const getValue = (
    value: GraphPointData
  ): {
    type: ItemType
    value: number
  } => {
    if (value.systemFaultCount > 0) {
      return {
        type: 'systemFault',
        value: value.systemFaultCount
      }
    }

    if (value.businessFaultCount > 0) {
      return {
        type: 'businessFault',
        value: value.businessFaultCount
      }
    }

    return {
      type: 'success',
      value: value.successCount || 0
    }
  }

  ;(values || []).forEach((collection, index) => {
    const time = addSeconds(date, timeGranularity * index)

    const subData = collection
      .map((value, i) => {
        const durationValue = fromDuration + durationGranularity * i

        const duration = durationValue > toDuration ? toDuration : durationValue

        return {
          time,
          duration,
          ...getValue(value)
        }
      })
      .reverse()

    result.push(...subData)
  })

  return result
})

const chartData = computed(() => {
  return originalChartData.value.filter((item) => {
    if (filterByTypeData.success && item.type === 'success') {
      return true
    }

    if (filterByTypeData.businessFault && item.type === 'businessFault') {
      return true
    }

    if (filterByTypeData.systemFault && item.type === 'systemFault') {
      return true
    }

    return false
  })
})

const chart$ = new BehaviorSubject<Chart | undefined>(undefined)

onActivated(() => {
  chart$.value?.forceFit()
})

const drawChart = (container: HTMLDivElement) => {
  const chart = new Chart({
    container,
    autoFit: true
  })

  chart
    .cell()
    .data([])
    .axis({
      x: {
        title: false,
        labelFormatter: (value: Date) => {
          return value.toLocaleTimeString()
        },
        tickFilter: (value: Date, index: number) => {
          return index % 5 === 0
        }
      },
      y: {
        title: false
      }
    })
    .encode('x', 'time')
    .encode('y', 'duration')
    .encode('color', 'value')
    .style('inset', 0.5)
    .tooltip({
      title: (data) => {
        if (data.type === 'businessFault') {
          return '业务失败'
        }

        if (data.type === 'systemFault') {
          return '系统失败'
        }

        return '成功'
      }
    })
    .tooltip({
      name: '时延',
      channel: 'y',
      valueFormatter: (value: number) => {
        return `${value}ms - ${value + durationGranularity.value}ms`
      }
    })
    .tooltip({
      name: '请求数',
      channel: 'color'
    })
    .tooltip({
      name: '时间',
      channel: 'x',
      valueFormatter: (value: Date) => {
        return format(value)
      }
    })
    .style('fill', (data: ChartDataItem) => {
      if (data.type === 'businessFault') {
        return '#000000'
      }

      if (data.type === 'systemFault') {
        return '#D4001A'
      }
    })
    .style('fillOpacity', 1)
    .scale('color', {
      palette: 'gnBu',
      relations: [[0, '#fff']]
    })

    .interaction('brushHighlight', true)

  // if (props.showLegend) {
  //   chart.legend('color', {
  //     title: '请求数',
  //     position: 'right',
  //     block: true,
  //     layout: {
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       flexDirection: 'column'
  //     }
  //   })
  // } else {
  //   chart.legend(false)
  // }

  chart.legend(false)

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

    const xRange = e.data.selection[0]
    const yRange = e.data.selection[1]

    const minDate = xRange[0]
    const maxDate = xRange[xRange.length - 1]

    const minDuration = yRange[yRange.length - 1]
    const maxDuration = yRange[0]

    const filtered = chartData.value.filter((value) => {
      return (
        (isAfter(value.time, minDate) || value.time.getTime() === minDate.getTime()) &&
        (isBefore(value.time, maxDate) || value.time.getTime() === maxDate.getTime()) &&
        value.duration >= minDuration &&
        value.duration <= maxDuration
      )
    })

    showAction.value = true

    actionPosition.value = {
      left: bounds.max[0] + 10,
      top: bounds.min[1]
    }

    filteredChartData.value = filtered

    filteredDurationRange.value = {
      min: minDuration,
      max: maxDuration + durationGranularity.value
    }

    filteredDateRange.value = {
      fromTime: minDate.getTime(),
      toTime: addSeconds(maxDate, timeGranularity.value).getTime()
    }
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

useSubscription(
  combineLatest([
    from(chartElement, { immediate: true }).pipe(filter((element) => !!element)),
    from(originalChartData, { immediate: true })
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
    timeWindow: filteredDateRange.value,
    durationInterval: filteredDurationRange.value
  })
}

function showDiagnosis() {
  if (!filteredDateRange.value) {
    return
  }

  emit('showDiagnosis', {
    timeWindow: filteredDateRange.value,
    durationInterval: filteredDurationRange.value
  })
}

function toggleByType(type: ItemType) {
  filterByTypeData[type] = !filterByTypeData[type]

  chart$.value?.changeData(chartData.value)
}
</script>

<template>
  <div class="container" style="min-height: 200px; position: relative">
    <a-spin
      v-if="loading"
      size="large"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 99"
    />

    <div
      class="chart-container"
      :class="{
        hide: originalChartData.length === 0
      }"
    >
      <div class="legend">
        <div
          class="legend-item"
          @click="toggleByType('success')"
          :class="{
            'legend-item-disabled': !filterByTypeData.success
          }"
        >
          <span class="marker" style="background-color: #02b7b7"></span>

          <span class="label">成功</span>
        </div>

        <div
          class="legend-item"
          @click="toggleByType('businessFault')"
          :class="{
            'legend-item-disabled': !filterByTypeData.businessFault
          }"
        >
          <span class="marker" style="background-color: #000000"></span>

          <span class="label">业务失败</span>
        </div>

        <div
          class="legend-item"
          @click="toggleByType('systemFault')"
          :class="{
            'legend-item-disabled': !filterByTypeData.systemFault
          }"
        >
          <span class="marker" style="background-color: #d4001a"></span>

          <span class="label">系统失败</span>
        </div>
      </div>

      <div ref="chartElement" style="flex-grow: 1"></div>
    </div>

    <a-empty
      :class="{
        hide: originalChartData.length > 0
      }"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"
    />

    <div
      v-if="showAction"
      class="actions"
      :style="{
        top: actionPosition.top + 'px',
        left: actionPosition.left + 'px'
      }"
    >
      <ZoomInOutlined @click="brushFilter" />

      <ProfileOutlined @click="goToDetail" />

      <MonitorOutlined @click="showDiagnosis" />
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
}

.chart-container {
  display: flex;
  width: 100%;
  min-height: 400px;
  height: auto;
  flex-direction: column-reverse;
}

.legend {
  display: flex;
  gap: 5px;
  cursor: pointer;
  justify-content: center;
  gap: 10px;
  position: relative;
}

.legend-item-disabled {
  opacity: 0.5;
}

.marker {
  border-radius: 100%;
  width: 12px;
  height: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

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
