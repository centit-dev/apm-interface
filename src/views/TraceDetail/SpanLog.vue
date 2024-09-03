<script lang="ts">
interface Props {
  detail: AppLogDetail
}
</script>

<script setup lang="ts">
import type { AppLogDetail } from '@/api'
import { format } from '@/utils/date'
import { ref } from 'vue'

const props = defineProps<Props>()

const visible = ref(false)
</script>

<template>
  <div class="log-details">
    <div class="log-detail">
      <div class="detail-label">{{ format(props.detail.timestamp) }}</div>
      <div class="text-break">
        {{ props.detail.severityText }}
      </div>
    </div>

    <div class="log-detail">
      <div class="detail-label">发生位置:</div>
      <div class="text-break">{{ props.detail.scopeName }}</div>
    </div>

    <div class="log-detail">
      <div class="detail-label">消息内容:</div>
      <div class="detail-body text-break">
        {{ props.detail.body }}
      </div>

      <a-popover v-model:open="visible" trigger="click" placement="left">
        <template #content>
          <div style="max-height: 75vh; max-width: 80vw; overflow-y: scroll">
            <div v-for="(attribute, index) in props.detail.logAttributes" :key="index">
              <div class="detail-label">
                {{ attribute.key }}

                <CopyIcon :text="attribute.value" />
              </div>
              <pre class="text-break" v-text="attribute.value"></pre>
            </div>
          </div>
        </template>

        <a-button style="float: right">调用栈</a-button>
      </a-popover>
    </div>
  </div>
</template>

<style scoped>
.log-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-body {
  padding: 5px;
}

.detail-label {
  font-weight: bold;
}
</style>
