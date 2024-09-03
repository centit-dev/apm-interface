<script setup lang="ts">
import { rumHttpHeaderList } from '@/apis/server'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import EditingForm from './RumHttpHeader/EditingForm.vue'

const pagination = ref(defaultPagination)
const openEditModal = ref(false)
const editing = ref<any>()
const abideWithW3c = ref(true)

const { data, loading, refresh } = useRequest(
  () => {
    return rumHttpHeaderList()
  },
  {
    refreshDeps: [pagination],
    refreshDepsAction() {
      refresh()
    }
  }
)

const tableData = computed(() => {
  return data.value
})

const current = computed(() => {
  if (tableData.value) {
    return (tableData.value.pageNo || 0) + 1
  }

  return defaultPagination.pageNo
})

const columns = ref<TableColumnsType>([
  {
    title: '字段变量',
    dataIndex: 'variable',
    key: 'variable'
  },
  {
    title: '字段名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions'
  }
])

const handleTableChange: TableProps['onChange'] = (paginationData) => {
  pagination.value = {
    pageNo: paginationData.current || defaultPagination.pageNo,
    pageSize: paginationData.pageSize || defaultPagination.pageSize
  }
}

function save() {
  console.log('save', editing.value)
}
</script>

<template>
  <a-card style="margin-top: 10px">
    <template #title>
      RUM HTTP Header 字段设置:
      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        (这些字段会被传播到所有应用服务字段)
      </span>
    </template>

    <div>
      <a-checkbox v-model:checked="abideWithW3c">遵循w3c规范传播TraceId和SpanId</a-checkbox>

      <a-table
        :columns="columns"
        :loading="loading"
        :data-source="tableData?.items"
        :pagination="{
          pageSizeOptions: ['10', '25', '50', '100'],
          defaultPageSize: tableData?.pageSize || defaultPagination.pageSize,
          current,
          total: tableData?.totalCount,
          showTotal
        }"
        @change="handleTableChange"
        style="margin-top: 10px"
      >
        <template #footer>
          <a-button
            @click="
              () => {
                openEditModal = true
              }
            "
            >添加</a-button
          >
        </template>

        <template #bodyCell="{ column, record }">
          <div v-if="column.key === 'actions'" class="actions">
            <EditOutlined
              @click="
                () => {
                  editing = record
                  openEditModal = true
                }
              "
            />

            <a-popconfirm
              title="确定要删除吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="
                () => {
                  console.log('delete')
                }
              "
            >
              <DeleteOutlined />
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </div>

    <a-modal v-model:open="openEditModal" title="RUM HTTP Header 字段" @ok="save" destroyOnClose>
      <EditingForm v-model="editing" />
    </a-modal>
  </a-card>
</template>

<style scoped>
:deep(.ant-table-title) {
  padding-left: 0;
}

.actions .anticon {
  cursor: pointer;
  font-size: 20px;
  margin-right: 5px;
}
</style>
