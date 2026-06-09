export const mockFlags = [
  {
    id: 1,
    key: 'new_checkout_flow',
    name: '新版结算流程',
    description: '启用新版购物车结算流程，包含优惠券叠加和分账优化',
    status: 'active',
    rolloutPercent: 75,
    audience: 'all_users',
    audienceName: '全部用户',
    environment: 'production',
    createdAt: '2026-04-15 10:30:00',
    updatedAt: '2026-06-08 14:20:00',
    creator: '张三',
    tags: ['支付', '核心路径'],
    totalImpressions: 1250000,
    successRate: 98.5
  },
  {
    id: 2,
    key: 'ai_recommendation',
    name: 'AI 个性化推荐',
    description: '基于用户行为的智能商品推荐算法升级',
    status: 'active',
    rolloutPercent: 50,
    audience: 'vip_users',
    audienceName: 'VIP 用户',
    environment: 'production',
    createdAt: '2026-05-01 09:00:00',
    updatedAt: '2026-06-09 11:30:00',
    creator: '李四',
    tags: ['推荐', 'AI'],
    totalImpressions: 890000,
    successRate: 97.2
  },
  {
    id: 3,
    key: 'dark_mode',
    name: '暗黑模式',
    description: '全站暗黑模式主题支持',
    status: 'inactive',
    rolloutPercent: 0,
    audience: 'beta_testers',
    audienceName: 'Beta 测试用户',
    environment: 'staging',
    createdAt: '2026-05-20 16:45:00',
    updatedAt: '2026-06-01 10:00:00',
    creator: '王五',
    tags: ['UI', '体验'],
    totalImpressions: 0,
    successRate: 0
  },
  {
    id: 4,
    key: 'live_stream_shopping',
    name: '直播购物入口',
    description: '首页新增直播间入口和快捷购物功能',
    status: 'gradual',
    rolloutPercent: 30,
    audience: 'young_users',
    audienceName: '年轻用户(18-30岁)',
    environment: 'production',
    createdAt: '2026-03-10 14:00:00',
    updatedAt: '2026-06-07 09:15:00',
    creator: '赵六',
    tags: ['直播', '增长'],
    totalImpressions: 450000,
    successRate: 96.8
  },
  {
    id: 5,
    key: 'one_click_login',
    name: '一键登录',
    description: '手机号一键登录功能，免去短信验证步骤',
    status: 'active',
    rolloutPercent: 100,
    audience: 'all_users',
    audienceName: '全部用户',
    environment: 'production',
    createdAt: '2026-02-28 08:30:00',
    updatedAt: '2026-06-05 16:00:00',
    creator: '张三',
    tags: ['登录', '体验'],
    totalImpressions: 3200000,
    successRate: 99.1
  },
  {
    id: 6,
    key: 'smart_search',
    name: '智能搜索升级',
    description: '支持语义搜索和模糊匹配的全新搜索引擎',
    status: 'disabled',
    rolloutPercent: 0,
    audience: 'empty',
    audienceName: '未分配',
    environment: 'production',
    createdAt: '2026-06-01 11:00:00',
    updatedAt: '2026-06-01 11:00:00',
    creator: '李四',
    tags: ['搜索', '核心'],
    totalImpressions: 0,
    successRate: 0
  },
  {
    id: 7,
    key: 'subscription_service',
    name: '订阅制服务',
    description: '月度/季度会员订阅服务，包含专属折扣',
    status: 'gradual',
    rolloutPercent: 15,
    audience: 'high_value_users',
    audienceName: '高价值用户',
    environment: 'production',
    createdAt: '2026-05-15 13:20:00',
    updatedAt: '2026-06-06 15:45:00',
    creator: '王五',
    tags: ['会员', '商业化'],
    totalImpressions: 120000,
    successRate: 95.5
  },
  {
    id: 8,
    key: 'social_sharing',
    name: '社交分享优化',
    description: '优化商品分享卡片和社交平台分享体验',
    status: 'active',
    rolloutPercent: 60,
    audience: 'all_users',
    audienceName: '全部用户',
    environment: 'production',
    createdAt: '2026-04-28 10:15:00',
    updatedAt: '2026-06-04 10:30:00',
    creator: '赵六',
    tags: ['社交', '增长'],
    totalImpressions: 680000,
    successRate: 98.0
  }
]

export const mockAudiences = [
  {
    id: 1,
    name: '全部用户',
    code: 'all_users',
    description: '覆盖所有平台用户',
    userCount: 5000000,
    ruleType: 'all',
    rules: [],
    flagCount: 3,
    createdAt: '2026-01-01 00:00:00',
    creator: '系统'
  },
  {
    id: 2,
    name: 'VIP 用户',
    code: 'vip_users',
    description: '已购买 VIP 会员的用户',
    userCount: 580000,
    ruleType: 'custom',
    rules: [
      { field: 'membership_level', operator: 'in', value: ['gold', 'platinum', 'diamond'] }
    ],
    flagCount: 1,
    createdAt: '2026-02-10 09:00:00',
    creator: '张三'
  },
  {
    id: 3,
    name: 'Beta 测试用户',
    code: 'beta_testers',
    description: '申请加入 Beta 测试计划的用户',
    userCount: 25000,
    ruleType: 'custom',
    rules: [
      { field: 'beta_tester', operator: 'eq', value: true }
    ],
    flagCount: 1,
    createdAt: '2026-03-05 14:30:00',
    creator: '李四'
  },
  {
    id: 4,
    name: '年轻用户(18-30岁)',
    code: 'young_users',
    description: '年龄在 18-30 岁之间的用户群体',
    userCount: 1800000,
    ruleType: 'custom',
    rules: [
      { field: 'age', operator: 'gte', value: 18 },
      { field: 'age', operator: 'lte', value: 30 }
    ],
    flagCount: 1,
    createdAt: '2026-03-12 11:00:00',
    creator: '王五'
  },
  {
    id: 5,
    name: '高价值用户',
    code: 'high_value_users',
    description: '年消费额超过 10000 元的用户',
    userCount: 320000,
    ruleType: 'custom',
    rules: [
      { field: 'annual_spending', operator: 'gt', value: 10000 },
      { field: 'last_login_days', operator: 'lte', value: 30 }
    ],
    flagCount: 1,
    createdAt: '2026-04-18 16:00:00',
    creator: '赵六'
  },
  {
    id: 6,
    name: 'iOS 用户',
    code: 'ios_users',
    description: '使用 iOS 设备的用户',
    userCount: 2100000,
    ruleType: 'custom',
    rules: [
      { field: 'platform', operator: 'eq', value: 'ios' }
    ],
    flagCount: 0,
    createdAt: '2026-05-08 10:00:00',
    creator: '张三'
  },
  {
    id: 7,
    name: '新注册用户(7天内)',
    code: 'new_users',
    description: '注册时间在 7 天以内的新用户',
    userCount: 280000,
    ruleType: 'custom',
    rules: [
      { field: 'register_days', operator: 'lte', value: 7 }
    ],
    flagCount: 0,
    createdAt: '2026-05-25 09:30:00',
    creator: '李四'
  }
]

export const mockOperationLogs = [
  {
    id: 1,
    operator: '张三',
    action: '修改发布比例',
    target: 'new_checkout_flow',
    targetName: '新版结算流程',
    detail: '发布比例从 50% 调整为 75%',
    ip: '192.168.1.101',
    createdAt: '2026-06-08 14:20:00'
  },
  {
    id: 2,
    operator: '李四',
    action: '启用开关',
    target: 'ai_recommendation',
    targetName: 'AI 个性化推荐',
    detail: '开关状态从 草稿 变更为 灰度中',
    ip: '192.168.1.102',
    createdAt: '2026-06-09 11:30:00'
  },
  {
    id: 3,
    operator: '王五',
    action: '创建人群',
    target: 'high_value_users',
    targetName: '高价值用户',
    detail: '创建新的人群分组，包含 320,000 用户',
    ip: '192.168.1.103',
    createdAt: '2026-04-18 16:00:00'
  },
  {
    id: 4,
    operator: '赵六',
    action: '关联人群',
    target: 'live_stream_shopping',
    targetName: '直播购物入口',
    detail: '将开关关联到人群「年轻用户(18-30岁)」',
    ip: '192.168.1.104',
    createdAt: '2026-06-07 09:15:00'
  },
  {
    id: 5,
    operator: '张三',
    action: '全量发布',
    target: 'one_click_login',
    targetName: '一键登录',
    detail: '开关发布比例调整为 100%，全量上线',
    ip: '192.168.1.101',
    createdAt: '2026-06-05 16:00:00'
  },
  {
    id: 6,
    operator: '李四',
    action: '创建开关',
    target: 'smart_search',
    targetName: '智能搜索升级',
    detail: '创建新的 Feature Flag',
    ip: '192.168.1.102',
    createdAt: '2026-06-01 11:00:00'
  },
  {
    id: 7,
    operator: '王五',
    action: '修改发布比例',
    target: 'subscription_service',
    targetName: '订阅制服务',
    detail: '发布比例从 10% 调整为 15%',
    ip: '192.168.1.103',
    createdAt: '2026-06-06 15:45:00'
  },
  {
    id: 8,
    operator: '赵六',
    action: '修改发布比例',
    target: 'social_sharing',
    targetName: '社交分享优化',
    detail: '发布比例从 40% 调整为 60%',
    ip: '192.168.1.104',
    createdAt: '2026-06-04 10:30:00'
  },
  {
    id: 9,
    operator: '张三',
    action: '禁用开关',
    target: 'old_promotion_banner',
    targetName: '旧版促销横幅',
    detail: '开关已被禁用并标记为废弃',
    ip: '192.168.1.101',
    createdAt: '2026-06-03 14:00:00'
  },
  {
    id: 10,
    operator: '李四',
    action: '更新人群规则',
    target: 'vip_users',
    targetName: 'VIP 用户',
    detail: '新增规则：会员等级包含 diamond',
    ip: '192.168.1.102',
    createdAt: '2026-05-28 09:00:00'
  }
]

export const operatorMap = {
  eq: '等于',
  ne: '不等于',
  gt: '大于',
  gte: '大于等于',
  lt: '小于',
  lte: '小于等于',
  in: '包含于',
  contains: '包含'
}

export const statusMap = {
  active: { label: '已发布', type: 'success', color: '#67c23a' },
  gradual: { label: '灰度中', type: 'warning', color: '#e6a23c' },
  inactive: { label: '未启用', type: 'info', color: '#909399' },
  disabled: { label: '已禁用', type: 'danger', color: '#f56c6c' }
}

export const environmentMap = {
  production: { label: '生产环境', type: 'danger' },
  staging: { label: '预发环境', type: 'warning' },
  development: { label: '开发环境', type: 'primary' }
}
