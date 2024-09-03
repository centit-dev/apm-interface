<script lang="ts">
interface TimeRangeOption extends TimeRange {
  text?: string
  tooltip?: string
}

export interface TimePickerProps {
  options?: TimeRangeOption[]
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { theme, Form } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { TimeRangeType, type TimeRange } from '@/api'
import { secondsToText } from '@/utils/date'

const { options } = withDefaults(defineProps<TimePickerProps>(), {
  options: () => [
    {
      timeType: TimeRangeType.RECENT,
      recentSeconds: 3 * 60
    },
    {
      timeType: TimeRangeType.RECENT,
      recentSeconds: 10 * 60
    },
    {
      timeType: TimeRangeType.RECENT,
      recentSeconds: 30 * 60
    },
    {
      timeType: TimeRangeType.RECENT,
      recentSeconds: 60 * 60
    },
    {
      timeType: TimeRangeType.RECENT,
      recentSeconds: 120 * 60
    }
  ]
})

const modelValue = defineModel<TimeRange>({
  default: {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 3 * 60
  }
})

const { useToken } = theme
const { token } = useToken()

const timeType = ref(modelValue.value.timeType)
const recentSeconds = ref(modelValue.value.recentSeconds || 0)

const range = ref<[Dayjs, Dayjs]>()
const fromTime = modelValue.value.fromTime ? dayjs(modelValue.value.fromTime) : undefined
const toTime = modelValue.value.toTime ? dayjs(modelValue.value.toTime) : undefined

if (fromTime && toTime) {
  range.value = [fromTime, toTime]
}

const formItemContext = Form.useInjectFormItemContext()

watch(modelValue, (value) => {
  if (!value) {
    return
  }

  timeType.value = value.timeType

  if (value?.timeType === TimeRangeType.RECENT) {
    recentSeconds.value = value.recentSeconds ?? 0
  } else if (value.fromTime && value.toTime) {
    range.value = [dayjs(value.fromTime), dayjs(value.toTime)]
  }
})

function switchMode() {
  timeType.value =
    timeType.value === TimeRangeType.RECENT ? TimeRangeType.DESIGNATED : TimeRangeType.RECENT
}

function updateModelValue(value?: TimeRange) {
  modelValue.value = value || {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 3 * 60
  }

  formItemContext.onFieldChange()
}

function updateRange(value: [Dayjs, Dayjs]) {
  if (value) {
    updateModelValue({
      timeType: 2,
      fromTime: value[0].toDate().getTime(),
      toTime: value[1].toDate().getTime()
    })
  } else {
    updateModelValue()
  }
}

function updateRecentSeconds(value: number | undefined) {
  if (recentSeconds.value === value) {
    return
  }

  if (!value) {
    return
  }

  recentSeconds.value = value

  updateModelValue({
    timeType: 1,
    recentSeconds: value
  })
}
</script>

<template>
  <div class="time-picker">
    <div class="recent-picker" v-if="timeType === 1">
      <template v-for="(option, index) in options" :key="index">
        <a-tooltip v-if="option.tooltip">
          <template #title>
            {{ option.tooltip }}
          </template>

          <span
            :style="{
              color: recentSeconds === option.recentSeconds ? token.colorPrimary : ''
            }"
            class="picker-option"
            @click="updateRecentSeconds(option.recentSeconds)"
          >
            {{ option.text ? option.text : secondsToText(option.recentSeconds || 0) }}
          </span>
        </a-tooltip>

        <span
          v-else
          :style="{
            color: recentSeconds === option.recentSeconds ? token.colorPrimary : ''
          }"
          class="picker-option"
          @click="updateRecentSeconds(option.recentSeconds)"
        >
          {{ option.text ? option.text : secondsToText(option.recentSeconds || 0) }}
        </span>
      </template>

      <span class="switcher" @click="switchMode">自定义</span>
    </div>

    <div v-else>
      <a-range-picker
        v-model:value="range"
        show-time
        allowClear
        :placeholder="['开始时间', '结束时间']"
        @change="updateRange"
      />

      <span class="switcher" style="margin-left: 10px" @click="switchMode">快捷选择</span>
    </div>
  </div>
</template>

<style scoped>
.time-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 480px;
}

.recent-picker {
  display: flex;
  gap: 10px;
  align-items: center;
}

.picker-option {
  cursor: pointer;
}

.switcher {
  cursor: pointer;
}
</style>
