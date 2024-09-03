<script setup lang="ts">
import { getAgentsList } from '@/apis/server'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<{
  record: any
}>()
const emits = defineEmits<{
  (e: 'onChange', value: any): void
}>()

const { data, loading } = useRequest(() => {
  return getAgentsList()
})

const tableData = computed(() => {
  return data.value
})

const formState = reactive({
  agentId: props.record.agentId,
  listen: false
})

const columns = ref<TableColumnsType>([
  {
    title: '支持语言',
    dataIndex: 'language',
    key: 'language'
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version'
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description'
  }
])

const selectedRowKeys = ref<string[]>([])
const rowKey = (record: any) => record.id

watch(
  () => props.record.agentId,
  (value) => {
    if (value) {
      selectedRowKeys.value = [value]
    }
  },
  {
    immediate: true
  }
)

const rowSelection = {
  type: 'radio',
  fixed: true,
  selectedRowKeys: selectedRowKeys,
  onChange: (rowKeys: string[], selectedRows: any[]) => {
    selectedRowKeys.value = rowKeys

    formState.agentId = selectedRows[0].id
  }
}

watch(formState, (data) => {
  emits('onChange', data)
})
</script>

<template>
  <a-table
    sticky
    :columns="columns"
    :data-source="tableData"
    :row-selection="rowSelection"
    :row-key="rowKey"
    :pagination="false"
    :loading="loading"
    :scroll="{ x: 'max-content', y: 400 }"
    style="margin-top: 10px"
  >
  </a-table>

  <a-checkbox v-model:checked="formState.listen" style="margin-top: 15px">
    侦听应用Deployment变更后自动重发
  </a-checkbox>
</template>
