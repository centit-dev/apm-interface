<script lang="ts">
interface Props {
  placeholder?: string
  defaultOpen?: boolean
}

interface ClusterPickerModelValue {
  platform?: string
  cluster?: string
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CascaderProps } from 'ant-design-vue'
import { DefaultApi } from '@/api'
import { configuration } from '@/utils/http'
import { useRequest } from 'vue-request'

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  defaultOpen: false
})
const modelValue = defineModel<ClusterPickerModelValue>({
  default: {}
})

const defaultApi = new DefaultApi(configuration)
const options = ref<CascaderProps['options']>()

const value = ref<string[]>([])

const { data: platformsData } = useRequest(() => defaultApi.listPlatforms(), {
  cacheKey: 'platforms'
})

watch(platformsData, (newValue) => {
  if (newValue) {
    options.value = newValue.data.data.map(({ name, displayName }) => {
      return {
        label: displayName,
        value: name,
        isLeaf: false
      }
    })
  }
})

const { platform, cluster } = modelValue.value
if (platform && cluster) {
  value.value = [platform, cluster]
}

watch(value, (data) => {
  if (!data || data.length < 2) {
    modelValue.value = {}

    return
  }

  const [platform, cluster] = data

  modelValue.value = {
    platform,
    cluster
  }
})

const loadData: CascaderProps['loadData'] = (selectedOptions) => {
  const targetOption = selectedOptions[selectedOptions.length - 1]

  if (!targetOption || !targetOption.value) {
    return
  }

  if (targetOption.children && targetOption.children.length > 0) {
    return
  }

  targetOption.loading = true
  defaultApi.listAppClusters(String(targetOption.value)).then((res) => {
    const values = (res.data.data || []).map(({ name, displayName }) => {
      return {
        label: displayName,
        value: name
      }
    })

    targetOption.loading = false
    targetOption.children = values

    options.value = (options.value || []).map((option) => {
      if (option.value === targetOption.value) {
        option.children = values
      }

      return option
    })
  })
}
</script>

<template>
  <a-cascader
    v-model:value="value"
    :options="options"
    :load-data="loadData"
    :placeholder="props.placeholder"
    :defaultOpen="props.defaultOpen"
    change-on-select
  />
</template>
