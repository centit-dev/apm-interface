<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  softwareName: string
  logo: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    softwareName: '',
    logo: ''
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="softwareName" label="软件名称">
      <a-input v-model:value="formState.softwareName" />
    </a-form-item>

    <a-form-item name="logo" label="Logo">
      <a-input v-model:value="formState.logo" />
    </a-form-item>
  </a-form>
</template>
