<script setup lang="ts">
interface Props {
  min?: number
}

import type { StatusCondition, SpanStatus, StatusConditionTrendEnum } from '@/api'
import { FallOutlined, RiseOutlined } from '@ant-design/icons-vue'
import { Form, theme } from 'ant-design-vue'
import type { CheckboxChangeEvent } from 'ant-design-vue/es/_util/EventInterface'
import { computed, watch } from 'vue'

const { useToken } = theme
const { token } = useToken()

const props = withDefaults(defineProps<Props>(), {
  min: 300
})

const modelValue = defineModel<StatusCondition[]>({
  default: []
})

const formItemContext = Form.useInjectFormItemContext()

watch(modelValue, () => {
  formItemContext.onFieldChange()
})

const successFieldChecked = computed(() => {
  return modelValue.value.some((condition) => condition.status === 1)
})
const successFieldMinDelay = computed(() => {
  const condition = modelValue.value.find((condition) => condition.status === 1)

  if (condition) {
    return condition.minDelay
  }

  return 1000
})

const systemErrorFieldChecked = computed(() => {
  return modelValue.value.some((condition) => condition.status === 2)
})
const systemErrorFieldTrend = computed(() => {
  const condition = modelValue.value.find((condition) => condition.status === 2)

  return condition?.trend
})

const businessErrorFieldChecked = computed(() => {
  return modelValue.value.some((condition) => condition.status === 3)
})

const businessErrorFieldTrend = computed(() => {
  const condition = modelValue.value.find((condition) => condition.status === 3)

  return condition?.trend
})

function toggleCondition(
  e: CheckboxChangeEvent,
  status: SpanStatus,
  value?: Partial<StatusCondition>
) {
  if (e.target.checked) {
    modelValue.value = [
      ...modelValue.value,
      {
        status,
        ...value
      }
    ]
  } else {
    modelValue.value = (modelValue.value || []).filter((condition) => condition.status !== status)
  }
}

function updateTrend(status: SpanStatus, value: StatusConditionTrendEnum) {
  modelValue.value = (modelValue.value || []).map((condition) => {
    if (condition.status === status) {
      condition.trend = condition.trend === value ? undefined : value
    }

    return condition
  })
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <div class="item">
      <a-checkbox
        v-model:checked="successFieldChecked"
        @change="
          (e: CheckboxChangeEvent) => {
            toggleCondition(e, 1, {
              minDelay: 1000
            })
          }
        "
        >成功,
      </a-checkbox>
      <span style="padding-right: 5px">时延 >= </span>
      <a-input-number
        v-model:value="successFieldMinDelay"
        :disabled="!successFieldChecked"
        addon-after="ms"
        :min="props.min"
        @change="
          (value: number) => {
            modelValue = (modelValue || []).map((condition) => {
              if (condition.status === 1) {
                condition.minDelay = value
              }

              return condition
            })
          }
        "
      ></a-input-number>
    </div>

    <div class="item">
      <a-checkbox
        v-model:checked="systemErrorFieldChecked"
        @change="
          (e: CheckboxChangeEvent) => {
            toggleCondition(e, 2)
          }
        "
        >系统失败
      </a-checkbox>

      <div class="trend">
        <RiseOutlined
          :style="{
            color: systemErrorFieldTrend === 'up' ? token.colorPrimary : undefined
          }"
          @click="
            () => {
              updateTrend(2, 'up')
            }
          "
        />

        <FallOutlined
          :style="{
            color: systemErrorFieldTrend === 'down' ? token.colorPrimary : undefined
          }"
          @click="
            () => {
              updateTrend(2, 'down')
            }
          "
        />
      </div>
    </div>

    <div class="item">
      <a-checkbox
        v-model:checked="businessErrorFieldChecked"
        @change="
          (e: CheckboxChangeEvent) => {
            toggleCondition(e, 3)
          }
        "
      >
        业务失败
      </a-checkbox>

      <div class="trend">
        <RiseOutlined
          :style="{
            color: businessErrorFieldTrend === 'up' ? token.colorPrimary : undefined
          }"
          @click="
            () => {
              updateTrend(3, 'up')
            }
          "
        />

        <FallOutlined
          :style="{
            color: businessErrorFieldTrend === 'down' ? token.colorPrimary : undefined
          }"
          @click="
            () => {
              updateTrend(3, 'down')
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
}

.trend {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
