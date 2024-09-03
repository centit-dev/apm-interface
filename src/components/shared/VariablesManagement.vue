<script lang="ts" setup>
import { theme, type TableColumnsType } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import { PlusOutlined, MinusOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons-vue'
import type { Variable } from '@/interfaces/variable'

const props = defineProps<{
  variables: Variable[]
}>()

const emits = defineEmits<{
  (e: 'onChange', value: Variable[]): void
}>()

const variables = ref<Partial<Variable>[]>(props.variables || [])

const { useToken } = theme
const { token } = useToken()

const selected = ref<Variable>()
const editingIndex = ref<number>()
const editingName = ref<string>()
const editingValue = ref<string>()

const columns = ref<TableColumnsType>([
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value'
  }
])

const canCreateNewVariable = computed(() => {
  const last = variables.value[variables.value.length - 1]

  if (!last) {
    return true
  }

  return last.name !== ''
})

const customRow = (record: Variable) => {
  return {
    onClick: () => {
      if (editingIndex.value !== undefined) {
        return
      }

      if (selected.value?.name === record?.name) {
        selected.value = undefined
      } else {
        selected.value = record
      }
    }
  }
}

const rowClassName = (record: Variable) => {
  return {
    selected: record.name === selected.value?.name
  }
}

const editing = computed(() => editingName.value || editingValue.value)

watch(
  () => variables.value,
  (values) => {
    if (editing.value) {
      return
    }

    emits('onChange', values.filter((item) => item.name && item.value) as Variable[])
  }
)

function createNewVariable() {
  if (!canCreateNewVariable.value) {
    return
  }

  const variable = {
    name: '',
    value: ''
  }

  variables.value = [...variables.value, variable]

  editName(variable, variables.value.length - 1)
  editValue(variable, variables.value.length - 1)
}

function editName(variable: Partial<Variable>, index: number) {
  editingIndex.value = index
  editingName.value = variable.name
}

function editValue(variable: Partial<Variable>, index: number) {
  editingIndex.value = index
  editingValue.value = variable.value
}

function saveName() {
  if (!editingName.value || typeof editingIndex.value !== 'number') {
    return
  }

  const newValue = variables.value.map((variable, index) => {
    if (index === editingIndex.value) {
      variable.name = editingName.value
    }

    return variable
  })

  const invalid =
    variables.value.filter((variable) => variable.name === editingName.value).length > 1

  if (invalid) {
    return
  }

  variables.value = newValue

  editingName.value = undefined
  if (!editing.value) {
    editingIndex.value = undefined
  }
}

function saveValue() {
  if (!editingValue.value || typeof editingIndex.value !== 'number') {
    return
  }

  variables.value = variables.value.map((variable, index) => {
    if (index === editingIndex.value) {
      variable.value = editingValue.value
    }

    return variable
  })

  editingValue.value = undefined
  if (!editing.value) {
    editingIndex.value = undefined
  }
}

function removeSelectedVariable() {
  if (!selected.value) {
    return
  }

  variables.value = variables.value.filter((variable) => variable.name !== selected.value?.name)

  selected.value = undefined
}
</script>

<template>
  <a-space :size="12" style="padding: 4px">
    <PlusOutlined
      @click="createNewVariable"
      :class="{
        disabled: !canCreateNewVariable
      }"
    />

    <MinusOutlined
      :class="{
        disabled: !selected
      }"
      @click="removeSelectedVariable()"
    />
    <!-- <CopyOutlined /> TODO: 有意义吗？ -->
  </a-space>

  <a-table
    sticky
    :columns="columns"
    :data-source="variables"
    :pagination="false"
    :indentSize="0"
    :customRow="customRow"
    :row-class-name="rowClassName"
    size="small"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.dataIndex === 'name'">
        <div class="editable-cell">
          <div
            v-if="editingName !== undefined && index === editingIndex"
            class="editable-cell-input-wrapper"
          >
            <a-input v-model:value="editingName" @pressEnter="saveName()" />

            <CheckOutlined class="editable-cell-icon-check" @click="saveName()" />
          </div>

          <div v-else class="editable-cell-text-wrapper">
            {{ record.name || ' ' }}

            <EditOutlined class="editable-cell-icon" @click="editName(record, index)" />
          </div>
        </div>
      </template>

      <template v-if="column.dataIndex === 'value'">
        <div class="editable-cell">
          <div
            v-if="editingValue !== undefined && index === editingIndex"
            class="editable-cell-input-wrapper"
          >
            <a-input v-model:value="editingValue" @pressEnter="saveValue()" />

            <CheckOutlined class="editable-cell-icon-check" @click="saveValue()" />
          </div>

          <div v-else class="editable-cell-text-wrapper">
            {{ record.value || ' ' }}

            <EditOutlined class="editable-cell-icon" @click="editValue(record, index)" />
          </div>
        </div>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.anticon {
  cursor: pointer;
}

.disabled.anticon {
  color: #ccc;
  cursor: not-allowed;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.editable-cell-text-wrapper .editable-cell-icon {
  display: none;
}

.editable-cell-text-wrapper:hover .editable-cell-icon {
  display: block;
}

:deep(.selected),
:deep(.selected .ant-table-cell) {
  background-color: v-bind(token.colorInfoBgHover) !important;
}
</style>
