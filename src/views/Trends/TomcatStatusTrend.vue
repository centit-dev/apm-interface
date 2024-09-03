<script lang="ts">
import { DefaultApi, type TimeRange } from '@/api'
import { configuration } from '@/utils/http'
import { Chart } from '@antv/g2'
import { from, useSubscription } from '@vueuse/rxjs'
import { BehaviorSubject, combineLatest, filter, finalize } from 'rxjs'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

interface Props {
  platform: string
  cluster: string
  instanceName?: string
  timeRange: TimeRange
}

interface ChartDataItem {
  time: Date
  type: string
  value?: number
  count?: number
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<Props>(), {
  instanceName: ''
})

const chartElement = ref<HTMLDivElement>()

const defaultApi = new DefaultApi(configuration)
const { data, loading, refresh } = useRequest(
  () =>
    defaultApi.getTomcatStatus(
      props.platform,
      props.cluster,
      props.instanceName,
      props.timeRange.timeType,
      props.timeRange.fromTime,
      props.timeRange.toTime,
      props.timeRange.recentSeconds
    ),
  {
    debounceInterval: 100,
    refreshDeps: [
      () => props.platform,
      () => props.cluster,
      () => props.timeRange,
      () => props.instanceName
    ],
    refreshDepsAction() {
      refresh()
    }
  }
)
const chartData = computed(() => {
  if (!data.value) {
    return []
  }

  const { fromTime, granularity, values } = data.value.data.data

  const result: ChartDataItem[] = []

  let date = new Date(fromTime)
  values.forEach(({ threads, activeSessions, requestCount }) => {
    result.push({
      time: date,
      value: threads,
      type: '活跃线程数'
    })

    result.push({
      time: date,
      value: activeSessions,
      type: '活跃会话数'
    })

    result.push({
      time: date,
      count: requestCount,
      type: '请求响应数'
    })

    date = new Date(date.getTime() + granularity! * 1000)
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
    .line()
    .encode('shape', 'smooth')
    .data([])
    .encode('x', 'time')
    .encode('y', 'value')
    .encode('color', 'type')
    .tooltip((d, index, data, column) => {
      if (d.type === '请求响应数') {
        return {
          value: data && index ? data[index].count : ''
        }
      }

      return {
        value: index ? column.y.value[index] : ''
      }
    })
    .axis({
      x: {
        title: false
      },
      y: {
        title: false
      }
    })

  chart
    .line()
    .data([])
    .encode('shape', 'smooth')
    .encode('x', 'time')
    .encode('y', 'count')
    .encode('color', 'type')
    .scale('y', { independent: true })
    .tooltip(false)
    .axis({
      x: {
        title: false
      },
      y: {
        title: false,
        position: 'right',
        grid: null
      }
    })

  chart.render()

  return chart
}

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
  </div>
</template>
