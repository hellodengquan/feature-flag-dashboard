import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockFlags, mockAudiences, mockOperationLogs } from '@/mock/data'
import { ElMessage, ElNotification } from 'element-plus'

const _uidCounter = ref(0)
const generateUid = () => {
  _uidCounter.value++
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    try {
      const uuid = globalThis.crypto.randomUUID()
      const short = uuid.replace(/-/g, '').slice(0, 12)
      return Number(`1${Date.now().toString().slice(-9)}${_uidCounter.value.toString().padStart(3, '0')}${parseInt(short, 36).toString().slice(0, 8)}`)
    } catch (e) {}
  }
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return Number(`${Date.now().toString()}${_uidCounter.value.toString().padStart(4, '0')}${rand}`)
}

export const useFeatureStore = defineStore('feature', () => {
  const flags = ref([...mockFlags])
  const audiences = ref([...mockAudiences])
  const operationLogs = ref([...mockOperationLogs])

  const stats = computed(() => {
    const total = flags.value.length
    const active = flags.value.filter(f => f.status === 'active').length
    const gradual = flags.value.filter(f => f.status === 'gradual').length
    const disabled = flags.value.filter(f => f.status === 'disabled').length
    const totalUsers = audiences.value.reduce((sum, a) => sum + a.userCount, 0)
    return { total, active, gradual, disabled, totalAudiences: audiences.value.length, totalUsers }
  })

  const _incAudienceFlagCount = (code, delta) => {
    const audience = audiences.value.find(a => a.code === code)
    if (audience) {
      audience.flagCount = Math.max(0, (audience.flagCount || 0) + delta)
    }
  }

  const addLog = (log) => {
    operationLogs.value.unshift({
      id: generateUid(),
      ...log,
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    })
  }

  const getFlags = (params = {}) => {
    let result = [...flags.value]
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(f =>
        f.key.toLowerCase().includes(kw) ||
        f.name.toLowerCase().includes(kw) ||
        f.description.toLowerCase().includes(kw)
      )
    }
    if (params.status) {
      result = result.filter(f => f.status === params.status)
    }
    if (params.environment) {
      result = result.filter(f => f.environment === params.environment)
    }
    if (params.tag) {
      result = result.filter(f => f.tags.includes(params.tag))
    }
    return result
  }

  const createFlag = (data) => {
    const newFlag = {
      id: generateUid(),
      rolloutPercent: 0,
      totalImpressions: 0,
      successRate: 0,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      creator: '管理员',
      ...data
    }
    flags.value.unshift(newFlag)
    if (data.audience) {
      _incAudienceFlagCount(data.audience, 1)
    }
    addLog({
      operator: '管理员',
      action: '创建开关',
      target: data.key,
      targetName: data.name,
      detail: '创建新的 Feature Flag'
    })
    ElMessage.success('开关创建成功')
    return newFlag
  }

  const updateFlag = (id, data) => {
    const index = flags.value.findIndex(f => f.id === id)
    if (index !== -1) {
      const oldFlag = { ...flags.value[index] }
      const oldAudience = oldFlag.audience
      const newAudience = data.audience
      flags.value[index] = {
        ...flags.value[index],
        ...data,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      }
      if (newAudience !== undefined && oldAudience !== newAudience) {
        if (oldAudience) {
          _incAudienceFlagCount(oldAudience, -1)
        }
        if (newAudience) {
          _incAudienceFlagCount(newAudience, 1)
        }
      }
      ElMessage.success('更新成功')
      return flags.value[index]
    }
    return null
  }

  const toggleFlagStatus = (id, status) => {
    const flag = flags.value.find(f => f.id === id)
    if (flag) {
      const oldStatus = flag.status
      flag.status = status
      flag.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

      const statusText = {
        active: '已发布',
        gradual: '灰度中',
        inactive: '未启用',
        disabled: '已禁用'
      }
      addLog({
        operator: '管理员',
        action: status === 'disabled' ? '禁用开关' : '启用开关',
        target: flag.key,
        targetName: flag.name,
        detail: `开关状态从 ${statusText[oldStatus] || '未知'} 变更为 ${statusText[status]}`
      })

      if (status === 'disabled') {
        ElNotification({
          title: '开关已禁用',
          message: `${flag.name} 已被禁用，功能将对所有用户关闭`,
          type: 'warning'
        })
      } else if (status === 'active') {
        ElNotification({
          title: '开关已发布',
          message: `${flag.name} 已发布，${flag.rolloutPercent}% 的用户将体验此功能`,
          type: 'success'
        })
      }
      return flag
    }
    return null
  }

  const updateRolloutPercent = (id, percent) => {
    const flag = flags.value.find(f => f.id === id)
    if (flag) {
      const oldPercent = flag.rolloutPercent
      flag.rolloutPercent = percent

      if (percent === 100) {
        flag.status = 'active'
      } else if (percent > 0 && percent < 100) {
        flag.status = 'gradual'
      } else {
        flag.status = flag.status === 'disabled' ? 'disabled' : 'inactive'
      }

      flag.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

      addLog({
        operator: '管理员',
        action: '修改发布比例',
        target: flag.key,
        targetName: flag.name,
        detail: `发布比例从 ${oldPercent}% 调整为 ${percent}%`
      })

      ElMessage.success(`发布比例已调整为 ${percent}%`)
      return flag
    }
    return null
  }

  const deleteFlag = (id) => {
    const index = flags.value.findIndex(f => f.id === id)
    if (index !== -1) {
      const flag = flags.value[index]
      if (flag.audience) {
        _incAudienceFlagCount(flag.audience, -1)
      }
      flags.value.splice(index, 1)
      addLog({
        operator: '管理员',
        action: '删除开关',
        target: flag.key,
        targetName: flag.name,
        detail: `Feature Flag 已删除`
      })
      ElMessage.success('删除成功')
      return true
    }
    return false
  }

  const getAudiences = (params = {}) => {
    let result = [...audiences.value]
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(kw) ||
        a.code.toLowerCase().includes(kw) ||
        a.description.toLowerCase().includes(kw)
      )
    }
    return result
  }

  const createAudience = (data) => {
    const newAudience = {
      id: generateUid(),
      userCount: Math.floor(Math.random() * 500000) + 10000,
      flagCount: 0,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      creator: '管理员',
      ...data
    }
    audiences.value.unshift(newAudience)
    addLog({
      operator: '管理员',
      action: '创建人群',
      target: data.code,
      targetName: data.name,
      detail: `创建新的人群分组，包含约 ${(newAudience.userCount / 10000).toFixed(1)} 万用户`
    })
    ElMessage.success('人群创建成功')
    return newAudience
  }

  const updateAudience = (id, data) => {
    const index = audiences.value.findIndex(a => a.id === id)
    if (index !== -1) {
      audiences.value[index] = { ...audiences.value[index], ...data }
      addLog({
        operator: '管理员',
        action: '更新人群',
        target: audiences.value[index].code,
        targetName: audiences.value[index].name,
        detail: '人群信息已更新'
      })
      ElMessage.success('更新成功')
      return audiences.value[index]
    }
    return null
  }

  const deleteAudience = (id) => {
    const index = audiences.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const audience = audiences.value[index]
      if (audience.flagCount > 0) {
        ElMessage.warning('该人群下有关联的开关，无法删除')
        return false
      }
      audiences.value.splice(index, 1)
      addLog({
        operator: '管理员',
        action: '删除人群',
        target: audience.code,
        targetName: audience.name,
        detail: '人群分组已删除'
      })
      ElMessage.success('删除成功')
      return true
    }
    return false
  }

  const assignAudienceToFlag = (flagId, audienceCode, audienceName) => {
    const flag = flags.value.find(f => f.id === flagId)
    if (flag) {
      const oldAudience = flag.audience
      if (oldAudience !== audienceCode) {
        if (oldAudience) {
          _incAudienceFlagCount(oldAudience, -1)
        }
        if (audienceCode) {
          _incAudienceFlagCount(audienceCode, 1)
        }
      }
      flag.audience = audienceCode
      flag.audienceName = audienceName
      flag.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      addLog({
        operator: '管理员',
        action: '关联人群',
        target: flag.key,
        targetName: flag.name,
        detail: `将开关关联到人群「${audienceName}」`
      })
      ElMessage.success('人群关联成功')
      return flag
    }
    return null
  }

  const getRolloutTrend = (flagId) => {
    const flag = flags.value.find(f => f.id === flagId)
    if (!flag) return []
    const days = 14
    const data = []
    const startPercent = Math.max(0, flag.rolloutPercent - 30)
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const progress = 1 - i / days
      const percent = Math.min(100, Math.round(startPercent + (flag.rolloutPercent - startPercent) * (0.3 + 0.7 * progress)))
      data.push({
        date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        percent,
        users: Math.round((flag.totalImpressions || 500000) * (percent / 100) * (0.8 + Math.random() * 0.4))
      })
    }
    return data
  }

  return {
    flags,
    audiences,
    operationLogs,
    stats,
    getFlags,
    createFlag,
    updateFlag,
    toggleFlagStatus,
    updateRolloutPercent,
    deleteFlag,
    getAudiences,
    createAudience,
    updateAudience,
    deleteAudience,
    assignAudienceToFlag,
    getRolloutTrend,
    addLog
  }
})
