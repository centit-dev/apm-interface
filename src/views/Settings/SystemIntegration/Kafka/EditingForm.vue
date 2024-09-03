<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  exportTypes: string[]
  ip: string
  protocol: string
  encryption: string
  username: string
  password: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    exportTypes: [''],
    ip: '',
    protocol: '',
    encryption: '',
    username: '',
    password: ''
  }
)
const options = [
  {
    label: '日志',
    value: '日志'
  },
  {
    label: '链路',
    value: '链路'
  },
  {
    label: '指标',
    value: '指标'
  }
]

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="exportTypes" label="输出内容">
      <a-checkbox-group v-model:value="formState.exportTypes" :options="options" />
    </a-form-item>

    <a-form-item name="ip" label="服务端地址">
      <a-input v-model:value="formState.ip" />
    </a-form-item>

    <a-form-item name="protocol" label="安全协议">
      <a-select v-model:value="formState.protocol">
        <a-select-option value="TLS">TLS</a-select-option>
        <a-select-option value="SSL">SSL</a-select-option>
        <a-select-option value="HTTPS">HTTPS</a-select-option>
        <a-select-option value="SSH">SSH</a-select-option>
        <a-select-option value="IPsec">IPsec</a-select-option>
        <a-select-option value="SFTP">SFTP</a-select-option>
        <a-select-option value="FTPS">FTPS</a-select-option>
        <a-select-option value="SASL_PLAINTEXT">SASL_PLAINTEXT</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="encryption" label="服务端地址">
      <a-select v-model:value="formState.encryption">
        <a-select-option value="AES">AES</a-select-option>
        <a-select-option value="RSA">RSA</a-select-option>
        <a-select-option value="DES">DES</a-select-option>
        <a-select-option value="3DES">3DES</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="username" label="用户名">
      <a-input v-model:value="formState.username" />
    </a-form-item>

    <a-form-item name="password" label="密码">
      <a-input v-model:value="formState.password" />
    </a-form-item>
  </a-form>
</template>
