<script lang="ts">
interface Props {
  snapshotId: string
  granularity?: number
  statusConditions: StatusCondition[]
  fieldConditions: FieldConditionResponse[]
}
</script>

<script setup lang="ts">
import {
  type SpanSubSnapshotRequest,
  type StatusCondition,
  type FieldConditionResponse
} from '@/api'
import { useRouter } from 'vue-router'
import FaultTrend from './FaultTrend.vue'
import HeatmapTrend from './HeatmapTrend.vue'
import { ref, watch } from 'vue'

const router = useRouter()
const props = defineProps<Props>()
const snapshotId = ref(props.snapshotId)
const activeKey = ref('HeatmapTrend')

watch(
  () => props.snapshotId,
  (value) => {
    snapshotId.value = value
  }
)

function goToDetail(data: SpanSubSnapshotRequest) {
  const { fieldConditions } = props

  const routeData = router.resolve({
    name: 'TracesList',
    query: {
      snapshotId: snapshotId.value,
      conditions: JSON.stringify({
        ...data,
        fieldConditions
      })
    }
  })

  window.open(routeData.href, '_blank')
}

function showDiagnosis(type: 'FaultTrend' | 'HeatmapTrend', data: SpanSubSnapshotRequest) {
  if (!snapshotId.value) {
    return
  }

  const { statusConditions, fieldConditions } = props

  const name = type === 'FaultTrend' ? 'SpanDiagnosis' : 'DurationDiagnosis'

  const routeData = router.resolve({
    name,
    query: {
      snapshotId: snapshotId.value,
      conditions: JSON.stringify({
        ...data,
        statusConditions,
        fieldConditions
      })
    }
  })

  window.open(routeData.href, '_blank')
}
</script>

<template>
  <a-card v-if="snapshotId">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="HeatmapTrend" tab="热点图趋势">
        <KeepAlive :max="10">
          <HeatmapTrend
            v-if="activeKey === 'HeatmapTrend'"
            :snapshotId="snapshotId"
            :granularity="props.granularity"
            @go-to-detail="
              (data) => {
                goToDetail(data)
              }
            "
            @show-diagnosis="
              (data) => {
                showDiagnosis('HeatmapTrend', data)
              }
            "
          />
        </KeepAlive>
      </a-tab-pane>

      <a-tab-pane key="FaultTrend" tab="成功率趋势">
        <KeepAlive :max="10">
          <FaultTrend
            v-if="activeKey === 'FaultTrend'"
            :snapshotId="snapshotId"
            @go-to-detail="
              (data) => {
                goToDetail(data)
              }
            "
            @show-diagnosis="
              (data) => {
                showDiagnosis('FaultTrend', data)
              }
            "
          />
        </KeepAlive>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
