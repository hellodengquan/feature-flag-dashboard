import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/flags',
    children: [
      {
        path: 'flags',
        name: 'Flags',
        component: () => import('@/views/flags/FlagList.vue'),
        meta: { title: '开关列表', icon: 'Switch' }
      },
      {
        path: 'audiences',
        name: 'Audiences',
        component: () => import('@/views/audiences/AudienceList.vue'),
        meta: { title: '目标人群', icon: 'User' }
      },
      {
        path: 'rollout',
        name: 'Rollout',
        component: () => import('@/views/rollout/RolloutProgress.vue'),
        meta: { title: '发布进度', icon: 'TrendCharts' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/logs/OperationLogs.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Feature Flag 灰度看板`
  }
  next()
})

export default router
