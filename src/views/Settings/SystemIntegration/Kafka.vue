<script setup lang="ts">
import { kafkaExpoterServers } from '@/apis/server'
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import EditingForm from './Kafka/EditingForm.vue'

const openEditModal = ref(false)
const editing = ref<any>()

const { data, loading } = useRequest(() => {
  return kafkaExpoterServers()
})

const tableData = computed(() => {
  return data.value
})

const columns = ref<TableColumnsType>([
  {
    title: '输出内容',
    dataIndex: 'exportTypes',
    key: 'exportTypes'
  },
  {
    title: '服务端地址',
    dataIndex: 'ip',
    key: 'ip'
  },
  {
    title: '身份认证配置参数',
    dataIndex: 'authConfig',
    key: 'authConfig'
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions'
  }
])

function save() {
  console.log('save', editing.value)
}
</script>

<template>
  <a-card style="margin-top: 10px">
    <template #title>
      Kafka数据输出地址:

      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        (可支持输出到数据湖、日志中心等)
      </span>
    </template>

    <div style="margin-top: 10px" :loading="loading">
      <a-table :columns="columns" :data-source="tableData" :pagination="false">
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
          <div v-if="column.key === 'exportTypes'">
            {{ record.exportTypes.join(', ') }}
          </div>

          <div v-if="column.key === 'authConfig'">
            {{ record.protocol }}/{{ record.encryption }}, {{ record.username }}, ***
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

    <a-modal v-model:open="openEditModal" title="Kafka数据输出地址" @ok="save" destroyOnClose>
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
