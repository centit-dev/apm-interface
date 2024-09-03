import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/trace-positioning',
      name: 'TracePositioning',
      component: () => import('../views/TracePositioning.vue'),
      meta: {
        title: 'Trace 异常定位',
        showMenu: true
      }
    },
    {
      path: '/log-positioning',
      name: 'LogPositioning',
      component: () => import('../views/LogPositioning.vue'),
      meta: {
        title: '日志异常定位',
        showMenu: true
      }
    },
    {
      path: '/service-map-positioning',
      name: 'ServiceMapPositioning',
      component: () => import('../views/ServiceMapPositioning.vue'),
      meta: {
        title: '服务地图定位',
        showMenu: true
      }
    },
    {
      path: '/agents',
      component: () => import('../views/Agents.vue'),
      name: 'Agents',
      children: [
        {
          path: 'app-agents-management',
          name: 'AppAgentsManagement',
          component: () => import('../views/Agents/AppAgentsManagement.vue'),
          meta: {
            title: 'App Agents 管理',
            showMenu: true
          }
        },
        {
          path: 'ebpf-agents-management',
          name: 'EbpfAgentsManagement',
          component: () => import('../views/Agents/EbpfAgentsManagement.vue'),
          meta: {
            title: 'eBPF Agents 管理',
            showMenu: true
          }
        }
      ]
    },
    {
      path: '/settings',
      component: () => import('../views/Settings.vue'),
      name: 'Settings',
      children: [
        {
          path: 'data-processing',
          name: 'DataProcessingSettings',
          component: () => import('../views/Settings/DataProcessing.vue'),
          meta: {
            title: '数据处理配置',
            showMenu: true
          }
        },
        {
          path: 'exception-processing',
          name: 'ExceptionProcessingSettings',
          component: () => import('../views/Settings/ExceptionProcessing.vue'),
          meta: {
            title: '异常处理配置',
            showMenu: true
          }
        },
        {
          path: 'system-integration',
          name: 'SystemIntegrationSettings',
          component: () => import('../views/Settings/SystemIntegration.vue'),
          meta: {
            title: '系统集成设置',
            showMenu: true
          }
        },
        {
          path: 'k8s-access',
          name: 'K8sAccessSettings',
          component: () => import('../views/Settings/K8sAccess.vue'),
          meta: {
            title: 'k8s集群访问设置',
            showMenu: true
          }
        },
        {
          path: 'ebpf-agents-groups',
          name: 'EbpfAgentsGroupsSettings',
          component: () => import('../views/Settings/EbpfAgentGroups.vue'),
          meta: {
            title: 'ebpf agent分组设置',
            showMenu: true
          }
        },
        {
          path: 'gpt',
          name: 'GPTSettings',
          component: () => import('../views/Settings/GPTConfig.vue'),
          meta: {
            title: 'LLM智能体设置',
            showMenu: true
          }
        }
      ]
    },
    {
      path: '/trace/:id',
      name: 'TraceDetail',
      component: () => import('../views/TraceDetail.vue'),
      meta: {
        title: 'Trace 详情',
        showMenu: false
      }
    },
    {
      path: '/traces',
      name: 'TracesList',
      component: () => import('../views/TracesList.vue'),
      meta: {
        title: 'Traces 列表',
        showMenu: false
      }
    },
    {
      path: '/span-diagnosis',
      name: 'SpanDiagnosis',
      component: () => import('../views/SpanDiagnosis.vue'),
      meta: {
        title: '初因span分析',
        showMenu: false
      }
    },
    {
      path: '/duration-diagnosis',
      name: 'DurationDiagnosis',
      component: () => import('../views/DurationDiagnosis.vue'),
      meta: {
        title: '超时诊断',
        showMenu: false
      }
    },
    {
      path: '/spans',
      name: 'Spans',
      component: () => import('../views/Spans.vue'),
      meta: {
        title: 'Spans',
        showMenu: false
      }
    },
    {
      path: '/help',
      name: 'Help',
      component: () => import('../views/Help.vue'),
      children: [
        {
          path: 'download',
          name: 'HelpDownload',
          component: () => import('../views/Help/Download.vue'),
          meta: {
            title: '帮助文档 agent/sdk下载',
            showMenu: true
          }
        },
        {
          path: 'introduction',
          name: 'HelpIntroduction',
          component: () => import('../views/Help/Introduction.vue'),
          meta: {
            title: '帮助文档 介绍',
            showMenu: true
          }
        },
        {
          path: 'install',
          name: 'HelpInstall',
          component: () => import('../views/Help/Install.vue'),
          meta: {
            title: '帮助文档 安装',
            showMenu: true
          }
        }
      ]
    },
    {
      path: '/',
      name: 'Root',
      redirect: '/trace-positioning'
    }
  ]
})

export default router
