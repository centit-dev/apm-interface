<script lang="ts">
interface Props {
  traceId: string
  spanId: string
}
</script>

<script lang="ts" setup>
import { DefaultApi, type AppLogDetail } from '@/api'
import { format } from '@/utils/date'
import { configuration } from '@/utils/http'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()

const keyword = ref('')

const defaultApi = new DefaultApi(configuration)

const {
  data: response,
  loading,
  refresh
} = useRequest(() => defaultApi.getSpanAppLogs(props.traceId, props.spanId), {
  refreshDeps: [() => props.spanId, () => props.traceId],
  refreshDepsAction() {
    refresh()
  }
})

const allData = computed(() => {
  return response.value?.data.data
})

const data = computed(() => {
  if (!keyword.value) {
    return allData.value
  }

  const searchValue = keyword.value.toLowerCase()

  return (allData.value || []).filter((log) => {
    return (
      log.severityText.toLowerCase().includes(searchValue) ||
      log.scopeName.toLowerCase().includes(searchValue) ||
      log.application.displayName.toLowerCase().includes(searchValue) ||
      log.platform.displayName.toLowerCase().includes(searchValue) ||
      log.cluster.toLowerCase().includes(searchValue) ||
      log.instance.toLowerCase().includes(searchValue) ||
      log.body?.toLowerCase().includes(searchValue)
    )
  })
})

const stacktrace = (log: AppLogDetail) => {
  return log.logAttributes?.find((item) => item.key === 'exception.stacktrace')?.value
}
</script>

<template>
  <div style="position: relative; min-height: 300px">
    <a-form-item label="日志筛选">
      <a-input v-model:value="keyword" placeholder="请输入关键字..." />
    </a-form-item>

    <a-spin
      v-if="loading"
      size="large"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"
    />

    <div v-else style="margin-top: 10px">
      <div v-for="(log, index) in data" :key="index" class="log">
        <a-descriptions bordered size="small" :column="4">
          <a-descriptions-item label="时间戳">
            {{ format(log.timestamp) }}
          </a-descriptions-item>
          <a-descriptions-item label="等级">{{ log.severityText }}</a-descriptions-item>
          <a-descriptions-item label="发生位置" :span="2">
            {{ log.scopeName }}
          </a-descriptions-item>
          <a-descriptions-item label="应用名称">
            {{ log.application.displayName }}
          </a-descriptions-item>
          <a-descriptions-item label="平面">{{ log.platform.displayName }}</a-descriptions-item>
          <a-descriptions-item label="应用集群">{{ log.cluster }}</a-descriptions-item>
          <a-descriptions-item label="应用实例">{{ log.instance }}</a-descriptions-item>
          <a-descriptions-item label="异常" :span="4">
            <div class="log-body">
              <pre class="text-break">{{ log.body }} </pre>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="异常" :span="4">
            <div class="log-body">
              <pre class="text-break">{{ stacktrace(log) }} </pre>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log {
  margin-bottom: 20px;
}

.log-body {
  width: 100%;
  padding: 10px;
  max-height: 400px;
  overflow-y: scroll;
}
</style>
