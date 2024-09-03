<script lang="ts" setup>
import { ClockCircleOutlined, SwapLeftOutlined, SwapRightOutlined } from '@ant-design/icons-vue'
import { computed, h } from 'vue'
import { useFilterHistoryPickerStore, type Item } from '../../stores/filterHistoryPickerStore'

const emit = defineEmits<{
  (e: 'onChange', value: Item | undefined): void
}>()

const store = useFilterHistoryPickerStore()

const selectedItems = computed(() => {
  if (!store.selectedItem) return []

  return [store.selectedItem.label]
})
</script>

<template>
  <div style="display: flex; gap: 5px" v-if="store.items.length > 0">
    <a-dropdown>
      <template #overlay>
        <a-menu v-model:selectedKeys="selectedItems">
          <a-menu-item
            v-for="item in store.items"
            :key="item.label"
            @click="
              () => {
                store.select(item)

                emit('onChange', item)
              }
            "
          >
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </template>

      <a-button shape="circle"> <ClockCircleOutlined /> </a-button>
    </a-dropdown>

    <template v-if="store.hasItems">
      <a-button
        shape="circle"
        :icon="h(SwapLeftOutlined)"
        :disabled="!store.canGotoPrevious"
        @click="store.gotoPrevious()"
      />
      <a-button
        shape="circle"
        :icon="h(SwapRightOutlined)"
        :disabled="!store.canGotoNext"
        @click="store.gotoNext()"
      />
    </template>
  </div>
</template>
