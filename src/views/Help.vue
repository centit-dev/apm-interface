<script setup lang="ts">
import { computed, ref, h } from 'vue'
import type { MenuProps } from 'ant-design-vue'
import { RouterView, useRoute } from 'vue-router'

const items = ref<MenuProps['items']>([
  {
    key: 'HelpDownload',
    label: h('a', { href: '/help/download' }, 'Agent/SDK下载'),
    title: 'Agent/SDK下载'
  },
  {
    key: 'HelpOpenAPI',
    label: h('a', { href: 'https://catpupil.apifox.cn/', target: '_blank' }, '开放API接口'),
    title: '开放API接口'
  },
  {
    key: 'HelpIntroduction',
    label: h('a', { href: '/help/introduction' }, '产品介绍'),
    title: '产品介绍'
  },
  {
    key: 'HelpInstall',
    label: h('a', { href: '/help/install' }, '安装部署'),
    title: '安装部署'
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
