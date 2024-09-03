<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  platformName: string
  platformCode: string
  clusterName: string
  address: string
  username: string
  serverCertificate: string
  clientCertificate: string
  clientKey: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    platformName: '',
    platformCode: '',
    clusterName: '',
    address: '',
    username: '',
    serverCertificate: '',
    clientCertificate: '',
    clientKey: ''
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '130px' } }">
    <a-form-item name="platformName" label="平面名称">
      <a-input v-model:value="formState.platformName" />
    </a-form-item>

    <a-form-item name="platformCode" label="平面编码">
      <a-input v-model:value="formState.platformCode" />
    </a-form-item>

    <a-form-item name="address" label="服务地址">
      <a-input v-model:value="formState.address" />
    </a-form-item>

    <a-form-item name="serverCertificate" label="服务端证书">
      <a-textarea v-model:value="formState.serverCertificate" />
    </a-form-item>

    <a-form-item name="username" label="用户名">
      <a-input v-model:value="formState.username" />
    </a-form-item>

    <a-form-item name="clientCertificate" label="客户端证书">
      <a-textarea v-model:value="formState.clientCertificate" />
    </a-form-item>

    <a-form-item name="clientKey" label="客户端密钥">
      <a-textarea v-model:value="formState.clientKey" />
    </a-form-item>
  </a-form>
</template>
