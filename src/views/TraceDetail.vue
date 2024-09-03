<script setup lang="ts">
import { TraceApi } from '@/api'
import { configuration } from '@/utils/http'
import { computed, ref } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute } from 'vue-router'
import TraceStackTree from './TraceDetail/TraceStackTree.vue'
import TraceServiceMap from './TraceDetail/TraceServiceMap.vue'
import { DATE_TIME_FORMAT, format } from '@/utils/date'

const route = useRoute()

const traceApi = new TraceApi(configuration)
const { data: traceDetailResponse, loading } = useRequest(() =>
  traceApi.getTraceDetail(route.params.id as string)
)

const trace = computed(() => {
  return traceDetailResponse.value?.data.data
})

const brief = computed(() => {
  if (traceDetailResponse.value) {
    return traceDetailResponse.value.data.data.brief
  }

  return null
})

const spans = computed(() => {
  if (traceDetailResponse.value) {
    return traceDetailResponse.value.data.data.spans
  }

  return []
})

const activeKey = ref('StackTreeTab')
</script>

<template>
  <a-card :loading="loading">
    <a-descriptions title="Trace 详情" bordered v-if="brief">
      <a-descriptions-item label="TraceId">{{ brief.traceId }}</a-descriptions-item>
      <a-descriptions-item label="状态"> {{ brief.status }} </a-descriptions-item>
      <a-descriptions-item label="开始时间">
        {{ format(brief.startTime, DATE_TIME_FORMAT) }}
      </a-descriptions-item>
      <a-descriptions-item label="时长(ms)">
        {{ (brief.duration / 1_000_000).toFixed(2) }}
      </a-descriptions-item>
      <a-descriptions-item label="span数">{{ brief.spanCount }}</a-descriptions-item>
      <a-descriptions-item label="端点地址">{{ brief.endpointAddress }}</a-descriptions-item>
      <a-descriptions-item label="首服务">{{ brief.firstService }}</a-descriptions-item>
      <a-descriptions-item label="平面" class="set-with-comma">
        <span class="element" v-for="(platform, i) in brief?.platforms" :key="i">
          {{ platform.displayName }}
        </span>
      </a-descriptions-item>
      <a-descriptions-item label="历经应用" class="set-with-comma">
        <span class="element" v-for="(application, i) in brief?.applications" :key="i">
          {{ application.displayName }}
        </span>
      </a-descriptions-item>
    </a-descriptions>
  </a-card>

  <a-card style="margin-top: 10px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="StackTreeTab" tab="调用树">
        <TraceStackTree :spans="spans" />
      </a-tab-pane>

      <a-tab-pane key="TraceServiceMapTab" tab="服务地图">
        <TraceServiceMap v-if="trace" :trace="trace" />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<style></style>
