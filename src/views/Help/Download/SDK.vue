<script setup lang="ts">
import { sdkDownload } from '@/apis/server'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const { data, loading } = useRequest(() => {
  return sdkDownload()
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
    dataIndex: 'versions',
    key: 'versions'
  },
  {
    title: '支持特性',
    dataIndex: 'features',
    key: 'features'
  },
  {
    title: 'SDK文件',
    dataIndex: 'downloadLink',
    key: 'downloadLink'
  },
  {
    title: '开发指南',
    key: 'description'
  }
])
</script>

<template>
  <a-card style="margin-top: 10px">
    <template #title>
      应用代码开发SDK下载:
      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        对于下列开发语言相关应用，猫瞳不支持自动注入，但可以下载SDK，并遵循相关的开发指南，在应用中注入观测信号采集能力。
      </span>
    </template>

    <a-table :columns="columns" :loading="loading" :data-source="tableData" :pagination="false">
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'versions'">
          {{ record.versions.join(', ') }}
        </div>

        <div v-if="column.key === 'features'">
          {{ record.features.join(', ') }}
        </div>

        <div v-if="column.key === 'downloadLink'">
          <a href="https://www.maotong.cn/docs/agent" target="_blank">{{ record.downloadLink }}</a>
        </div>

        <div v-if="column.key === 'description'">
          <a href="https://www.maotong.cn/docs/agent" target="_blank">查看</a>
        </div>
      </template>
    </a-table>
  </a-card>
</template>
