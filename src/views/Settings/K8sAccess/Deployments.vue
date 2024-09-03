<script setup lang="ts">
import { k8sDeployments } from '@/apis/server'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import EditingForm from './Deployments/EditingForm.vue'

const openEditModal = ref(false)
const editing = ref<any>()

const { data, loading } = useRequest(() => {
  return k8sDeployments()
})

const tableData = computed(() => {
  return data.value
})

const columns = ref<TableColumnsType>([
  {
    title: '平面名称',
    dataIndex: 'platformName',
    key: 'platformName',
    customRender: ({ record }) => {
      return `${record.platformName} (${record.platformCode})`
    }
  },
  {
    title: '平面编码',
    dataIndex: 'platformCode',
    key: 'platformCode'
  },
  {
    title: '服务地址',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '证书/密钥',
    dataIndex: 'authenticationKey',
    key: 'authenticationKey'
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
      可供访问的K8S集群平面列表
      <span v-if="tableData?.totalCount"> (共{{ tableData?.totalCount }}项)</span>
    </template>

    <div style="margin-top: 10px" :loading="loading">
      <a-table :columns="columns" :data-source="tableData?.items" :pagination="false">
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
          <div v-if="column.key === 'authenticationKey'">
            <a target="_blank" href="/downloads/package.tar.gz">服务端证书-客户端证书-客户端秘钥</a>
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
      v-model:open="openEditModal"
      title="可供访问的K8S集群平面列表"
      @ok="save"
      destroyOnClose
    >
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
