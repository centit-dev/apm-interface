<script lang="ts">
interface Props {
  data: {
    snapshotId: string
    color: string
  }[]
  timeWindow?: TimeWindow
}

interface ChartStateValue {
  chart?: Chart
}

type ChartState = Record<SpanDurationTrendsChartType, Record<Percentile, ChartStateValue>>

interface TooltipPositionData {
  chartId: string
  globalOffset: number
  pageOffset: number
}
</script>

<script setup lang="ts">
import { DefaultApi, DurationType, Percentile, type DurationTrend, type TimeWindow } from '@/api'
import { configuration } from '@/utils/http'
import { Chart } from '@antv/g2'
import { useSubscription } from '@vueuse/rxjs'
import { addMilliseconds, closestTo } from 'date-fns'
import { Subject } from 'rxjs'
import { distinctUntilChanged, tap } from 'rxjs/operators'
import { computed, onActivated, onMounted, onUnmounted, ref, watch } from 'vue'
import SpanDurationTrendTooltipContent from './SpanDurationTrendTooltipContent.vue'
import {
  spanDurationTrendsChartTypes,
  type SpanDurationTrendsChartData,
  type SpanDurationTrendsChartType,
  type SpanDurationTrendsDurationData
} from './interface'

const props = defineProps<Props>()

const selfDurationElement = ref<HTMLDivElement>()
const gapElement = ref<HTMLDivElement>()
const traceDurationElement = ref<HTMLDivElement>()

const tooltipElement = ref<HTMLDivElement>()

const chartData = ref<SpanDurationTrendsChartData>()
const dateWhitelist = ref<Date[]>([])
const tooltipTime = ref<Date>()
const durationDataTime = ref<Date>()

const durationData = ref<SpanDurationTrendsDurationData>()

const defaultApi = new DefaultApi(configuration)

const snapshotIds = computed(() => {
  return props.data.map((item) => item.snapshotId)
})

const colors = computed(() => {
  return props.data.reduce(
    (acc, item) => {
      acc[item.snapshotId] = item.color
      return acc
    },
    {} as Record<string, string>
  )
})

const percentiles = ref<Percentile[]>([Percentile.P90])
const percentileOptions = Object.values(Percentile).map((value) => {
  return {
    label: `${value}时延`,
    value
  }
})

watch(
  snapshotIds,
  (ids) => {
    loadData(ids).then((trends) => {
      const values = toChartData(ids, trends)
      getDateWhitelist(trends[0])

      chartData.value = values

      if (!values) {
        return
      }

      spanDurationTrendsChartTypes.forEach((chartType) => {
        Object.values(Percentile).forEach((percentile) => {
          const data = values[chartType][percentile]
          const chart = chartState[chartType][percentile].chart

          if (!chart) {
            return
          }

          if (!data || data.length === 0) {
            chart.getContainer().style.display = 'none'
          }

          chart.changeData(data)
          chart.getContainer().style.display = 'block'
          chart.forceFit()
        })
      })
    })
  },
  { immediate: true }
)

watch(percentiles, () => updateVisibility())

function updateVisibility() {
  if (!chartData.value) {
    return
  }

  Object.values(Percentile).forEach((v) => {
    const elements = document.getElementsByClassName(`percentile-${v}`)

    Array.from(elements).forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.display = percentiles.value.includes(v) ? 'block' : 'none'
      }
    })
  })
}

const showTooltip = ref(false)
const tooltipPositionData = ref<TooltipPositionData>({
  chartId: '',
  globalOffset: 0,
  pageOffset: 0
})
const containerPadding = 24

const chartState: ChartState = {
  selfDurations: {
    [Percentile.P50]: {},
    [Percentile.P75]: {},
    [Percentile.P90]: {},
    [Percentile.P99]: {}
  },
  gaps: {
    [Percentile.P50]: {},
    [Percentile.P75]: {},
    [Percentile.P90]: {},
    [Percentile.P99]: {}
  },
  traceDurations: {
    [Percentile.P50]: {},
    [Percentile.P75]: {},
    [Percentile.P90]: {},
    [Percentile.P99]: {}
  }
}

const updateTooltipPosition$ = new Subject<TooltipPositionData>()
const allowMove = ref(true)

const lineOffset = computed(() => {
  return tooltipPositionData.value.globalOffset
})

const tooltipOffset = computed<{
  offset: number
  transform: string
}>(() => {
  if (!tooltipElement.value) {
    return {
      offset: 0,
      transform: 'none'
    }
  }

  if (
    tooltipElement.value.offsetWidth + tooltipPositionData.value.pageOffset + containerPadding * 2 >
    window.innerWidth
  ) {
    return {
      offset: tooltipPositionData.value.pageOffset,
      transform: `translate(calc(-100% - ${containerPadding}px), -50%)`
    }
  }

  return {
    offset: tooltipPositionData.value.pageOffset,
    transform: `translate(20px, -50%)`
  }
})

watch(durationDataTime, (currentTime) => {
  if (!currentTime || !chartData.value) {
    return
  }

  const result: SpanDurationTrendsDurationData = {
    selfDurations: {
      [Percentile.P50]: [],
      [Percentile.P75]: [],
      [Percentile.P90]: [],
      [Percentile.P99]: []
    },
    gaps: {
      [Percentile.P50]: [],
      [Percentile.P75]: [],
      [Percentile.P90]: [],
      [Percentile.P99]: []
    },
    traceDurations: {
      [Percentile.P50]: [],
      [Percentile.P75]: [],
      [Percentile.P90]: [],
      [Percentile.P99]: []
    },
    time: currentTime,
    total: 0,
    colors: colors.value
  }

  const values = chartData.value

  spanDurationTrendsChartTypes.forEach((chartType) => {
    Object.values(Percentile).forEach((percentile) => {
      const data = values[chartType][percentile]

      if (!data || data.length === 0) {
        return
      }

      const items = data.filter((item) => item.date.getTime() === currentTime.getTime())

      items.forEach((item) => {
        result.total += item.value || 0
      })
      result[chartType][percentile] = items
    })
  })

  durationData.value = result

  updateVisibility()
})

watch(tooltipTime, (currentTime) => {
  if (!currentTime) {
    return
  }

  if (!chartData.value || !dateWhitelist.value) {
    return
  }

  if (!allowMove.value) {
    return
  }

  durationDataTime.value = closestTo(currentTime, dateWhitelist.value)
})

useSubscription(
  updateTooltipPosition$
    .pipe(
      distinctUntilChanged((a, b) => {
        return a.chartId === b.chartId && a.globalOffset === b.globalOffset
      }),
      tap((postion) => {
        if (allowMove.value) {
          tooltipPositionData.value = postion
        }

        if (!showTooltip.value) {
          showTooltip.value = true
        }
      })
    )
    .subscribe()
)

onMounted(() => {
  if (!selfDurationElement.value || !gapElement.value || !traceDurationElement.value) {
    console.error('Element not found')

    return
  }

  const elements: Record<SpanDurationTrendsChartType, HTMLDivElement> = {
    selfDurations: selfDurationElement.value,
    gaps: gapElement.value,
    traceDurations: traceDurationElement.value
  }

  spanDurationTrendsChartTypes.forEach((chartType) => {
    Object.values(Percentile).forEach((percentile) => {
      const container = document.createElement('div')
      container.style.display = 'none'
      container.classList.add(`percentile-${percentile}`)
      elements[chartType].appendChild(container)

      const chart = new Chart({
        container,
        autoFit: true,
        height: 200
      })

      const chartId = `${chartType}-${percentile}`

      chart
        .line()
        .data([])
        .encode('x', 'date')
        .encode('y', 'value')
        .encode('shape', 'smooth')
        .encode('color', 'color')
        .scale('color', { type: 'identity' })
        .axis('x', { title: percentile })
        .axis('y', { title: false })
        .legend(false)
        .interaction('tooltip', {
          body: false,
          crosshairs: false
        })

      chart.on('tooltip:show', (event) => {
        updateTooltipPosition$.next({
          chartId,
          globalOffset: event.global.x,
          pageOffset: event.page.x
        })

        tooltipTime.value = event.data.data.x
      })

      chart.render()

      chartState[chartType][percentile].chart = chart
    })
  })
})

onUnmounted(() => {
  spanDurationTrendsChartTypes.forEach((chartType) => {
    Object.values(Percentile).forEach((percentile) => {
      chartState[chartType][percentile].chart?.destroy()
    })
  })
})

onActivated(() => {
  spanDurationTrendsChartTypes.forEach((chartType) => {
    Object.values(Percentile).forEach((percentile) => {
      chartState[chartType][percentile].chart?.forceFit()
    })
  })
})

async function loadData(snapshotIds: string[]): Promise<DurationTrend[]> {
  return Promise.all(
    snapshotIds.map((snapshotId) => {
      const { fromTime, toTime } = props.timeWindow || {}

      return defaultApi
        .getSpanDurationTrends(
          [snapshotId],
          Object.values(Percentile),
          Object.values(DurationType),
          undefined,
          fromTime,
          toTime
        )
        .then((res) => {
          return res.data.data
        })
    })
  )
}

function toChartData(snapshotIds: string[], trends: DurationTrend[]) {
  if (!trends || trends.length === 0) {
    return
  }

  const result: SpanDurationTrendsChartData = {
    selfDurations: {
      [Percentile.P50]: [],
      [Percentile.P75]: [],
      [Percentile.P90]: [],
      [Percentile.P99]: []
    },
    gaps: {
      [Percentile.P50]: [],
      [Percentile.P75]: [],
      [Percentile.P90]: [],
      [Percentile.P99]: []
    },
    traceDurations: {
      [Percentile.P50]: [],
      [Percentile.P75]: [],
      [Percentile.P90]: [],
      [Percentile.P99]: []
    }
  }

  trends.forEach((trend, trendIndex) => {
    const fromTime = new Date(trend.fromTime)
    const granularity = trend.granularity

    spanDurationTrendsChartTypes.forEach((type) => {
      trend[type].forEach((value, index) => {
        Object.values(Percentile).forEach((percentile, percentileIndex) => {
          const item = {
            date: addMilliseconds(fromTime, granularity * index),
            value: parseFloat(((value[percentileIndex] || 0) / 1_000_000).toFixed(2)),
            snapshotId: snapshotIds[trendIndex],
            color: colors.value[snapshotIds[trendIndex]]
          }

          if (result[type][percentile]) {
            result[type][percentile]!.push(item)
          } else {
            result[type][percentile] = [item]
          }
        })
      })
    })
  })

  return result
}

function getDateWhitelist(trend: DurationTrend) {
  if (!trend) {
    return
  }

  const fromTime = new Date(trend.fromTime)
  const granularity = trend.granularity

  dateWhitelist.value = Array.from({ length: trend.selfDurations.length }, (_, index) => {
    return addMilliseconds(fromTime, granularity * index)
  })
}
</script>

<template>
  <div style="margin: 10px 0">
    <a-checkbox-group
      v-model:value="percentiles"
      name="checkboxgroup"
      :options="percentileOptions"
    />
  </div>

  <div
    @mouseleave="
      () => {
        if (allowMove) {
          showTooltip = false
        }
      }
    "
  >
    <div
      @click="
        () => {
          allowMove = !allowMove
        }
      "
    >
      <div class="self-duration">
        <h3>自身时延趋势</h3>
        <div ref="selfDurationElement"></div>
      </div>

      <div class="gap">
        <h3>Gap时延趋势</h3>
        <div ref="gapElement"></div>
      </div>

      <div class="trace-duration">
        <h3>Trace时延趋势</h3>
        <div ref="traceDurationElement"></div>
      </div>
    </div>

    <div
      class="line"
      :style="{
        display: showTooltip ? 'block' : 'none',
        position: 'absolute',
        left: lineOffset + 'px',
        top: containerPadding + 'px',
        width: 0,
        height: 'calc(100% - 48px)',
        borderLeft: '1px dashed red',
        pointerEvents: 'none'
      }"
    ></div>

    <div
      ref="tooltipElement"
      class="tooltip"
      :style="{
        display: showTooltip ? 'block' : 'none',
        position: 'fixed',
        left: tooltipOffset.offset + 'px',
        top: '50%',
        transform: tooltipOffset.transform,
        pointerEvents: allowMove ? 'none' : 'auto'
      }"
    >
      <div class="tooltip-content" v-if="durationData">
        <SpanDurationTrendTooltipContent :data="durationData" :selected-percentiles="percentiles" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tooltip {
  max-width: 850px;
  min-height: 200px;
  max-height: 100vh;
  overflow-y: scroll;
  transform: translateY(-160px);

  &.left {
  }

  .tooltip-content {
    background-color: #fff;
    border-radius: 4px;
    width: 100%;
    height: 100%;
    min-height: 200px;
    border: 1px solid #f0f0f0;
    padding: 4px;
    box-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
  }
}
</style>
