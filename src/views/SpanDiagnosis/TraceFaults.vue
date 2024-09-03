<script lang="ts">
interface Props {
  snapshotId: string
}
</script>

<script setup lang="ts">
import { DefaultApi } from '@/api'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { spanKindText, spanStatusText } from '@/decorators/enum'
import { format } from '@/utils/date'
import { configuration } from '@/utils/http'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()

const pagination = ref(defaultPagination)
const defaultApi = new DefaultApi(configuration)

const { data, loading, refresh } = useRequest(
  () => {
    const { pageNo, pageSize } = pagination.value

    return defaultApi.getTraceFaults(props.snapshotId, pageNo - 1, pageSize)
  },
  {
    ready: () => !!props.snapshotId,
    debounceInterval: 100,
    refreshDeps: [() => props.snapshotId, pagination],
    refreshDepsAction() {
      refresh()
    }
  }
)

const tableData = computed(() => data.value?.data.data)

const current = computed(() => {
  if (tableData.value) {
    return (tableData.value.pageNo || 0) + 1
  }

  return defaultPagination.pageNo
})

const columns = ref<TableColumnsType>([
  {
    title: 'TraceId-SpanId',
    dataIndex: 'id',
    key: 'id',
    customRender: ({ record }) => {
      return record.traceId ? `${record.traceId}-${record.spanId}` : ''
    },
    width: 150,
    fixed: 'left',
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ record }) => {
      return spanStatusText(record.status)
    }
  },
  {
    title: 'Span名称',
    dataIndex: 'spanName',
    key: 'spanName',
    customRender: ({ record }) => {
      return `${record.serviceName} ${record.spanName}`
    }
  },
  {
    title: 'Span类型',
    dataIndex: 'spanKind',
    key: 'spanKind',
    customRender: ({ record }) => {
      return spanKindText(record.spanKind)
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
    title: '应用集群',
    dataIndex: 'cluster',
    key: 'cluster'
  },
  {
    title: '应用实例',
    dataIndex: 'instance',
    key: 'instance'
  },
  {
    title: '开始时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    customRender: ({ record }) => {
      return format(record.timestamp)
    }
  },
  {
    title: '时长(ms)',
    dataIndex: 'duration',
    key: 'duration',
    customRender: ({ record }) => {
      return record.duration ? (record.duration / 1_000_000).toFixed(2) : '-'
    }
  },
  {
    title: 'Gap(ms)',
    dataIndex: 'gap',
    key: 'gap',
    customRender: ({ record }) => {
      return record.gap ? (record.gap / 1_000_000).toFixed(2) : '-'
    }
  },
  {
    title: 'Self(ms)',
    dataIndex: 'selfDuration',
    key: 'selfDuration',
    customRender: ({ record }) => {
      return record.selfDuration ? (record.selfDuration / 1_000_000).toFixed(2) : '-'
    }
  },
  {
    title: '本端地址',
    dataIndex: 'localAddress',
    key: 'localAddress'
  },
  {
    title: '对端地址',
    dataIndex: 'peerAddress',
    key: 'peerAddress'
  },
  {
    title: '被影响首服务',
    dataIndex: 'affectedService',
    key: 'affectedService',
    customRender: ({ record }) => {
      return `${record.rootServiceName}-${record.rootSpanName}`
    }
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
    :columns="columns"
    :data-source="tableData?.spans"
    rowKey="id"
    :pagination="{
      pageSizeOptions: ['10', '25', '50', '100'],
      defaultPageSize: tableData?.pageSize || 10,
      current,
      total: tableData?.totalCount,
      showTotal
    }"
    :loading="loading"
    :scroll="{ x: 'max-content' }"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'spanName'">
        <a :href="record.serviceMonitorUrl" target="_blank">
          {{ record.serviceName }} {{ record.spanName }}
        </a>
      </template>

      <template v-if="column.key === 'spanKind'">
        {{ spanKindText(record.spanKind) }}
      </template>

      <template v-if="column.key === 'platform'">
        {{ record.platform.displayName }}
      </template>
    </template>
  </a-table>
</template>
