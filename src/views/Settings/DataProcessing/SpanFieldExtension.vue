<script setup lang="ts">
import { spanFieldsList } from '@/apis/server'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import EditingForm from './SpanFieldExtension/EditingForm.vue'

const pagination = ref(defaultPagination)
const openEditModal = ref(false)
const editing = ref<any>()

const { data, loading, refresh } = useRequest(
  () => {
    return spanFieldsList()
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
    title: '扩展类型',
    dataIndex: 'extentionType',
    key: 'extentionType'
  },
  {
    title: '变量名',
    dataIndex: 'variableName',
    key: 'variableName'
  },
  {
    title: 'Span字段名',
    dataIndex: 'spanFieldName',
    key: 'spanFieldName'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
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
      服务自定义字段扩展:

      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        (一旦识别到应用配置了这些扩展变量，即会被自动添加到该应用所有服务字段中)
      </span>
    </template>

    <div style="margin-top: 10px" :loading="loading">
      <a-table
        :columns="columns"
        :data-source="tableData?.items"
        :pagination="{
          pageSizeOptions: ['10', '25', '50', '100'],
          defaultPageSize: tableData?.pageSize || defaultPagination.pageSize,
          current,
          total: tableData?.totalCount,
          showTotal
        }"
        @change="handleTableChange"
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
              v-if="record.status === '失效'"
              title="确定要开启吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="
                () => {
                  console.log('start')
                }
              "
            >
              <PlayCircleOutlined />
            </a-popconfirm>

            <a-popconfirm
              v-if="record.status === '生效'"
              title="确定要禁用吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="
                () => {
                  console.log('stop')
                }
              "
            >
              <StopOutlined />
            </a-popconfirm>

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

    <a-modal v-model:open="openEditModal" title="Span字段扩展" @ok="save" destroyOnClose>
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
