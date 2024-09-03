<script lang="ts" setup>
import { reactive, ref } from 'vue'

const llmFormState = reactive({
  model: '通义千问-Max',
  temperature: 0.85,
  maxTokens: 13000,
  prompt: '解读如下报错并给出修复建议'
})

const exceptionParseConfig = ref<'realTime' | 'fore'>('fore')
const count = ref(100)
function save() {}
</script>

<template>
  <a-card title="LLM模型配置" style="margin-top: 10px">
    <a-form :model="llmFormState" @finish="save" :label-col="{ style: { width: '160px' } }">
      <a-form-item label="对话模型" name="model">
        <a-select v-model:value="llmFormState.model">
          <a-select-option value="通义千问-Max">通义千问-Max</a-select-option>
          <a-select-option value="通义千问2-开源版-72B">通义千问2-开源版-72B</a-select-option>
          <a-select-option value="通义千问2-开源版-72B">通义千问2-开源版-72B</a-select-option>
          <a-select-option value="通义千问2-开源版-57B">通义千问2-开源版-57B</a-select-option>
          <a-select-option value="通义千问-Plus">通义千问-Plus</a-select-option>
          <a-select-option value="通义千问-Turbo">通义千问-Turbo</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item name="temperature" label="温度">
        <a-slider v-model:value="llmFormState.temperature" :max="1.99" :min="0.01" :step="0.01" />
      </a-form-item>

      <a-form-item name="maxTokens" label="回复上限">
        <a-slider v-model:value="llmFormState.maxTokens" :max="16000" :min="100" :step="100" />
      </a-form-item>

      <a-form-item label="提示词" name="prompt">
        <a-input v-model:value="llmFormState.prompt" />
      </a-form-item>

      <a-button type="primary" html-type="submit"> 保存 </a-button>
    </a-form>
  </a-card>

  <a-card title="异常报错解析参数" style="margin-top: 10px">
    <a-radio-group v-model:value="exceptionParseConfig" style="display: block">
      <a-radio value="fore" style="display: block">
        预处理解析，超过
        <a-input v-model:value="count" style="width: 50px; margin: 0 4px" /> 条/分钟同类报错，即
        自动预处理解析
      </a-radio>
      <a-radio value="realTime" style="display: block"> 使用时 临时解析 </a-radio>
    </a-radio-group>

    <a-button type="primary" style="margin-top: 10px"> 保存 </a-button>
  </a-card>
</template>
