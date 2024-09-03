<script lang="ts">
import type { IGroup } from '@antv/g-base'
import type { EdgeConfig, INode, Item, ModelConfig, NodeConfig } from '@antv/g6'
import { Graph, Minimap, registerNode } from '@antv/g6'
import { theme } from 'ant-design-vue'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { from, useSubscription } from '@vueuse/rxjs'
import { filter, finalize } from 'rxjs/operators'
import { arc } from 'd3-shape'

interface Props {
  nodes: NodeConfig[]
  edges: EdgeConfig[]
  selectedId?: string
}
</script>

<script lang="ts" setup>
import { ref } from 'vue'

const emits = defineEmits<{
  (e: 'selected', value?: string): void
  (e: 'selectedNodePosition', value: { x: number; y: number; width: number; height: number }): void
}>()

const container = ref<HTMLDivElement>()
const minimapContainer = ref<HTMLDivElement>()

const { useToken } = theme
const { token } = useToken()

const props = defineProps<Props>()

const graph$ = new BehaviorSubject<Graph | undefined>(undefined)

const drawChart = (container: HTMLDivElement, minimapContainer: HTMLDivElement) => {
  const plugins: any[] = []

  if (minimapContainer) {
    plugins.push(
      new Minimap({
        container: minimapContainer,
        size: [150, 100]
      })
    )
  }

  const containerWidth = container.scrollWidth || 1200
  const containerHeight = (container.scrollHeight || 900) - 20

  const nodeCircleColor = 'rgba(0,0,0,0.2)'

  registerNode('serviceNode', {
    draw(cfg: ModelConfig, group: IGroup) {
      const rect = group.addShape('circle', {
        attrs: {
          x: 0,
          y: 0,
          r: 40,
          lineWidth: 2,
          fillOpacity: 1,
          radius: 12,
          stroke: nodeCircleColor,
          fill: '#fff'
        },
        name: 'circle-shape',
        draggable: true
      })

      const counts: {
        successCount: number
        businessFaultCount: number
        systemFaultCount: number
      } = cfg.donutAttrs as any

      const totalCount =
        (counts?.successCount || 0) +
        (counts?.businessFaultCount || 0) +
        (counts?.systemFaultCount || 0)

      if (totalCount > 0) {
        const arcGenerator = arc()

        let startAngle = 0

        const arcsData = [
          {
            count: counts.successCount,
            color: token.value.colorSuccess
          },
          {
            count: counts.businessFaultCount,
            color: token.value.colorWarning
          },
          {
            count: counts.systemFaultCount,
            color: token.value.colorError
          }
        ]

        for (const arcData of arcsData) {
          const { count, color } = arcData

          if (count > 0) {
            const endAngle = startAngle + Math.PI * 2 * (count / totalCount)

            const path = arcGenerator({
              innerRadius: 36,
              outerRadius: 39,
              startAngle,
              endAngle,
              padAngle: 0.006
            })

            group.addShape('path', {
              attrs: {
                path: path || '',
                fill: color
              },
              name: 'line-shape',
              draggable: true
            })

            startAngle = endAngle
          }
        }
      }

      group.addShape('image', {
        attrs: {
          x: -23,
          y: -26,
          width: 46,
          height: 46,
          img: cfg.avatar
        },
        name: 'image-shape',
        draggable: true
      })

      group.addShape('text', {
        attrs: {
          y: 55,
          text: cfg.label,
          fill: 'rgba(0, 0, 0, 0.88)',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 10
        },
        name: 'title-shape',
        draggable: true
      })

      if (cfg.instanceCount) {
        group.addShape('text', {
          attrs: {
            y: 32,
            text: cfg.instanceCount,
            fill: 'rgba(0, 0, 0, 0.88)',
            textAlign: 'center'
          },
          name: 'instance-count-shape',
          draggable: true
        })
      }

      return rect
    },
    setState(name?: string, value?: string | boolean, item?: Item) {
      if (!item) {
        return
      }

      const group = item.getContainer()

      const circle = group.get('children').find((child: any) => child.cfg.name === 'circle-shape')

      const selected = item.hasState('selected')

      const restore = () => {
        circle.attr({
          stroke: nodeCircleColor,
          lineWidth: 2
        })
      }

      if (selected) {
        circle.attr({
          stroke: token.value.colorPrimary,
          lineWidth: 2
        })
      } else {
        restore()
      }

      if (circle && name === 'hover') {
        if (value) {
          circle.attr({
            stroke: token.value.colorLinkHover,
            lineWidth: 2
          })
        } else {
          restore()
        }
      }
    }
  })

  const graph = new Graph({
    container: container,
    width: containerWidth,
    height: containerHeight,
    fitCenter: true,
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      controlPoints: true
    },
    modes: {
      default: [
        'click-select',
        'activate-relations',
        'drag-canvas',
        'drag-node',
        {
          type: 'zoom-canvas',
          sensitivity: 3,
          minZoom: 0.6,
          maxZoom: 1.2
        }
      ]
    },
    plugins,
    edgeStateStyles: {
      active: {
        stroke: token.value.colorLinkHover
      },
      selected: {
        stroke: token.value.colorPrimary
      }
    }
  })

  graph.on('nodeselectchange', (event: any) => {
    emits('selected', event.select ? event.target._cfg.id : undefined)
    emitSelectedNodePosition(event.target)
  })

  graph.on('node:mouseenter', (event) => {
    if (event.item) {
      graph.setItemState(event.item, 'hover', true)
    }
  })

  graph.on('node:mouseleave', (event) => {
    if (event.item) {
      graph.setItemState(event.item, 'hover', false)
    }
  })

  graph.data({
    nodes: props.nodes,
    edges: props.edges
  })

  selectNode(graph, props.selectedId || '')

  graph.render()

  return graph
}

useSubscription(
  combineLatest([
    from(container, { immediate: true }).pipe(filter((element) => !!element)),
    from(minimapContainer, { immediate: true }).pipe(filter((element) => !!element))
  ])
    .pipe(
      finalize(() => {
        graph$.value?.destroy()
      })
    )
    .subscribe(([container, minimapContainer]) => {
      const graph = drawChart(container!, minimapContainer!)

      graph$.next(graph)
    })
)

function selectNode(graph: Graph, id?: string) {
  if (!id) {
    return
  }

  setTimeout(() => {
    graph.getNodes().forEach((node) => {
      graph.setItemState(node, 'selected', node.getModel().id === id)

      if (node.getModel().id === id) {
        emitSelectedNodePosition(node)
      }
    })
  }, 200)
}

function emitSelectedNodePosition(node: INode) {
  if (!node?._cfg) {
    return
  }

  const cfg = node._cfg.keyShape?.cfg.cacheCanvasBBox

  emits('selectedNodePosition', {
    width: cfg.width,
    height: cfg.height,
    x: cfg.x,
    y: cfg.y
  })
}
</script>

<template>
  <div style="height: 100%; position: relative">
    <div ref="container" style="flex-grow: 1"></div>
    <div
      ref="minimapContainer"
      style="width: 150px; position: absolute; left: 0; top: 0; border: 1px solid #ddd"
    ></div>
  </div>
</template>
