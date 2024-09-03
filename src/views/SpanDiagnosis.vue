<script lang="ts">
interface FormState {
  fieldConditions: FieldConditionResponse[]
}
</script>

<script setup lang="ts">
import {
  TraceApi,
  type FieldCondition,
  type SpanGroupField,
  type StatusCondition,
  type SpanSubSnapshotRequest,
  type FieldConditionResponse
} from '@/api'
import { spanStatusText } from '@/decorators/enum'
import { DataType } from '@/interfaces/data-type'
import type { SpanCommonalityData } from '@/interfaces/span-commonality'
import { formatTimeRange } from '@/utils/date'
import { parseJSON } from '@/utils/json'
import { useClipboard } from '@vueuse/core'
import { notification } from 'ant-design-vue'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExceptionInfo from './SpanDiagnosis/ExceptionInfo.vue'
import SpanAppInstances from './SpanDiagnosis/SpanAppInstances.vue'
import SpanCommonalities from './SpanDiagnosis/SpanCommonalities.vue'
import SpanGroups from './SpanDiagnosis/SpanGroups.vue'
import TraceFaults from './SpanDiagnosis/TraceFaults.vue'
import { useRequest } from 'vue-request'
import { configuration } from '@/utils/http'
import type { SpanGroupFieldWithDisplayName } from '@/interfaces/span-group-field'
import { queryFilterRequestsGenerator, toFieldConditions } from '@/components/shared/QueryFilters'

const route = useRoute()
const router = useRouter()

const snapshotId = route.query.snapshotId as string
const conditions = parseJSON<
  SpanSubSnapshotRequest & {
    statusConditions: StatusCondition[]
    fieldConditions: FieldConditionResponse[]
  }
>(route.query.conditions as string)
const formState = reactive<FormState>({
  fieldConditions: conditions?.fieldConditions || []
})

const checked = computed(() => true)
const spanGroupFields = ref<SpanGroupFieldWithDisplayName[]>([])

const activeKey = ref<'ExceptionInfo' | 'AppsInfo'>('ExceptionInfo')

const selectedSnapshotsData = ref<
  {
    snapshotId: string
    color: string
  }[]
>([])

const selectedSnapshotIds = computed(() => {
  if (!selectedSnapshotsData.value || selectedSnapshotsData.value.length === 0) {
    return [snapshotId]
  }

  return selectedSnapshotsData.value.map(({ snapshotId }) => snapshotId)
})

const { copy, isSupported } = useClipboard()

const traceApi = new TraceApi(configuration)

const { data, loading, run } = useRequest(
  () => {
    const timeWindow = conditions?.timeWindow
    const fieldConditions = formState.fieldConditions || []

    return traceApi.createSubSpanSnapshot(snapshotId, {
      timeWindow,
      fieldConditions: toFieldConditions(fieldConditions)
    })
  },
  {
    ready: () => !!snapshotId
  }
)

const subSnapshotId = computed(() => data.value?.data.data)

function search() {
  run()

  router.replace({
    name: 'SpanDiagnosis',
    query: {
      ...route.query,
      conditions: JSON.stringify({
        ...conditions,
        fieldConditions: formState.fieldConditions
      })
    }
  })
}

const queryFilterRequests = queryFilterRequestsGenerator(DataType.SPAN)

const [api, contextHolder] = notification.useNotification()

function handleSpanCommonalitiesChanged(value: {
  data: SpanCommonalityData
  operator: FieldCondition['operator']
}) {
  const { data, operator } = value

  const name = data.name

  if (operator === 'copy') {
    if (!isSupported.value) {
      api.error({
        message: '浏览器不支持复制'
      })
    } else {
      copy(String(data.value))

      api.success({
        message: '复制成功'
      })
    }
    return
  }

  if (
    operator === 'groupByCondition' &&
    !spanGroupFields.value.find((field) => field.name === name)
  ) {
    spanGroupFields.value = [
      ...spanGroupFields.value,
      {
        type: data.type,
        name,
        displayName: data.displayName
      }
    ]

    return
  }

  if (formState.fieldConditions.find((con) => con.name.name === name)) {
    return
  }

  if (operator === '=') {
    formState.fieldConditions = [
      ...(formState.fieldConditions || []),
      {
        name: {
          name,
          displayName: data.displayName
        },
        operator: {
          name: '=',
          displayName: '='
        },
        value: data.code
      }
    ]
  }

  if (operator === '!=') {
    formState.fieldConditions = [
      ...(formState.fieldConditions || []),
      {
        name: {
          name,
          displayName: data.displayName
        },
        operator: {
          name: '!=',
          displayName: '!='
        },
        value: data.code
      }
    ]
  }
}

function removeSpanGroupField(field: SpanGroupField) {
  spanGroupFields.value = spanGroupFields.value.filter(
    (f) => !(f.name === field.name && f.type === field.type)
  )
}
</script>

<template>
  <a-card>
    <a-form
      :model="formState"
      name="search"
      autocomplete="off"
      class="search-form"
      labelAlign="left"
      :labelCol="{ style: { width: '80px' } }"
      @finish="search"
    >
      <div class="header-form-section">
        <label class="section-label" style="padding-top: 0"> 搜索条件: </label>

        <div class="section-content">
          <div class="readonly-field" v-if="conditions?.timeWindow">
            <label class="readonly-field-label">时间范围:</label>

            <span v-if="conditions.timeWindow.fromTime && conditions.timeWindow.toTime">{{
              formatTimeRange(conditions.timeWindow.fromTime, conditions.timeWindow.toTime)
            }}</span>
          </div>

          <div class="readonly-field" v-if="conditions?.statusConditions">
            <label class="readonly-field-label">状态:</label>

            <a-checkbox
              v-for="(statusCondition, index) in conditions.statusConditions"
              :key="index"
              v-model:checked="checked"
              :disabled="true"
            >
              {{ spanStatusText(statusCondition.status) }}
            </a-checkbox>
          </div>

          <a-form-item name="fieldConditions" label="条件">
            <QueryFilters :requests="queryFilterRequests" v-model="formState.fieldConditions" />
          </a-form-item>
        </div>
      </div>

      <div class="header-form-actions">
        <a-button type="primary" html-type="submit" :loading="loading"> span 解析 </a-button>
      </div>
    </a-form>
  </a-card>

  <!-- <a-card style="margin-top: 10px">
    <TraceFaults :snapshotId="snapshotId" />
  </a-card> -->

  <div style="display: flex; width: 100%; gap: 10px; margin-top: 10px" v-if="subSnapshotId">
    <SpanCommonalities :snapshotId="subSnapshotId" @onChange="handleSpanCommonalitiesChanged" />

    <SpanGroups
      :snapshotId="subSnapshotId"
      :spanGroupFields="spanGroupFields"
      :colorful="false"
      @on-change="selectedSnapshotsData = $event"
      @on-remove="removeSpanGroupField($event)"
      style="flex-basis: 65%"
    />
  </div>

  <a-card style="margin-top: 10px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="ExceptionInfo" tab="报错信息">
        <ExceptionInfo :snapshotIds="selectedSnapshotIds" />
      </a-tab-pane>

      <a-tab-pane key="AppsInfo" tab="初因应用">
        <SpanAppInstances :snapshotIds="selectedSnapshotIds" />
      </a-tab-pane>
    </a-tabs>
  </a-card>

  <contextHolder />
</template>

<style scoped>
.readonly-field {
  display: flex;
}

.readonly-field-label {
  width: 80px;
  display: block;
}
</style>
