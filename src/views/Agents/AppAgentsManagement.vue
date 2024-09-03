<script setup lang="ts">
import { getDeployments, getK8sClusters } from '@/apis/server'
import { defaultPagination, showTotal } from '@/components/shared/pagination'
import type { Variable } from '@/interfaces/variable'
import { format } from '@/utils/date'
import {
  BarsOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import AgentPicker from './AppAgentsManagement/AgentPicker.vue'

const selectedK8sClusterId = ref<number>()

const openVariablesManagementModal = ref(false)
const openAgentPickerModal = ref(false)
const variables = ref<Variable[]>([])
const editingRecord = ref<any>()

const { data: k8sClusters, loading: loadingK8sClusters } = useRequest(
  () => {
    return getK8sClusters()
  },
  {
    onSuccess(res) {
      if (res.length > 0) {
        selectedK8sClusterId.value = res[0].id
      }
    }
  }
)

const pagination = ref(defaultPagination)

const { data, loading, refresh } = useRequest(
  () => {
    return getDeployments(selectedK8sClusterId.value as number)
  },
  {
    ready: () => selectedK8sClusterId.value !== undefined,
    debounceInterval: 100,
    refreshDeps: [() => selectedK8sClusterId.value, pagination],
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
    title: '应用集群',
    dataIndex: 'clusterName',
    key: 'clusterName',
    fixed: 'left'
  },
  {
    title: '平面',
    dataIndex: 'platform',
    key: 'platform'
  },
  {
    title: 'agent状态',
    dataIndex: 'agentStatus',
    key: 'agentStatus',
    width: 100
  },
  {
    title: '发布agent',
    dataIndex: 'deployAgent',
    key: 'deployAgent'
  },
  {
    title: '自动重发',
    dataIndex: 'autoResend',
    key: 'autoResend',
    width: 100
  },
  {
    title: 'agent类型',
    dataIndex: 'agentType',
    key: 'agentType',
    width: 100
  },
  {
    title: '配置变量',
    dataIndex: 'configVariables',
    key: 'configVariables'
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
    key: 'actions',
    fixed: 'right'
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

function saveVariablesManagement() {
  openVariablesManagementModal.value = false

  const result = variables.value.filter((item) => item.name && item.value)

  console.log(result)
}

function updateVariables(data: Variable[]) {
  variables.value = data
}

function saveAgent() {
  console.log('save agent')
}

function updateAgent(data: { agentId: number; listen: boolean }) {
  console.log('update agent', data)
}
</script>

<template>
  <a-card style="margin-top: 10px">
    <div class="header-form-section">
      <label class="section-label"> k8s集群: </label>

      <a-select
        :loading="loadingK8sClusters"
        style="width: 300px"
        v-model:value="selectedK8sClusterId"
      >
        <a-select-option v-for="(cluster, index) in k8sClusters" :key="index" :value="cluster.id">
          {{ cluster.name }}
        </a-select-option>
      </a-select>
    </div>

    <div class="deployments" style="margin-top: 10px" :loading="loading">
      <a-table
        sticky
        :columns="columns"
        :data-source="tableData?.deployments"
        :row-selection="rowSelection"
        :row-key="rowKey"
        :scroll="{ x: 'max-content' }"
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
            <a-button>批量修改</a-button>
            <a-button>批量启用</a-button>
            <a-button>批量禁用</a-button>
            <a-button>批量删除</a-button>
          </a-space>
        </template>

        <template #bodyCell="{ column, record, index }">
          <div v-if="column.key === 'configVariables'" style="display: flex; flex-wrap: wrap">
            <div>
              <a-tag v-for="(value, key) in record.configVariables" :key="key">
                {{ value.name }} = {{ value.value }}
              </a-tag>
            </div>

            <EditOutlined
              v-if="record.configVariables && record.configVariables.length > 0"
              @click="
                () => {
                  openVariablesManagementModal = true
                  variables = record.configVariables
                }
              "
            />
          </div>

          <div v-if="column.key === 'actions'" class="actions">
            <a-tooltip>
              <template #title>选择应用agent</template>

              <EditOutlined
                v-if="record.agentId"
                @click="
                  () => {
                    openAgentPickerModal = true
                    editingRecord = record
                  }
                "
              />
              <BarsOutlined
                v-else
                @click="
                  () => {
                    openAgentPickerModal = true
                    editingRecord = record
                  }
                "
              />
            </a-tooltip>

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

    <a-modal
      v-model:open="openVariablesManagementModal"
      title="设置环境变量"
      @ok="saveVariablesManagement"
      destroyOnClose
    >
      <VariablesManagement :variables="variables" @onChange="updateVariables" />
    </a-modal>

    <a-modal
      v-model:open="openAgentPickerModal"
      title="选择应用agent"
      @ok="saveAgent"
      destroyOnClose
      width="750px"
    >
      <AgentPicker :record="editingRecord" @onChange="updateAgent" />
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
