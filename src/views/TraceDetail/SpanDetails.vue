<script lang="ts">
interface Props {
  traceId: string
  spanId: string
}
</script>

<script lang="ts" setup>
import { TraceApi, type KeyValuePair } from '@/api'
import { computed, ref, watch } from 'vue'
import SpanLog from './SpanLog.vue'
import DescriptionsItem from '@/components/shared/DescriptionsItem.vue'
import { useRequest } from 'vue-request'
import { configuration } from '@/utils/http'

const props = defineProps<Props>()

const traceApi = new TraceApi(configuration)

const { data, run } = useRequest(
  () => traceApi.getSpanByTraceIdAndSpanId(props.traceId, props.spanId),
  {
    manual: true
  }
)

const activeSpan = computed(() => {
  return data.value?.data.data
})

const drawerTabActiveKey = ref<string>('span-info')

const spanInfoValue = ref('')
const resourceInfoValue = ref('')
const requestAndResponseInfoValue = ref('')

const resourceAttributes = computed<KeyValuePair[]>(() => {
  const attributes = (activeSpan.value?.resourceAttributes || []).sort((a, b) =>
    a.key.localeCompare(b.key)
  )

  if (!resourceInfoValue.value) {
    return attributes
  }

  const lowerCasedValue = resourceInfoValue.value.toLowerCase()

  return (
    attributes.filter(({ key, value }) => {
      return (
        key.toLowerCase().includes(lowerCasedValue) || value.toLowerCase().includes(lowerCasedValue)
      )
    }) || []
  )
})

const spanAttributes = computed<KeyValuePair[]>(() => {
  const attributes = [...(activeSpan.value?.spanAttributes || [])].sort((a, b) =>
    a.key.localeCompare(b.key)
  )

  if (!spanInfoValue.value) {
    return attributes
  }

  const lowerCasedValue = spanInfoValue.value.toLowerCase()

  return (
    attributes.filter(({ key, value }) => {
      return (
        key.toLowerCase().includes(lowerCasedValue) || value.toLowerCase().includes(lowerCasedValue)
      )
    }) || []
  )
})

const requestAndResponseAttributes = computed<{
  requestAttributes: KeyValuePair[]
  responseAttributes: KeyValuePair[]
}>(() => {
  const attributes = {
    requestAttributes: [...(activeSpan.value?.requestAttributes || [])].sort((a, b) =>
      a.key.localeCompare(b.key)
    ),
    responseAttributes: [...(activeSpan.value?.responseAttributes || [])].sort((a, b) =>
      a.key.localeCompare(b.key)
    )
  }

  if (!requestAndResponseInfoValue.value) {
    return attributes
  }

  const lowerCasedValue = requestAndResponseInfoValue.value.toLowerCase()

  return {
    requestAttributes: attributes.requestAttributes.filter(({ key, value }) => {
      return (
        key.toLowerCase().includes(lowerCasedValue) || value.toLowerCase().includes(lowerCasedValue)
      )
    }),
    responseAttributes: attributes.responseAttributes.filter(({ key, value }) => {
      return (
        key.toLowerCase().includes(lowerCasedValue) || value.toLowerCase().includes(lowerCasedValue)
      )
    })
  }
})

const requestAndResponseAttributesSize = computed(() => {
  return (
    requestAndResponseAttributes.value.requestAttributes.length +
    requestAndResponseAttributes.value.responseAttributes.length
  )
})

watch(
  props,
  () => {
    run()

    spanInfoValue.value = ''
    resourceInfoValue.value = ''
    requestAndResponseInfoValue.value = ''
  },
  {
    immediate: true
  }
)
</script>

<template>
  <h3 v-if="activeSpan" class="text-break">
    {{ activeSpan.serviceName }} {{ activeSpan.spanName }}
  </h3>

  <a-tabs v-if="activeSpan" v-model:activeKey="drawerTabActiveKey">
    <a-tab-pane key="span-info" tab="span信息">
      <a-input v-model:value="spanInfoValue" placeholder="字段筛选" />

      <div class="descriptions">
        <DescriptionsItem
          v-for="(attribute, index) in spanAttributes"
          :key="index"
          label="str"
          :name="attribute.key"
          :value="attribute.value"
        />
      </div>
    </a-tab-pane>

    <a-tab-pane key="resource-info" tab="资源信息">
      <a-input v-model:value="resourceInfoValue" placeholder="字段筛选" />

      <div class="descriptions">
        <DescriptionsItem
          v-for="(attribute, index) in resourceAttributes"
          :key="index"
          label="str"
          :name="attribute.key"
          :value="attribute.value"
        />
      </div>
    </a-tab-pane>

    <a-tab-pane
      v-if="requestAndResponseAttributesSize > 0"
      key="request-and-response-info"
      tab="出入参"
    >
      <a-input v-model:value="requestAndResponseInfoValue" placeholder="字段筛选" />

      <div class="descriptions">
        <h4>入参:</h4>
        <DescriptionsItem
          v-for="(attribute, index) in requestAndResponseAttributes.requestAttributes"
          :key="index"
          label="str"
          :name="attribute.key"
          :value="attribute.value"
        />
      </div>

      <div class="descriptions">
        <h4>出参:</h4>
        <DescriptionsItem
          v-for="(attribute, index) in requestAndResponseAttributes.responseAttributes"
          :key="index"
          label="str"
          :name="attribute.key"
          :value="attribute.value"
        />
      </div>
    </a-tab-pane>

    <a-tab-pane v-if="activeSpan.logs" key="span-log" tab="span日志">
      <SpanLog v-for="(log, index) in activeSpan.logs" :detail="log" :key="index" />
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped>
.descriptions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px 10px;
}
</style>
