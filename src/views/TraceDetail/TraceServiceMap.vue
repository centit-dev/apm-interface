<script lang="ts">
interface Props {
  trace: TraceDetail
}
</script>

<script lang="ts" setup>
import { TraceApi, type ServiceMapEdge, type ServiceMapNode, type TraceDetail } from '@/api'
import { useSoftwaresState } from '@/stores/softwares'
import { configuration } from '@/utils/http'
import type { EdgeConfig, NodeConfig } from '@antv/g6'
import { theme } from 'ant-design-vue'
import { computed } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<Props>()

const { useToken } = theme
const { token } = useToken()

const traceApi = new TraceApi(configuration)

const { data, refresh } = useRequest(() => traceApi.getTraceServiceMap(props.trace.brief.traceId), {
  refreshDeps: [() => props.trace.brief.traceId],
  refreshDepsAction() {
    refresh()
  }
})

const { getLogoUrl } = useSoftwaresState()

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

    edgesData.push({
      type: 'polyline',
      source: edge.fromCluster,
      target: edge.toCluster,
      label: `${edge.callCount}(${duration}ms)`,
      labelCfg: {
        style: {
          stroke: 'white',
          lineWidth: 5,
          fill: labelColor
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
</script>

<template>
  <ServiceMapChart
    v-if="serviceMapData"
    :nodes="serviceMapData.nodes"
    :edges="serviceMapData.edges"
  />
</template>
