<script setup lang="ts">
import { agentDownload } from '@/apis/server'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const { data, loading } = useRequest(() => {
  return agentDownload()
})

const tableData = computed(() => {
  return data.value
})

const columns = ref<TableColumnsType>([
  {
    title: '开发语言',
    dataIndex: 'language',
    key: 'language'
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version'
  },
  {
    title: '支持信号',
    dataIndex: 'signals',
    key: 'signals'
  },
  {
    title: 'Agent文件',
    dataIndex: 'agentFile',
    key: 'agentFile'
  },
  {
    title: '配置说明',
    key: 'description'
  }
])
</script>

<template>
  <a-card style="margin-top: 10px">
    <template #title>
      应用代码自动注入Agent下载:
      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        猫瞳支持如下开发语言相关应用的自动注入，可选择相应的版本下载，并按照使用说明进行配置。
      </span>
    </template>

    <a-table :columns="columns" :loading="loading" :data-source="tableData" :pagination="false">
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'agentFile'">
          <a href="https://www.maotong.cn/docs/agent" target="_blank">{{ record.agentFile }}</a>
        </div>

        <div v-if="column.key === 'description'">
          <a href="https://www.maotong.cn/docs/agent" target="_blank">查看</a>
        </div>
      </template>
    </a-table>
  </a-card>
</template>
