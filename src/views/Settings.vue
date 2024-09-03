<script setup lang="ts">
import { computed, ref, h } from 'vue'
import type { MenuProps } from 'ant-design-vue'
import { RouterView, useRoute } from 'vue-router'

const items = ref<MenuProps['items']>([
  {
    key: 'DataProcessingSettings',
    label: h('a', { href: '/settings/data-processing' }, '数据处理配置'),
    title: '数据处理配置'
  },
  {
    key: 'ExceptionProcessingSettings',
    label: h('a', { href: '/settings/exception-processing' }, '异常处理配置'),
    title: '异常处理配置'
  },
  {
    key: 'SystemIntegrationSettings',
    label: h('a', { href: '/settings/system-integration' }, '系统集成设置'),
    title: '系统集成设置'
  },
  {
    key: 'K8sAccessSettings',
    label: h('a', { href: '/settings/k8s-access' }, 'k8s集群访问设置'),
    title: 'k8s集群访问设置'
  },
  {
    key: 'EbpfAgentsGroupsSettings',
    label: h('a', { href: '/settings/ebpf-agents-groups' }, 'ebpf agent分组设置'),
    title: 'ebpf agent分组设置'
  },
  {
    key: 'GPTSettings',
    label: h('a', { href: '/settings/gpt' }, 'LLM智能体设置'),
    title: 'LLM智能体设置'
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
