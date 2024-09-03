<script lang="ts">
interface FormState {
  time: TimeRange
  statusConditions: StatusCondition[]
  fieldConditions: FieldConditionResponse[]
}
</script>

<script setup lang="ts">
import {
  QueryForType,
  SpanStatus,
  TimeRangeType,
  TraceApi,
  type FieldConditionResponse,
  type StatusCondition,
  type TimeRange
} from '@/api'
import RequestStatusPicker from '@/components/shared/RequestStatusPicker.vue'
import { DataType } from '@/interfaces/data-type'
import { configuration } from '@/utils/http'
import { reactive, ref, watch, watchEffect } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute, useRouter } from 'vue-router'
import FaultAndHeatmapTrends from './Trends/FaultAndHeatmapTrends.vue'
import { queryFilterRequestsGenerator, toFieldConditions } from '@/components/shared/QueryFilters'

const route = useRoute()
const router = useRouter()
const defaultFormState = {
  time: {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 3 * 60
  },
  statusConditions: [
    {
      status: SpanStatus.SUCCEED,
      minDelay: 1000
    },
    {
      status: SpanStatus.SYS_FAULT
    },
    {
      status: SpanStatus.BIZ_FAULT
    }
  ],
  fieldConditions: []
}

const formState = reactive<FormState>(defaultFormState)
const snapshotId = ref<string>(route.params.snapshotId as string)
const traceApi = new TraceApi(configuration)

const queryFilterRequests = queryFilterRequestsGenerator(DataType.SPAN)

const { run: readDataFromQuery } = useRequest(
  () => {
    return traceApi.getSpanSnapshot(route.query.snapshotId as string)
  },
  {
    manual: true,
    onSuccess(res) {
      const value = res.data.data

      if (!value) {
        return
      }

      formState.time = {
        timeType: TimeRangeType.DESIGNATED,
        fromTime: value.timeWindow?.fromTime,
        toTime: value.timeWindow?.toTime
      }
      formState.statusConditions = value.statusConditions || []
      formState.fieldConditions = value.fieldConditions || []

      search()
    }
  }
)

if (route.query.snapshotId) {
  readDataFromQuery()
}

const { data, loading, run } = useRequest(
  () => {
    const { time, statusConditions, fieldConditions } = formState

    return traceApi.createSpanSnapshot({
      fieldConditions: toFieldConditions(fieldConditions),
      statusConditions,
      timeCondition: time,
      for: QueryForType.TRACE
    })
  },
  {
    manual: true
  }
)

watchEffect(() => {
  if (!data.value) {
    return
  }

  snapshotId.value = data.value?.data.data

  router.replace({
    name: 'TracePositioning',
    query: {
      snapshotId: snapshotId.value
    }
  })
})

watch(
  () => route.query.snapshotId,
  (value) => {
    if (value) {
      snapshotId.value = value && (value as string)
    }
  }
)

function search() {
  run()
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <a-card>
      <a-form
        :model="formState"
        name="search"
        autocomplete="off"
        class="search-form"
        labelAlign="left"
        :labelCol="{ style: { width: '80px', fontWeight: 'bold' } }"
        @finish="search"
      >
        <div class="header-form-section">
          <div class="section-content">
            <a-form-item name="time" label="时间">
              <TimePicker v-model="formState.time" />
            </a-form-item>

            <a-form-item name="statusConditions" label="Trace状态">
              <RequestStatusPicker v-model="formState.statusConditions" />
            </a-form-item>

            <a-form-item name="fieldConditions" label="条件">
              <QueryFilters
                :requests="queryFilterRequests"
                :timeCondition="formState.time"
                v-model="formState.fieldConditions"
              />
            </a-form-item>

            <div class="actions">
              <a-button type="primary" html-type="submit" :loading="loading"> 搜索 </a-button>
            </div>
          </div>
        </div>
      </a-form>
    </a-card>

    <FaultAndHeatmapTrends
      v-if="snapshotId"
      :snapshotId="snapshotId"
      :statusConditions="formState.statusConditions"
      :fieldConditions="formState.fieldConditions"
    />
  </div>
</template>
