<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#409eff"><User /></el-icon>
          <div class="stat-value" style="color: #409eff;">{{ stats.totalAudiences }}</div>
          <div class="stat-label">人群分组数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#67c23a"><Avatar /></el-icon>
          <div class="stat-value" style="color: #67c23a;">{{ formatNumber(stats.totalUsers) }}</div>
          <div class="stat-label">覆盖用户总数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <el-icon :size="32" color="#e6a23c"><Connection /></el-icon>
          <div class="stat-value" style="color: #e6a23a;">{{ usedAudiencesCount }}</div>
          <div class="stat-label">已关联开关</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="main-card" shadow="never">
      <div class="page-header">
        <div class="page-title">
          <el-icon :size="22" color="#409eff"><UserFilled /></el-icon>
          <span style="margin-left: 8px;">目标人群管理</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建人群
          </el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索人群名称、编码、描述"
          :prefix-icon="Search"
          clearable
          style="width: 320px;"
          @clear="currentPage = 1"
        />
      </div>

      <el-row :gutter="20" v-loading="loading">
        <el-col
          v-for="audience in paginatedList"
          :key="audience.id"
          :span="8"
          :class="{ 'highlight-card': highlightCode === audience.code }"
        >
          <el-card class="audience-card" shadow="hover" @click="handleView(audience)">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <div class="title-row">
                    <el-icon :size="20" :color="getAudienceColor(audience.code)"><UserFilled /></el-icon>
                    <span class="name">{{ audience.name }}</span>
                  </div>
                  <div class="code-row">{{ audience.code }}</div>
                </div>
                <el-dropdown trigger="click" @click.stop>
                  <el-button :icon="MoreFilled" circle text size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click.stop="handleEdit(audience)">
                        <el-icon><Edit /></el-icon>编辑
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleDuplicate(audience)">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleView(audience)">
                        <el-icon><View /></el-icon>查看详情
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        @click.stop="handleDelete(audience)"
                        :disabled="audience.flagCount > 0 || isDeleting(audience.id)"
                      >
                        <el-icon v-if="isDeleting(audience.id)" class="is-spin" style="color: #909399;"><Loading /></el-icon>
                        <el-icon v-else style="color: #f56c6c;"><Delete /></el-icon>
                        <span :style="{ color: isDeleting(audience.id) ? '#909399' : '#f56c6c' }">
                          {{ isDeleting(audience.id) ? '删除中...' : '删除' }}
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <div class="card-body">
              <p class="description">{{ audience.description }}</p>

              <div class="user-count-row">
                <div class="count-item">
                  <span class="count-label">用户数</span>
                  <span class="count-value">{{ formatNumber(audience.userCount) }}</span>
                </div>
                <div class="count-item">
                  <span class="count-label">关联开关</span>
                  <el-tag
                    :type="audience.flagCount > 0 ? 'primary' : 'info'"
                    effect="light"
                    size="small"
                  >
                    {{ audience.flagCount }} 个
                  </el-tag>
                </div>
              </div>

              <el-divider style="margin: 16px 0 12px;" />

              <div class="rules-section">
                <div class="rules-label">
                  <el-icon><Filter /></el-icon>
                  <span>筛选规则</span>
                </div>
                <div class="rules-content">
                  <template v-if="audience.ruleType === 'all'">
                    <el-tag effect="dark" type="success">全部用户</el-tag>
                  </template>
                  <template v-else-if="audience.rules && audience.rules.length > 0">
                    <el-tag
                      v-for="(rule, idx) in audience.rules.slice(0, 2)"
                      :key="idx"
                      size="small"
                      effect="plain"
                      style="margin: 2px 4px 2px 0;"
                    >
                      {{ rule.field }} {{ operatorMap[rule.operator] }} {{ formatRuleValue(rule.value) }}
                    </el-tag>
                    <el-tooltip
                      v-if="audience.rules.length > 2"
                      :content="getRulesTooltip(audience.rules)"
                      placement="top"
                    >
                      <el-tag size="small" effect="plain">+{{ audience.rules.length - 2 }} 更多</el-tag>
                    </el-tooltip>
                  </template>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="card-footer">
                <span class="creator">
                  <el-icon><User /></el-icon>
                  {{ audience.creator }}
                </span>
                <span class="time">
                  <el-icon><Clock /></el-icon>
                  {{ audience.createdAt }}
                </span>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <div class="pagination" v-if="filteredList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[9, 18, 36]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>

      <el-empty v-if="!loading && filteredList.length === 0" description="暂无人群分组数据" />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="720px"
      destroy-on-close
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
            <el-form-item label="人群名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入人群名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人群编码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="如: vip_users"
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
            :rows="2"
            placeholder="请输入人群描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">
          <el-icon><Filter /></el-icon>
          <span style="margin-left: 6px;">筛选规则</span>
        </el-divider>

        <el-alert
          title="提示：使用以下规则组合筛选目标用户，多个规则为「且」的关系"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px;"
        />

        <div class="rules-builder">
          <div
            v-for="(rule, index) in formData.rules"
            :key="index"
            class="rule-item"
          >
            <el-select v-model="rule.field" placeholder="选择字段" style="width: 160px;">
              <el-option label="用户等级" value="membership_level" />
              <el-option label="年龄" value="age" />
              <el-option label="平台" value="platform" />
              <el-option label="年消费" value="annual_spending" />
              <el-option label="最近登录(天)" value="last_login_days" />
              <el-option label="注册天数" value="register_days" />
              <el-option label="Beta 测试" value="beta_tester" />
            </el-select>
            <el-select v-model="rule.operator" placeholder="操作符" style="width: 120px;">
              <el-option v-for="(label, key) in operatorMap" :key="key" :label="label" :value="key" />
            </el-select>
            <el-input v-model="rule.value" placeholder="值" style="width: 180px;" />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              plain
              size="small"
              @click="removeRule(index)"
            />
          </div>
          <el-button type="primary" plain :icon="Plus" @click="addRule">
            添加规则
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEditMode ? '保存修改' : '确认创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      title="人群详情"
      width="640px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentAudience">
        <el-descriptions-item label="人群名称" :span="2">{{ currentAudience.name }}</el-descriptions-item>
        <el-descriptions-item label="人群编码">{{ currentAudience.code }}</el-descriptions-item>
        <el-descriptions-item label="用户数">
          <span style="color: #409eff; font-weight: 600;">{{ formatNumber(currentAudience.userCount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentAudience.description }}</el-descriptions-item>
        <el-descriptions-item label="关联开关数">
          <el-tag type="primary">{{ currentAudience.flagCount }} 个</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentAudience.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentAudience.createdAt }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-section" v-if="currentAudience">
        <div class="section-title">
          <el-icon><Filter /></el-icon>
          <span>筛选规则详情</span>
        </div>
        <el-table :data="currentAudience.rules" v-if="currentAudience.ruleType !== 'all'" size="small">
          <el-table-column prop="field" label="字段" width="160" />
          <el-table-column label="操作符" width="120">
            <template #default="{ row }">{{ operatorMap[row.operator] }}</template>
          </el-table-column>
          <el-table-column label="值">
            <template #default="{ row }">{{ formatRuleValue(row.value) }}</template>
          </el-table-column>
        </el-table>
        <el-alert
          v-else
          title="此人群未设置筛选规则，覆盖全部用户"
          type="success"
          show-icon
          :closable="false"
        />
      </div>

      <div class="detail-section" v-if="currentAudience">
        <div class="section-title">
          <el-icon><Switch /></el-icon>
          <span>关联开关</span>
        </div>
        <div v-if="relatedFlags.length > 0">
          <el-tag
            v-for="flag in relatedFlags"
            :key="flag.id"
            type="primary"
            effect="light"
            style="margin: 4px 6px 4px 0; padding: 4px 10px;"
          >
            {{ flag.name }} ({{ flag.rolloutPercent }}%)
          </el-tag>
        </div>
        <el-empty v-else description="暂无关联开关" :image-size="60" style="padding: 10px 0;" />
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToFlags">查看关联开关</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Edit, Delete, View, MoreFilled,
  User, UserFilled, Clock, Filter, Avatar, Connection,
  CopyDocument, Switch as SwitchIcon, Loading
} from '@element-plus/icons-vue'
import { useFeatureStore } from '@/stores/feature'
import { operatorMap } from '@/mock/data'

const store = useFeatureStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const highlightCode = ref('')

const stats = computed(() => store.stats)

const usedAudiencesCount = computed(() => {
  return store.audiences.filter(a => a.flagCount > 0).length
})

const filteredList = computed(() => {
  return store.getAudiences({ keyword: keyword.value })
})

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const deletingId = ref(null)
const formRef = ref(null)
const currentAudience = ref(null)

const isDeleting = (id) => deletingId.value === id

const relatedFlags = computed(() => {
  if (!currentAudience.value) return []
  return store.flags.filter(f => f.audience === currentAudience.value.code)
})

const dialogTitle = computed(() => isEditMode.value ? '编辑人群' : '新建人群')

const formData = reactive({
  name: '',
  code: '',
  description: '',
  ruleType: 'custom',
  rules: []
})

const formRules = {
  name: [{ required: true, message: '请输入人群名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入人群编码', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入人群描述', trigger: 'blur' }]
}

watch(() => route.query.highlight, (val) => {
  if (val) {
    highlightCode.value = val
    setTimeout(() => {
      highlightCode.value = ''
    }, 3000)
  }
}, { immediate: true })

watch(keyword, () => {
  currentPage.value = 1
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 100000000) return (num / 100000000).toFixed(2) + ' 亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + ' 万'
  return num.toLocaleString()
}

const getAudienceColor = (code) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#722ed1']
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const formatRuleValue = (val) => {
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'boolean') return val ? '是' : '否'
  return String(val)
}

const getRulesTooltip = (rules) => {
  return rules.slice(2).map(r =>
    `${r.field} ${operatorMap[r.operator]} ${formatRuleValue(r.value)}`
  ).join('\n')
}

const handleCreate = () => {
  isEditMode.value = false
  Object.assign(formData, {
    name: '',
    code: '',
    description: '',
    ruleType: 'custom',
    rules: []
  })
  dialogVisible.value = true
}

const handleEdit = (audience) => {
  isEditMode.value = true
  Object.assign(formData, {
    name: audience.name,
    code: audience.code,
    description: audience.description,
    ruleType: audience.ruleType,
    rules: audience.rules ? audience.rules.map(r => ({ ...r })) : []
  })
  dialogVisible.value = true
}

const handleDuplicate = (audience) => {
  isEditMode.value = false
  Object.assign(formData, {
    name: audience.name + ' (副本)',
    code: audience.code + '_copy_' + Date.now().toString(36).slice(-4),
    description: audience.description + ' - 复制自 ' + audience.name,
    ruleType: audience.ruleType,
    rules: audience.rules ? audience.rules.map(r => ({ ...r })) : []
  })
  dialogVisible.value = true
}

const handleView = (audience) => {
  currentAudience.value = audience
  detailVisible.value = true
}

const handleDelete = async (audience) => {
  if (isDeleting(audience.id)) return
  deletingId.value = audience.id
  try {
    await ElMessageBox.confirm(
      `确定要删除人群「${audience.name}」吗？`,
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
      store.deleteAudience(audience.id)
      deletingId.value = null
    }, 200)
  } catch (e) {
    deletingId.value = null
    ElMessage.info('已取消删除')
  }
}

const addRule = () => {
  formData.rules.push({ field: '', operator: '', value: '' })
}

const removeRule = (index) => {
  formData.rules.splice(index, 1)
}

const handleDialogClosed = () => {
  formRef.value?.resetFields()
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    submitting.value = true
    setTimeout(() => {
      const validRules = formData.rules.filter(r => r.field && r.operator)
      const data = {
        ...formData,
        rules: validRules
      }
      if (isEditMode.value) {
        const audience = store.audiences.find(a => a.code === formData.code)
        if (audience) {
          store.updateAudience(audience.id, data)
        }
      } else {
        store.createAudience(data)
      }
      submitting.value = false
      dialogVisible.value = false
    }, 500)
  })
}

const goToFlags = () => {
  detailVisible.value = false
  router.push({ path: '/flags' })
}

onMounted(() => {})
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.main-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.search-bar {
  margin-bottom: 20px;
}

.highlight-card {
  animation: highlight 1.5s ease-in-out 2;
}

@keyframes highlight {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3); }
}

.audience-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;

  &:hover {
    border-color: #409eff;
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .card-title {
      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .code-row {
        font-size: 12px;
        color: #909399;
        font-family: 'Courier New', monospace;
        margin-top: 4px;
        background-color: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
      }
    }
  }

  .card-body {
    .description {
      font-size: 13px;
      color: #606266;
      line-height: 1.5;
      margin-bottom: 16px;
      min-height: 40px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .user-count-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .count-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .count-label {
          font-size: 12px;
          color: #909399;
        }

        .count-value {
          font-size: 18px;
          font-weight: 700;
          color: #409eff;
        }
      }
    }

    .rules-section {
      .rules-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .rules-content {
        min-height: 32px;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #909399;

    .creator, .time {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.rules-builder {
  .rule-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 12px;
    background-color: #fafafa;
    border-radius: 6px;
  }
}

.detail-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }
}

.is-spin {
  animation: spin-icon 1s linear infinite;
  display: inline-flex;
}

@keyframes spin-icon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
