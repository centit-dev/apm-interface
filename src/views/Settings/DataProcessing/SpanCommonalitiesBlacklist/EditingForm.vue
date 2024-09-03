<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  fieldType: string
  spanFieldName: string
  status: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    fieldType: '',
    spanFieldName: '',
    status: '生效'
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="fieldType" label="扩展类型">
      <a-select v-model:value="formState.fieldType">
        <a-select-option value="Span属性">Span属性</a-select-option>
        <a-select-option value="Resource属性">Resource属性</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="spanFieldName" label="服务字段名">
      <a-input v-model:value="formState.spanFieldName" />
    </a-form-item>

    <a-form-item name="status" label="状态">
      <a-radio-group v-model:value="formState.status">
        <a-radio value="生效">生效</a-radio>
        <a-radio value="失效">失效</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>
