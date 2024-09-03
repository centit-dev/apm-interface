<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  variable: string
  name: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    variable: '',
    name: ''
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="variable" label="字段变量">
      <a-input v-model:value="formState.variable" />
    </a-form-item>

    <a-form-item name="name" label="字段名称">
      <a-input v-model:value="formState.name" />
    </a-form-item>
  </a-form>
</template>
