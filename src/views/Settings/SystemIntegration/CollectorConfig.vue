<script setup lang="ts">
import { reactive, ref } from 'vue'

interface FormState {
  loadBalancerInstancesCount: number
  processorInstancesCount: number
}

const loading = ref<boolean>(false)

const formState = reactive<FormState>({
  loadBalancerInstancesCount: 1,
  processorInstancesCount: 2
})

const cluster = ref<string>('tls:10.243.1.24:6443')

function save() {
  console.log(formState)
}
</script>

<template>
  <a-card style="margin-top: 10px" title="Collector 配置">
    <div class="content">
      <a-form :model="formState" @finish="save" :label-col="{ style: { width: '160px' } }">
        <a-form-item label="所在K8S集群">
          <a-input :value="cluster" disabled />
        </a-form-item>

        <a-form-item name="loadBalancerInstancesCount" label="Load Balancer实例数">
          <a-input-number v-model:value="formState.loadBalancerInstancesCount" min="1" />
        </a-form-item>

        <a-form-item name="processorInstancesCount" label="Processor实例数">
          <a-input-number v-model:value="formState.processorInstancesCount" min="2" />
        </a-form-item>

        <a-button type="primary" html-type="submit" :loading="loading"> 生效 </a-button>
      </a-form>
    </div>
  </a-card>
</template>

<style scoped>
.content {
  flex-grow: 1;
}
</style>
