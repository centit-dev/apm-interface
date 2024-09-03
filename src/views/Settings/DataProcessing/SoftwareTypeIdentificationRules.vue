<script setup lang="ts">
import { softwareTypeIdentificationRules } from '@/apis/server'
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
import EditingForm from './SoftwareTypeIdentificationRules/EditingForm.vue'

const pagination = ref(defaultPagination)
const openEditModal = ref(false)
const editing = ref<any>()

const { data, loading, refresh } = useRequest(
  () => {
    return softwareTypeIdentificationRules()
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
    title: '软件名称',
    dataIndex: 'softwareName',
    key: 'softwareName'
  },
  {
    title: 'Logo',
    dataIndex: 'logo',
    key: 'logo'
  },
  {
    title: '规则',
    dataIndex: 'rules',
    key: 'rules'
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
      软件类型识别规则:

      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        (根据这些Span属性识别其属于哪种软件类型)
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
          <div v-if="column.key === 'logo'">
            <img
              :src="record.logo"
              :alt="record.softwareName"
              style="max-height: 60px; width: auto"
            />
          </div>

          <div v-if="column.key === 'rules'" class="rules">
            <div class="rule" v-for="(rule, index) in record.rules" :key="index">
              <span class="rule-key">{{ rule.key }}</span>
              <span>{{ rule.value }}</span>
            </div>
          </div>

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

    <a-modal v-model:open="openEditModal" title="软件类型识别规则" @ok="save" destroyOnClose>
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

.rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule {
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule span {
  padding: 4px;
}

.rule-key {
  border-right: 1px solid #ccc;
}
</style>
