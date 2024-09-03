<script lang="ts">
interface Props {
  platform: string
  cluster: string
  timeRange: TimeRange
}
</script>

<script setup lang="ts">
import { DefaultApi, type TimeRange } from '@/api'
import { configuration } from '@/utils/http'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()

const defaultApi = new DefaultApi(configuration)

const { data, refresh } = useRequest(
  () => {
    const { timeType, fromTime, toTime, recentSeconds } = props.timeRange

    return defaultApi.getClusterRed(
      props.platform,
      props.cluster,
      undefined,
      undefined,
      timeType,
      fromTime,
      toTime,
      recentSeconds
    )
  },
  {
    refreshDeps: [() => props.platform, () => props.cluster, () => props.timeRange],
    refreshDepsAction() {
      refresh()
    }
  }
)

const instanceRedData = computed(() => {
  if (!data.value) {
    return []
  }

  return data.value.data.data
})

const columns = ref<TableColumnsType>([
  {
    title: 'Span名称',
    dataIndex: 'spanName',
    key: 'spanName'
  },
  {
    title: '调用次数',
    dataIndex: 'calls',
    key: 'calls'
  },
  {
    title: '成功率',
    dataIndex: 'successRate',
    key: 'successRate',
    customRender: ({ record }) => {
      return `${record.successRate}%`
    }
  },
  {
    title: 'P90时延',
    dataIndex: 'durationP90',
    key: 'durationP90'
  }
])
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="instanceRedData"
    :scroll="{ x: 'max-content', y: 240 }"
    :pagination="false"
  >
  </a-table>
</template>
