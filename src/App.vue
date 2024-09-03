<script setup lang="ts">
import {
  CompassOutlined,
  FunnelPlotOutlined,
  MonitorOutlined,
  BulbOutlined
} from '@ant-design/icons-vue'
import { theme, type ItemType } from 'ant-design-vue'
import { computed, h, reactive, ref, watchEffect, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { eagerLoadSoftwares } from './stores/softwares'
import logo from '@/assets/images/logo.png'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import { lowerFirst } from 'lodash'
import { useWindowSize } from '@vueuse/core'

const router = useRouter()
const route = useRoute()

const pathMap: Record<string, string> = {
  tracePositioning: '/trace-positioning',
  logPositioning: '/log-positioning',
  serviceMapPositioning: '/service-map-positioning',
  agents: '/agents/app-agents-management',
  settings: '/settings/data-processing'
}

dayjs.locale('zh-cn')

eagerLoadSoftwares()

const selectedKeys = ref<string[]>([])
const clickMenuItem = (key: string) => {
  selectedKeys.value = [key]

  router.push(pathMap[key])
}
const collapsed = ref<boolean>(false)
const showMenu = computed(() => route.meta.showMenu)
const { useToken, compactAlgorithm } = theme
const { token } = useToken()

const items = reactive<ItemType[]>([
  {
    label: 'Trace 异常定位',
    key: 'tracePositioning',
    icon: h(FunnelPlotOutlined),
    onClick: () => clickMenuItem('tracePositioning')
  },
  {
    label: '日志异常定位',
    key: 'logPositioning',
    icon: h(MonitorOutlined),
    onClick: () => clickMenuItem('logPositioning')
  },
  {
    label: '服务地图定位',
    key: 'serviceMapPositioning',
    icon: h(CompassOutlined),
    onClick: () => clickMenuItem('serviceMapPositioning')
  },
  {
    label: 'Agents管理',
    key: 'agents',
    icon: h(RobotOutlined),
    onClick: () => clickMenuItem('agents')
  },
  {
    label: '系统配置',
    key: 'settings',
    icon: h(SettingOutlined),
    onClick: () => clickMenuItem('settings')
  }
])

const { width } = useWindowSize()

watch(
  width,
  () => {
    if (width.value < 1440) {
      collapsed.value = true
    } else {
      collapsed.value = false
    }
  },
  { immediate: true }
)

watchEffect(() => {
  if (!route.matched || route.matched.length === 0) {
    return
  }

  const key = lowerFirst(String(route.matched[0].name))

  if (key) {
    selectedKeys.value = [key]
  }
})
</script>

<template>
  <a-style-provider hash-priority="high">
    <a-config-provider
      :locale="zhCN"
      :theme="{
        algorithm: compactAlgorithm
      }"
    >
      <a-layout class="app-layout">
        <a-layout-sider v-if="showMenu" v-model:collapsed="collapsed">
          <div
            class="logo-container"
            :class="{
              truncated: collapsed
            }"
          >
            <router-link
              to="/"
              style="
                display: flex;
                height: 100%;
                width: 100%;
                justify-content: center;
                align-items: center;
              "
            >
              <div class="logo" :style="{ backgroundImage: 'url(' + logo + ')' }"></div>
            </router-link>
          </div>

          <div class="website-title" v-if="!collapsed">猫瞳</div>
          <span class="website-slogan" v-if="!collapsed">轻松定位故障</span>

          <a-menu
            style="margin-top: 16px"
            v-model:selectedKeys="selectedKeys"
            mode="inline"
            theme="dark"
            :items="items"
          ></a-menu>
        </a-layout-sider>

        <a-layout>
          <a-layout-header class="header">
            <template v-if="showMenu">
              <MenuUnfoldOutlined
                v-if="collapsed"
                class="trigger"
                @click="() => (collapsed = !collapsed)"
              />

              <MenuFoldOutlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
            </template>

            <div class="page-title">
              {{ route.meta.title }}
            </div>

            <div style="margin: 0 5px 0 auto">
              <a href="/help/download" target="_blank"> <BulbOutlined /> 帮助中心 </a>
            </div>
          </a-layout-header>

          <a-layout class="main-content">
            <a-layout-content>
              <router-view></router-view>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-config-provider>
  </a-style-provider>
</template>

<style scoped>
.app-layout {
  height: 100%;
}

.ant-menu-root {
  height: 100%;
}

.ant-layout-has-sider {
  flex-grow: 1;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px !important;
  background: #fff;
}

.ant-layout-header {
  background-color: white !important;
}

.logo-container {
  margin: 10px auto 0 auto;
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.65);
  padding: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  box-shadow: 0 0 10px 4px rgba(255, 255, 255, 0.4);
}

.logo {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px auto;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.logo-container.truncated {
  width: 44px;
  height: 44px;
  box-shadow: none;
}

.truncated .logo {
  height: 40px;
  background-size: 40px;
  width: 40px;
  background-position: 0 0;
}

:deep(.ant-layout-sider .ant-menu-item) {
  margin: 0;
  width: 100%;
  border-radius: 0;
}

:deep(.ant-layout-sider .ant-menu-item .anticon) {
  font-size: 20px;
}

:deep(.ant-layout-sider .ant-menu-item-selected) {
  /* background-color: transparent; */
  border-radius: 0;
  border-right: 3px solid v-bind('token.colorPrimaryBg');
}

.website-title {
  color: white;
  margin: 10px 0 5px 0;
  text-align: center;
}

.website-slogan {
  color: white;
  display: block;
  text-align: center;
}

.page-title {
  font-weight: bold;
}

.trigger {
  font-size: 22px;
}

.main-content {
  padding: 10px;
  margin: 0 0 10px 0;
  min-height: 280px;
  overflow: scroll;
}
</style>
