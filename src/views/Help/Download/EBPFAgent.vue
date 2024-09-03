<script setup lang="ts">
import { bBPFAgentDownload } from '@/apis/server'
import { theme, type TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const { useToken } = theme
const { token } = useToken()

const { data, loading } = useRequest(() => {
  return bBPFAgentDownload()
})

const tableData = computed(() => {
  return data.value
})

const columns = ref<TableColumnsType>([
  {
    title: '操作系统',
    dataIndex: 'name',
    key: 'name'
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
    dataIndex: 'downloadLink',
    key: 'downloadLink'
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
      非容器化eBPF注入agent下载:
      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        对于非容器化应用，为了捕获其服务调用，可现在下列eBPF相关agent，并按照安装指南进行安装配置后，可实现服务链路观测信号的采集
      </span>
    </template>

    <div
      :style="{
        color: token.colorError
      }"
      style="margin: 0 0 10px 6px"
    >
      注: 这里的ebpf
      agent下载，仅适用于传统非容器化应用。对于容器化应用，可直接在“agent管理”中发布ebpf采集器到k8s集群，无需下载ebpf
      agent。
    </div>

    <a-table :columns="columns" :loading="loading" :data-source="tableData" :pagination="false">
      <template #bodyCell="{ column, record }">
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
