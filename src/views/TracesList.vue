<script setup lang="ts">
import {
  TraceApi,
  TraceBriefStatusEnum,
  type FieldConditionResponse,
  type SpanSubSnapshotRequest,
  type TraceBrief
} from '@/api'
import { format } from '@/utils/date'
import { parseJSON } from '@/utils/json'
import { configuration } from '@/utils/http'
import { theme, type TableColumnsType, type TableProps } from 'ant-design-vue'
import { kebabCase } from 'lodash'
import { computed, ref, watch } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute } from 'vue-router'
import TraceStackTree from './TraceDetail/TraceStackTree.vue'
import TraceServiceMap from './TraceDetail/TraceServiceMap.vue'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { toFieldConditions } from '@/components/shared/QueryFilters'

const route = useRoute()

const pagination = ref(defaultPagination)

const { useToken } = theme
const { token } = useToken()

const conditions = parseJSON<
  SpanSubSnapshotRequest & {
    fieldConditions: FieldConditionResponse[]
  }
>(route.query.conditions as string)

const traceApi = new TraceApi(configuration)

const { data: subSpanSnapshotData } = useRequest(
  () => {
    const timeWindow = conditions?.timeWindow
    const durationInterval = conditions?.durationInterval
    const fieldConditions = conditions?.fieldConditions || []

    return traceApi.createSubSpanSnapshot(route.query.snapshotId as string, {
      timeWindow,
      durationInterval,
      fieldConditions: toFieldConditions(fieldConditions)
    })
  },
  {
    ready: () => !!route.query.snapshotId
  }
)

const subSpanSnapshotId = computed(() => {
  return subSpanSnapshotData.value?.data.data
})

const {
  data: tracesResponse,
  loading,
  refresh
} = useRequest(
  () => {
    const { pageNo, pageSize } = pagination.value

    return traceApi.listTracesBySpanSnapshots([subSpanSnapshotId.value!], pageNo - 1, pageSize)
  },
  {
    ready: () => !!subSpanSnapshotId.value,
    debounceInterval: 100,
    refreshDeps: [() => subSpanSnapshotId.value, pagination],
    refreshDepsAction() {
      refresh()
    }
  }
)

const data = computed(() => tracesResponse.value?.data.data)

const current = computed(() => {
  if (data.value) {
    return (data.value.pageNo || 0) + 1
  }

  return defaultPagination.pageNo
})

const traceId = ref<string>()
const abortController = ref<AbortController>()

const {
  data: traceResponse,
  loading: traceLoading,
  run: traceRefresh
} = useRequest(
  () => {
    abortController.value = new AbortController()

    return traceApi.getTraceDetail(traceId.value as string, {
      signal: abortController.value.signal
    })
  },
  {
    refreshDeps: [traceId],
    manual: true
  }
)

watch(traceId, (newTraceId) => {
  if (abortController.value) {
    abortController.value.abort()

    abortController.value = undefined
  }

  if (newTraceId) {
    traceRefresh()
  }
})

const trace = computed(() => {
  return traceResponse.value?.data.data
})
const spans = computed(() => traceResponse.value?.data.data.spans)

const columns = ref<TableColumnsType>([
  {
    title: 'TraceId',
    width: 100,
    dataIndex: 'traceId',
    key: 'traceId',
    fixed: 'left'
  },
  {
    title: '状态',
    key: 'status'
  },
  {
    title: '开始时间',
    key: 'startTime'
  },
  {
    title: '时长(ms)',
    dataIndex: 'duration',
    key: 'duration',
    width: 120,
    customRender: ({ record }) => {
      return ((record.duration || 0) / 1000000).toFixed(2)
    }
  },
  {
    title: 'span数',
    dataIndex: 'spanCount',
    key: 'spanCount',
    width: 100
  },
  {
    title: '运行平面',
    dataIndex: 'platforms',
    key: 'platforms'
  },
  {
    title: '端点地址',
    dataIndex: 'endpointAddress',
    key: 'endpointAddress',
    width: 140
  },
  {
    title: '首服务',
    dataIndex: 'firstService',
    key: 'firstService',
    ellipsis: true
  },
  {
    title: '历经应用',
    key: 'applications'
  }
])

const customRow = (record: TraceBrief) => {
  return {
    onClick: () => {
      traceId.value = record.traceId
    }
  }
}

const rowClassName = (record: TraceBrief) => {
  return `row-${kebabCase(record.status)}`
}

function statusText(status: TraceBriefStatusEnum) {
  switch (status) {
    case TraceBriefStatusEnum.Success:
      return '成功'
    case TraceBriefStatusEnum.BusinessFault:
      return '业务失败'
    case TraceBriefStatusEnum.SystemFault:
      return '系统错误'
    case TraceBriefStatusEnum.Timeout:
      return '超时'
    default:
      return status
  }
}
const activeKey = ref('StackTreeTab')

const handleTableChange: TableProps['onChange'] = (paginationData) => {
  pagination.value = {
    pageNo: paginationData.current || defaultPagination.pageNo,
    pageSize: paginationData.pageSize || defaultPagination.pageSize
  }
}
</script>

<template>
  <a-card :loading="loading">
    <a-table
      :columns="columns"
      :data-source="data?.content"
      :scroll="{ x: 'max-content', y: 230 }"
      :customRow="customRow"
      :row-class-name="rowClassName"
      :pagination="{
        pageSizeOptions: ['5', '10', '25', '50', '100'],
        defaultPageSize: data?.pageSize || 50,
        current,
        total: data?.total,
        showTotal
      }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'status'">
          {{ statusText(record.status) }}
        </div>

        <div v-if="column.key === 'startTime'">
          {{ format(record.startTime) }}
        </div>

        <div v-if="column.key === 'platforms'">
          <div class="set-with-comma">
            <span v-for="(platform, index) in record.platforms" :key="index" class="element">
              {{ platform.displayName }}
            </span>
          </div>
        </div>

        <div v-if="column.key === 'applications'">
          <div class="set-with-comma">
            <span v-for="(application, index) in record.applications" :key="index" class="element">
              {{ application.displayName }}
            </span>
          </div>
        </div>
      </template>
    </a-table>
  </a-card>

  <a-card v-if="trace" :loading="traceLoading" style="margin-top: 10px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane v-if="spans" key="StackTreeTab" tab="调用树">
        <TraceStackTree :spans="spans" />
      </a-tab-pane>

      <a-tab-pane key="TraceServiceMapTab" tab="服务地图">
        <TraceServiceMap :trace="trace" />
      </a-tab-pane>
    </a-tabs>
  </a-card>

  <a-spin
    v-if="!trace && traceLoading"
    style="margin: 40px auto 0 auto; display: block"
    size="large"
  />
</template>

<style scoped>
.row-business-fault {
  background-color: v-bind(token.colorWarningBg);
}

.row-system-fault {
  background-color: v-bind(token.colorErrorBg);
}

.row-timeout {
  background-color: v-bind(token.colorErrorBg);
}
</style>
