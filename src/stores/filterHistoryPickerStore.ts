import { useStorage, type RemovableRef } from '@vueuse/core'
import { defineStore } from 'pinia'

export interface Item {
  label: string
  value: any
}

interface State {
  items: RemovableRef<Item[]>
  selectedItem: Item | undefined
}

export const useFilterHistoryPickerStore = defineStore('filterHistoryPickerStore', {
  state: (): State => ({
    items: useStorage('filterHistoryPickerStore', [], localStorage, {}),
    selectedItem: undefined
  }),
  getters: {
    hasItems: ({ items }) => items.length > 0,
    isFirstItem({ items, selectedItem }): boolean {
      if (!this.hasItems) {
        return false
      }

      return items[0].label === selectedItem?.label
    },
    isLastItem({ items, selectedItem }): boolean {
      if (!this.hasItems) {
        return false
      }

      return items[items.length - 1].label === selectedItem?.label
    },
    canGotoNext(): boolean {
      if (!this.selectedItem) {
        return false
      }

      return !this.isLastItem
    },
    canGotoPrevious(): boolean {
      if (!this.selectedItem) {
        return false
      }

      return !this.isFirstItem
    }
  },
  actions: {
    addItem(item: Item) {
      if (this.items.some((i) => i.label === item.label)) {
        return
      }

      this.items.push(item)
      this.selectedItem = item
    },
    select(item: Item) {
      this.selectedItem = item
    },
    gotoNext() {
      if (this.isLastItem) {
        return
      }

      const index = this.items.findIndex((item) => item.label === this.selectedItem?.label)

      this.selectedItem = this.items[index + 1]
    },
    gotoPrevious() {
      if (this.isFirstItem) {
        return
      }

      const index = this.items.findIndex((item) => item.label === this.selectedItem?.label)

      this.selectedItem = this.items[index - 1]
    }
  }
})
