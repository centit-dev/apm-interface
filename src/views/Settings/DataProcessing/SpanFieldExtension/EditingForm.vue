<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ModelValue {
  extentionType: string
  variableName: string
  spanFieldName: string
  status: string
}

const model = defineModel<ModelValue>()
const formState = reactive<ModelValue>(
  model.value || {
    extentionType: '',
    variableName: '',
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
    <a-form-item name="extentionType" label="扩展类型">
      <a-select v-model:value="formState.extentionType">
        <a-select-option value="环境变量">环境变量</a-select-option>
        <a-select-option value="命令行参数">命令行参数</a-select-option>
        <a-select-option value="JVM参数">JVM参数</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item name="variableName" label="变量名">
      <a-input v-model:value="formState.variableName" />
    </a-form-item>

    <a-form-item name="spanFieldName" label="Span字段名">
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
