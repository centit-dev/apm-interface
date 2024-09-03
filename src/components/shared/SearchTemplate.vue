<script lang="ts">
interface SearchTemplateProps {
  type: QueryForType
  values: Pick<QueryTemplateRequest, 'fieldConditions' | 'statusConditions' | 'timeCondition'>
}
</script>

<script lang="ts" setup>
import { DefaultApi, QueryForType, type QueryTemplate, type QueryTemplateRequest } from '@/api'
import { configuration } from '@/utils/http'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { computed, defineComponent, ref } from 'vue'
import { useRequest } from 'vue-request'

const props = defineProps<SearchTemplateProps>()
const emits = defineEmits<{
  (e: 'change', template: QueryTemplate | undefined): void
}>()

const saveModalOpen = ref(false)
const deleteModelOpen = ref(false)

const templateId = ref<number>()

const newTemplate = ref<Pick<QueryTemplate, 'id' | 'name'>>()
const newTemplateNameInput = ref<string>()
const newTemplateNameInputOpen = ref(false)

const removeIDs = ref<number[]>([])

const defaultApi = new DefaultApi(configuration)

const { data, loading, refresh } = useRequest(() => defaultApi.listQueryTemplates(props.type), {
  onAfter: () => {
    newTemplate.value = undefined
    newTemplateNameInput.value = undefined
  }
})

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true
    }
  },
  render() {
    return this.vnodes
  }
})

const templates = computed(() => {
  return data.value?.data.data || []
})

const options = computed(() => {
  const result = templates.value.map((template) => ({
    value: template.id,
    label: template.name
  }))

  if (newTemplate.value) {
    result.push({
      value: newTemplate.value.id,
      label: newTemplate.value.name
    })
  }

  return result
})

function showSaveModal() {
  saveModalOpen.value = true
}

function showDeleteModal() {
  deleteModelOpen.value = true
}

function selectTemplate(id: number) {
  if (!templates.value) {
    emits('change', undefined)

    return
  }

  const template = templates.value.find((template) => template.id === id)

  templateId.value = template?.id

  emits('change', template)
}

function saveTemplate() {
  const template = templates.value.find((template) => template.id === templateId.value)

  const response = (() => {
    if (template) {
      return defaultApi.updateQueryTemplate(`${template.id}`, {
        name: template.name,
        ...props.values,
        for: props.type
      })
    } else if (newTemplate.value) {
      return defaultApi.createQueryTemplate({
        name: newTemplate.value.name,
        ...props.values,
        for: props.type
      })
    }
  })()

  response?.then((res) => {
    templateId.value = res.data.data?.id

    refresh()
  })

  saveModalOpen.value = false
}

function addOrUpdateItem() {
  if (!newTemplateNameInput.value) {
    return
  }

  newTemplate.value = {
    id: 0,
    name: newTemplateNameInput.value
  }

  templateId.value = newTemplate.value.id

  newTemplateNameInputOpen.value = false
}

function removeTemplates() {
  if (removeIDs.value.length === 0) {
    return
  }

  const promises = removeIDs.value.map((id) => defaultApi.deleteQueryTemplate(`${id}`))

  Promise.all(promises).then(() => {
    refresh()
  })

  deleteModelOpen.value = false
}
</script>

<template>
  <div class="container">
    <a-select
      :loading="loading"
      style="width: 300px"
      allowClear
      @change="
        (value: number) => {
          selectTemplate(value)
        }
      "
    >
      <a-select-option v-for="(template, index) in templates" :key="index" :value="template.id">
        {{ template.name }}
      </a-select-option>
    </a-select>

    <a-button type="default" @click="showSaveModal"> 条件存为模板 </a-button>

    <DeleteOutlined
      @click="
        () => {
          showDeleteModal()
        }
      "
    />
  </div>

  <a-modal v-model:open="saveModalOpen" title="保存模板" @ok="saveTemplate">
    <a-select
      v-model:value="templateId"
      :open="newTemplateNameInputOpen"
      style="width: 100%"
      :options="options"
      @dropdownVisibleChange="
        (visible: boolean) => {
          newTemplateNameInputOpen = visible
        }
      "
    >
      <template #dropdownRender="{ menuNode: menu }">
        <v-nodes :vnodes="menu" />
        <a-divider style="margin: 4px 0" />
        <div style="padding: 4px 8px; display: flex; gap: 4px">
          <a-input
            v-model:value="newTemplateNameInput"
            placeholder="新模板名称"
            style="flex-grow: 1"
          />

          <a-button type="default" @click="addOrUpdateItem" :disabled="!newTemplateNameInput">
            {{ newTemplate ? '更新' : '添加' }}
          </a-button>
        </div>
      </template>
    </a-select>
  </a-modal>

  <a-modal v-model:open="deleteModelOpen" title="删除模板" @ok="removeTemplates">
    <a-select v-model:value="removeIDs" style="width: 100%" :options="options" mode="multiple">
    </a-select>
  </a-modal>
</template>

<style scoped>
.container {
  display: flex;
  gap: 10px;
}
</style>
