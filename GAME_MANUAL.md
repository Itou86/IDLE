# IDLE 网页放置游戏 - 完整项目文档

> 本文档整理自项目源码，涵盖所有系统模块、配置数据及核心计算公式。
> 项目路径：`/mnt/d/Work/IDLE`
> 技术栈：纯 HTML + CSS + JavaScript（Vanilla JS），localStorage 存档

---

## 📁 项目结构

```
IDLE/
├── index.html              # 入口页面（加载所有JS模块）
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── main.js             # 游戏主入口、UI渲染、事件绑定
│   ├── config/
│   │   ├── cards.js        # 卡牌配置（稀有度、卡池、套装羁绊）
│   │   ├── achievements.js # 成就配置（54个成就定义）
│   │   └── stages.js       # 竞技关卡配置（预设+生成规则）
│   ├── systems/
│   │   ├── gacha.js        # 抽卡系统
│   │   ├── battle.js       # 竞技/战斗系统
│   │   ├── achievement.js  # 成就检测与奖励
│   │   ├── idle.js         # 放置收益系统（点击+自动）
│   │   ├── shop.js         # 商店系统
│   │   └── save.js         # 存档读写（localStorage）
│   └── utils/
│       └── formatter.js    # 大数字格式化、时间格式化、深拷贝
├── tests/
│   ├── index.html          # 测试套件入口页面
│   ├── test-framework.js   # 轻量级测试框架（TestRunner + Assert）
│   ├── test-config.js      # 配置数据验证测试（136+用例）
│   ├── test-gacha.js       # 抽卡系统测试
│   ├── test-battle.js      # 竞技系统测试
│   ├── test-achievement.js # 成就系统测试
│   ├── test-idle.js        # 放置收益系统测试
│   ├── test-shop.js        # 商店系统测试
│   ├── test-save.js        # 存档系统测试
│   ├── test-formatter.js   # 工具函数测试
│   └── test-integration.js # 集成测试（核心循环验证）
├── AGENTS.md               # 游戏设计文档
├── README.md               # 项目说明
├── DEPLOY.md               # 部署文档（GitHub Pages）
├── CONTRIBUTING.md         # 贡献指南
├── LICENSE                 # 许可证
└── package.json            # 项目元数据
```

---

## 🎮 核心玩法循环

```
进入游戏 → 抽卡 → 竞技 → 获得奖励 → 抽卡（循环）
```

玩家通过抽卡获得卡牌提升战力，通过竞技验证战力并获取金币/抽卡券奖励，再用资源继续抽卡，形成正循环。放置系统提供离线收益和点击收益作为辅助资源来源。

---

## 📐 计算公式汇总

### 一、抽卡系统（GachaSystem）

#### 1. 抽卡消耗
```
每次抽卡消耗 = 10 张抽卡券
```

#### 2. 稀有度概率分布
```
SSR: 5%   (rand < 0.05)
SR:  10%  (rand < 0.15)
R:   25%  (rand < 0.40)
N:   60%  (rand ≥ 0.40)

概率总和 = 5% + 10% + 25% + 60% = 100%
```

#### 3. 玩家总战力计算
```
基础战力 = 10

单张卡牌战力贡献 = basePower × count × multiplier

其中：
  multiplier = 1 + (level - 1) × 0.1
  （每升1级，战力倍率+10%）

总攻击力 = 10 + Σ(攻击卡 basePower × count × multiplier)
总防御力 = Σ(防御卡 basePower × count × multiplier)

套装加成：
  若玩家拥有套装内全部卡牌（每张count > 0），则激活对应bonus

最终返回：
  power  = floor(总攻击力 + 套装攻击加成)
  defense = floor(总防御力 + 套装防御加成)
```

#### 4. 卡牌升级
```
单张升级：
  条件：count ≥ 2
  消耗：count -= 1
  效果：level += 1

批量升级：
  条件：count ≥ (targetLevel - currentLevel) + 1  （至少留1张）
  消耗：count -= (targetLevel - currentLevel)
  效果：level = targetLevel
```

#### 5. 连抽统计
```
streakNoRare:  连续抽到N卡的次数（抽到R/SR/SSR时重置为0）
streakNoSSR:   连续未抽到SSR的次数（抽到SSR时重置为0）
```

---

### 二、竞技系统（BattleSystem）

#### 1. 敌人战力生成
```
// 预设关卡（第1-10关固定值）
第1关: 80, 第2关: 100, 第3关: 130, 第4关: 170, 第5关: 220
第6关: 280, 第7关: 360, 第8关: 460, 第9关: 590
第10关(BOSS): 1000 × 1.5 = 1500

// 生成关卡（第11关起）
enemyPower = floor(100 × 1.15^(stage - 1))

BOSS判定：stage % 10 === 0
BOSS倍率：1.5
实际敌人战力 = floor(enemyPower × bossMultiplier)
```

#### 2. 关卡奖励
```
// 预设关卡有固定奖励值

// 生成关卡奖励
goldReward    = floor(10 × stage × (1 + stage × 0.02))
ticketReward  = floor(0.02 × stage)   // 每50关约1张券
```

#### 3. 胜负判定
```
玩家有效战力 = playerPower + playerDefense × 0.5

胜利条件：effectivePlayerPower ≥ enemyPower

胜利后：
  gold        += goldReward
  tickets     += ticketReward
  stats.goldTotal += goldReward
  stats.battleWin += 1
  stage       += 1
  stats.loseStreak = 0

失败后：
  stats.battleLose += 1
  stats.loseStreak += 1
```

---

### 三、放置收益系统（IdleSystem）

#### 1. 点击收益
```
点击获得金币 = BASE_CLICK_GOLD + clickLevel × valuePerLevel
           = 1 + clickLevel × 1
```

#### 2. 自动收益（每秒）
```
每秒自动金币 = BASE_AUTO_GOLD + autoLevel × valuePerLevel
           = 0 + autoLevel × 1
           = autoLevel
```

#### 3. 离线收益
```
离线时间 = floor((now - lastSaveTime) / 1000) 秒
有效离线时间 = min(离线时间, 8 × 3600)  // 上限8小时

离线金币 = effectiveSeconds × autoGoldPerSecond
```

#### 4. 升级价格
```
点击升级价格 = floor(10 × 1.5^clickLevel)
自动升级价格 = floor(50 × 1.8^autoLevel)
```

价格示例：
| 等级 | 点击升级价格 | 自动升级价格 |
|------|-------------|-------------|
| 0    | 10          | 50          |
| 1    | 15          | 90          |
| 2    | 22          | 162         |
| 3    | 33          | 291         |
| 4    | 50          | 524         |
| 5    | 75          | 944         |

---

### 四、商店系统（ShopSystem）

#### 1. 商品价格
```
抽卡券价格 = 500 金币
N卡价格   = 300 金币
```

#### 2. 商店刷新
```
自动刷新间隔 = 20 分钟（20 × 60 × 1000 毫秒）

刷新时随机选择 3-5 种 N卡：
  stockCount = 3 + floor(rand × 3)  // 3-5种

每种卡牌库存 = 1 + floor(rand × 3)  // 1-3张
```

---

### 五、成就系统（AchievementSystem）

#### 1. 成就检测条件
```
gold_total:          stats.goldTotal ≥ value
gacha_count:         stats.gachaCount ≥ value
battle_win:          stats.battleWin ≥ value
stage:               gameState.stage > value
card_count:          Object.keys(cards).length ≥ value
card_unique:         Object.keys(cards).length ≥ value
card_all:            Object.keys(cards).length ≥ CARD_CONFIG.pool.length
card_level:          任意卡牌 level ≥ value
rarity_obtain:       stats.rarityObtained[value] === true
set_active(1):       至少1个套装全部拥有
set_active(0):       所有套装全部拥有
gacha_streak_no_rare: stats.streakNoRare ≥ value
gacha_streak_no_ssr:  stats.streakNoSSR ≥ value
hoarder:             gold ≥ value 且 gachaCount === 0
gamble:              gold === 0 且 gachaCount > 0
lose_streak:         stats.loseStreak ≥ value
midnight_login:      new Date().getHours() === 0
```

#### 2. 成就奖励
```
解锁成就时：
  if reward.gold    → gameState.gold += reward.gold
  if reward.tickets → gameState.tickets += reward.tickets
```

---

### 六、存档系统（SaveSystem）

#### 1. 存档结构
```javascript
{
  gold: 100,              // 当前金币
  tickets: 10,            // 当前抽卡券
  stage: 1,               // 当前关卡
  cards: {},              // 拥有的卡牌
  achievements: {},        // 已解锁成就
  idle: {                 // 放置系统状态
    clickLevel: 0,
    autoLevel: 0
  },
  shop: {                 // 商店状态
    lastRefresh: 0,
    cardStock: {}
  },
  stats: {
    goldTotal: 100,       // 累计获得金币
    gachaCount: 0,        // 累计抽卡次数
    battleWin: 0,         // 累计胜利
    battleLose: 0,        // 累计失败
    loseStreak: 0,        // 当前连败数
    streakNoRare: 0,      // 连续无稀有
    streakNoSSR: 0,       // 连续无SSR
    rarityObtained: {},   // 记录获得过的稀有度
    lastSaveTime: Date.now(),
    createTime: Date.now()
  }
}
```

#### 2. 存档操作
```
save:   JSON.stringify → localStorage.setItem(KEY, data)
load:   localStorage.getItem(KEY) → JSON.parse
reset:   localStorage.removeItem(KEY)
export:  btoa(JSON.stringify(state))  → Base64字符串
import:  atob(base64) → JSON.parse
```

---

### 七、工具函数（Formatter）

#### 1. 大数字格式化
```
num < 1000:              直接显示整数
num ≥ 1000:              scaled = num / 1000^unitIndex
                         unitIndex = floor(log10(num) / 3)
                         
                         if scaled < 10: 保留2位小数
                         else:           保留1位小数
                         
                         单位: ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac']
```

示例：
| 输入 | 输出 |
|------|------|
| 999 | "999" |
| 1000 | "1.00K" |
| 1500 | "1.50K" |
| 1000000 | "1.00M" |
| 1000000000 | "1.00B" |
| 1000000000000 | "1.00T" |

#### 2. 时间格式化
```
seconds < 60:     floor(seconds) + "秒"
seconds < 3600:   floor(seconds / 60) + "分"
seconds < 86400:  floor(seconds / 3600) + "小时"
seconds ≥ 86400:  floor(seconds / 86400) + "天"
```

#### 3. 唯一ID生成
```
uid = Date.now().toString(36) + Math.random().toString(36).substr(2)
```

---

## 🃏 卡牌配置详情

### 稀有度概率
| 稀有度 | 概率 | 颜色 | 中文名 |
|--------|------|------|--------|
| N      | 60%  | #888 | 普通   |
| R      | 25%  | #4fc3f7 | 稀有 |
| SR     | 10%  | #ba68c8 | 史诗 |
| SSR    | 5%   | #ffd54f | 传说 |

### 卡牌池（共20张）

**N卡（8张）- 基础数值卡**
| ID | 名称 | 战力 | 效果 |
|----|------|------|------|
| n_001 | 生锈的剑 | 5 | 攻击力 |
| n_002 | 破木盾 | 3 | 防御力 |
| n_003 | 铜币袋 | 2 | 金币产出 |
| n_004 | 学徒法杖 | 4 | 攻击力 |
| n_005 | 旧皮甲 | 4 | 防御力 |
| n_006 | 草药包 | 3 | 恢复 |
| n_007 | 铁箭头 | 4 | 攻击力 |
| n_008 | 麻绳 | 1 | 羁绊素材 |

**R卡（6张）- 有特性**
| ID | 名称 | 战力 | 效果 |
|----|------|------|------|
| r_001 | 精钢剑 | 12 | 攻击力 |
| r_002 | 骑士盾 | 10 | 防御力 |
| r_003 | 幸运金币 | 5 | 金币产出 |
| r_004 | 火焰宝石 | 15 | 攻击力 |
| r_005 | 疾风靴 | 8 | 速度 |
| r_006 | 生命护符 | 8 | 恢复 |

**SR卡（5张）- 有联动**
| ID | 名称 | 战力 | 效果 |
|----|------|------|------|
| sr_001 | 龙血剑 | 30 | 攻击力（与龙鳞甲联动+50%） |
| sr_002 | 龙鳞甲 | 25 | 防御力（与龙血剑联动+50%） |
| sr_003 | 聚宝盆 | 15 | 金币产出 |
| sr_004 | 时空沙漏 | 12 | 离线收益+50% |
| sr_005 | 灵魂契约 | 20 | 攻击力 |

**SSR卡（4张）- 核心驱动**
| ID | 名称 | 战力 | 效果 |
|----|------|------|------|
| ssr_001 | 创世之刃 | 80 | 攻击力（所有N卡效果翻倍） |
| ssr_002 | 永恒王冠 | 50 | 金币产出（成就奖励+30%） |
| ssr_003 | 命运骰子 | 30 | 抽卡时10%额外抽1张 |
| ssr_004 | 虚空之眼 | 60 | 攻击力（可看到隐藏成就提示） |

### 套装羁绊（4套）
| 套装名称 | 所需卡牌 | 攻击加成 | 防御加成 | 金币加成 |
|----------|----------|----------|----------|----------|
| 新手套装 | n_001 + n_002 | +5 | - | - |
| 骑士套装 | r_001 + r_002 | +15 | +10 | - |
| 屠龙套装 | sr_001 + sr_002 | +50 | +30 | - |
| 神王套装 | ssr_001 + ssr_002 | +100 | - | +30 |

---

## 🏆 成就列表（54个）

### 数值成就（16个）
| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| num_001 | 初出茅庐 | 累计100金币 | 50金币 |
| num_002 | 小有积蓄 | 累计1000金币 | 200金币 |
| num_003 | 富翁之路 | 累计10000金币 | 1000金币+1券 |
| num_004 | 百万富翁 | 累计100万金币 | 50000金币+5券 |
| num_005 | 亿万富翁 | 累计1亿金币 | 100万金币+20券 |
| num_010 | 初次抽卡 | 抽卡1次 | 1券 |
| num_011 | 抽卡爱好者 | 抽卡10次 | 2券 |
| num_012 | 抽卡狂魔 | 抽卡100次 | 10券 |
| num_013 | 抽卡之神 | 抽卡1000次 | 50券 |
| num_020 | 首次胜利 | 胜利1场 | 100金币 |
| num_021 | 连胜新手 | 胜利10场 | 500金币 |
| num_022 | 竞技场常客 | 胜利100场 | 5000金币+3券 |
| num_023 | 不败传说 | 胜利1000场 | 50000金币+10券 |
| num_030 | 突破第一层 | 通过第10关 | 200金币 |
| num_031 | 中层挑战者 | 通过第50关 | 1000金币+2券 |
| num_032 | 高层攀登者 | 通过第100关 | 5000金币+5券 |
| num_033 | 巅峰之上 | 通过第500关 | 50000金币+20券 |

### 系统成就（12个）
| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| sys_001 | 第一张卡 | 拥有1张卡牌 | 50金币 |
| sys_002 | 卡组成型 | 拥有10张不同卡牌 | 300金币 |
| sys_003 | 收藏家 | 拥有30张不同卡牌 | 2000金币+3券 |
| sys_004 | 全图鉴 | 收集所有卡牌 | 10万金币+50券 |
| sys_010 | 首次升级 | 卡牌升到2级 | 100金币 |
| sys_011 | 卡牌大师 | 卡牌升到10级 | 5000金币+2券 |
| sys_012 | 极限突破 | 卡牌升到50级 | 50000金币+10券 |
| sys_020 | 稀有发现 | 抽到R卡 | 200金币 |
| sys_021 | 史诗时刻 | 抽到SR卡 | 1000金币+2券 |
| sys_022 | 传说降临 | 抽到SSR卡 | 5000金币+5券 |
| sys_030 | 套装新手 | 激活1个套装 | 300金币 |
| sys_031 | 套装大师 | 激活所有套装 | 20000金币+10券 |

### 隐藏成就（10个）
| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| hid_001 | 十连保底 | 连续10次无R以上 | 5券 |
| hid_002 | 欧皇附体 | 单次抽到SSR | 10券 |
| hid_003 | 非酋之王 | 连续100次无SSR | 20券 |
| hid_004 | 速通者 | 1分钟内通过第5关 | 5000金币+5券 |
| hid_005 | 守财奴 | 持有10万金币但不抽卡 | 10券 |
| hid_006 | 赌徒 | 金币为0时抽卡 | 100金币 |
| hid_007 | 连败者 | 连续失败10场 | 1000金币 |
| hid_008 | 绝地反击 | 战力低于敌人10%时获胜 | 3券 |
| hid_009 | 点击狂魔 | 1分钟点击抽卡30次 | 100金币 |
| hid_010 | 午夜玩家 | 0:00-1:00登录 | 1券 |

---

## 🧪 测试覆盖

### 测试框架
- 自定义轻量级测试框架：`TestRunner` + `Assert`
- 支持：通过(pass)、失败(fail)、警告(warn)三种状态
- 断言方法：equal, notEqual, true, false, includes, greaterThan, lessThan, approx, warn, throws, doesNotThrow 等

### 测试套件（8个）
| 测试文件 | 测试对象 | 用例数 |
|----------|----------|--------|
| test-config.js | 配置数据验证 | ~30 |
| test-gacha.js | 抽卡系统 | ~15 |
| test-battle.js | 竞技系统 | ~18 |
| test-achievement.js | 成就系统 | ~20 |
| test-idle.js | 放置收益系统 | ~16 |
| test-shop.js | 商店系统 | ~12 |
| test-save.js | 存档系统 | ~18 |
| test-formatter.js | 工具函数 | ~15 |
| test-integration.js | 核心循环集成 | ~14 |

**总计：136+ 测试用例**

---

## 🔄 游戏状态初始化

```javascript
{
  gold: 100,           // 初始金币
  tickets: 10,         // 初始抽卡券（可抽1次）
  stage: 1,            // 从第1关开始
  cards: {},           // 无卡牌
  achievements: {},    // 无成就
  stats: {
    goldTotal: 100,
    gachaCount: 0,
    battleWin: 0,
    battleLose: 0,
    loseStreak: 0,
    streakNoRare: 0,
    streakNoSSR: 0,
    rarityObtained: {},
    lastSaveTime: Date.now(),
    createTime: Date.now()
  }
}
```

---

## 📊 数值增长曲线参考

### 关卡敌人战力增长（1.15倍指数增长）
| 关卡 | 敌人战力 |
|------|----------|
| 1 | 80 |
| 5 | 220 |
| 10 | 1500 (BOSS) |
| 20 | ~1,636 |
| 50 | ~108,366 |
| 100 | ~11,739,085 |
| 200 | ~1.38×10¹² |
| 500 | ~2.25×10²⁸ |

### 玩家战力增长示例
```
基础战力: 10

1张N卡(生锈的剑): 10 + 5 = 15
5张N卡: 10 + 25 = 35
10张SSR(创世之刃): 10 + 800 = 810

升级后（5张创世之刃 Lv.10）:
  10 + 5 × 80 × (1 + 9×0.1) = 10 + 400 × 1.9 = 770
```

---

## 🚀 部署信息

- **部署方式**: GitHub Pages（通过 GitHub Actions 自动部署）
- **触发条件**: push 到 main 分支
- **构建输出**: 根目录直接部署（纯静态文件）
- **访问地址**: `https://<username>.github.io/IDLE/`

---

*文档生成时间: 2026-05-06*
*基于项目 commit: 当前工作区*
