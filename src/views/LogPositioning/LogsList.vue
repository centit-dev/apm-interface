<script setup lang="ts">
import {
  DefaultApi,
  QueryForType,
  type AppLogBrief,
  type FieldConditionResponse,
  type StatusCondition,
  type TimeRange
} from '@/api'
import { toFieldConditions } from '@/components/shared/QueryFilters'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { format } from '@/utils/date'
import { configuration } from '@/utils/http'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<{
  time: TimeRange
  statusConditions: StatusCondition[]
  fieldConditions: FieldConditionResponse[]
}>()

const defaultApi = new DefaultApi(configuration)

const query = ref({
  ...defaultPagination,
  ...props
})

watch(props, (newValue) => {
  query.value = {
    ...defaultPagination,
    ...newValue
  }
})

const { data: logsData, refresh } = useRequest(
  () => {
    const { pageNo, pageSize, time, statusConditions, fieldConditions } = query.value

    return defaultApi.listAppLogs(pageNo - 1, pageSize, {
      fieldConditions: toFieldConditions(fieldConditions),
      statusConditions,
      timeCondition: time,
      for: QueryForType.LOG
    })
  },
  {
    refreshDeps: [query],
    refreshDepsAction: () => {
      refresh()
    }
  }
)

const data = computed(() => {
  return logsData.value?.data.data
})

const current = computed(() => {
  if (data.value) {
    return (data.value.pageNo || 0) + 1
  }

  return defaultPagination.pageNo
})

const columns = ref<TableColumnsType>([
  {
    title: 'TraceId-SpanId',
    width: 150,
    dataIndex: 'traceId',
    key: 'traceId',
    fixed: 'left',
    ellipsis: true
  },
  {
    title: '时间',
    width: 180,
    dataIndex: 'timestamp',
    customRender: (opt) => {
      return format(opt.value)
    },
    key: 'timestamp',
    sorter: (a, b) => a.timestamp - b.timestamp
  },
  {
    title: '等级',
    width: 100,
    dataIndex: 'severityText',
    key: 'severityText'
  },
  {
    title: '日志信息',
    key: 'body',
    width: 400
  },
  {
    title: '平面',
    dataIndex: 'platform',
    key: 'platform',
    sorter: (a, b) => a.platform.localeCompare(b.platform, 'zh-Hans-CN', { sensitivity: 'accent' })
  },
  {
    title: '应用',
    dataIndex: 'application',
    key: 'application',
    sorter: (a, b) =>
      a.application.localeCompare(b.application, 'zh-Hans-CN', { sensitivity: 'accent' })
  },
  {
    title: '集群',
    dataIndex: 'cluster',
    key: 'cluster',
    sorter: (a, b) => a.cluster.localeCompare(b.cluster)
  },
  {
    title: '实例',
    dataIndex: 'instance',
    key: 'instance',
    sorter: (a, b) => a.instance.localeCompare(b.instance)
  },
  {
    title: '服务',
    dataIndex: 'service',
    key: 'service',
    sorter: (a, b) => a.service.localeCompare(b.service)
  }
])

const handleTableChange: TableProps['onChange'] = (pagination: {
  pageSize?: number
  current?: number
}) => {
  query.value = {
    ...query.value,
    pageNo: pagination.current || defaultPagination.pageNo,
    pageSize: pagination.pageSize || defaultPagination.pageSize
  }
}
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data?.logs"
    :rowKey="(record: AppLogBrief) => [record.traceId, record.spanId].join('-')"
    :pagination="{
      pageSizeOptions: ['10', '25', '50', '100'],
      defaultPageSize: data?.pageSize || defaultPagination.pageSize,
      current,
      total: data?.totalCount,
      showTotal
    }"
    :scroll="{ x: 'max-content' }"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'traceId'">
        <router-link v-if="record.traceId" :to="`/trace/${record.traceId}`" target="_blank">
          {{ record.traceId }} - {{ record.spanId }}
        </router-link>
      </template>

      <template v-if="column.key === 'platform'">
        {{ record.platform?.displayName }}
      </template>

      <template v-if="column.key === 'application'">
        {{ record.application?.displayName }}
      </template>

      <template v-if="column.key === 'body'">
        <a-popover trigger="click">
          <template #content>
            <p style="max-width: 60vw">{{ record.body }}</p>
          </template>

          <div class="inline-text">
            {{ record.body }}
          </div>
        </a-popover>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.inline-text {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
