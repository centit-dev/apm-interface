<script lang="ts">
interface Props {
  data: SpanDurationTrendsDurationData
  selectedPercentiles: Percentile[]
}

interface TableDataItem {
  typeName: string
  percentile: string
  [key: string]: string
}
</script>
<script setup lang="ts">
import { Percentile } from '@/api'
import { format } from '@/utils/date'
import type { TableColumnsType } from 'ant-design-vue'
import { uniq } from 'lodash'
import { computed, ref, watch } from 'vue'
import {
  spanDurationTrendsChartTypeText,
  spanDurationTrendsChartTypes,
  type SpanDurationTrendsChartDataItem,
  type SpanDurationTrendsDurationData
} from './interface'

const props = defineProps<Props>()

const percentileCount = ref(getPercentileCount(props.data))

const snapshotIds = computed(() => {
  const values: SpanDurationTrendsChartDataItem[] = Object.values(props.data.gaps)[0]

  if (values.length === 0) {
    return []
  }

  return uniq(values.map((value) => value.snapshotId))
})

const colors = computed(() => {
  return props.data.colors
})

const columns = computed<TableColumnsType>(() => {
  const data = snapshotIds.value.map((snapshotId) => {
    return {
      dataIndex: snapshotId
    }
  })

  return [
    {
      dataIndex: 'typeName',
      customCell: (_, index) => ({
        rowSpan: (() => {
          if (typeof index !== 'number' || percentileCount.value === 0) {
            return 1
          }

          return index % percentileCount.value === 0 ? percentileCount.value : 0
        })()
      }),
      customRender: ({ record, index }) => {
        if (index % percentileCount.value === 0) {
          return record.typeName
        }

        return ''
      }
    },
    {
      dataIndex: 'percentile'
    },
    ...data
  ]
})

const tableData = computed<TableDataItem[]>(() => {
  const data: TableDataItem[] = []

  spanDurationTrendsChartTypes.forEach((chartType) => {
    props.selectedPercentiles.forEach((percentile) => {
      const rows = props.data[chartType][percentile]

      if (rows) {
        const record: Record<string, number> = {}

        rows.forEach((row) => {
          record[row.snapshotId] = row.value
        })

        data.push({
          typeName: spanDurationTrendsChartTypeText(chartType),
          percentile,
          ...record
        })
      }
    })
  })

  return data
})

const druationDataTimeText = computed(() => {
  if (!props.data.time) {
    return ''
  }

  return format(props.data.time, 'YYYY-MM-DD HH:mm:ss.SSS')
})

const total = computed(() => {
  return (props.data.total || 0).toFixed(2)
})

function getPercentileCount(data: SpanDurationTrendsDurationData) {
  const value = props.selectedPercentiles.length

  return value > 0 ? value : 1
}

watch(
  () => props.data,
  (data) => {
    percentileCount.value = getPercentileCount(data)
  }
)
</script>

<template>
  <div style="display: flex; gap: 10px; padding: 4px; justify-content: space-between">
    <div class="key-value">
      <div class="key">时间:</div>
      <div>{{ druationDataTimeText }}</div>
    </div>

    <div class="key-value">
      <div class="key">合计:</div>
      <div>{{ total }}</div>
    </div>
  </div>

  <a-table
    :columns="columns"
    :data-source="tableData"
    :pagination="false"
    :scroll="{ x: 'max-content' }"
  >
    <template #headerCell="{ column }">
      <template v-if="snapshotIds.includes(column.dataIndex)">
        <div class="block-container">
          <span
            class="block"
            :style="{
              background: colors[column.dataIndex]
            }"
          ></span>
        </div>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.block-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.block {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.key-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.key {
  font-weight: bold;
}

:deep(.ant-table-cell) {
  padding: 6px !important;
}
</style>
