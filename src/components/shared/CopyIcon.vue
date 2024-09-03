<script lang="ts" setup>
interface Props {
  text: string
  message?: string
}

import { CopyOutlined } from '@ant-design/icons-vue'
import { useClipboard } from '@vueuse/core'
import { notification } from 'ant-design-vue'

const props = withDefaults(defineProps<Props>(), {
  message: '复制成功'
})

const { copy, isSupported } = useClipboard()
const [api, contextHolder] = notification.useNotification()
</script>

<template>
  <CopyOutlined
    v-if="isSupported"
    style="cursor: pointer"
    @click="
      () => {
        copy(props.text).then(() => {
          api.success({
            message: '复制成功'
          })
        })
      }
    "
  />

  <Teleport to="body">
    <contextHolder />
  </Teleport>
</template>
