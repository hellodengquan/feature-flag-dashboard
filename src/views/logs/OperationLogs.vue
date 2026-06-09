<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#409eff"><Document /></el-icon>
          <div class="stat-value" style="color: #409eff;">{{ store.operationLogs.length }}</div>
          <div class="stat-label">总操作数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#67c23a"><Edit /></el-icon>
          <div class="stat-value" style="color: #67c23a;">{{ todayCount }}</div>
          <div class="stat-label">今日操作</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#e6a23c"><Warning /></el-icon>
          <div class="stat-value" style="color: #e6a23c;">{{ riskCount }}</div>
          <div class="stat-label">高风险操作</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#722ed1"><User /></el-icon>
          <div class="stat-value" style="color: #722ed1;">{{ activeOperators }}</div>
          <div class="stat-label">活跃操作人</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="log-card" shadow="never">
      <div class="page-header">
        <div class="page-title">
          <el-icon :size="22" color="#409eff"><Notebook /></el-icon>
          <span style="margin-left: 8px;">操作日志</span>
        </div>
        <div class="header-actions">
          <el-button :icon="Download" plain @click="handleExport">
            导出日志
          </el-button>
          <el-button :icon="Refresh" circle @click="refreshLogs" />
        </div>
      </div>

      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="操作人">
          <el-select v-model="filterForm.operator" placeholder="全部操作人" clearable style="width: 140px;">
            <el-option
              v-for="op in operatorList"
              :key="op"
              :label="op"
              :value="op"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filterForm.action" placeholder="全部类型" clearable style="width: 160px;">
            <el-option
              v-for="type in actionTypeList"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px;"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索对象名称/详情"
            :prefix-icon="Search"
            clearable
            style="width: 220px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="applyFilter">查询</el-button>
          <el-button :icon="RefreshRight" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="paginatedLogs" style="width: 100%;" v-loading="loading" stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="操作类型">{{ row.action }}</el-descriptions-item>
              <el-descriptions-item label="操作对象">
                <span class="mono-text">{{ row.target }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="对象名称">{{ row.targetName }}</el-descriptions-item>
              <el-descriptions-item label="操作详情" :span="2">{{ row.detail }}</el-descriptions-item>
              <el-descriptions-item label="IP 地址">
                <span class="mono-text">{{ row.ip }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170" fixed="left">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ row.createdAt }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="120">
          <template #default="{ row }">
            <div class="operator-cell">
              <el-avatar :size="28" :style="{ backgroundColor: getOperatorColor(row.operator) }">
                {{ row.operator.charAt(0) }}
              </el-avatar>
              <span class="operator-name">{{ row.operator }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-tag :type="getActionTagType(row.action)" effect="light">
              <el-icon style="margin-right: 4px;"><component :is="getActionIcon(row.action)" /></el-icon>
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="操作对象" min-width="180">
          <template #default="{ row }">
            <div>
              <div class="target-name">{{ row.targetName }}</div>
              <div class="target-key">{{ row.target }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="详情说明" min-width="260" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goToRelated(row)">
              定位
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredLogs.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document, Edit, Warning, User, Notebook, Download, Refresh,
  Search, RefreshRight, Clock, Plus, Delete, Switch, Setting,
  Connection, View, CopyDocument
} from '@element-plus/icons-vue'
import { useFeatureStore } from '@/stores/feature'

const store = useFeatureStore()
const router = useRouter()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  operator: '',
  action: '',
  dateRange: [],
  keyword: ''
})

const actionTypeList = [
  { label: '创建开关', value: '创建开关' },
  { label: '启用开关', value: '启用开关' },
  { label: '禁用开关', value: '禁用开关' },
  { label: '修改发布比例', value: '修改发布比例' },
  { label: '关联人群', value: '关联人群' },
  { label: '删除开关', value: '删除开关' },
  { label: '创建人群', value: '创建人群' },
  { label: '更新人群', value: '更新人群' },
  { label: '更新人群规则', value: '更新人群规则' },
  { label: '删除人群', value: '删除人群' }
]

const operatorList = computed(() => {
  const set = new Set(store.operationLogs.map(l => l.operator))
  return Array.from(set)
})

const todayCount = computed(() => {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
  return store.operationLogs.filter(l => l.createdAt.startsWith(today)).length
})

const riskCount = computed(() => {
  return store.operationLogs.filter(l =>
    l.action.includes('禁用') || l.action.includes('删除')
  ).length
})

const activeOperators = computed(() => {
  const recent7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const set = new Set()
  store.operationLogs.forEach(l => {
    const date = new Date(l.createdAt.replace(/-/g, '/'))
    if (date >= recent7Days) {
      set.add(l.operator)
    }
  })
  return set.size
})

const filteredLogs = computed(() => {
  let result = [...store.operationLogs]

  if (filterForm.operator) {
    result = result.filter(l => l.operator === filterForm.operator)
  }
  if (filterForm.action) {
    result = result.filter(l => l.action === filterForm.action)
  }
  if (filterForm.keyword) {
    const kw = filterForm.keyword.toLowerCase()
    result = result.filter(l =>
      l.targetName.toLowerCase().includes(kw) ||
      l.target.toLowerCase().includes(kw) ||
      l.detail.toLowerCase().includes(kw)
    )
  }
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [start, end] = filterForm.dateRange
    result = result.filter(l => {
      const dateStr = l.createdAt.split(' ')[0]
      return dateStr >= start && dateStr <= end
    })
  }
  return result
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredLogs.value.slice(start, start + pageSize.value)
})

const getOperatorColor = (name) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#722ed1', '#13c2c2']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getActionTagType = (action) => {
  if (action.includes('创建')) return 'success'
  if (action.includes('删除') || action.includes('禁用')) return 'danger'
  if (action.includes('修改') || action.includes('更新') || action.includes('关联')) return 'warning'
  if (action.includes('启用') || action.includes('全量')) return 'primary'
  return 'info'
}

const getActionIcon = (action) => {
  if (action.includes('创建')) return Plus
  if (action.includes('删除')) return Delete
  if (action.includes('禁用') || action.includes('启用')) return Switch
  if (action.includes('修改') || action.includes('更新')) return Edit
  if (action.includes('关联')) return Connection
  if (action.includes('查看')) return View
  if (action.includes('复制')) return CopyDocument
  return Setting
}

const applyFilter = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  filterForm.operator = ''
  filterForm.action = ''
  filterForm.dateRange = []
  filterForm.keyword = ''
  currentPage.value = 1
}

const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('日志已刷新')
  }, 500)
}

const handleExport = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success(`已导出 ${filteredLogs.value.length} 条日志记录`)
  }, 800)
}

const goToRelated = (row) => {
  const isAudience = row.action.includes('人群') || row.target.includes('user') || row.target.includes('audience') || row.target.includes('beta') || row.target.includes('young') || row.target.includes('new') || row.target.includes('ios') || row.target.includes('vip') || row.target.includes('high')

  if (isAudience) {
    router.push({ path: '/audiences', query: { highlight: row.target } })
  } else {
    router.push({ path: '/flags' })
  }
}
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.log-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.filter-form {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.operator-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .operator-name {
    font-weight: 500;
    color: #303133;
  }
}

.target-name {
  font-weight: 500;
  color: #303133;
}

.target-key {
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
  margin-top: 2px;
}

.mono-text {
  font-family: 'Courier New', monospace;
  color: #606266;
  font-size: 13px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
