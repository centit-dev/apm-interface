<script lang="ts">
interface Props {
  snapshotIds: string[]
}
</script>

<script setup lang="ts">
import { DefaultApi, type ServiceExceptionInfo } from '@/api'
import { configuration } from '@/utils/http'
import { FullscreenOutlined, MessageOutlined } from '@ant-design/icons-vue'
import { type TreeProps } from 'ant-design-vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRequest } from 'vue-request'
import AssociatedSpans from './AssociatedSpans.vue'
import { from, useSubscription } from '@vueuse/rxjs'
import { combineLatest, filter, map, switchMap, tap } from 'rxjs'
import { aiChat } from '@/utils/chat'
import VueMarkdown from 'vue-markdown-render'

const props = defineProps<Props>()

const defaultApi = new DefaultApi(configuration)

const {
  data: response,
  loading,
  refresh
} = useRequest(() => defaultApi.getSpanExceptionAnalysis(props.snapshotIds), {
  debounceInterval: 100,
  refreshDeps: [() => props.snapshotIds],
  refreshDepsAction() {
    refresh()
  }
})

const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const selectedException = ref<ServiceExceptionInfo>()
const rootExceptionBody = computed(() => selectedException.value?.rootExceptionBody)
const showException = ref(false)

const showAiChat = ref(false)
const sendAiRequest = ref(false)
const aiConclusion = ref('')

watch(showAiChat, () => {
  sendAiRequest.value = true
})

useSubscription(
  combineLatest({
    selectedException: from(selectedException),
    sendAiRequest: from(sendAiRequest)
  })
    .pipe(
      filter(({ selectedException, sendAiRequest }) => !!selectedException && sendAiRequest),
      map(({ selectedException }) => selectedException!.rootExceptionBody),
      switchMap((rootExceptionBody) => {
        const prompt = `解答如下报错，并给出解决方案建议：\n\n${rootExceptionBody}`

        return aiChat(prompt).pipe(
          tap((res: any) => {
            if (res?.output) {
              aiConclusion.value = res.output.text
            }
          })
        )
      })
    )
    .subscribe({
      error: (err) => {
        console.error(err)
      }
    })
)

watchEffect(() => {
  if (!response.value) {
    return
  }

  const categories = response.value.data.data.categories

  if (!categories || categories.length === 0) {
    return
  }

  expandedKeys.value = categories.map((category) => {
    return String(category.categoryId)
  })

  const firstException = categories[0].exceptions[0]
  if (firstException) {
    selectedKeys.value = [exceptionKey(firstException)]
    selectedException.value = firstException
  }
})

const treeData = computed<TreeProps['treeData']>(() => {
  return response.value?.data.data.categories.map((category) => {
    return {
      title: `${category.categoryName} (${category.spanCount})`,
      key: category.categoryId,
      sourceData: category,
      selectable: false,
      children: category.exceptions.map((exception) => {
        return {
          title: `${exception.exceptionName} (${exception.spanCount})`,
          key: exceptionKey(exception),
          sourceData: exception
        }
      })
    }
  })
})

const onSelect: TreeProps['onSelect'] = (selectedKeysValue, info) => {
  if (selectedKeysValue.length > 0) {
    selectedException.value = info.node.sourceData
  } else {
    selectedException.value = undefined
    selectedKeys.value = []
  }
}

function exceptionKey(value: ServiceExceptionInfo) {
  return ['exception', value.exceptionId].join('-')
}
</script>

<template>
  <div style="display: flex; width: 100%; gap: 10px">
    <a-card title="报错分类" :loading="loading" style="flex-basis: 30%">
      <a-tree
        v-model:selectedKeys="selectedKeys"
        :tree-data="treeData"
        :showLine="true"
        :defaultExpandAll="true"
        @select="onSelect"
      >
      </a-tree>
    </a-card>

    <a-card title="报错信息" style="flex-basis: 70%">
      <template #extra>
        <div v-if="rootExceptionBody" style="display: flex; gap: 10px">
          <a-popover v-model:open="showAiChat" title="AI总结" trigger="click" placement="left">
            <template #content>
              <div
                style="max-width: 600px; min-height: 100px; overflow-y: scroll; position: relative"
              >
                <vue-markdown v-if="aiConclusion" :source="aiConclusion" />

                <a-spin
                  v-else
                  size="large"
                  style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"
                />
              </div>
            </template>

            <MessageOutlined style="cursor: pointer" />
          </a-popover>

          <FullscreenOutlined
            @click="
              () => {
                showException = true
              }
            "
          />

          <CopyIcon :text="rootExceptionBody" />
        </div>
      </template>

      <div v-if="rootExceptionBody">
        <pre class="text-break" style="max-height: 400px; overflow-y: scroll">
          {{ rootExceptionBody }}
        </pre>
      </div>

      <a-drawer
        v-model:open="showException"
        width="80%"
        style="color: red"
        title="详情"
        placement="right"
        @close="
          () => {
            showException = false
          }
        "
      >
        <pre class="text-break">
          {{ rootExceptionBody }}
        </pre>
      </a-drawer>
    </a-card>
  </div>

  <AssociatedSpans
    v-if="selectedException"
    :snapshotIds="props.snapshotIds"
    :exception="selectedException"
  />
</template>
