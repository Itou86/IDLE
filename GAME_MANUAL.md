# IDLE 网页放置游戏 - 完整公式与数据手册

> 本文档整理自项目源码，涵盖所有系统模块、配置数据及核心计算公式。
> 项目路径：`/mnt/d/Work/IDLE`
> 技术栈：纯 HTML + CSS + JavaScript（Vanilla JS），localStorage 存档

---

## 📁 项目结构

```
IDLE/
├── index.html              # 入口页面（加载所有JS模块）
├── css/
│   └── style.css           # 全局样式（含卡组图鉴UI）
├── js/
│   ├── main.js             # 游戏主入口、UI渲染、事件绑定
│   ├── config/
│   │   ├── cards.js        # 卡牌配置（23张卡 + 4套装）
│   │   ├── achievements.js # 成就配置（68个成就定义）
│   │   ├── stages.js       # 竞技关卡配置（预设+生成规则）
│   │   └── stats.js        # 属性系统配置（11种属性定义）
│   ├── systems/
│   │   ├── gacha.js        # 抽卡系统（单抽/十连/保底）
│   │   ├── battle.js       # 竞技/战斗系统（回合制）
│   │   ├── achievement.js  # 成就检测与奖励（战力加成）
│   │   ├── idle.js         # 放置收益系统（点击+自动+离线）
│   │   ├── shop.js         # 商店系统
│   │   ├── stats.js        # 角色属性系统（11属性计算）
│   │   └── save.js         # 存档读写（localStorage）
│   └── utils/
│       └── formatter.js    # 大数字格式化、时间格式化、深拷贝
├── tests/
│   ├── index.html          # 测试套件入口页面
│   ├── test-framework.js   # 轻量级测试框架
│   ├── run-node.js         # Node.js 测试运行器
│   └── test-*.js           # 各系统测试文件（10个，192用例）
├── AGENTS.md               # 游戏设计文档
├── CLAUDE.md               # AI 开发脚手架
├── GAME_MANUAL.md          # 本文件（公式与数据手册）
├── CHANGELOG.md            # 开发日志与版本历史
├── TODO.md                 # 当前任务与待办事项
├── README.md               # 项目说明
├── DEPLOY.md               # 部署指南
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
单抽消耗 = 1 张抽卡券
十连抽消耗 = 10 张抽卡券
```

#### 2. 稀有度概率分布

**单抽概率：**
```
SSR: 5%   (rand < 0.05)
SR:  10%  (rand < 0.15)
R:   25%  (rand < 0.40)
N:   60%  (rand ≥ 0.40)
```

**十连抽概率（整体提升）：**
```
SSR: 8%   (rand < 0.08)
SR:  18%  (rand < 0.26)
R:   35%  (rand < 0.61)
N:   39%  (rand ≥ 0.61)
```

**十连第10张保底：**
```
SR:  85%  (rand < 0.85)
SSR: 15%  (rand ≥ 0.85)
```

#### 3. 角色属性计算（StatSystem）

属性计算分5步，按顺序执行：

```
// 1. 基础值（STAT_CONFIG.baseStats）
power=10, defense=0, hp=200, hpRegen=50, goldBonus=0, ticketBonus=0,
dropRate=0, critRate=0, critDamage=50, speed=5, expBonus=0

// 2. 卡牌固定值加成
对于每张拥有的卡牌：
  若卡牌使用旧格式（basePower + effect）：
    effect='power'   → power   += basePower × count × (1 + (level-1) × 0.1)
    effect='defense' → defense += basePower × count × (1 + (level-1) × 0.1)
    effect='gold'    → goldBonus += basePower × count × (1 + (level-1) × 0.1)
    effect='heal'    → hpRegen += basePower × count × (1 + (level-1) × 0.1)
    effect='speed'   → speed   += basePower × count × (1 + (level-1) × 0.1)

// 3. 套装固定值加成
对于每个完整收集的套装：
  将套装 bonus 中的数值型属性加到对应属性上

// 4. 百分比加成（在固定值之后乘算）
对于每个有百分比加成的套装：
  属性值 = 属性值 × (1 + 百分比 / 100)

// 5. 成就战力加成
achBonus = AchievementSystem.getTotalPowerBonus(gameState)  // 每个成就+1%~+5%
  power   = power   × (1 + achBonus / 100)
  defense = defense × (1 + achBonus / 100)
  hp      = hp      × (1 + achBonus / 100)

// 全部取整
effectivePower = floor(power × 1.0 + defense × 0.5 + hp × 0.1 + speed × 0.2 + critRate × 0.5)
```

**有效战力权重：**
| 属性 | 权重 |
|------|------|
| 攻击力 | 1.0 |
| 防御力 | 0.5 |
| 生命值 | 0.1 |
| 速度 | 0.2 |
| 暴击率 | 0.5 |

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

### 二、竞技系统（BattleSystem）— 回合制战斗

#### 1. 敌人属性生成

**所有关卡均使用生成式公式（无预设固定值）：**
```
enemyPower = floor(40 × 1.18^totalOffset)

其中：
  totalOffset = (world - 1) × 3 + (subStage - 1)
  // 每个世界贡献3关的等效进度，使世界N+1第1关 ≈ 世界N第4关

BOSS判定：subStage === 6（每世界第6关为BOSS）
BOSS倍率：1.3
实际敌人战力 = floor(enemyPower × bossMultiplier)
```

**敌人属性分配：**
```
敌人攻击力 = floor(enemyPower × attackRatio)
敌人防御力 = floor(enemyPower × defenseRatio)
敌人HP     = floor(enemyPower × hpMultiplier)
敌人速度   = max(1, floor(enemyPower / 100))

其中：
  普通关：attackRatio=0.7, defenseRatio=0.3, hpMultiplier=2.0
  BOSS关：attackRatio=0.6, defenseRatio=0.4, hpMultiplier=3.0, critRate=5%
```

#### 2. 关卡奖励
```
// 预设关卡有固定奖励值

// 生成关卡奖励
goldReward    = floor(15 × stage × (1 + stage × 0.015))
ticketReward  = max(1, floor(0.05 × stage))  // 至少1张券
```

#### 3. 回合制战斗流程

```
1. 先攻判定：玩家速度 ≥ 敌人速度 → 玩家先攻，否则敌人先攻
2. 双方交替行动，每回合交换先手权
3. 最多100回合，超时判负

// 玩家回合：计算对敌人伤害
伤害 = max(1, 玩家攻击力 - 敌人防御力 × 0.5)

// 暴击判定（玩家有 critRate 属性时）
若 random × 100 < critRate：
  伤害 = floor(伤害 × (1 + critDamage / 100))

// 敌人回合：计算对玩家伤害
伤害 = max(1, 敌人攻击力 - 玩家防御力 × 0.5)

// 闪避判定（玩家被攻击时）
闪避率 = max(0, 玩家速度 - 敌人速度)
若 random × 100 < min(闪避率, 20)：
  伤害 = 0（闪避）

// 胜负判定
敌人HP ≤ 0 → 胜利
玩家HP ≤ 0 → 失败
```

#### 4. 战斗结果

**胜利后：**
```
gold        += goldReward
tickets     += ticketReward
stats.goldTotal += goldReward
stats.battleWin += 1
subStage    += 1  // 若subStage > 6则进入下一世界
stats.loseStreak = 0
// 记录战斗日志（每回合详情）
```

**失败后：**
```
stats.battleLose += 1
stats.loseStreak += 1
// 记录战斗日志
```

**隐藏成就触发：**
```
// 绝地反击（hid_008）：战力低于敌人90%时获胜
若 playerPower < enemyPower × 0.9 且获胜：
  stats.underdogWin = true
```

---

### 三、放置收益系统（IdleSystem）

#### 1. 点击收益
```
点击获得金币 = BASE_CLICK_GOLD + clickLevel × valuePerLevel
           = 2 + clickLevel × 1
```

#### 2. 自动收益（每秒）
```
每秒自动金币 = BASE_AUTO_GOLD + autoLevel × valuePerLevel
           = 1 + autoLevel × 1
```

#### 3. 离线收益
```
离线时间 = floor((now - lastSaveTime) / 1000) 秒
有效离线时间 = min(离线时间, 8 × 3600)  // 上限8小时

离线金币 = effectiveSeconds × autoGoldPerSecond
```

#### 4. 升级价格
```
点击升级价格 = floor(5 × 1.3^clickLevel)
自动升级价格 = floor(20 × 1.5^autoLevel)
```

价格示例：
| 等级 | 点击升级价格 | 自动升级价格 |
|------|-------------|-------------|
| 0    | 5           | 20          |
| 1    | 6           | 30          |
| 2    | 8           | 45          |
| 3    | 10          | 67          |
| 4    | 13          | 101         |
| 5    | 17          | 151         |
| 10   | 69          | 1,140       |
| 20   | 951         | 66,300      |

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
gold_total:            stats.goldTotal ≥ value
gacha_count:           stats.gachaCount ≥ value
battle_win:            stats.battleWin ≥ value
stage:                 gameState.stage > value
card_count:            Object.keys(cards).length ≥ value
card_unique:           Object.keys(cards).length ≥ value
card_all:              Object.keys(cards).length ≥ CARD_CONFIG.pool.length
card_level:            任意卡牌 level ≥ value
rarity_obtain:         stats.rarityObtained[value] === true
set_active(1):         至少1个套装全部拥有
set_active(0):         所有套装全部拥有
set_active_count:      已激活套装数量 ≥ value
set_active_specific:   指定名称套装已激活
has_cards:             同时拥有指定id的全部卡牌
gacha_streak_no_rare:  stats.streakNoRare ≥ value
gacha_streak_no_ssr:   stats.streakNoSSR ≥ value
gacha_single_ssr:      stats.gachaSingleSSR === true
speedrun_stage5:       创建后1小时内到达第5关
hoarder:               gold ≥ value 且 gachaCount === 0
gamble:                gold === 0 且 gachaCount > 0
lose_streak:           stats.loseStreak ≥ value
underdog_win:          stats.underdogWin === true
click_spam:            1分钟内点击 ≥ value 次
midnight_login:        new Date().getHours() === 0
```

#### 2. 成就奖励
```
解锁成就时：
  if reward.powerBonus → 累计到总战力加成中
  
总战力加成 = Σ(所有已解锁成就的 powerBonus)
作用：power、defense、hp 三项属性按总加成比例提升
  power   = power   × (1 + 总加成 / 100)
  defense = defense × (1 + 总加成 / 100)
  hp      = hp      × (1 + 总加成 / 100)
```

---

### 六、存档系统（SaveSystem）

#### 1. 存档结构
```javascript
{
  gold: 50,               // 当前金币
  tickets: 20,            // 当前抽卡券
  stage: 1,                // 当前关卡
  cards: {},               // 拥有的卡牌 { id: { count, level, instances[] } }
  achievements: {},         // 已解锁成就 { id: true }
  idle: {                 // 放置系统状态
    clickLevel: 0,
    autoLevel: 1           // 初始自动收益1级
  },
  shop: {                 // 商店状态
    lastRefresh: 0,
    cardStock: {}          // 卡牌库存 { cardId: stock }
  },
  stats: {
    goldTotal: 50,        // 累计获得金币
    gachaCount: 0,        // 累计抽卡次数
    battleWin: 0,         // 累计胜利
    battleLose: 0,        // 累计失败
    loseStreak: 0,        // 当前连败数
    streakNoRare: 0,      // 连续无稀有（连续抽到N卡）
    streakNoSSR: 0,       // 连续无SSR
    rarityObtained: {},   // 记录获得过的稀有度 { 'SSR': true }
    lastSaveTime: Date.now(),
    createTime: Date.now(),
    // 隐藏成就追踪
    gachaSingleSSR: false,      // hid_002: 是否单抽过SSR
    underdogWin: false,         // hid_008: 是否低战力获胜过
    clickSpamCount: 0,          // hid_009: 点击计数
    clickSpamStartTime: 0       // hid_009: 点击计时起点
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

### 卡牌池（共23张）

**N卡（8张）- 基础数值卡**
| ID | 名称 | basePower | 效果 | 描述 |
|----|------|-----------|------|------|
| n_001 | 生锈的剑 | 5 | power | 攻击力 +5 |
| n_002 | 破木盾 | 3 | defense | 防御力 +3 |
| n_003 | 铜币袋 | 2 | gold | 金币产出 +2 |
| n_004 | 学徒法杖 | 4 | power | 攻击力 +4 |
| n_005 | 旧皮甲 | 4 | defense | 防御力 +4 |
| n_006 | 草药包 | 3 | heal | 每关恢复 +3 |
| n_007 | 铁箭头 | 4 | power | 攻击力 +4 |
| n_008 | 麻绳 | 1 | utility | 羁绊素材 |

**R卡（6张）- 有特性**
| ID | 名称 | basePower | 效果 | 描述 |
|----|------|-----------|------|------|
| r_001 | 精钢剑 | 12 | power | 攻击力 +12 |
| r_002 | 骑士盾 | 10 | defense | 防御力 +10 |
| r_003 | 幸运金币 | 5 | gold | 金币产出 +5，抽卡券产出 +1 |
| r_004 | 火焰宝石 | 15 | power | 攻击力 +15，对BOSS伤害+20% |
| r_005 | 疾风靴 | 8 | speed | 先攻+1，闪避+5% |
| r_006 | 生命护符 | 8 | heal | 每关恢复 +8，生命上限+20 |

**SR卡（5张）- 有联动**
| ID | 名称 | basePower | 效果 | 描述 |
|----|------|-----------|------|------|
| sr_001 | 龙血剑 | 30 | power | 攻击力 +30，与"龙鳞甲"同时装备时+50% |
| sr_002 | 龙鳞甲 | 25 | defense | 防御力 +25，与"龙血剑"同时装备时+50% |
| sr_003 | 聚宝盆 | 15 | gold | 金币产出 +15，每10关额外获得抽卡券 |
| sr_004 | 时空沙漏 | 12 | utility | 离线收益+50%，在线时每分钟额外+1金币 |
| sr_005 | 灵魂契约 | 20 | power | 攻击力 +20，击败敌人时20%概率再抽1次 |

**SSR卡（4张）- 核心驱动**
| ID | 名称 | basePower | 效果 | 描述 |
|----|------|-----------|------|------|
| ssr_001 | 创世之刃 | 80 | power | 攻击力 +80，所有N卡效果翻倍 |
| ssr_002 | 永恒王冠 | 50 | gold | 金币产出 +50，成就奖励+30% |
| ssr_003 | 命运骰子 | 30 | utility | 抽卡时10%概率额外抽1张，且稀有度+1 |
| ssr_004 | 虚空之眼 | 60 | power | 攻击力 +60，可看到隐藏成就的提示 |

### 套装羁绊（4套）

**2张套（4套）**
| 套装名称 | 所需卡牌 | 攻击加成 | 防御加成 | 金币加成 |
|----------|----------|----------|----------|----------|
| 新手套装 | n_001 + n_002 | +5 | - | - |
| 骑士套装 | r_001 + r_002 | +15 | +10 | - |
| 屠龙套装 | sr_001 + sr_002 | +50 | +30 | - |
| 神王套装 | ssr_001 + ssr_002 | +100 | - | +30 |

---

## 🏆 成就列表（68个）

**成就奖励机制**：所有成就解锁后提供 `powerBonus`（战力加成百分比）。每个已解锁成就的 powerBonus 累加，最终按比例提升角色的 `power`、`defense`、`hp`。

### 数值成就（32个）

**金币累计（8个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| num_001 | 初出茅庐 | 累计获得100金币 | +1% |
| num_002 | 小有积蓄 | 累计获得500金币 | +1% |
| num_003 | 稳步积累 | 累计获得2,000金币 | +1% |
| num_004 | 富翁之路 | 累计获得10,000金币 | +1% |
| num_005 | 财运亨通 | 累计获得5万金币 | +1% |
| num_006 | 百万富翁 | 累计获得100万金币 | +2% |
| num_007 | 亿万富翁 | 累计获得1亿金币 | +3% |
| num_008 | 富可敌国 | 累计获得100亿金币 | +5% |

**抽卡次数（8个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| num_010 | 初次抽卡 | 进行首次抽卡 | +1% |
| num_011 | 抽卡新手 | 累计抽卡5次 | +1% |
| num_012 | 抽卡爱好者 | 累计抽卡25次 | +1% |
| num_013 | 抽卡常客 | 累计抽卡50次 | +1% |
| num_014 | 抽卡狂魔 | 累计抽卡100次 | +2% |
| num_015 | 抽卡大师 | 累计抽卡500次 | +2% |
| num_016 | 抽卡之神 | 累计抽卡2,000次 | +3% |
| num_017 | 无限抽卡 | 累计抽卡1万次 | +5% |

**竞技胜利（7个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| num_020 | 首次胜利 | 赢得第一场竞技 | +1% |
| num_021 | 初露锋芒 | 累计获胜5场 | +1% |
| num_022 | 连胜新手 | 累计获胜25场 | +1% |
| num_023 | 竞技场常客 | 累计获胜100场 | +2% |
| num_024 | 竞技高手 | 累计获胜500场 | +2% |
| num_025 | 不败传说 | 累计获胜2,000场 | +3% |
| num_026 | 战神 | 累计获胜1万场 | +5% |

**关卡进度（9个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| num_030 | 初探竞技 | 通过第1关 | +1% |
| num_031 | 稳步前进 | 通过第5关 | +1% |
| num_032 | 突破第一层 | 通过第10关 | +1% |
| num_033 | 中层挑战者 | 通过第25关 | +1% |
| num_034 | 高层攀登者 | 通过第50关 | +2% |
| num_035 | 百层突破 | 通过第100关 | +2% |
| num_036 | 深渊行者 | 通过第250关 | +3% |
| num_037 | 巅峰之上 | 通过第500关 | +3% |
| num_038 | 传说之路 | 通过第1,000关 | +5% |

### 系统成就（19个）

**卡牌收集（7个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| sys_001 | 第一张卡 | 获得第一张卡牌 | +1% |
| sys_002 | 卡牌新手 | 拥有3张不同卡牌 | +1% |
| sys_003 | 卡组扩充 | 拥有5张不同卡牌 | +1% |
| sys_004 | 卡组成型 | 拥有10张不同卡牌 | +1% |
| sys_005 | 收藏家 | 拥有20张不同卡牌 | +2% |
| sys_006 | 资深收藏家 | 拥有30张不同卡牌 | +2% |
| sys_007 | 全图鉴 | 收集所有卡牌（23张） | +5% |

**卡牌升级（5个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| sys_010 | 首次升级 | 将一张卡牌升到2级 | +1% |
| sys_011 | 卡牌培养 | 将一张卡牌升到5级 | +1% |
| sys_012 | 卡牌大师 | 将一张卡牌升到10级 | +2% |
| sys_013 | 极限突破 | 将一张卡牌升到25级 | +2% |
| sys_014 | 传说卡牌 | 将一张卡牌升到50级 | +3% |

**稀有度收集（3个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| sys_020 | 稀有发现 | 抽到第一张R卡 | +1% |
| sys_021 | 史诗时刻 | 抽到第一张SR卡 | +1% |
| sys_022 | 传说降临 | 抽到第一张SSR卡 | +2% |

**套装羁绊（4个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| sys_030 | 套装新手 | 激活第一个套装羁绊 | +1% |
| sys_031 | 套装收集者 | 激活2个套装羁绊 | +2% |
| sys_032 | 套装大师 | 激活3个套装羁绊 | +2% |
| sys_033 | 套装之王 | 激活所有套装羁绊 | +5% |

### 组合成就（8个）

**同时拥有特定卡牌（5个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| combo_001 | 攻守兼备 | 同时拥有生锈的剑和破木盾 | +1% |
| combo_002 | 元素亲和 | 同时拥有火焰宝石和疾风靴 | +1% |
| combo_003 | 自然之力 | 同时拥有铁箭头和麻绳 | +1% |
| combo_004 | 光暗平衡 | 同时拥有龙血剑和龙鳞甲 | +2% |
| combo_005 | 创世之力 | 同时拥有创世之刃和永恒王冠 | +3% |

**激活特定套装（3个）**
| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| combo_010 | 骑士荣耀 | 激活骑士套装 | +1% |
| combo_011 | 屠龙传说 | 激活屠龙套装 | +2% |
| combo_012 | 神王降临 | 激活神王套装 | +3% |

### 隐藏成就（9个）

| ID | 名称 | 条件 | 战力加成 |
|----|------|------|---------|
| hid_001 | 十连保底 | 连续10次抽卡没有R以上 | +1% |
| hid_002 | 欧皇附体 | 单次抽卡抽到SSR | +2% |
| hid_003 | 非酋之王 | 连续100次抽卡没有SSR | +3% |
| hid_005 | 守财奴 | 持有金币超过10万但一次都不抽卡 | +1% |
| hid_006 | 赌徒 | 金币为0时进行抽卡 | +1% |
| hid_007 | 连败者 | 连续失败10场竞技 | +1% |
| hid_008 | 绝地反击 | 战力低于敌人10%时获胜 | +2% |
| hid_009 | 点击狂魔 | 1分钟内点击赚金币按钮超过30次 | +1% |
| hid_010 | 午夜玩家 | 在0:00-1:00之间登录游戏 | +1% |

---

## 🧪 测试覆盖

### 测试框架
- 自定义轻量级测试框架：`TestRunner` + `Assert`
- 支持：通过(pass)、失败(fail)、警告(warn)三种状态
- 断言方法：equal, notEqual, true, false, includes, greaterThan, lessThan, approx, warn, throws, doesNotThrow 等

### 测试套件（10个文件，192用例）
| 测试文件 | 测试对象 | 用例数 |
|----------|----------|--------|
| test-config.js | 配置数据验证（卡牌/套装/成就字段完整性） | ~34 |
| test-gacha.js | 抽卡系统（概率/保底/升级/战力计算） | ~25 |
| test-battle.js | 竞技系统（回合制/胜负/奖励/BOSS） | ~21 |
| test-achievement.js | 成就系统（条件检测/奖励/隐藏成就） | ~31 |
| test-idle.js | 放置收益系统（点击/自动/离线/升级） | ~16 |
| test-shop.js | 商店系统（刷新/购买/库存） | ~11 |
| test-save.js | 存档系统（序列化/导入导出） | ~20 |
| test-formatter.js | 工具函数（数字/时间/深拷贝/UID） | ~20 |
| test-integration.js | 核心循环集成（跨系统交互） | ~14 |
| test-stats.js | 属性系统（属性计算/套装加成/成就加成） | —（待创建） |

**运行测试：**
```bash
# 浏览器方式
打开 tests/index.html

# Node.js 方式
cd tests && node run-node.js
# 或
npm test
```

---

## 🔄 游戏状态初始化

```javascript
{
  gold: 50,            // 初始金币
  tickets: 20,         // 初始抽卡券（可抽20次单抽或2次十连）
  world: 1,            // 当前世界
  subStage: 1,         // 当前世界内的子关卡
  worldProgress: {},   // 各世界最高通关进度 { "1": 5 }
  cards: {},           // 无卡牌
  achievements: {},    // 无成就
  idle: {
    clickLevel: 0,
    autoLevel: 1           // 初始自动收益1级
  },
  // shop: 由 ShopSystem 在首次访问时动态创建
  stats: {
    goldTotal: 50,
    gachaCount: 0,
    battleWin: 0,
    battleLose: 0,
    loseStreak: 0,
    streakNoRare: 0,
    streakNoSSR: 0,
    rarityObtained: {},
    lastSaveTime: Date.now(),
    createTime: Date.now(),
    // 隐藏成就追踪
    gachaSingleSSR: false,
    underdogWin: false,
    clickSpamCount: 0,
    clickSpamStartTime: 0
  }
}
```

---

## 📊 数值增长曲线参考

### 关卡敌人战力增长（1.18倍指数增长，基于 totalOffset）
| 世界 | 子关卡 | totalOffset | 敌人战力 |
|------|--------|-------------|----------|
| 1 | 1 | 0 | 40 |
| 1 | 5 | 4 | ~82 |
| 1 | 6 (BOSS) | 5 | ~127 |
| 2 | 1 | 3 | ~65 |
| 2 | 6 (BOSS) | 8 | ~158 |
| 3 | 1 | 6 | ~108 |
| 5 | 6 (BOSS) | 17 | ~571 |
| 10 | 6 (BOSS) | 32 | ~4,330 |

### 玩家战力增长示例（基于 StatSystem）
```
基础属性（无卡牌）:
  power=10, defense=0, hp=200, speed=5, critRate=0, critDamage=50
  effectivePower = 10×1.0 + 0×0.5 + 200×0.1 + 5×0.2 + 0×0.5 = 31

1张N卡(生锈的剑) Lv.1: power += 5
  effectivePower = 15×1.0 + ... ≈ 36

5张SSR(创世之刃) Lv.1: power += 5 × 80 = 400
  effectivePower = 410×1.0 + ... ≈ 441

升级后（5张创世之刃 Lv.10）:
  power += 5 × 80 × (1 + 9×0.1) = 5 × 80 × 1.9 = 760
  effectivePower ≈ 801
```

---

## 🚀 部署信息

- **部署方式**: GitHub Pages（通过 GitHub Actions 自动部署）
- **触发条件**: push 到 main 分支
- **构建输出**: 根目录直接部署（纯静态文件）
- **访问地址**: `https://<username>.github.io/IDLE/`

---

## 📝 版本历史

| 日期 | 提交 | 主要变更 |
|------|------|----------|
| 2026-06-03 | 62b296c | **战斗系统重做**：纯数值比较 → 回合制战斗（先攻/暴击/闪避/HP/战斗日志） |
| 2026-06-03 | 2638f01 | **新增属性系统**：11种角色属性（攻击/防御/生命/暴击/速度等）、属性面板UI |
| 2026-06-03 | bb63085 | **成就奖励重做**：金币/券奖励 → 战力加成百分比（powerBonus） |
| 2026-05-07 | 29d3dcd | 修正文档引用，确认卡牌数量一致性 |
| 2026-05-07 | 112d19d | **UI修复**：防止图鉴面板在自动金币刷新时跳动 |
| 2026-05-06 | 7e35c3e | 添加 Node.js 测试运行器 |
| 2026-05-06 | d40ffff | 修复所有测试失败 |
| 2026-05-06 | 7d813f8 | 添加放置收益和商店系统 |
| 2026-05-06 | 72d5f8d | 添加 AI 脚手架和游戏手册 |
| 2026-05-06 | 39edbe7 | 数值调整与卡组系统：单抽1券、十连保底、关卡难度降低 |
| 2026-05-06 | 495f3ba | 游戏平衡与卡组图鉴：卡组图鉴UI |
| 2026-05-07 | c0afcc0 | 卡组图鉴UI优化 |

---

*文档生成时间: 2026-06-03*
*基于项目 commit: 62b296c*
*卡牌数量: 23张 | 套装数量: 4套 | 成就数量: 68个 | 测试用例: 192*
