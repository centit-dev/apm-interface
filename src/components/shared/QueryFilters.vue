<script lang="ts">
type Step = 'PickKey' | 'PickOp' | 'PickValue'

interface Props {
  requests: QueryFilterRequests
  placeholder?: string
}
</script>

<script lang="ts" setup>
import { type ConditionKey, type FieldConditionResponse } from '@/api'
import type { SelectProps } from 'ant-design-vue'
import { Form } from 'ant-design-vue'
import { groupBy } from 'lodash'
import { computed, ref, watch } from 'vue'
import { useRequest } from 'vue-request'
import type { QueryFilterRequests } from './QueryFilters'

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索并选择...'
})

const modelValue = defineModel<FieldConditionResponse[]>()
const internalModelValue = ref<FieldConditionResponse[]>(initInternalModelValue())

const selectValue = ref<string[]>([])
const searchValue = ref('')
const containOptionFromSearch = ref(false)
const open = ref(false)
const options = ref<SelectProps['options']>([])
const conditionKeyMap = ref<Record<string, ConditionKey>>({})
const operatorMap = ref<Record<string, string>>({})
const step = ref<Step>('PickKey')
const currentKey = ref<ConditionKey>()
const editingValue = ref<Partial<FieldConditionResponse>>({})
const formItemContext = Form.useInjectFormItemContext()

const { loading } = useRequest(() => props.requests.listConditionKeys(), {
  onSuccess: (conditionKeys) => {
    const map: Record<string, ConditionKey> = {}

    conditionKeys.forEach((item) => {
      map[item.name] = item
    })

    conditionKeyMap.value = map

    resetOptions()

    if (internalModelValue?.value && internalModelValue.value.length > 0) {
      updateSelectValue()
    }
  }
})

const tagsData = computed(() => {
  // 将多值的条件合并
  // 多个值的tag显示为一个tag
  const data: Record<string, string> = {}

  const grouped = groupModelValue()

  Object.keys(grouped).forEach((key) => {
    const values = grouped[key]

    const label = selectOptionLabel(values[0])

    const valuesText = (() => {
      if (values.length > 1) {
        return `[${values.map((v) => v.value).join(', ')}]`
      }

      return values[0].value
    })()
    data[label] = [values[0].name.displayName, values[0].operator.displayName, valuesText].join(' ')
  })

  return data
})

watch(
  () => editingValue.value,
  (newValue) => {
    if (!newValue.name) {
      searchValue.value = ''

      return
    }

    searchValue.value = [
      newValue.name.displayName,
      newValue.operator?.displayName,
      newValue.value
    ].join(' ')
  }
)

watch(modelValue, () => {
  internalModelValue.value = initInternalModelValue()

  updateSelectValue()
})

function updateModelValue(value: FieldConditionResponse[]) {
  internalModelValue.value = value

  updateSelectValue()

  const grouped = groupModelValue()

  modelValue.value = Object.keys(grouped).map((key) => {
    const values = grouped[key]
    const first = values[0]

    const { name, operator } = first

    if (allowMultipleValues(operator.name)) {
      return {
        name,
        operator,
        value: JSON.stringify(values.map((v) => v.value))
      }
    }

    return first
  })

  formItemContext.onFieldChange()
}

function initInternalModelValue() {
  if (!modelValue.value) {
    return []
  }

  // 将多值的条件展开
  // 例如：{ name: 'a', operator: 'in', value: ['1', '2'] }
  // 展开为：
  // { name: 'a', operator: 'in', value: '1' }
  // { name: 'a', operator: 'in', value: '2' }
  // 以便于在组件内部处理
  const collection: FieldConditionResponse[] = []

  modelValue.value.forEach((item) => {
    if (allowMultipleValues(item.operator.name)) {
      const values: string[] = (() => {
        try {
          return JSON.parse(item.value)
        } catch {
          return []
        }
      })()

      const { name, operator } = item

      values.forEach((val) => {
        collection.push({
          name,
          operator,
          value: val
        })
      })
    } else {
      collection.push(item)
    }
  })

  return collection
}

function groupModelValue() {
  return groupBy(internalModelValue.value, (item) => `${item.name.name} ${item.operator.name}`)
}

function allowMultipleValues(operator?: string) {
  return operator === 'in' || operator === 'notIn'
}

function resetOptions() {
  setTimeout(() => {
    options.value = Object.values(conditionKeyMap.value)
      .filter((key) => {
        return !(internalModelValue.value || []).find((condition) => {
          return condition.name.name === key.name
        })
      })
      .map((key) => {
        return {
          label: key.displayName,
          value: key.name
        }
      })
  }, 0)

  containOptionFromSearch.value = false
}

function appendValue(editingValue: Partial<FieldConditionResponse>) {
  if (!editingValue) {
    return
  }

  const { name, operator, value } = editingValue

  if (name && operator && value) {
    updateModelValue([
      ...(internalModelValue.value || []),
      {
        name,
        operator,
        value
      }
    ])
  }
}

function updateSelectValue() {
  const values = (internalModelValue.value || [])
    .map((item) => {
      return selectOptionLabel(item)
    })
    .flat()

  selectValue.value = values
}

function onSelect(pickedValue: string) {
  if (step.value === 'PickKey') {
    const key = conditionKeyMap.value[pickedValue]
    currentKey.value = key

    if (key) {
      editingValue.value.name = {
        name: key.name,
        displayName: key.displayName
      }

      props.requests.getDataTypeOperators(key.dataType).then((data) => {
        const map: Record<string, string> = {}

        data.forEach((item) => {
          map[item.name] = item.displayName
        })

        operatorMap.value = map

        options.value = data.map((item) => {
          return {
            label: `${key.displayName} ${item.displayName}`,
            value: `${key.name} ${item.name}`
          }
        })
      })

      searchValue.value = key.displayName
    }

    step.value = 'PickOp'

    return updateSelectValue()
  }

  if (step.value === 'PickOp') {
    const array = pickedValue.split(' ')
    const op = array[array.length - 1]

    if (currentKey.value && editingValue.value.name && op) {
      props.requests.listConditionValues(currentKey.value.id).then((data) => {
        const name = editingValue.value.name

        if (!name) {
          return
        }

        const operatorName = operatorMap.value[op]

        editingValue.value.operator = {
          name: op,
          displayName: operatorName
        }

        options.value = data.map((item) => {
          return {
            label: `${name.displayName} ${operatorName} ${item}`,
            value: `${name.name} ${op} ${item}`
          }
        })

        searchValue.value = `${name.displayName} ${operatorName}`
      })
    }

    step.value = 'PickValue'

    return updateSelectValue()
  }

  if (step.value === 'PickValue') {
    const array = pickedValue.split(' ')
    const itemValue = array[array.length - 1]

    editingValue.value.value = itemValue

    appendValue(editingValue.value)

    if (allowMultipleValues(editingValue.value.operator?.name)) {
      editingValue.value = {
        name: editingValue.value.name,
        operator: editingValue.value.operator
      }

      step.value = 'PickValue'

      options.value = (options.value || []).filter((opt) => {
        return opt.value !== pickedValue
      })
      searchValue.value = `${editingValue.value.name?.displayName} ${editingValue.value.operator?.displayName}`
    } else {
      editingValue.value = {}

      step.value = 'PickKey'

      resetOptions()
      closeDropdown()
    }

    updateSelectValue()

    return
  }
}

function closeDropdown() {
  open.value = false
}

function onDeselect(selectedValue: string) {
  const found = (internalModelValue.value || []).find(
    (item) => selectOptionLabel(item) === selectedValue
  )

  if (found) {
    updateModelValue(
      (internalModelValue.value || []).filter(
        (item) =>
          !(item.name.name === found.name.name && item.operator.name === found.operator.name)
      )
    )
  }

  resetOptions()
}

function selectOptionLabel(fieldCondition: FieldConditionResponse): string {
  return [
    fieldCondition.name.displayName,
    fieldCondition.operator.displayName,
    fieldCondition.value
  ].join(' ')
}

function onSearch(text: string) {
  searchValue.value = text

  if (!text) {
    resetOptions()

    return
  }

  const editing = editingValue.value
  const optionsData = options.value

  if (!editing.name) {
    return
  }

  const name = editing.name

  if (!text.startsWith(name.displayName)) {
    step.value = 'PickKey'

    resetOptions()

    return
  }

  if (step.value !== 'PickValue') {
    return
  }

  if (!editing.name || !editing.operator) {
    return
  }

  const operator = editing.operator

  const nameWithOperator = `${name.displayName} ${operator.displayName}`
  if (!text.startsWith(nameWithOperator)) {
    step.value = 'PickKey'
    onSelect(name.name)

    return
  }

  const valueText = text.replace(nameWithOperator, '').trim()

  if (valueText.length === 0) {
    return
  }

  const generatedLabel = `${name.displayName} ${operator.displayName} ${valueText}`
  const generatedValue = `${name.name} ${operator.name} ${valueText}`

  searchValue.value = generatedLabel

  if (!optionsData || optionsData.length === 0) {
    options.value = [
      {
        label: generatedLabel,
        value: generatedValue
      }
    ]

    return
  }

  if (containOptionFromSearch.value) {
    // update existing option
    const [_, ...restOptions] = optionsData

    options.value = [
      {
        label: generatedLabel,
        value: generatedValue
      },
      ...restOptions
    ]

    return
  }

  options.value = [
    {
      label: generatedLabel,
      value: generatedValue
    },
    ...optionsData
  ]

  containOptionFromSearch.value = true
}

function onDropdownVisibleChange(visible: boolean) {
  open.value = visible

  if (!visible) {
    step.value = 'PickKey'
    editingValue.value = {}

    resetOptions()
  }
}
</script>

<template>
  <a-select
    v-model:value="selectValue"
    :loading="loading"
    mode="multiple"
    style="width: 650px"
    :searchValue="searchValue"
    :open="open"
    :placeholder="props.placeholder"
    :options="options"
    optionFilterProp="label"
    @select="onSelect"
    @deselect="onDeselect"
    @dropdownVisibleChange="onDropdownVisibleChange"
    @search="onSearch"
  >
    <template #tagRender="{ label, closable, onClose }">
      <a-tag v-if="tagsData[label]" :closable="closable" @close="onClose">
        {{ tagsData[label] }}
      </a-tag>
    </template>
  </a-select>
</template>

<style scoped>
:deep(.ant-select-selection-overflow) {
  gap: 4px 0;
}

:deep(.ant-tag) {
  display: flex;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
