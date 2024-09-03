<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  id: string
  agentCount: number
  networkPort: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    id: '',
    agentCount: 0,
    networkPort: ''
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="id" label="分组Id">
      <a-select v-model:value="formState.id">
        <a-select-option value="dvxjfiugdf">dvxjfiugdf</a-select-option>
        <a-select-option value="gjiusdglkdf">gjiusdglkdf</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="agentCount" label="当前agent数">
      <a-input-number v-model:value="formState.agentCount" min="0" />
    </a-form-item>

    <a-form-item name="networkPort" label="采集网口">
      <a-input v-model:value="formState.networkPort" />
    </a-form-item>
  </a-form>
</template>
