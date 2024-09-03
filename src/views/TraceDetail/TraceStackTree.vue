<script lang="ts">
interface Props {
  spans: TimelineSpan[]
}
</script>

<script lang="ts" setup>
import { type TimelineSpan } from '@/api'
import TimeRuler from '@/components/shared/TimeRuler.vue'
import { generateRandomColors } from '@/utils/color'
import {
  addAssociations,
  assembleTree,
  calculateChildrenCount,
  flatTreeNodes,
  updateNodeByKey,
  type TreeNode
} from '@/utils/tree'
import type { TableColumnsType } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import SpanDetails from './SpanDetails.vue'
import { maxBy } from 'lodash'

interface Item extends TimelineSpan, TreeNode {}

const props = defineProps<Props>()
const totalDuration = ref<number>()

const spansTree = ref<Item[]>([])

const activeSpan = ref<Item>()
const hoveredSpanId = ref<string>()

const colors = computed(() => {
  const records: Record<string, string> = {}

  if (!props.spans) {
    return records
  }

  const data = generateRandomColors(props.spans.length)

  data.forEach((color, index) => {
    records[props.spans[index].spanId] = color
  })

  return records
})

const colorByItem = (item: Item) => {
  return colors.value[item.spanId]
}

watch(
  () => props.spans,
  (spans) => {
    if (!spans) {
      return
    }

    const { tree } = assembleTree(spans, 'spanId', 'parentSpanId')

    for (const item of tree) {
      addAssociations(item, (node) => {
        if (node.level && node.level <= 5) {
          node.expanded = true
        }

        if (node.isCause) {
          node.expanded = true

          if (node.parents) {
            node.parents.forEach((parent) => {
              parent.expanded = true
            })
          }
        }
      })

      calculateChildrenCount(item)
    }

    spansTree.value = tree
    activeSpan.value = tree[0]

    totalDuration.value = maxBy(tree, (item) => item.duration)?.duration
  },
  {
    immediate: true
  }
)

const rootSpan = (span: Item) => {
  if (span.parents && span.parents.length > 0) {
    return span.parents[0]
  }

  return span
}

const rectWidth = 36
const rectHeight = 24
const paddingTop = 16
const paddingRight = 12
const height = rectHeight + paddingTop * 2
const offset = 12
const lineGap = offset + rectWidth / 2
const totalWidth = (record: Item) => {
  if (!record.parents || record.parents.length === 0) {
    return rectWidth + paddingRight
  }
  const recordWidth = record.children ? rectWidth : 20

  return rectWidth / 2 + (record.parents.length - 1) * lineGap + offset + recordWidth + paddingRight
}
const textOffset = 19

const columns = ref<TableColumnsType>([
  {
    title: '服务名',
    key: 'name',
    fixed: 'left'
  },
  {
    title: '异常类型',
    dataIndex: 'faultKind',
    key: 'faultKind',
    customRender: ({ record }) => record.faultKind?.displayName
  },
  {
    title: '操作类型',
    dataIndex: 'spanKind',
    key: 'spanKind',
    customRender: ({ record }) => record.spanKind?.displayName
  },
  {
    title: '应用',
    key: 'application',
    customRender: ({ record }) => record.application.displayName
  },
  {
    title: '平面',
    dataIndex: 'platform',
    key: 'platform',
    customRender: ({ record }) => record.platform.displayName
  },
  {
    title: '集群',
    dataIndex: 'cluster',
    key: 'cluster'
  },
  {
    title: 'duration',
    dataIndex: 'duration',
    key: 'duration',
    width: 500
  }
])

const dataSource = computed(() => {
  return spansTree.value.map((item) => flatTreeNodes(item, (target) => !!target.expanded)).flat()
})

const toggleNode = (record: Item) => {
  spansTree.value = spansTree.value.map((row) => {
    updateNodeByKey(row, 'spanId', record.spanId, (node) => {
      node.expanded = !node.expanded
    })

    return row
  })
}

const rowKey = (record: Item) => record.spanId

const customRow = (record: Item) => {
  return {
    onClick: () => {
      activeSpan.value = record
    },
    onMouseenter: () => {
      hoveredSpanId.value = record.spanId
    },
    onMouseleave: () => {
      hoveredSpanId.value = undefined
    }
  }
}

const rowClassName = (record: Item, index: number) => {
  if (record.spanId === hoveredSpanId.value) {
    return 'hovered'
  }

  if (!record.parents) {
    return
  }

  if (record.parents.some((parent) => parent.spanId === hoveredSpanId.value)) {
    return 'hovered'
  }
}
</script>

<template>
  <div class="container">
    <a-table
      class="trace-detail-stack-tree"
      :columns="columns"
      :data-source="dataSource"
      :rowKey="rowKey"
      :customRow="customRow"
      :scroll="{ x: 'max-content' }"
      :pagination="false"
      :row-class-name="rowClassName"
      childrenColumnName="none"
    >
      <template #headerCell="{ title }">
        <template v-if="title === 'duration'">
          <TimeRuler v-if="totalDuration" :show-tick="true" :totalDuration="totalDuration" />
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="name-field">
            <div
              class="icon"
              style="top: -16px"
              @click.stop="
                () => {
                  toggleNode(record)
                }
              "
            >
              <svg
                :height="height + 'px'"
                :viewBox="'0 0 ' + totalWidth(record) + ' ' + height"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <template v-if="record.level === 1">
                  <rect
                    x="1"
                    :y="paddingTop"
                    :width="rectWidth"
                    :height="rectHeight"
                    :stroke="colorByItem(record)"
                    :fill="record.expanded ? 'transparent' : colorByItem(record)"
                    rx="4"
                    stroke-width="2"
                  />

                  <text
                    :x="textOffset"
                    y="34"
                    :fill="record.expanded ? 'black' : 'white'"
                    text-anchor="middle"
                    text-length="36"
                  >
                    {{ record.childrenCount }}
                  </text>

                  <line
                    v-if="record.expanded"
                    :x1="rectWidth / 2"
                    :y1="paddingTop + rectHeight"
                    :x2="rectWidth / 2"
                    :y2="height"
                    :stroke="colorByItem(record)"
                    stroke-width="2"
                  />
                </template>

                <template v-else>
                  <template v-for="(parent, index) in record.parents" :key="index">
                    <line
                      v-if="
                        record.parents.length === index + 1 || !record.parents[index + 1].isLast
                      "
                      :x1="rectWidth / 2 + index * lineGap"
                      y1="0"
                      :x2="rectWidth / 2 + index * lineGap"
                      :y2="
                        record.parents.length === index + 1 && record.isLast ? height / 2 : height
                      "
                      :stroke="colorByItem(parent)"
                      stroke-width="2"
                    />

                    <line
                      v-if="record.parents.length === index + 1"
                      :x1="rectWidth / 2 + index * lineGap"
                      y1="28"
                      :x2="
                        record.children?.length > 0
                          ? rectWidth / 2 + index * lineGap + offset
                          : rectWidth / 2 + index * lineGap + offset + rectWidth / 2 - 3
                      "
                      y2="28"
                      :stroke="colorByItem(parent)"
                      stroke-width="2"
                    />
                  </template>

                  <template v-if="record.children?.length > 0">
                    <rect
                      :x="rectWidth / 2 + (record.parents?.length - 1) * lineGap + offset"
                      :y="paddingTop"
                      :width="rectWidth"
                      :height="rectHeight"
                      :stroke="colorByItem(record)"
                      :fill="record.expanded ? 'transparent' : colorByItem(record)"
                      rx="4"
                      stroke-width="2"
                    />

                    <text
                      :x="
                        rectWidth / 2 + (record.parents?.length - 1) * lineGap + offset + textOffset
                      "
                      y="34"
                      :fill="record.expanded ? 'black' : 'white'"
                      text-anchor="middle"
                      text-length="36"
                    >
                      {{ record.childrenCount }}
                    </text>

                    <line
                      v-if="record.expanded"
                      :x1="
                        rectWidth / 2 +
                        (record.parents?.length - 1) * lineGap +
                        offset +
                        rectWidth / 2
                      "
                      :y1="paddingTop + rectHeight"
                      :x2="
                        rectWidth / 2 +
                        (record.parents?.length - 1) * lineGap +
                        offset +
                        rectWidth / 2
                      "
                      :y2="height"
                      :stroke="colorByItem(record)"
                      stroke-width="2"
                    />
                  </template>

                  <template v-else>
                    <circle
                      :cx="
                        rectWidth / 2 +
                        (record.parents?.length - 1) * lineGap +
                        offset +
                        rectWidth / 2
                      "
                      :cy="height / 2"
                      :r="3"
                      :stroke="colorByItem(record)"
                      :fill="colorByItem(record)"
                      stroke-width="2"
                    />
                  </template>
                </template>
              </svg>
            </div>

            <div :style="{ paddingLeft: totalWidth(record) + 'px' }">
              {{ record.serviceName }} {{ record.spanName }}

              <a-tooltip v-if="record.isCause">
                <template #title>造成Trace失败的最底层的出错Span</template>
                <a-tag color="red" :bordered="false">初因</a-tag>
              </a-tooltip>
            </div>
          </div>
        </template>

        <template v-if="column.key === 'duration'">
          <TimeRuler
            :duration="record.duration"
            :startedAt="record.timestamp"
            :totalDuration="rootSpan(record).duration"
            :beginningTime="rootSpan(record).timestamp || record.timestamp"
          />
        </template>
      </template>
    </a-table>

    <div class="details">
      <SpanDetails v-if="activeSpan" :trace-id="activeSpan.traceId" :span-id="activeSpan.spanId" />
    </div>
  </div>
</template>

<style scoped>
.name-field {
  display: flex;
  align-items: center;
  position: relative;
}

.name-field.child {
  height: 56px;
}

.icon {
  position: absolute;
  cursor: pointer;
}

.container {
  display: flex;
  gap: 10px;
  position: relative;
}

.trace-detail-stack-tree {
  flex-grow: 1;
  width: calc(100% - 320px);
}

.details {
  flex: 0 0 320px;
  max-width: 320px;
  position: sticky;
  top: 0;
  overflow-y: scroll;
  max-height: calc(100vh - 100px);
}

:deep(.ant-table-tbody > tr > td) {
  border-top: none !important;
}

:deep(.hovered) td {
  background-color: #fafafa;
}
</style>
