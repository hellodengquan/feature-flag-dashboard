<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#409eff"><Collection /></el-icon>
          <div class="stat-value" style="color: #409eff;">{{ stats.total }}</div>
          <div class="stat-label">开关总数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#67c23a"><CircleCheck /></el-icon>
          <div class="stat-value" style="color: #67c23a;">{{ stats.active }}</div>
          <div class="stat-label">已发布</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#e6a23c"><Clock /></el-icon>
          <div class="stat-value" style="color: #e6a23c;">{{ stats.gradual }}</div>
          <div class="stat-label">灰度中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#f56c6c"><CircleClose /></el-icon>
          <div class="stat-value" style="color: #f56c6c;">{{ stats.disabled }}</div>
          <div class="stat-label">已禁用</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <div class="page-header">
        <div class="page-title">
          <el-icon :size="22" color="#409eff"><Switch /></el-icon>
          <span style="margin-left: 8px;">开关管理</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建开关
          </el-button>
        </div>
      </div>

      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="输入开关名称/Key/描述"
            :prefix-icon="Search"
            clearable
            style="width: 260px;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option
              v-for="(item, key) in statusMap"
              :key="key"
              :label="item.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="环境">
          <el-select v-model="filterForm.environment" placeholder="全部环境" clearable style="width: 140px;">
            <el-option
              v-for="(item, key) in environmentMap"
              :key="key"
              :label="item.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filterForm.tag" placeholder="全部标签" clearable style="width: 140px;">
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="applyFilter">查询</el-button>
          <el-button :icon="RefreshRight" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="filteredFlags"
        style="width: 100%"
        v-loading="loading"
        stripe
        @row-dblclick="handleView"
      >
        <el-table-column prop="name" label="开关名称" min-width="180">
          <template #default="{ row }">
            <div class="flag-info">
              <div class="flag-name">
                {{ row.name }}
                <el-tooltip v-if="row.rolloutPercent === 100" content="全量用户" placement="top">
                  <el-tag effect="dark" type="success" size="small" style="margin-left: 6px;">100%</el-tag>
                </el-tooltip>
              </div>
              <div class="flag-key">{{ row.key }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" effect="light" class="tag-status">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布进度" min-width="220">
          <template #default="{ row }">
            <div class="rollout-bar">
              <el-slider
                v-model="row.rolloutPercent"
                :min="0"
                :max="100"
                :step="5"
                :show-tooltip="true"
                :disabled="isRolling(row.id)"
                tooltip-class="rollout-tooltip"
                @change="(val) => handleRolloutChange(row, val)"
              />
              <span class="rollout-percent" :class="{ 'rolling': isRolling(row.id) }">
                <el-icon v-if="isRolling(row.id)" class="is-rolling"><Loading /></el-icon>
                {{ row.rolloutPercent }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="目标人群" width="180">
          <template #default="{ row }">
            <div class="audience-cell" @click="goToAudience(row)">
              <el-icon><User /></el-icon>
              <span>{{ row.audienceName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="环境" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="environmentMap[row.environment].type" size="small">
              {{ environmentMap[row.environment].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="160">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags.slice(0, 2)"
              :key="tag"
              size="small"
              effect="plain"
              style="margin-right: 4px;"
            >
              {{ tag }}
            </el-tag>
            <el-popover
                v-if="row.tags.length > 2"
                placement="top"
                :width="200"
                trigger="hover"
              >
                <div v-for="tag in row.tags.slice(2)" :key="tag" style="padding: 4px 0;">
                  {{ tag }}
                </div>
                <template #reference>
                  <el-tag size="small" effect="plain">+{{ row.tags.length - 2 }}</el-tag>
                </template>
              </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ row.updatedAt }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-switch
                v-model="row._switchValue"
                :model-value="row.status !== 'disabled' && row.status !== 'inactive'"
                :loading="isToggling(row.id)"
                :disabled="isToggling(row.id)"
                @update:model-value="(val) => handleToggle(row, val)"
                active-text="开"
                inactive-text="关"
                inline-prompt
                style="--el-switch-on-color: #67c23a;"
              />
              <el-button link type="primary" size="small" :icon="View" @click="handleView(row)">详情</el-button>
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
              <el-button
                link
                type="danger"
                size="small"
                :icon="Delete"
                :loading="isDeleting(row.id)"
                :disabled="isDeleting(row.id)"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredFlags.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="720px"
      destroy-on-close
      :close-on-click-modal="!submitting"
      :close-on-press-escape="!submitting"
      :show-close="!submitting"
      :before-close="handleFlagDialogBeforeClose"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开关名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入开关名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开关 Key" prop="key">
              <el-input
                v-model="formData.key"
                placeholder="如: new_feature_v2"
                :disabled="isEditMode"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="formData.description"
            :rows="3"
            placeholder="请输入功能描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标人群" prop="audience">
              <el-select v-model="formData.audience" placeholder="选择目标人群" style="width: 100%;">
                <el-option
                  v-for="audience in store.audiences"
                  :key="audience.id"
                  :label="audience.name"
                  :value="audience.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行环境" prop="environment">
              <el-select v-model="formData.environment" placeholder="选择环境" style="width: 100%;">
                <el-option label="生产环境" value="production" />
                <el-option label="预发环境" value="staging" />
                <el-option label="开发环境" value="development" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布比例">
              <div class="form-rollout">
                <el-slider
                  v-model="formData.rolloutPercent"
                  :min="0"
                  :max="100"
                  :step="5"
                  show-input
                  :show-input-controls="false"
                  input-size="small"
                  style="flex: 1;"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="初始状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio-button value="inactive">未启用</el-radio-button>
                <el-radio-button value="gradual">灰度中</el-radio-button>
                <el-radio-button value="active">已发布</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标签">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或创建标签"
            style="width: 100%;"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleFlagDialogCancel" :disabled="submitting">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="submitting" @click="submitForm">
          {{ isEditMode ? '保存修改' : '确认创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      title="开关详情"
      width="680px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentFlag">
        <el-descriptions-item label="开关名称" :span="2">{{ currentFlag.name }}</el-descriptions-item>
        <el-descriptions-item label="开关 Key">{{ currentFlag.key }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMap[currentFlag.status].type">
            {{ statusMap[currentFlag.status].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentFlag.description }}</el-descriptions-item>
        <el-descriptions-item label="目标人群">{{ currentFlag.audienceName }}</el-descriptions-item>
        <el-descriptions-item label="运行环境">
          <el-tag :type="environmentMap[currentFlag.environment].type">
            {{ environmentMap[currentFlag.environment].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布比例">
          <el-progress :percentage="currentFlag.rolloutPercent" :status="currentFlag.rolloutPercent === 100 ? 'success' : ''" />
        </el-descriptions-item>
        <el-descriptions-item label="成功率">
          <span style="color: #67c23a; font-weight: 600;">{{ currentFlag.successRate }}%</span>
        </el-descriptions-item>
        <el-descriptions-item label="曝光总数">
          <span style="font-weight: 600;">{{ formatNumber(currentFlag.totalImpressions) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag
            v-for="tag in currentFlag.tags"
            :key="tag"
            size="small"
            style="margin-right: 4px;"
          >
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentFlag.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentFlag.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="最近更新">{{ currentFlag.updatedAt }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-chart" v-if="currentFlag">
        <div class="chart-title">
          <el-icon><TrendCharts /></el-icon>
          <span>近 14 天发布进度趋势</span>
        </div>
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToRollout(currentFlag)">查看发布进度</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, RefreshRight, View, Edit, Delete,
  Switch as SwitchIcon, User, Clock, TrendCharts,
  Collection, CircleCheck, CircleClose, Loading
} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { useFeatureStore } from '@/stores/feature'
import { statusMap, environmentMap } from '@/mock/data'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const store = useFeatureStore()
const router = useRouter()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  keyword: '',
  status: '',
  environment: '',
  tag: ''
})

const stats = computed(() => store.stats)

const allTags = computed(() => {
  const tags = new Set()
  store.flags.forEach(f => f.tags.forEach(t => tags.add(t)))
  return Array.from(tags)
})

const filteredFlags = computed(() => {
  return store.getFlags(filterForm)
})

watch(filterForm, () => {
  currentPage.value = 1
}, { deep: true })

const applyFilter = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.status = ''
  filterForm.environment = ''
  filterForm.tag = ''
}

const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const togglingMap = ref(new Map())
const rollingMap = ref(new Map())
const deletingId = ref(null)
const formRef = ref(null)
const currentFlag = ref(null)
const chartOption = ref({})

const isToggling = (id) => togglingMap.value.get(id) || false
const isRolling = (id) => rollingMap.value.get(id) || false
const isDeleting = (id) => deletingId.value === id

const dialogTitle = computed(() => isEditMode.value ? '编辑开关' : '新建开关')

const formData = reactive({
  name: '',
  key: '',
  description: '',
  audience: '',
  environment: 'production',
  rolloutPercent: 0,
  status: 'inactive',
  tags: []
})

const formRules = {
  name: [{ required: true, message: '请输入开关名称', trigger: 'blur' }],
  key: [
    { required: true, message: '请输入开关 Key', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入功能描述', trigger: 'blur' }],
  audience: [{ required: true, message: '请选择目标人群', trigger: 'change' }],
  environment: [{ required: true, message: '请选择运行环境', trigger: 'change' }],
  status: [{ required: true, message: '请选择初始状态', trigger: 'change' }]
}

const handleCreate = () => {
  isEditMode.value = false
  Object.assign(formData, {
    name: '',
    key: '',
    description: '',
    audience: 'all_users',
    environment: 'production',
    rolloutPercent: 0,
    status: 'inactive',
    tags: []
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditMode.value = true
  Object.assign(formData, {
    name: row.name,
    key: row.key,
    description: row.description,
    audience: row.audience,
    environment: row.environment,
    rolloutPercent: row.rolloutPercent,
    status: row.status,
    tags: [...row.tags]
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  currentFlag.value = row
  const trend = store.getRolloutTrend(row.id)
  chartOption.value = markRaw({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map(t => t.date)
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series: [{
      name: '发布比例',
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
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
  detailVisible.value = true
}

const handleDialogClosed = () => {
  formRef.value?.resetFields()
}

const handleFlagDialogCancel = () => {
  if (submitting.value) return
  dialogVisible.value = false
}

const handleFlagDialogBeforeClose = (done) => {
  if (submitting.value) {
    ElMessage.warning('正在提交数据，请稍候...')
    return
  }
  done()
}

const submitForm = async () => {
  if (submitting.value) return
  if (!formRef.value) return
  submitting.value = true
  try {
    await new Promise((resolve, reject) => {
      formRef.value.validate((valid) => {
        valid ? resolve() : reject(new Error('VALIDATE_FAILED'))
      })
    })
    await new Promise(resolve => setTimeout(resolve, 500))
    const audience = store.audiences.find(a => a.code === formData.audience)
    const data = {
      ...formData,
      audienceName: audience?.name || '未分配'
    }
    if (isEditMode.value) {
      const flag = store.flags.find(f => f.key === formData.key)
      if (flag) {
        store.updateFlag(flag.id, data)
      }
    } else {
      store.createFlag(data)
    }
    dialogVisible.value = false
  } catch (e) {
    if (e && e.message !== 'VALIDATE_FAILED') {
      ElMessage.error('提交失败，请重试')
      console.error(e)
    }
  } finally {
    submitting.value = false
  }
}

const handleToggle = async (row, val) => {
  if (isToggling(row.id)) return
  let nextStatus = val ? (row.rolloutPercent > 0 ? 'gradual' : 'active') : 'disabled'
  if (val && row.rolloutPercent === 100) {
    nextStatus = 'active'
  }
  const actionText = val ? '启用' : '禁用'
  togglingMap.value.set(row.id, true)
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}「${row.name}」吗？${val ? '功能将对目标人群生效' : '功能将对所有用户关闭'}`,
      '操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: val ? 'success' : 'warning',
        confirmButtonClass: val ? 'el-button--success' : '',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
          }
          done()
        }
      }
    )
    setTimeout(() => {
      store.toggleFlagStatus(row.id, nextStatus)
      togglingMap.value.delete(row.id)
    }, 200)
  } catch (e) {
    togglingMap.value.delete(row.id)
    row._switchValue = !val
    ElMessage.info('已取消操作')
  }
}

const handleRolloutChange = async (row, val) => {
  if (isRolling(row.id)) return
  rollingMap.value.set(row.id, true)
  try {
    await ElMessageBox.confirm(
      `确定要将「${row.name}」的发布比例调整为 ${val}% 吗？`,
      '调整发布比例',
      {
        confirmButtonText: '确认调整',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
          }
          done()
        }
      }
    )
    setTimeout(() => {
      store.updateRolloutPercent(row.id, val)
      rollingMap.value.delete(row.id)
    }, 200)
  } catch (e) {
    rollingMap.value.delete(row.id)
    const original = store.flags.find(f => f.id === row.id)
    if (original) {
      row.rolloutPercent = original.rolloutPercent
    }
    ElMessage.info('已取消调整')
  }
}

const handleDelete = async (row) => {
  if (isDeleting(row.id)) return
  deletingId.value = row.id
  try {
    await ElMessageBox.confirm(
      `确定要删除开关「${row.name}」吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
          }
          done()
        }
      }
    )
    setTimeout(() => {
      store.deleteFlag(row.id)
      deletingId.value = null
    }, 200)
  } catch (e) {
    deletingId.value = null
    ElMessage.info('已取消删除')
  }
}

const goToAudience = (row) => {
  if (row.audience && row.audience !== 'empty') {
    router.push({ path: '/audiences', query: { highlight: row.audience } })
  }
}

const goToRollout = (row) => {
  detailVisible.value = false
  router.push({ path: '/rollout', query: { flagId: row.id } })
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

onMounted(() => {
  store.flags.forEach(f => {
    f._switchValue = f.status !== 'disabled' && f.status !== 'inactive'
  })
})
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.filter-card {
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

.flag-info {
  .flag-name {
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
  }

  .flag-key {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    font-family: 'Courier New', monospace;
    background-color: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }
}

.audience-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.rollout-percent {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;

  &.rolling {
    color: #409eff;
  }

  .is-rolling {
    animation: spin-rolling 1s linear infinite;
  }
}

@keyframes spin-rolling {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.form-rollout {
  display: flex;
  align-items: center;
  width: 100%;
}

.detail-chart {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;

  .chart-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }

  .chart {
    height: 220px;
  }
}
</style>
