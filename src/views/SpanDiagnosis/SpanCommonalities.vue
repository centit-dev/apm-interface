<script lang="ts">
interface Props {
  snapshotId: string
}

interface PickerOption extends Pick<FieldCondition, 'operator'> {
  label: string
}
</script>

<script setup lang="ts">
import { DefaultApi, type FieldCondition, type SpanCommonalityValue } from '@/api'
import type { SpanCommonalityData } from '@/interfaces/span-commonality'
import { configuration } from '@/utils/http'
import { Chart } from '@antv/g2'
import { onClickOutside } from '@vueuse/core'
import { useSubscription } from '@vueuse/rxjs'
import { theme } from 'ant-design-vue'
import { Subject, timer } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'
import { computed, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()
const emit = defineEmits<{
  (
    e: 'onChange',
    data: {
      data: SpanCommonalityData
      operator: FieldCondition['operator']
    }
  ): void
}>()

const { useToken } = theme
const { token } = useToken()

const chartElement = ref<HTMLDivElement>()

const defaultApi = new DefaultApi(configuration)

const { data, loading, refresh } = useRequest(
  () => defaultApi.identifySpanCommonalities(props.snapshotId),
  {
    debounceInterval: 100,
    refreshDeps: [() => props.snapshotId],
    refreshDepsAction() {
      refresh()
    }
  }
)

const targetElement = ref<HTMLDivElement>()
const pickerVisibility = ref(false)
const selectedData = ref<SpanCommonalityData>()
const pickerPosition = ref({ top: 0, left: 0 })

const pickerOptions: PickerOption[] = [
  {
    label: '只看等于该值',
    operator: '='
  },
  {
    label: '只看不等于该值',
    operator: '!='
  },
  {
    label: '按该条件分组',
    operator: 'groupByCondition'
  },
  {
    label: '拷贝该值',
    operator: 'copy'
  }
]

const clickOutside$ = new Subject<PointerEvent>()
const showPicker$ = new Subject<void>()

useSubscription(
  showPicker$
    .pipe(
      switchMap(() => {
        return timer(600).pipe(
          switchMap(() => clickOutside$),
          tap(() => {
            closePicker()
          })
        )
      })
    )
    .subscribe()
)

function showPicker() {
  showPicker$.next()

  pickerVisibility.value = true
}

function closePicker() {
  showPicker$.next()

  pickerVisibility.value = false
}

function selectOption(option: PickerOption) {
  if (selectedData.value) {
    emit('onChange', {
      data: toRaw(selectedData.value),
      operator: option.operator
    })

    closePicker()
  }
}

const chartData = computed(() => {
  const result: SpanCommonalityData[] = []

  data.value?.data.data.forEach((item) => {
    const { type, name, displayName } = item

    item.values.forEach((value, index) => {
      result.push({
        type,
        name,
        uniqueName: `${item.displayName}-${value.value}`,
        displayName,
        ...value
      })
    })
  })

  return result
})

let chart: Chart

watch(chartData, (newVal) => {
  if (chart) {
    chart.changeData(newVal || [])
  }
})

onMounted(() => {
  if (!chartElement.value) {
    return
  }

  chart = new Chart({
    container: chartElement.value,
    autoFit: true
  })

  chart
    .interval()
    .data(chartData.value || [])
    .axis({
      x: {
        title: false,
        labelFormatter: (d: string) => {
          return d.split('-')[0]
        }
      },
      y: {
        title: false,
        grid: true,
        gridStroke: 'black',
        gridStrokeOpacity: 0.6
      }
    })
    .coordinate({ transform: [{ type: 'transpose' }] })
    .encode('x', 'uniqueName')
    .encode('y', 'value')
    .encode('color', 'code')
    .legend(false)
    .interaction('elementHighlight', { background: true })
    .label({
      text: (d: SpanCommonalityValue) => {
        return d.code
      },
      position: 'outside',
      transform: [{ type: 'overflowHide' }]
    })
    .tooltip({
      title: 'displayName',
      items: [
        {
          name: '共有属性',
          field: 'code'
        },
        {
          name: 'Span数',
          field: 'value'
        }
      ]
    })

  const selectCallback = (event: any) => {
    showPicker()

    selectedData.value = event.data.data

    pickerPosition.value = {
      top: event.client.y,
      left: event.client.x
    }
  }

  chart.on('label:click', selectCallback)
  chart.on('element:click', selectCallback)

  chart.render()

  onClickOutside(targetElement, (event) => {
    clickOutside$.next(event)
  })
})

onUnmounted(() => {
  chart.destroy()
})
</script>

<template>
  <a-card title="Span共性识别" style="flex-basis: 35%; position: relative">
    <a-spin
      v-if="loading"
      size="large"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"
    />

    <div ref="chartElement"></div>
  </a-card>

  <Teleport to="body">
    <div
      ref="targetElement"
      v-if="pickerVisibility && selectedData && selectedData.value > 0"
      class="picker"
      :style="{
        top: pickerPosition.top + 'px',
        left: pickerPosition.left + 'px'
      }"
    >
      <div class="picker-title">
        <b>共有属性:</b>

        <span> {{ selectedData.displayName }}, 记录{{ selectedData.value }}条 </span>
      </div>

      <ul class="picker-list">
        <li
          v-for="(option, index) in pickerOptions"
          :key="index"
          @click="selectOption(option)"
          class="picker-option"
          :class="{
            // selected:
            //   selected &&
            //   selected.label === selectedData.label &&
            //   selected.operator === option.operator
          }"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<style scoped>
.picker {
  position: fixed;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  width: 320px;
  z-index: 99999;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.picker-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 10px;
}

.picker-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.picker-option {
  cursor: pointer;
  padding: 5px 10px;
  margin: 2px 0;
  border-radius: 4px;

  &:hover {
    background-color: v-bind('token.colorPrimaryHover');
    color: white;
  }

  &.selected {
    background-color: v-bind('token.colorPrimary');
    color: white;
  }
}
</style>
