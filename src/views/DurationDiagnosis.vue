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
  type SpanSubSnapshotRequest,
  type FieldConditionResponse,
  SpanStatus,
  type StatusCondition
} from '@/api'
import { DataType } from '@/interfaces/data-type'
import type { SpanCommonalityData } from '@/interfaces/span-commonality'
import { formatTimeRange } from '@/utils/date'
import { configuration } from '@/utils/http'
import { parseJSON } from '@/utils/json'
import { useClipboard } from '@vueuse/core'
import { notification } from 'ant-design-vue'
import { computed, reactive, ref } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute, useRouter } from 'vue-router'
import SpanDurationTrends from './DurationDiagnosis/SpanDurationTrends.vue'
import SpanAppInstances from './SpanDiagnosis/SpanAppInstances.vue'
import SpanGroups from './SpanDiagnosis/SpanGroups.vue'
import SpanCommonalities from './SpanDiagnosis/SpanCommonalities.vue'
import TraceFaults from './SpanDiagnosis/TraceFaults.vue'
import OvertimeTraces from './DurationDiagnosis/OvertimeTraces.vue'
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

const spanGroupFields = ref<SpanGroupFieldWithDisplayName[]>([])
const selectedSnapshotsData = ref<
  {
    snapshotId: string
    color: string
  }[]
>([])

const selectedSnapshotIds = computed(() => {
  return selectedSnapshotsData.value.map(({ snapshotId }) => snapshotId)
})

const queryFilterRequests = queryFilterRequestsGenerator(DataType.SPAN)

const activeKey = ref<'SpanDurationTrends' | 'OvertimeTraces' | 'AppsInfo'>('SpanDurationTrends')

const { copy, isSupported } = useClipboard()

const traceApi = new TraceApi(configuration)

const { data, loading, run } = useRequest(
  () => {
    const timeWindow = conditions?.timeWindow
    const durationInterval = conditions?.durationInterval
    const fieldConditions = formState.fieldConditions || []

    return traceApi.createSubSpanSnapshot(snapshotId, {
      timeWindow,
      durationInterval,
      fieldConditions: toFieldConditions(fieldConditions)
    })
  },
  {
    ready: () => !!snapshotId,
    onAfter: () => {
      selectedSnapshotsData.value = []
    }
  }
)

const subSnapshotId = computed(() => data.value?.data.data)

const traceDuration = computed(() => {
  if (!conditions?.statusConditions) {
    return
  }

  const durationCondition = conditions.statusConditions.find(
    (item) => item.status === SpanStatus.SUCCEED
  )

  if (!durationCondition) {
    return
  }

  return durationCondition.minDelay
})

function search() {
  run()

  router.replace({
    name: 'DurationDiagnosis',
    query: {
      ...route.query,
      conditions: JSON.stringify({
        ...conditions,
        fieldConditions: formState.fieldConditions
      })
    }
  })
}

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
        name: data.name,
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

          <div class="readonly-field" v-if="traceDuration">
            <label class="readonly-field-label">Trace时延:</label>

            <span> {{ traceDuration }} ms </span>
          </div>

          <div class="readonly-field" v-if="conditions?.durationInterval">
            <label class="readonly-field-label">自身时延:</label>

            <span>
              {{ conditions.durationInterval.min }} - {{ conditions.durationInterval.max }} ms
            </span>
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
      :showSelection="true"
      @on-change="selectedSnapshotsData = $event"
      @on-remove="removeSpanGroupField($event)"
      style="flex-basis: 65%"
    />
  </div>

  <a-card style="margin-top: 10px" v-if="subSnapshotId">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="SpanDurationTrends" tab="超时分析">
        <KeepAlive :max="10" v-if="selectedSnapshotsData.length > 0">
          <SpanDurationTrends
            v-if="activeKey === 'SpanDurationTrends'"
            :data="selectedSnapshotsData"
            :timeWindow="conditions?.timeWindow"
          />
        </KeepAlive>

        <a-empty v-if="selectedSnapshotsData.length === 0" />
      </a-tab-pane>

      <a-tab-pane key="OvertimeTraces" tab="超时Traces">
        <OvertimeTraces :snapshotIds="selectedSnapshotIds" />
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
