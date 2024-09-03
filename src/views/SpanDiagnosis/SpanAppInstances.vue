<script lang="ts">
interface Props {
  snapshotIds: string[]
}
</script>

<script setup lang="ts">
import { DefaultApi, type InitialCauseAppInstance } from '@/api'
import { spanKindText } from '@/decorators/enum'
import { configuration } from '@/utils/http'
import type { TableColumnsType } from 'ant-design-vue'
import { divide } from 'lodash'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()

const defaultApi = new DefaultApi(configuration)

const { data, loading, refresh } = useRequest(
  () => defaultApi.getSpanAppInstances(props.snapshotIds),
  {
    debounceInterval: 100,
    refreshDeps: [() => props.snapshotIds],
    refreshDepsAction() {
      refresh()
    }
  }
)

const tableData = computed(() => {
  return data.value?.data.data
})

const columns = ref<TableColumnsType>([
  {
    title: '初因Span',
    dataIndex: 'spanName',
    key: 'spanName',
    fixed: 'left',
    ellipsis: true
  },
  {
    title: 'Span类型',
    dataIndex: 'spanKind',
    key: 'spanKind',
    width: 100
  },
  {
    title: '初因平面',
    dataIndex: 'platform',
    key: 'platform'
  },
  {
    title: '初因应用集群',
    dataIndex: 'cluster',
    key: 'cluster'
  },
  {
    title: '初因应用实例',
    dataIndex: 'instance',
    key: 'instance',
    ellipsis: true
  },
  {
    title: '异常数',
    dataIndex: 'exceptionCount',
    key: 'exceptionCount',
    width: 100
  },
  {
    title: '调用数/异常率',
    dataIndex: 'callCount',
    key: 'callCount',
    width: 150
  },
  {
    title: '相关监控',
    dataIndex: 'resources',
    key: 'resources'
  }
])

function exceptionRate(record: InitialCauseAppInstance) {
  const value = divide(record.exceptionCount, record.callCount) * 100

  return `${value.toFixed(2)}%`
}
</script>

<template>
  <a-table
    sticky
    :columns="columns"
    :data-source="tableData"
    rowKey="id"
    :pagination="false"
    :loading="loading"
    :scroll="{ x: 'max-content' }"
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

      <template v-if="column.key === 'callCount'">
        <span>{{ record.callCount }}</span> / <span>{{ exceptionRate(record) }}</span>
      </template>

      <template v-if="column.key === 'resources'">
        <div class="resources">
          <div v-for="(resource, index) in record.resources" :key="index" class="resource">
            <a :href="resource.monitorURL" target="_blank">
              <img :src="resource.logo" :alt="resource.name" />
            </a>
          </div>
        </div>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.resources {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.resource img {
  height: 28px;
}
</style>
