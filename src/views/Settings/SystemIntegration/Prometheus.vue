<script setup lang="ts">
import { reactive, ref } from 'vue'

interface FormState {
  period: number
  address: {
    useOpenMetrics: boolean
    values: string[]
  }
  namespace: {
    key: string
    value: string
  }
  labels: string[]
}

const loading = ref<boolean>(false)

const formState = reactive<FormState>({
  period: 10,
  address: {
    useOpenMetrics: false,
    values: [
      'https://10.23.253.12:9000/metrics',
      'https://10.23.253.12:9001/metrics',
      'https://10.23.253.12:9002/metrics'
    ]
  },
  namespace: {
    key: '',
    value: ''
  },
  labels: []
})

const cluster = ref<string>('tls:10.243.1.24:6443')

function save() {
  console.log(formState)
}
</script>

<template>
  <a-card style="margin-top: 10px" title="Prometheus 配置">
    <a-form :model="formState" @finish="save" :label-col="{ style: { width: '160px' } }">
      <a-form-item label="指标聚合时间窗">
        <a-input :value="formState.period" addonAfter="秒/次" />
      </a-form-item>

      <a-form-item name="address" label="指标输出服务地址">
        <a-checkbox v-model:checked="formState.address.useOpenMetrics" style="margin: 5px 0 6px 0"
          >使用OpenMetrics输出</a-checkbox
        >
        <a-textarea v-model:value="formState.address.values" :rows="5" disabled />
      </a-form-item>

      <a-form-item name="namespace" label="自定义命名空间">
        <a-input-group compact>
          <a-input v-model:value="formState.namespace.key" style="width: 20%" />
          <a-input v-model:value="formState.namespace.value" style="width: 30%" />
        </a-input-group>
      </a-form-item>

      <!-- TODO: 自定义标签 -->

      <a-button type="primary" html-type="submit" :loading="loading">保存</a-button>
    </a-form>
  </a-card>
</template>
