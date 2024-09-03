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
  TraceApi,
  type StatusCondition,
  type TimeRange,
  TimeRangeType,
  type FieldConditionResponse
} from '@/api'
import RequestStatusPicker from '@/components/shared/RequestStatusPicker.vue'
import { DataType } from '@/interfaces/data-type'
import { configuration } from '@/utils/http'
import { reactive, ref, watch, watchEffect } from 'vue'
import LogsList from './LogPositioning/LogsList.vue'
import FaultAndHeatmapTrends from './Trends/FaultAndHeatmapTrends.vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import { queryFilterRequestsGenerator, toFieldConditions } from '@/components/shared/QueryFilters'

const route = useRoute()
const router = useRouter()
const formState = reactive<FormState>({
  time: {
    timeType: 1,
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
})

const traceApi = new TraceApi(configuration)
const query = ref<FormState>()
const snapshotId = ref<string>(route.params.snapshotId as string)

const queryFilterRequests = queryFilterRequestsGenerator(DataType.LOG)

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
      for: QueryForType.LOG
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
    name: 'LogPositioning',
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
  const { time, statusConditions, fieldConditions } = formState

  query.value = {
    time,
    statusConditions,
    fieldConditions
  }

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
              <QueryFilters :requests="queryFilterRequests" v-model="formState.fieldConditions" />
            </a-form-item>

            <div class="actions">
              <a-button type="primary" html-type="submit" :loading="loading"> 搜索 </a-button>
            </div>
          </div>
        </div>
      </a-form>
    </a-card>

    <template v-if="query">
      <LogsList
        :time="query.time"
        :statusConditions="query.statusConditions"
        :fieldConditions="query.fieldConditions"
      ></LogsList>
    </template>

    <FaultAndHeatmapTrends
      v-if="snapshotId"
      :snapshotId="snapshotId"
      :statusConditions="formState.statusConditions"
      :fieldConditions="formState.fieldConditions"
    />
  </div>
</template>
