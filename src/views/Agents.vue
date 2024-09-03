<script setup lang="ts">
import { computed, ref, h } from 'vue'
import type { MenuProps } from 'ant-design-vue'
import { RouterView, useRoute } from 'vue-router'

const items = ref<MenuProps['items']>([
  {
    key: 'AppAgentsManagement',
    label: h('a', { href: '/agents/app-agents-management' }, '应用 Agents 管理'),
    title: '应用 Agents 管理'
  },
  {
    key: 'EbpfAgentsManagement',
    label: h('a', { href: '/agents/ebpf-agents-management' }, 'eBPF Agents 管理'),
    title: 'eBPF Agents 管理'
  }
])

const route = useRoute()

const current = computed(() => [route.name as string])
</script>

<template>
  <div>
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
  </div>

  <router-view />
</template>
