<script lang="ts">
interface SearchFormState {
  cluster: {
    platform: string
    cluster: string
  }
  gateDepths?: {
    inletDepth?: number
    outletDepth?: number
  }
  time: TimeRange
}

interface QueryParams {
  cluster?: string
  platform?: string
  inletDepth?: number
  outletDepth?: number
  timeType?: number
  fromTime?: number
  toTime?: number
  recentSeconds?: number
}
</script>
<script setup lang="ts">
import {
  DefaultApi,
  TimeRangeType,
  type ServiceMapEdge,
  type ServiceMapNode,
  type TimeRange
} from '@/api'
import ClusterPicker from '@/components/shared/ClusterPicker.vue'
import { useSoftwaresState } from '@/stores/softwares'
import { msToSecondsText } from '@/utils/date'
import { configuration } from '@/utils/http'
import { humanizeNumber } from '@/utils/number'
import type { EdgeConfig, NodeConfig } from '@antv/g6'
import { theme } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute, useRouter } from 'vue-router'
import InstanceDetail from './ServiceMapPositioning/InstanceDetail.vue'
import RedData from './ServiceMapPositioning/RedData.vue'
import {
  BehaviorSubject,
  Subject,
  interval,
  repeatWhen,
  startWith,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  timer
} from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'
import { createControlableInterval } from '@/utils/stream'

const defaultFormState = {
  cluster: {
    platform: '',
    cluster: ''
  },
  gateDepths: {
    inletDepth: 1,
    outletDepth: 1
  },
  time: {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 3 * 60
  }
}

const searchFormState = reactive<SearchFormState>(defaultFormState)

const { useToken } = theme
const { token } = useToken()

const route = useRoute()
const router = useRouter()

const selectedClusterId = ref<string>()
const instance = ref<string>()
const nodePosition = ref<{ x: number; y: number }>({
  x: 0,
  y: 0
})

const { getLogoUrl } = useSoftwaresState()

const defaultApi = new DefaultApi(configuration)

const searchFormValid = computed(() => {
  const { cluster, gateDepths } = searchFormState

  if (
    !cluster?.cluster ||
    !cluster?.platform ||
    !gateDepths?.inletDepth ||
    !gateDepths?.outletDepth
  ) {
    return false
  }

  return true
})

const timePickerOptions = [
  {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 60,
    text: '实时',
    tooltip: '每分钟自动刷新一次'
  },
  {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 3 * 60
  },
  {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 10 * 60
  },
  {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 30 * 60
  },
  {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 60 * 60
  },
  {
    timeType: TimeRangeType.RECENT,
    recentSeconds: 120 * 60
  }
]

const { data, loading, run } = useRequest(
  () => {
    const { cluster, gateDepths, time } = searchFormState

    return defaultApi.createServiceMap({
      timeCondition: time,
      platform: cluster.platform,
      cluster: cluster.cluster,
      entranceDepth: gateDepths?.inletDepth || 4,
      exitDepth: gateDepths?.outletDepth || 4
    })
  },
  {
    manual: true
  }
)

const defaultOpen = computed(() => {
  return (
    !searchFormState.cluster ||
    !searchFormState.cluster.platform ||
    !searchFormState.cluster.cluster
  )
})

parseQueryParams()

function parseQueryParams() {
  const { cluster, platform, inletDepth, outletDepth, timeType, fromTime, toTime, recentSeconds } =
    route.query

  searchFormState.cluster = {
    platform: platform ? platform.toString() : '',
    cluster: cluster ? cluster.toString() : ''
  }

  searchFormState.gateDepths = {
    inletDepth: inletDepth ? Number(inletDepth) : defaultFormState.gateDepths.inletDepth,
    outletDepth: outletDepth ? Number(outletDepth) : defaultFormState.gateDepths.outletDepth
  }

  searchFormState.time = {
    timeType:
      Number(timeType) === TimeRangeType.DESIGNATED
        ? TimeRangeType.DESIGNATED
        : TimeRangeType.RECENT,
    fromTime: fromTime ? Number(fromTime) : undefined,
    toTime: toTime ? Number(toTime) : undefined,
    recentSeconds: recentSeconds ? Number(recentSeconds) : defaultFormState.time.recentSeconds
  }

  selectedClusterId.value = searchFormState.cluster.cluster

  if (searchFormValid.value) {
    run()
  }
}

function toQueryParams(): QueryParams {
  const { cluster, gateDepths, time } = searchFormState

  return {
    cluster: cluster.cluster,
    platform: cluster.platform,
    inletDepth: gateDepths?.inletDepth,
    outletDepth: gateDepths?.outletDepth,
    timeType: time.timeType,
    fromTime: time.fromTime,
    toTime: time.toTime,
    recentSeconds: time.recentSeconds
  }
}

watch(searchFormState, () => {
  if (searchFormValid.value) {
    run()

    instance.value = undefined
    selectedClusterId.value = searchFormState.cluster.cluster

    router.replace({
      name: 'ServiceMapPositioning',
      query: {
        ...toQueryParams()
      }
    })
  } else {
    data.value = undefined
  }
})

function parseData(nodes: ServiceMapNode[], edges: ServiceMapEdge[]) {
  const nodesData: NodeConfig[] = []
  const edgesData: EdgeConfig[] = []

  nodes.forEach((node) => {
    const nodeData: NodeConfig = {
      type: 'serviceNode',
      id: node.cluster,
      label: node.cluster,
      instanceCount: node.instanceCount,
      avatar: getLogoUrl(node.software.name)
    }

    if (node.type !== 'SOFTWARE') {
      nodeData.donutAttrs = {
        successCount: node.successCount,
        businessFaultCount: node.businessFaultCount,
        systemFaultCount: node.systemFaultCount
      }
    }

    nodesData.push(nodeData)
  })

  edges.forEach((edge) => {
    let duration = edge.duration || 0
    duration = parseFloat((duration / 1_000_000).toFixed(2))

    const labelColor = (() => {
      if (duration > 500) {
        return token.value.colorErrorText
      } else if (duration > 300) {
        return token.value.colorWarningText
      }

      return token.value.colorSuccessText
    })()

    const successRate = Math.round((edge.successCount / edge.callCount) * 10000) / 100
    const colorBySuccessRate = () => {
      if (successRate < 90) {
        return token.value.colorWarningText
      } else if (successRate < 50) {
        return token.value.colorErrorText
      }

      return token.value.colorSuccessText
    }

    edgesData.push({
      type: 'polyline',
      source: edge.fromCluster,
      target: edge.toCluster,
      label: `${humanizeNumber(edge.callCount)}/${successRate}% (${msToSecondsText(duration)})`,
      color: colorBySuccessRate(),
      labelCfg: {
        style: {
          stroke: 'white',
          lineWidth: 2,
          fill: labelColor,
          fontSize: 10,
          textBaseline: 'bottom'
        }
      },
      style: {
        endArrow: true
      }
    })
  })

  return {
    nodes: nodesData,
    edges: edgesData
  }
}

const serviceMapData = computed(() => {
  const rawData = data.value?.data.data

  if (!rawData) {
    return
  }

  return parseData(rawData.nodes, rawData.edges)
})

const selectedCluster = computed(() => {
  const rawData = data.value?.data.data

  if (!rawData) {
    return
  }

  return rawData.nodes.find((node) => node.cluster === selectedClusterId.value)
})

const controlableInterval = createControlableInterval(60000)
useSubscription(
  controlableInterval.stream.subscribe(() => {
    run()
  })
)

watch(
  () => searchFormState.time,
  (timeRange) => {
    if (timeRange.timeType === TimeRangeType.RECENT && timeRange.recentSeconds === 60) {
      controlableInterval.open()
    } else {
      controlableInterval.close()
    }
  },
  {
    immediate: true
  }
)

function nodeSelected(nodeId: string) {
  selectedClusterId.value = nodeId

  instance.value = ''
}

function updateNodePosition(position: { x: number; y: number; width: number; height: number }) {
  nodePosition.value = {
    x: position.x + position.width,
    y: position.y + position.height
  }
}
</script>

<template>
  <a-card>
    <a-form
      :model="searchFormState"
      name="search"
      class="search-form"
      autocomplete="off"
      labelAlign="left"
      :labelCol="{ span: 4, style: { width: '80px', fontWeight: 'bold' } }"
    >
      <a-form-item name="clusterId" label="应用集群" style="margin-bottom: 0">
        <ClusterPicker v-model="searchFormState.cluster" :default-open="defaultOpen" />
      </a-form-item>

      <a-form-item name="gateDepths" label="出入口深度" style="margin-bottom: 0">
        <GateDepthsPicker v-model="searchFormState.gateDepths" />
      </a-form-item>

      <a-form-item name="time" label="时间">
        <TimePicker v-model="searchFormState.time" :options="timePickerOptions" />
      </a-form-item>
    </a-form>
  </a-card>

  <a-card :loading="loading" style="margin-top: 10px">
    <div v-if="serviceMapData" class="service-map-container">
      <ServiceMapChart
        :nodes="serviceMapData.nodes"
        :edges="serviceMapData.edges"
        :selectedId="selectedClusterId"
        @selected="nodeSelected"
        @selected-node-position="updateNodePosition"
      />

      <!-- <a-card
        v-if="selectedClusterId && selectedCluster?.type && nodePosition.y > 0"
        size="small"
        style="position: absolute; transform: translate(-50%, 20px)"
        :style="{
          top: `${nodePosition.y}px`,
          left: `${nodePosition.x}px`
        }"
      >
        <RedData
          :platform="searchFormState.cluster.platform"
          :cluster="selectedClusterId"
          :time-range="searchFormState.time"
        />
      </a-card> -->

      <div
        v-if="selectedClusterId && selectedCluster?.type"
        style="padding: 0 5px; position: relative"
      >
        <InstanceDetail
          :platform="searchFormState.cluster.platform"
          :cluster="selectedClusterId"
          :type="selectedCluster?.type"
          :time-range="searchFormState.time"
        />
      </div>
    </div>

    <a-empty v-else />
  </a-card>
</template>

<style scoped>
.search-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 500px;

  &:deep(.ant-form-item) {
    margin-bottom: 0;
  }
}

.service-map-container {
  display: grid;
  gap: 10px;
  width: 100%;
  grid-template-columns: 1fr 350px;
  min-height: 500px;
  position: relative;
}

@media screen and (max-width: 1200px) {
  .service-map-container {
    grid-template-columns: 1fr 250px;
  }
}
</style>
