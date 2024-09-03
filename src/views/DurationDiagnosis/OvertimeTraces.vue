<script lang="ts">
interface Props {
  snapshotIds: string[]
}
</script>

<script setup lang="ts">
import { TraceApi } from '@/api'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { traceStatusText } from '@/decorators/enum'
import { format } from '@/utils/date'
import { configuration } from '@/utils/http'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()

const pagination = ref(defaultPagination)

const traceApi = new TraceApi(configuration)
const {
  data: tracesResponse,
  loading,
  refresh
} = useRequest(
  () => {
    const { pageNo, pageSize } = pagination.value

    return traceApi.listTracesBySpanSnapshots(props.snapshotIds, pageNo - 1, pageSize)
  },
  {
    refreshDeps: [() => props.snapshotIds, pagination],
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

const columns = ref<TableColumnsType>([
  {
    title: 'TraceId',
    dataIndex: 'traceId',
    key: 'traceId',
    fixed: 'left'
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    customRender: ({ record }) => {
      return traceStatusText(record.status)
    }
  },
  {
    title: '端点地址',
    dataIndex: 'endpointAddress',
    key: 'endpointAddress',
    width: 120
  },
  {
    title: '开始时间',
    key: 'startTime',
    customRender: ({ record }) => {
      return format(record.startTime)
    }
  },
  {
    title: '时长 (ms)',
    dataIndex: 'duration',
    key: 'duration',
    width: 120,
    customRender: ({ record }) => {
      return ((record.duration || 0) / 1_000_000).toFixed(2)
    }
  },
  {
    title: 'span 数',
    dataIndex: 'spanCount',
    key: 'spanCount',
    width: 140
  },
  {
    title: '运行平面',
    dataIndex: 'platforms',
    key: 'platforms'
  },
  {
    title: '应用实例',
    dataIndex: 'instanceNames',
    key: 'instanceNames'
  },
  {
    title: '首服务',
    width: 100,
    dataIndex: 'firstService',
    key: 'firstService',
    ellipsis: true
  },
  {
    title: '历经应用',
    key: 'applications'
  }
])

const handleTableChange: TableProps['onChange'] = (paginationData) => {
  pagination.value = {
    pageNo: paginationData.current || defaultPagination.pageNo,
    pageSize: paginationData.pageSize || defaultPagination.pageSize
  }
}
</script>

<template>
  <a-table
    sticky
    :columns="columns"
    :data-source="data?.content"
    :pagination="{
      pageSizeOptions: ['10', '25', '50', '100'],
      defaultPageSize: data?.pageSize || 50,
      current,
      total: data?.total,
      showTotal
    }"
    :scroll="{ x: 'max-content' }"
    :loading="loading"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'traceId'">
        <router-link
          v-if="record.traceId"
          :to="`/trace/${record.traceId}`"
          target="_blank"
          style="white-space: nowrap; display: inline"
        >
          {{ record.traceId }}
        </router-link>
      </template>

      <div v-if="column.key === 'platforms'" class="set-with-comma">
        <span v-for="(platform, index) in record.platforms" :key="index" class="element">
          {{ platform.displayName }}
        </span>
      </div>

      <div v-if="column.key === 'instanceNames'" class="set-with-comma">
        <span v-for="(instanceName, index) in record.instanceNames" :key="index" class="element">
          {{ instanceName }}
        </span>
      </div>

      <div v-if="column.key === 'applications'" class="set-with-comma">
        <span v-for="(application, index) in record.applications" :key="index" class="element">
          {{ application.displayName }}
        </span>
      </div>
    </template>
  </a-table>
</template>
