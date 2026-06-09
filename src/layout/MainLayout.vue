<template>
  <el-container class="main-layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#409eff"><Flag /></el-icon>
        <span class="logo-text">Feature Flag</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#001529"
        text-color="#b7b7b7"
        active-text-color="#ffffff"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="resolvePath(route.path)"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
          <el-icon><Location /></el-icon>
          <span>{{ currentTitle }}</span>
        </div>
        <div class="header-actions">
          <el-badge :value="3" class="notification-badge">
            <el-button :icon="Bell" circle text />
          </el-badge>
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Flag, Location, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const menuRoutes = computed(() => {
  const mainRoute = router.options.routes.find(r => r.path === '/')
  return mainRoute?.children?.filter(c => c.meta?.title) || []
})

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '首页')

const resolvePath = (path) => path.startsWith('/') ? path : `/${path}`

const handleUserCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('已退出登录')
    }).catch(() => {})
  } else {
    ElMessage.info(`点击了：${command}`)
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo-text {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }

  :deep(.sidebar-menu) {
    border-right: none;
  }

  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;

    &:hover {
      background-color: rgba(64, 158, 255, 0.1) !important;
    }

    &.is-active {
      background-color: #409eff !important;
    }
  }
}

.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 14px;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 20px;

    .notification-badge {
      margin-right: 10px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.main-content {
  background-color: #f5f7fa;
  padding: 0;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
