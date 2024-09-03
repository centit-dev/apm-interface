<script lang="ts">
interface Props {
  snapshotIds: string[]
  exception: ServiceExceptionInfo
}
</script>

<script setup lang="ts">
import { TraceApi, type ServiceExceptionInfo, type SpanBrief } from '@/api'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { spanKindText, spanStatusText } from '@/decorators/enum'
import { format } from '@/utils/date'
import { configuration } from '@/utils/http'
import { theme, type TableColumnsType, type TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import SpanLogs from './SpanLogs.vue'

const props = defineProps<Props>()

const { useToken } = theme
const { token } = useToken()

const traceApi = new TraceApi(configuration)

const pagination = ref(defaultPagination)

const open = ref(false)
const activeSpan = ref<SpanBrief>()

const { data, loading, refresh } = useRequest(
  () =>
    traceApi.getSpans(
      props.snapshotIds,
      JSON.stringify([
        {
          name: 'exceptionId',
          operator: '=',
          value: String(props.exception.exceptionId)
        }
      ]),
      undefined,
      undefined,
      undefined,
      undefined,
      pagination.value.pageNo - 1,
      pagination.value.pageSize
    ),
  {
    refreshDeps: [() => props.snapshotIds, () => props.exception.exceptionId, pagination],
    refreshDepsAction() {
      refresh()
    }
  }
)

const columns = ref<TableColumnsType>([
  {
    title: 'TraceId-SpanId',
    dataIndex: 'traceId',
    key: 'traceId',
    fixed: 'left',
    ellipsis: true
  },
  {
    title: '开始时间',
    key: 'timestamp',
    width: 150,
    customRender: ({ record }) => {
      return format(record.timestamp)
    }
  },
  {
    title: '时延 (ms)',
    dataIndex: 'duration',
    key: 'duration',
    width: 80,
    customRender: ({ record }) => {
      return (record.duration / 1_000_000).toFixed(2)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    customRender: ({ record }) => {
      return spanStatusText(record.status)
    }
  },
  {
    title: 'Span类型',
    key: 'spanKind',
    customRender: ({ record }) => {
      return spanKindText(record.spanKind)
    }
  },
  {
    title: 'Span名称',
    key: 'spanName',
    dataIndex: 'spanName'
  },
  {
    title: '应用名称',
    key: 'application',
    customRender: ({ record }) => {
      return record.application.displayName
    }
  },
  {
    title: '运行平面',
    dataIndex: 'platform',
    key: 'platform',
    customRender: ({ record }) => {
      return record.platform.displayName
    }
  },
  {
    title: '集群',
    dataIndex: 'cluster',
    key: 'cluster'
  },
  {
    title: '实例',
    dataIndex: 'instance',
    key: 'instance'
  },
  {
    title: '日志',
    dataIndex: 'logCount',
    key: 'logCount',
    width: 100
  }
])

const tableData = computed(() => {
  return data.value?.data.data
})

const current = computed(() => {
  if (tableData.value) {
    return (tableData.value.pageNo || 0) + 1
  }

  return defaultPagination.pageNo
})

const handleTableChange: TableProps['onChange'] = (paginationData) => {
  pagination.value = {
    pageNo: paginationData.current || defaultPagination.pageNo,
    pageSize: paginationData.pageSize || defaultPagination.pageSize
  }
}

function showLogs(record: SpanBrief) {
  open.value = true

  activeSpan.value = record
}
</script>

<template>
  <a-card title="关联Span" style="margin-top: 10px" :loading="loading">
    <a-table
      sticky
      :columns="columns"
      :data-source="tableData?.spans"
      :pagination="{
        pageSizeOptions: ['10', '25', '50', '100'],
        defaultPageSize: tableData?.pageSize || defaultPagination.pageSize,
        current,
        total: tableData?.totalCount,
        showTotal
      }"
      :scroll="{ x: 'max-content' }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'traceId'">
          <router-link :to="`/trace/${record.traceId}`" target="_blank">
            {{ record.traceId }} - {{ record.spanId }}
          </router-link>
        </div>

        <div v-if="column.key === 'logCount'">
          <span
            v-if="record.logCount > 0"
            @click="
              () => {
                showLogs(record)
              }
            "
            style="cursor: pointer"
            :style="{
              color: token.colorInfoTextActive
            }"
          >
            {{ record.logCount }}
          </span>

          <span v-else>{{ record.logCount }}</span>
        </div>
      </template>
    </a-table>
  </a-card>

  <a-modal v-model:open="open" title="日志详情" width="80%">
    <template #footer> </template>

    <SpanLogs v-if="activeSpan" :trace-id="activeSpan.traceId" :span-id="activeSpan.spanId" />
  </a-modal>
</template>
