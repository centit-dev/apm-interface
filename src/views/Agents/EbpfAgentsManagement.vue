<script setup lang="ts">
import { ebpfAgentList } from '@/apis/server'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import { format } from '@/utils/date'
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import EbpfAgentForm from './EbpfAgentsManagement/EbpfAgentForm.vue'

const pagination = ref(defaultPagination)
const openEditModal = ref(false)
const editing = ref<any>()

const { data, loading, refresh } = useRequest(
  () => {
    return ebpfAgentList()
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
    title: '采集器名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '平面',
    dataIndex: 'platform',
    key: 'platform'
  },
  {
    title: '分组',
    dataIndex: 'group',
    key: 'group'
  },
  {
    title: '状态',
    dataIndex: 'agentStatus',
    key: 'agentStatus'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os'
  },
  {
    title: 'CPU限制',
    dataIndex: 'cpuLimit',
    key: 'cpuLimit'
  },
  {
    title: '内存限制',
    dataIndex: 'memoryLimit',
    key: 'memoryLimit'
  },
  {
    title: '采集包限速',
    dataIndex: 'packetLimit',
    key: 'packetLimit'
  },
  {
    title: '版本',
    dataIndex: 'agentVersion',
    key: 'agentVersion'
  },
  {
    title: '操作时间',
    dataIndex: 'operationTime',
    key: 'operationTime',
    customRender: ({ record }) => {
      return format(record.operationTime)
    }
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions'
  }
])

const selectedRowKeys = ref<string[]>([])
const rowKey = (record: any) => record.id

const rowSelection = {
  fixed: true,
  selectedRowKeys: selectedRowKeys,
  onChange: (rowKeys: string[], selectedRows: any[]) => {
    selectedRowKeys.value = rowKeys

    console.log('selectedRowKeys:', rowKeys)
  }
}

const handleTableChange: TableProps['onChange'] = (paginationData) => {
  pagination.value = {
    pageNo: paginationData.current || defaultPagination.pageNo,
    pageSize: paginationData.pageSize || defaultPagination.pageSize
  }

  selectedRowKeys.value = []
}

function saveAgentInfo() {
  console.log('save agent info', editing.value)
}
</script>

<template>
  <a-card style="margin-top: 10px">
    <div class="agents" style="margin-top: 10px" :loading="loading">
      <a-table
        sticky
        :columns="columns"
        :data-source="tableData?.agents"
        :row-selection="rowSelection"
        :row-key="rowKey"
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
          <a-space>
            <a-button
              @click="
                () => {
                  openEditModal = true
                  editing = {}
                }
              "
              >新增</a-button
            >

            <a-button>批量修改</a-button>
            <a-button>批量启用</a-button>
            <a-button>批量禁用</a-button>
            <a-button>批量删除</a-button>
          </a-space>
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
              v-if="record.agentStatus === '禁用'"
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
              v-if="record.agentStatus === '启用'"
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

    <a-modal v-model:open="openEditModal" title="eBPF Agent信息" @ok="saveAgentInfo" destroyOnClose>
      <EbpfAgentForm v-model="editing" />
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
