<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  name: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    name: ''
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="name" label="名称">
      <a-input v-model:value="formState.name" />
    </a-form-item>
  </a-form>
</template>
