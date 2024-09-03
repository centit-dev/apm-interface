<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  fieldType: string
  spanFieldName: string
  spanFieldChinese: string
  status: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    fieldType: '',
    spanFieldName: '',
    spanFieldChinese: '',
    status: '生效'
  }
)

watch(formState, (values) => {
  model.value = values
})
</script>

<template>
  <a-form :model="formState" labelAlign="left" :labelCol="{ style: { width: '110px' } }">
    <a-form-item name="fieldType" label="字段类型">
      <a-select v-model:value="formState.fieldType">
        <a-select-option value="1">服务出参</a-select-option>
        <a-select-option value="2">服务入参</a-select-option>
        <a-select-option value="3">span属性</a-select-option>
        <a-select-option value="4">资源属性</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="spanFieldName" label="服务字段名">
      <a-input v-model:value="formState.spanFieldName" />
    </a-form-item>

    <a-form-item name="spanFieldChinese" label="服务字段中文名">
      <a-input v-model:value="formState.spanFieldChinese" />
    </a-form-item>

    <a-form-item name="status" label="状态">
      <a-radio-group v-model:value="formState.status">
        <a-radio value="生效">生效</a-radio>
        <a-radio value="失效">失效</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>
