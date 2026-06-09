<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card gradient-card gradient-blue" shadow="hover">
          <div class="stat-icon-wrap">
            <el-icon :size="36"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overallProgress }}%</div>
            <div class="stat-label">总体发布进度</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card gradient-card gradient-green" shadow="hover">
          <div class="stat-icon-wrap">
            <el-icon :size="36"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(totalCoveredUsers) }}</div>
            <div class="stat-label">覆盖用户数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card gradient-card gradient-orange" shadow="hover">
          <div class="stat-icon-wrap">
            <el-icon :size="36"><View /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(totalImpressions) }}</div>
            <div class="stat-label">总曝光量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card gradient-card gradient-purple" shadow="hover">
          <div class="stat-icon-wrap">
            <el-icon :size="36"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ avgSuccessRate }}%</div>
            <div class="stat-label">平均成功率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <div class="card-header">
            <div class="card-title">
              <el-icon :size="18" color="#409eff"><TrendCharts /></el-icon>
              <span>开关发布进度对比</span>
            </div>
            <el-radio-group v-model="chartRange" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="active">进行中</el-radio-button>
              <el-radio-button value="completed">已完成</el-radio-button>
            </el-radio-group>
          </div>
          <v-chart class="chart" :option="barChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <div class="card-header">
            <div class="card-title">
              <el-icon :size="18" color="#409eff"><PieChart /></el-icon>
              <span>开关状态分布</span>
            </div>
          </div>
          <v-chart class="chart pie-chart" :option="pieChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <div class="card-header">
            <div class="card-title">
              <el-icon :size="18" color="#409eff"><DataLine /></el-icon>
              <span>曝光趋势（近 7 天）</span>
            </div>
          </div>
          <v-chart class="chart" :option="impressionChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <div class="card-header">
            <div class="card-title">
              <el-icon :size="18" color="#409eff"><Histogram /></el-icon>
              <span>各开关成功率排行</span>
            </div>
          </div>
          <v-chart class="chart" :option="successRateChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="progress-table-card" shadow="never" style="margin-top: 20px;">
      <div class="card-header">
        <div class="card-title">
          <el-icon :size="18" color="#409eff"><Tickets /></el-icon>
          <span>发布进度明细</span>
        </div>
        <div class="header-actions">
          <el-select v-model="filterStatus" placeholder="筛选状态" clearable size="default" style="width: 140px; margin-right: 12px;">
            <el-option label="已发布" value="active" />
            <el-option label="灰度中" value="gradual" />
            <el-option label="未启用" value="inactive" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
          <el-button :icon="Refresh" @click="refreshData" circle />
        </div>
      </div>

      <el-table :data="filteredProgressList" style="width: 100%;" v-loading="loading" stripe>
        <el-table-column prop="name" label="开关" min-width="200">
          <template #default="{ row }">
            <div class="flag-cell">
              <el-avatar :size="36" :style="{ backgroundColor: getAvatarColor(row.key) }">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <div class="flag-info">
                <div class="flag-name">{{ row.name }}</div>
                <div class="flag-key">{{ row.key }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" effect="light">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" min-width="280">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress
                :percentage="row.rolloutPercent"
                :color="getProgressColor(row.rolloutPercent, row.status)"
                :stroke-width="12"
                :text-inside="true"
              />
              <div class="progress-meta">
                <span>
                  <el-icon><User /></el-icon>
                  {{ formatNumber(getAffectedUsers(row)) }} 用户
                </span>
                <span>
                  <el-icon><View /></el-icon>
                  {{ formatNumber(row.totalImpressions) }} 次
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="目标人群" width="160">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">
              <el-icon><UserFilled /></el-icon>
              {{ row.audienceName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成功率" width="120" align="center">
          <template #default="{ row }">
            <div :class="['success-rate', getRateClass(row.successRate)]">
              {{ row.successRate }}%
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最近更新" width="170">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ row.updatedAt }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewTrend(row)">
              趋势分析
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="trendDialogVisible" title="发布趋势分析" width="860px" destroy-on-close>
      <div v-if="selectedFlag" class="trend-dialog-content">
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="开关名称">{{ selectedFlag.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusMap[selectedFlag.status].type" size="small">
              {{ statusMap[selectedFlag.status].label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前比例">
            <span style="font-weight: 600; color: #409eff;">{{ selectedFlag.rolloutPercent }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="成功率">
            <span :class="getRateClass(selectedFlag.successRate)" style="font-weight: 600;">
              {{ selectedFlag.successRate }}%
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="trend-charts">
          <div class="trend-chart">
            <div class="chart-subtitle">
              <el-icon><TrendCharts /></el-icon>
              <span>发布比例趋势</span>
            </div>
            <v-chart class="chart" :option="trendPercentOption" autoresize />
          </div>
          <div class="trend-chart">
            <div class="chart-subtitle">
              <el-icon><User /></el-icon>
              <span>触达用户趋势</span>
            </div>
            <v-chart class="chart" :option="trendUserOption" autoresize />
          </div>
        </div>

        <el-alert
          type="success"
          :closable="false"
          show-icon
          style="margin-top: 20px;"
        >
          <template #title>
            <span>预计 {{ getEstimatedTime(selectedFlag) }} 可完成全量发布</span>
          </template>
          按照当前的发布节奏，该功能预计将稳定运行并为用户提供持续的服务体验。
        </el-alert>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, markRaw, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  TrendCharts, User, View, CircleCheck, PieChart, DataLine, Histogram,
  Tickets, Refresh, Clock, UserFilled
} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart as PieChartType } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent
} from 'echarts/components'
import { useFeatureStore } from '@/stores/feature'
import { statusMap } from '@/mock/data'

use([
  CanvasRenderer, BarChart, LineChart, PieChartType,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent
])

const store = useFeatureStore()
const route = useRoute()

const loading = ref(false)
const chartRange = ref('all')
const filterStatus = ref('')
const trendDialogVisible = ref(false)
const selectedFlag = ref(null)
const trendPercentOption = ref({})
const trendUserOption = ref({})

const flags = computed(() => store.flags)

const overallProgress = computed(() => {
  if (flags.value.length === 0) return 0
  const activeFlags = flags.value.filter(f => f.status !== 'disabled' && f.status !== 'inactive')
  if (activeFlags.length === 0) return 0
  const sum = activeFlags.reduce((acc, f) => acc + f.rolloutPercent, 0)
  return Math.round(sum / activeFlags.length)
})

const totalCoveredUsers = computed(() => {
  return flags.value.reduce((acc, f) => {
    const audience = store.audiences.find(a => a.code === f.audience)
    return acc + Math.round((audience?.userCount || 0) * f.rolloutPercent / 100)
  }, 0)
})

const totalImpressions = computed(() => {
  return flags.value.reduce((acc, f) => acc + (f.totalImpressions || 0), 0)
})

const avgSuccessRate = computed(() => {
  const activeFlags = flags.value.filter(f => f.totalImpressions > 0)
  if (activeFlags.length === 0) return 0
  const sum = activeFlags.reduce((acc, f) => acc + f.successRate, 0)
  return (sum / activeFlags.length).toFixed(1)
})

const filteredProgressList = computed(() => {
  if (!filterStatus.value) return flags.value
  return flags.value.filter(f => f.status === filterStatus.value)
})

const chartFlags = computed(() => {
  let list = flags.value
  if (chartRange.value === 'active') {
    list = list.filter(f => f.status === 'gradual' || (f.status === 'active' && f.rolloutPercent < 100))
  } else if (chartRange.value === 'completed') {
    list = list.filter(f => f.rolloutPercent === 100)
  }
  return list.sort((a, b) => b.rolloutPercent - a.rolloutPercent)
})

const barChartOption = computed(() => {
  const data = chartFlags.value
  return markRaw({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>发布进度：${p.value}%`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: data.map(f => f.name),
      axisLabel: {
        width: 120,
        overflow: 'truncate',
        interval: 0
      }
    },
    series: [{
      type: 'bar',
      data: data.map(f => ({
        value: f.rolloutPercent,
        itemStyle: {
          color: f.rolloutPercent === 100
            ? '#67c23a'
            : f.rolloutPercent >= 50
            ? '#409eff'
            : '#e6a23c',
          borderRadius: [0, 6, 6, 0]
        }
      })),
      barWidth: 16,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        fontWeight: 'bold'
      }
    }]
  })
})

const pieChartOption = computed(() => {
  const counts = { active: 0, gradual: 0, inactive: 0, disabled: 0 }
  flags.value.forEach(f => counts[f.status]++)
  return markRaw({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 个 ({d}%)' },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: counts.active, name: '已发布', itemStyle: { color: '#67c23a' } },
        { value: counts.gradual, name: '灰度中', itemStyle: { color: '#e6a23c' } },
        { value: counts.inactive, name: '未启用', itemStyle: { color: '#909399' } },
        { value: counts.disabled, name: '已禁用', itemStyle: { color: '#f56c6c' } }
      ]
    }]
  })
})

const impressionChartOption = computed(() => {
  const days = 7
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
  }
  return markRaw({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总曝光', '独立用户'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (val) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val
      }
    },
    series: [
      {
        name: '总曝光',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64,158,255,0.4)' },
              { offset: 1, color: 'rgba(64,158,255,0.05)' }
            ]
          }
        },
        lineStyle: { color: '#409eff', width: 3 },
        itemStyle: { color: '#409eff' },
        data: dates.map(() => Math.round(500000 + Math.random() * 800000))
      },
      {
        name: '独立用户',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103,194,58,0.4)' },
              { offset: 1, color: 'rgba(103,194,58,0.05)' }
            ]
          }
        },
        lineStyle: { color: '#67c23a', width: 3 },
        itemStyle: { color: '#67c23a' },
        data: dates.map(() => Math.round(200000 + Math.random() * 400000))
      }
    ]
  })
})

const successRateChartOption = computed(() => {
  const sorted = [...flags.value]
    .filter(f => f.totalImpressions > 0)
    .sort((a, b) => b.successRate - a.successRate)
  return markRaw({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `${params[0].name}<br/>成功率：${params[0].value}%`
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map(f => f.name),
      axisLabel: {
        rotate: 25,
        interval: 0,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      min: 90,
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series: [{
      type: 'bar',
      data: sorted.map(f => ({
        value: f.successRate,
        itemStyle: {
          color: f.successRate >= 98 ? '#67c23a' : f.successRate >= 96 ? '#409eff' : '#e6a23c',
          borderRadius: [6, 6, 0, 0]
        }
      })),
      barWidth: 24,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 11,
        fontWeight: 'bold'
      }
    }]
  })
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 100000000) return (num / 100000000).toFixed(2) + ' 亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + ' 万'
  return num.toLocaleString()
}

const getAvatarColor = (key) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#722ed1', '#13c2c2']
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getProgressColor = (percent, status) => {
  if (status === 'disabled') return '#f56c6c'
  if (status === 'inactive') return '#dcdfe6'
  if (percent === 100) return '#67c23a'
  if (percent >= 50) return '#409eff'
  return '#e6a23c'
}

const getRateClass = (rate) => {
  if (rate >= 98) return 'rate-excellent'
  if (rate >= 95) return 'rate-good'
  return 'rate-warning'
}

const getAffectedUsers = (flag) => {
  const audience = store.audiences.find(a => a.code === flag.audience)
  return Math.round((audience?.userCount || 0) * flag.rolloutPercent / 100)
}

const getEstimatedTime = (flag) => {
  const remain = 100 - flag.rolloutPercent
  if (remain === 0) return '已完成'
  if (remain < 10) return '2-3 天内'
  if (remain < 30) return '1 周内'
  if (remain < 60) return '2 周内'
  return '1 个月内'
}

const viewTrend = (flag) => {
  selectedFlag.value = flag
  const trend = store.getRolloutTrend(flag.id)

  trendPercentOption.value = markRaw({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: trend.map(t => t.date) },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      name: '发布比例',
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64,158,255,0.4)' },
            { offset: 1, color: 'rgba(64,158,255,0.05)' }
          ]
        }
      },
      lineStyle: { color: '#409eff', width: 3 },
      itemStyle: { color: '#409eff' },
      data: trend.map(t => t.percent)
    }]
  })

  trendUserOption.value = markRaw({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: trend.map(t => t.date) },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (val) => val >= 10000 ? (val / 10000).toFixed(0) + '万' : val
      }
    },
    series: [{
      name: '触达用户',
      type: 'bar',
      data: trend.map(t => ({
        value: t.users,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: 'rgba(103,194,58,0.4)' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      })),
      barWidth: 14
    }]
  })

  trendDialogVisible.value = true
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 600)
}

watch(() => route.query.flagId, (val) => {
  if (val) {
    const flag = flags.value.find(f => f.id === Number(val))
    if (flag) {
      setTimeout(() => {
        viewTrend(flag)
      }, 500)
    }
  }
}, { immediate: true })

onMounted(() => {})
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.gradient-card {
  overflow: hidden;
  position: relative;

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px !important;
  }

  .stat-icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 30px;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 4px;
    }
  }
}

.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.gradient-orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.gradient-purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.chart-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .chart {
    height: 300px;
  }

  .pie-chart {
    height: 280px;
  }
}

.progress-table-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }
}

.flag-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .flag-info {
    .flag-name {
      font-weight: 600;
      color: #303133;
    }

    .flag-key {
      font-size: 12px;
      color: #909399;
      font-family: 'Courier New', monospace;
      margin-top: 2px;
    }
  }
}

.progress-cell {
  padding: 4px 0;

  .progress-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.success-rate {
  font-weight: 700;
  font-size: 15px;
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-block;
}

.rate-excellent {
  color: #67c23a;
  background-color: #f0f9eb;
}

.rate-good {
  color: #409eff;
  background-color: #ecf5ff;
}

.rate-warning {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.trend-dialog-content {
  .trend-charts {
    display: flex;
    gap: 20px;
    margin-top: 20px;

    .trend-chart {
      flex: 1;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 16px;

      .chart-subtitle {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #303133;
      }

      .chart {
        height: 220px;
      }
    }
  }
}
</style>
