# 代码地图

> 快速查找模块职责、热点函数位置和依赖关系。

---

## 📁 目录总览

```
js/
├── config/          # 游戏数据配置
│   ├── cards.js     # 卡牌、套装、世界配置
│   ├── achievements.js  # 成就定义
│   ├── stages.js    # 关卡生成规则
│   └── stats.js     # 属性定义
├── systems/         # 业务逻辑系统
│   ├── gacha.js     # 抽卡、战力、升级
│   ├── battle.js    # 回合制战斗
│   ├── achievement.js  # 成就检测
│   ├── idle.js      # 放置收益
│   ├── shop.js      # 商店
│   ├── stats.js     # 角色属性计算
│   └── save.js      # 存档读写
├── utils/
│   └── formatter.js # 数字/时间格式化、深拷贝
└── main.js          # 游戏入口、UI渲染、事件绑定

tests/
├── test-framework.js   # TestRunner + Assert
├── test-config.js      # 配置数据验证
├── test-gacha.js       # 抽卡系统
├── test-battle.js      # 战斗系统
├── test-achievement.js # 成就系统
├── test-idle.js        # 放置收益
├── test-shop.js        # 商店系统
├── test-save.js        # 存档系统
├── test-stats.js       # 属性系统
├── test-formatter.js   # 工具函数
└── test-integration.js # 核心循环集成
```

---

## 🔧 配置模块

### CARD_CONFIG（`js/config/cards.js`）

| 成员 | 说明 |
|------|------|
| `rates` | 稀有度概率 {N,R,SR,SSR} |
| `rarityStyle` | 稀有度颜色/名称映射 |
| `worlds` | 无限流世界配置（卡牌ID列表、套装） |
| `pool` | 全部 23 张卡牌定义 |
| `sets` | 兼容性套装定义 |
| `getWorldCards(worldId)` | 获取指定世界的卡牌 |
| `getWorldSets(worldId)` | 获取指定世界的套装 |
| `getCurrentPool(gameState)` | 获取当前世界卡池 |
| `getCurrentSets(gameState)` | 获取当前世界套装 |
| `getWorldCardsByRarity(worldId, rarity)` | 按稀有度获取世界卡牌 |
| `addWorld(config)` | 动态添加新世界 |

### STAT_CONFIG（`js/config/stats.js`）

| 成员 | 说明 |
|------|------|
| `definitions` | 11 种属性定义（名称/描述/图标/格式） |
| `baseStats` | 角色基础属性值 |
| `calcOrder` | 属性计算顺序 |
| `powerWeights` | 综合战力权重 |

### STAGE_CONFIG（`js/config/stages.js`）

| 成员 | 说明 |
|------|------|
| `SUB_STAGES_PER_WORLD` | 每个世界的子关卡数 |
| `BOSS_STAGE` | Boss 关卡编号 |
| `UNLOCK_NEXT_WORLD_AT` | 解锁下一世界所需条件 |
| `BASE_POWER` | 敌人基础攻击力 |
| `GROWTH_RATE` | 敌人属性成长率 |
| `BOSS_MULTIPLIER` | Boss 攻击倍率 |
| `BOSS_HP_MULTIPLIER` | Boss 生命倍率 |
| `BASE_GOLD` | 基础金币奖励 |
| `BASE_TICKETS` | 基础抽卡券奖励 |
| `preset` | 预设关卡配置（向后兼容） |
| `generate(world, subStage)` | 生成关卡敌人属性 |
| `getWorldName(world)` | 获取世界名称 |
| `getStage(gameState)` | 获取当前关卡敌人属性 |
| `getCurrentStageInfo(gameState)` | 获取当前关卡信息 |
| `canUnlockNextWorld(gameState)` | 判断是否可解锁下一世界 |
| `isStageUnlocked(gameState, world, subStage)` | 判断指定关卡是否已解锁 |
| `getTotalStage(gameState)` | 计算总关卡数 |

### ACHIEVEMENT_CONFIG（`js/config/achievements.js`）

| 成员 | 说明 |
|------|------|
| `powerBonusPerAchievement` | 每个成就提供的战力加成百分比 |
| `list` | 68 个成就定义数组 |

---

## ⚙️ 系统模块

### GachaSystem（`js/systems/gacha.js`）

**职责**：抽卡逻辑、战力计算、卡牌升级

| 函数 | 返回 | 说明 |
|------|------|------|
| `draw(gameState, count)` | `{success, cards}` | 单抽/十连，消耗抽卡券 |
| `getTotalPower(gameState)` | `{power, defense}` | 计算玩家总战力 |
| `getActiveSets(gameState)` | `sets[]` | 获取已激活的套装列表 |
| `getCollectionProgress(gameState)` | `{total, owned, percent}` | 获取卡牌收集进度 |
| `upgradeCard(gameState, cardId)` | `{success, newLevel}` | 2合1升级卡牌 |
| `upgradeCardBatch(gameState)` | `{upgraded, details}` | 批量升级所有可合成卡牌 |
| `_rollCard(worldPool, rarity)` | `card` | 内部：从卡池抽一张卡 |
| `_addCard(gameState, card)` | — | 内部：添加卡牌到库存 |
| `_updateStreaks(gameState, rarity)` | — | 内部：更新抽卡连抽统计 |
| `_getSetBonus(gameState, setId)` | `bonus` | 内部：获取套装加成效果 |

### BattleSystem（`js/systems/battle.js`）

**职责**：回合制战斗、胜负判定、奖励发放

| 函数 | 返回 | 说明 |
|------|------|------|
| `fight(gameState)` | `{win, gold, tickets, log}` | 进行一场战斗 |
| `getCurrentStageInfo(gameState)` | `{world, subStage, isBoss}` | 获取当前关卡信息 |
| `getStageInfo(gameState, world, subStage)` | `{enemy, rewards}` | 获取指定关卡信息 |
| `healAfterBattle(gameState)` | — | 战斗结束后回复生命值 |
| `_calcEnemyStats(world, subStage)` | `{power, defense, hp, speed}` | 生成敌人属性 |
| `_calcDamage(attacker, defender, isCrit)` | `number` | 计算单次伤害 |
| `_calcBossSpecial(gameState, enemy)` | `effect` | 内部：计算 Boss 特殊攻击 |
| `_handleWin(gameState, result)` | — | 内部：处理胜利奖励与进度 |
| `_handleLoss(gameState, result)` | — | 内部：处理失败逻辑 |
| `_dropCard(gameState)` | `card` | 战斗胜利后掉落卡牌 |
| `_getPlayerStats(gameState)` | `stats` | 内部：获取玩家战斗属性 |

### AchievementSystem（`js/systems/achievement.js`）

**职责**：成就条件检测、解锁、战力加成计算

| 函数 | 返回 | 说明 |
|------|------|------|
| `checkAll(gameState)` | `achievement[]` | 检测所有成就，返回新解锁的 |
| `getTotalPowerBonus(gameState)` | `number` | 计算已解锁成就的总战力加成 |
| `getList(gameState)` | `achievement[]` | 返回所有成就（标记解锁状态） |
| `_checkCondition(gameState, type, value)` | `boolean` | 内部：检测单个条件 |
| `_grantReward(gameState, reward)` | — | 内部：发放奖励 |

### StatSystem（`js/systems/stats.js`）

**职责**：角色属性计算、属性来源明细

| 函数 | 返回 | 说明 |
|------|------|------|
| `getCharacterStats(gameState)` | `stats` | 计算完整属性面板（11种属性） |
| `getStatBreakdown(gameState)` | `{base, cards, sets, percent, achievement}` | 属性来源明细 |
| `getDodgeRate(gameState)` | `number` | 获取闪避率（供 BattleSystem） |
| `formatStat(statKey, value)` | `string` | 格式化属性值显示 |
| `_getCardFlatBonuses(gameState)` | `{stat: value}` | 内部：卡牌固定值加成 |
| `_getSetFlatBonuses(gameState)` | `{stat: value}` | 内部：套装固定值加成 |
| `_getPercentBonuses(gameState)` | `{stat: pct}` | 内部：百分比加成 |
| `_calcEffectivePower(stats)` | `number` | 内部：计算综合战力 |
| `_mapEffectToStats(config, nMultiplier)` | `{stat: value}` | 内部：effect 映射为 stats |

### IdleSystem（`js/systems/idle.js`）

**职责**：点击收益、自动收益、离线收益

| 函数 | 返回 | 说明 |
|------|------|------|
| `click(gameState)` | `{gold, total}` | 处理一次点击，增加金币 |
| `getAutoGoldPerSecond(gameState)` | `number` | 每秒自动收益 |
| `calculateOfflineGold(gameState)` | `{seconds, gold}` | 计算离线收益 |
| `applyOfflineGold(gameState)` | `{success, gold}` | 应用离线收益到状态 |
| `getClickUpgradeCost(gameState)` | `number` | 获取点击升级当前价格 |
| `getAutoUpgradeCost(gameState)` | `number` | 获取自动升级当前价格 |
| `buyClickUpgrade(gameState)` | `{success, newLevel}` | 购买点击升级 |
| `buyAutoUpgrade(gameState)` | `{success, newLevel}` | 购买自动升级 |
| `getInfo(gameState)` | `{click, auto, prices}` | 获取升级信息 |
| `_getCardGoldBonus(gameState)` | `multiplier` | 内部：计算卡牌金币加成倍数 |
| `_getOfflineBonusPercent(gameState)` | `percent` | 内部：计算离线收益加成百分比 |

### ShopSystem（`js/systems/shop.js`）

**职责**：商店刷新、商品购买

| 函数 | 返回 | 说明 |
|------|------|------|
| `getItems(gameState)` | `items[]` | 获取当前商品列表 |
| `buy(gameState, itemId)` | `{success, item}` | 购买商品 |
| `refresh(gameState)` | `{success, items}` | 手动刷新商店 |
| `getNextRefreshTime(gameState)` | `timestamp` | 获取下次刷新时间 |
| `_refresh(gameState)` | — | 内部：执行刷新逻辑 |
| `_getRarityIcon(rarity)` | `string` | 内部：获取稀有度图标 |

### SaveSystem（`js/systems/save.js`）

**职责**：存档读写、导出导入、版本迁移

| 函数 | 返回 | 说明 |
|------|------|------|
| `save(gameState)` | `boolean` | 保存到 localStorage |
| `load()` | `gameState \| null` | 从 localStorage 读取 |
| `reset()` | — | 删除存档 |
| `export(gameState)` | `base64` | 导出为 Base64 字符串 |
| `import(base64)` | `gameState \| null` | 从 Base64 导入 |
| `_migrate(gameState)` | `gameState` | 内部：旧存档版本迁移 |

### Formatter（`js/utils/formatter.js`）

**职责**：数字格式化、时间格式化、深拷贝、UID 生成

| 函数 | 返回 | 说明 |
|------|------|------|
| `number(num)` | `string` | 大数字格式化（1.50K, 1.00M） |
| `time(seconds)` | `string` | 时间格式化（秒/分/小时/天） |
| `clone(obj)` | `obj` | 深拷贝 |
| `uid()` | `string` | 生成唯一 ID |

---

## 🎨 UI / 入口

### main.js（`js/main.js`）

**职责**：游戏主入口、UI 渲染、事件绑定、状态管理

| 函数 | 说明 |
|------|------|
| `Game.init()` | 初始化游戏（加载存档、启动定时器） |
| `Game.reset()` | 重置游戏状态 |
| `Game.save()` | 手动触发存档 |
| `Game.load()` | 手动触发读档 |
| `Game.gacha(count)` | 触发抽卡，更新 UI |
| `Game.battle()` | 触发当前关卡战斗 |
| `Game.battleAt(world, subStage)` | 挑战指定关卡 |
| `Game.render()` | 渲染主界面 |
| `Game.switchTab(tabName)` | 切换标签页 |
| `Game.showToast(message, type)` | 显示提示消息 |
| `Game.click()` | 处理点击收益 |
| `Game.buyClickUpgrade()` | 购买点击升级 |
| `Game.buyAutoUpgrade()` | 购买自动升级 |
| `Game.refreshShop()` | 刷新商店 |
| `Game.buyShopItem(itemId)` | 购买商店商品 |
| `Game.nextWorld()` | 进入下一世界 |
| `_handleBattleResult(result)` | 内部：处理战斗结果回调 |
| `_renderShop()` | 内部：渲染商店面板 |
| `_checkAchievements()` | 内部：检测并提示新成就 |
| `_createToastContainer()` | 内部：创建提示容器 |
| `_initMobileTabs()` | 内部：初始化移动端标签 |
| `_log(message, type)` | 内部：添加战斗日志 |
| `_showClickFloat(amount)` | 内部：点击浮动数字 |
| `_calcOfflineEarnings()` | 内部：计算并应用离线收益 |
| `_startAutoTick()` | 内部：启动自动收益定时器 |
| `_startShopTimer()` | 内部：启动商店刷新定时器 |
| `_renderShopTimer()` | 内部：渲染商店倒计时 |
| `_renderAchievements()` | 内部：渲染成就列表 |
| `_renderStats()` | 内部：渲染属性面板 |
| `_renderCollection()` | 内部：渲染卡牌图鉴 |

---

## 🔗 依赖关系

```
GachaSystem ← CARD_CONFIG, Formatter
BattleSystem ← STAGE_CONFIG, StatSystem
StatSystem ← STAT_CONFIG, CARD_CONFIG, AchievementSystem
AchievementSystem ← ACHIEVEMENT_CONFIG, CARD_CONFIG
ShopSystem ← CARD_CONFIG, Formatter
IdleSystem ← 无外部依赖
SaveSystem ← 无外部依赖
Game.main ← 所有系统
```

**数据流**：
1. 配置模块（`js/config/*`）提供静态数据
2. 系统模块（`js/systems/*`）读取配置，操作 `gameState`
3. `main.js` 调度系统调用，渲染 UI
4. `SaveSystem` 持久化 `gameState`

---

## ⚠️ 影响分析矩阵

> 修改某系统时，必须检查对其下游依赖的影响。

### 系统变更影响范围

| 修改系统 | 直接影响 | 间接影响 | 必须检查 |
|---------|---------|---------|---------|
| `CARD_CONFIG` (cards.js) | GachaSystem, ShopSystem, StatSystem, AchievementSystem | BattleSystem（战力变化影响战斗）, IdleSystem（卡牌金币加成） | 所有测试 |
| `STAT_CONFIG` (stats.js) | StatSystem | BattleSystem（属性变化影响战斗）, GachaSystem（战力显示） | test-stats.js + test-battle.js + test-integration.js |
| `STAGE_CONFIG` (stages.js) | BattleSystem | — | test-battle.js + test-integration.js |
| `ACHIEVEMENT_CONFIG` | AchievementSystem | StatSystem（战力加成变化）, BattleSystem（战力变化） | test-achievement.js + test-stats.js + test-integration.js |
| `GachaSystem` | gameState.cards | StatSystem（战力重算）, BattleSystem（战力变化）, AchievementSystem（卡牌收集成就） | test-gacha.js + test-stats.js + test-integration.js |
| `BattleSystem` | gameState.stats.battleWin/Lose, gold, tickets | AchievementSystem（胜利/失败成就）, IdleSystem（金币变化影响升级） | test-battle.js + test-achievement.js + test-integration.js |
| `StatSystem` | gameState 显示的属性 | BattleSystem（属性变化）, main.js（UI渲染） | test-stats.js + test-battle.js |
| `AchievementSystem` | gameState.achievements | StatSystem（战力加成重算）, BattleSystem | test-achievement.js + test-stats.js + test-integration.js |
| `IdleSystem` | gameState.gold, gameState.idle | ShopSystem（金币变化影响购买）, main.js（UI渲染） | test-idle.js + test-shop.js + test-integration.js |
| `ShopSystem` | gameState.cards, gameState.gold | GachaSystem（卡牌变化）, StatSystem（战力变化） | test-shop.js + test-gacha.js + test-stats.js + test-integration.js |
| `SaveSystem` | gameState 持久化 | 全部系统（加载后恢复） | test-save.js + test-integration.js |
| `Formatter` | 所有使用 Formatter 的系统 | — | test-formatter.js + 所有相关测试 |
| `main.js` | UI 渲染, 事件绑定, gameState 初始化 | 全部系统 | test-integration.js + test-save.js |

### 修改检查流程

修改某系统后，按以下顺序检查：

1. **直接下游** — 读取依赖此系统的所有模块（看上表「直接影响」列）
2. **间接下游** — 检查间接依赖（看上表「间接影响」列）
3. **测试覆盖** — 运行上表「必须检查」列中的测试文件
4. **存档兼容** — 如果修改了 `gameState` 结构，检查 `SaveSystem` 和 `reset()`

### 高风险修改

以下修改类型需要特别谨慎：

- **修改 `gameState` 结构** — 影响 SaveSystem、所有测试的 `createState`、旧存档兼容
- **修改战力计算公式** — 影响 StatSystem、BattleSystem、GachaSystem.getTotalPower
- **修改卡牌数据结构** — 影响 GachaSystem、StatSystem、SaveSystem、BattleSystem._dropCard
- **修改成就条件类型** — 影响 AchievementSystem._checkCondition、所有使用该条件的测试
- **修改稀有度概率** — 影响 GachaSystem、测试期望值、游戏平衡

---

## 🧪 测试速查

| 想测试... | 打开... |
|-----------|---------|
| 全部系统 | `tests/index.html` 或 `npm test` |
| 抽卡概率 | `test-gacha.js` |
| 战斗逻辑 | `test-battle.js` |
| 属性计算 | `test-stats.js` |
| 成就检测 | `test-achievement.js` |
| 跨系统交互 | `test-integration.js` |

---

## 🔍 调试速查

浏览器控制台常用命令：

```javascript
game.state                          // 当前游戏状态
GachaSystem.getTotalPower(game.state)   // 查看战力
StatSystem.getCharacterStats(game.state) // 查看属性面板
AchievementSystem.checkAll(game.state)   // 手动检测成就
BattleSystem.getStageInfo(game.state, 1, 1)  // 查看第1世界第1关敌人信息
STAGE_CONFIG.getWorldName(1)        // 获取第1世界名称
```

---

*代码地图应与代码同步更新。新增模块/函数时请及时补充。*
