<script lang="ts">
interface Props {
  snapshotId: string
  spanGroupFields: SpanGroupFieldWithDisplayName[]
  colorful?: boolean
}
</script>

<script setup lang="ts">
import { DefaultApi, type SpanGroup, type SpanGroupField } from '@/api'
import type { SpanGroupFieldWithDisplayName } from '@/interfaces/span-group-field'
import { generateRandomColors } from '@/utils/color'
import { configuration } from '@/utils/http'
import type { TableColumnsType } from 'ant-design-vue'
import type { CheckboxChangeEvent } from 'ant-design-vue/es/_util/EventInterface'
import { divide } from 'lodash'
import { computed, ref, watch } from 'vue'
import { useRequest } from 'vue-request'

const props = withDefaults(defineProps<Props>(), {
  colorful: true
})

const emit = defineEmits<{
  (
    e: 'onChange',
    data: Array<{
      snapshotId: string
      color: string
    }>
  ): void
  (e: 'onRemove', field: SpanGroupField): void
}>()

const overheadCheckboxProps = computed(() => {
  if (!data.value || data.value?.length === 0) {
    return {
      checked: false,
      indeterminate: false,
      disabled: true
    }
  }

  if (selectedSnapshotIds.value.length === data.value?.length) {
    return {
      checked: true,
      indeterminate: false,
      disabled: false
    }
  }

  return {
    checked: false,
    indeterminate: selectedSnapshotIds.value.length > 0,
    disabled: false
  }
})
const unchecked = computed(() => false)

const defaultApi = new DefaultApi(configuration)

const {
  data: response,
  loading,
  run
} = useRequest(() => defaultApi.groupSpanSnapshots(props.snapshotId, props.spanGroupFields), {
  refreshDeps: [() => props.snapshotId, () => props.spanGroupFields],
  refreshDepsAction: () => {
    run()
  },
  onSuccess: (res) => {
    selectedSnapshotIds.value = res.data.groups.map((group) => group.snapshotId)
  },
  debounceInterval: 100
})

const data = computed(() => {
  return response.value?.data.groups || []
})

const colors = computed<Record<string, string>>(() => {
  if (!data.value || !props.colorful) {
    return {}
  }

  const generatedColors = generateRandomColors(data.value.length)

  const result: Record<string, string> = {}

  data.value.forEach((group, index) => {
    result[group.snapshotId] = generatedColors[index]
  })

  return result
})

const rowKey = (record: SpanGroup) => record.snapshotId

const selectedSnapshotIds = ref<string[]>([])
function selected(group: SpanGroup) {
  return !!selectedSnapshotIds.value.find((id) => id === group.snapshotId)
}

function toggleGroup(group: SpanGroup) {
  if (selected(group)) {
    selectedSnapshotIds.value = selectedSnapshotIds.value.filter((id) => id !== group.snapshotId)
  } else {
    selectedSnapshotIds.value = [...selectedSnapshotIds.value, group.snapshotId]
  }
}

function toggleAllGroups(isChecked?: boolean) {
  if (isChecked) {
    selectedSnapshotIds.value = data.value.map((group) => group.snapshotId)
  } else {
    selectedSnapshotIds.value = []
  }
}

const columns = ref<TableColumnsType>([
  {
    title: 'selection',
    key: 'selection',
    width: 50
  },
  {
    title: '集群 服务名',
    dataIndex: 'labels',
    key: 'labels',
    width: 200
  },
  {
    title: '异常数',
    dataIndex: 'innormalCount',
    key: 'innormalCount'
  },
  {
    title: '调用数/报错率',
    key: 'callCount'
  },
  {
    title: '实例',
    key: 'innormalInstances',
    ellipsis: true
  },
  {
    title: '被影响首服务',
    key: 'innormalFirstServices'
  }
])

watch(selectedSnapshotIds, (ids) => {
  emit(
    'onChange',
    ids.map((id) => ({ snapshotId: id, color: colors.value[id] }))
  )
})

function innormalRate(group: SpanGroup) {
  if (!group.callCount || group.callCount === 0) {
    return '0%'
  }

  const value = divide(group.innormalCount, group.callCount) * 100

  return `${value.toFixed(2)}%`
}

function removeSpanGroupField(field: SpanGroupField) {
  emit('onRemove', field)
}
</script>

<template>
  <a-card title="Span分组列表" :loading="loading">
    <a-table
      :columns="columns"
      :data-source="data"
      :rowKey="rowKey"
      :pagination="false"
      :scroll="{ y: 400 }"
    >
      <template #headerCell="{ title, column }">
        <template v-if="title === 'selection'">
          <a-checkbox
            :indeterminate="overheadCheckboxProps.indeterminate"
            v-model:checked="overheadCheckboxProps.checked"
            :disabled="overheadCheckboxProps.disabled"
            @change="
              (e: CheckboxChangeEvent) => {
                toggleAllGroups(e.target.checked)
              }
            "
          />
        </template>

        <template v-if="column.dataIndex === 'labels'">
          <div style="display: flex; flex-wrap: wrap; gap: 4px">
            <a-tag
              v-for="(field, index) in props.spanGroupFields"
              :key="index"
              closable
              @close="
                () => {
                  removeSpanGroupField(field)
                }
              "
            >
              <span class="limited-text">{{ field.displayName }}</span>
            </a-tag>
          </div>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'selection'">
          <a-checkbox
            :class="{
              colorful: props.colorful
            }"
            :style="{
              '--checkboxColor': colors[record.snapshotId]
            }"
            :indeterminate="selected(record)"
            v-model:checked="unchecked"
            @change="
              (e: CheckboxChangeEvent) => {
                toggleGroup(record)
              }
            "
          />
        </template>

        <template v-if="column.key === 'labels'">
          <div style="display: flex; flex-direction: column; gap: 4px">
            <div v-for="(label, index) in record.labels" :key="index">
              {{ label }}
            </div>
          </div>
        </template>

        <template v-if="column.key === 'callCount'">
          <span>{{ record.callCount }}</span> <span>/</span>
          <span>
            {{ innormalRate(record) }}
          </span>
        </template>

        <template v-if="column.key === 'innormalInstances'">
          <template v-if="record.innormalInstances && record.innormalInstances.length > 0">
            <a-tooltip>
              <template #title>
                {{ record.innormalInstances?.join(', ') }}
              </template>

              {{ record.innormalInstances[0] }}
              <span v-if="record.innormalInstances.length > 1">
                等 {{ record.innormalInstances.length }} 个
              </span>
            </a-tooltip>
          </template>
        </template>

        <template v-if="column.key === 'innormalFirstServices'">
          <a-tooltip>
            <template #title>
              <div class="set-with-comma">
                <span v-for="(service, i) in record.innormalFirstServices" :key="i" class="element">
                  {{ service }}
                </span>
              </div>
            </template>

            <div
              v-for="(service, i) in record.innormalFirstServices"
              :key="i"
              style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
              :title="service"
            >
              {{ service }}
            </div>
          </a-tooltip>

          <div style="width: 200px"></div>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<style lang="scss" scoped>
.colorful {
  :deep(.ant-checkbox-indeterminate .ant-checkbox-inner) {
    border-color: var(--checkboxColor);
  }

  :deep(.ant-checkbox-indeterminate .ant-checkbox-inner:after) {
    background-color: var(--checkboxColor);
  }
}

:deep(.ant-tag) {
  display: flex;
}

.limited-text {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
</style>
