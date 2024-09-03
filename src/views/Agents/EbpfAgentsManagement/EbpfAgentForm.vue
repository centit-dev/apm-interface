<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  cluster: string
  agentVersion: string
  agentGroup: string
  cpuLimit: number
  memoryLimit: number
  packetLimit: number
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    cluster: '',
    agentVersion: '',
    agentGroup: '',
    cpuLimit: 0,
    memoryLimit: 0,
    packetLimit: 0
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="cluster" label="选择k8s集群">
      <a-select v-model:value="formState.cluster">
        <a-select-option value="1">北京1区</a-select-option>
        <a-select-option value="2">北京2区</a-select-option>
        <a-select-option value="3">天津1区</a-select-option>
        <a-select-option value="4">上海1区</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="agentVersion" label="选择agent版本">
      <a-select v-model:value="formState.agentVersion">
        <a-select-option value="1">Trident-DaemonSet镜像1.0</a-select-option>
        <a-select-option value="2">Trident-DaemonSet镜像1.2</a-select-option>
        <a-select-option value="3">Trident进程1.2</a-select-option>
        <a-select-option value="4">Rosen进程1.0</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="agentGroup" label="选择agent分组">
      <a-select v-model:value="formState.agentGroup">
        <a-select-option value="9904afa47efe135c35cbc589552573c9">国产化库监控组</a-select-option>
        <a-select-option value="e8e72845eec9fbfceac61058ef975d97">缓存中间件监控组</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="cpuLimit" label="CPU限制">
      <a-input-number v-model:value="formState.cpuLimit" :min="1" addon-after="个" />
    </a-form-item>

    <a-form-item name="memoryLimit" label="内存限制">
      <a-input-number v-model:value="formState.memoryLimit" :min="0" addon-after="K字节" />
    </a-form-item>

    <a-form-item name="packetLimit" label="采集包限速">
      <a-input-number v-model:value="formState.packetLimit" :min="0" addon-after="K字节" />
    </a-form-item>
  </a-form>
</template>
