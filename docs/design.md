# 设计指南

> 项目的设计决策、开发规范、贡献流程和部署说明。
> 面向开发者和 AI 协作者。

---

## 🎯 设计原则

### 核心循环

```
进入游戏 → 抽卡 → 竞技 → 获得奖励 → 抽卡（循环）
```

- **抽卡**：获取各类卡牌，提供数值增长和玩法变化
- **竞技**：验证当前数值强度，提供挫败感、成就感和奖励
- **奖励**：反馈到抽卡资源或角色成长上，形成正循环

### 数值先行

放置游戏的乐趣在数值，任何系统上线前必须有基础数值表。用配置驱动，不要硬编码。

### 配置驱动

所有游戏数据放在 `js/config/` 中，禁止在系统逻辑中硬编码数值。

❌ 错误：
```javascript
// 在 gacha.js 中
if (rarity === 'SSR') power += 80;  // 硬编码！
```

✅ 正确：
```javascript
// 在 cards.js 中
{ id: 'ssr_001', name: '创世之刃', rarity: 'SSR', basePower: 80, effect: 'power' }

// 在 gacha.js 中
const config = CARD_CONFIG.pool.find(c => c.id === id);
power += config.basePower * count * multiplier;  // 从配置读取
```

### 视觉最低可用

Demo 阶段优先功能可用，UI 整洁即可。不必追求完美美术，可用 Emoji/纯色块占位。

---

## 🏗️ 系统架构

### 1. 成就系统

- **目标**：至少 **1000+** 个成就（当前 68 个，持续扩展）
- **节奏**：不能乱弹，要有节奏感
- **三类成就**：
  1. **数值成就**：随进度自然解锁（累计金币、抽卡次数等）
  2. **系统成就**：随各系统深度触发（首次合成、抽到 SSR 等）
  3. **隐藏成就**：搞怪、诡异但不恶心，鼓励探索和社群传播
- **奖励**：所有成就提供 `powerBonus`（战力加成百分比），累加后提升 `power`/`defense`/`hp`

### 2. 抽卡系统（贵重系统）

- 卡牌/物品种类丰富，效果"乱七八糟"但有设计逻辑
- **四个核心维度**：
  1. **统一框架**：一致的稀有度（N/R/SR/SSR）、等级、升级规则
  2. **卡组收集奖励**：特定组合激活额外加成（套装羁绊）
  3. **卡牌间联动**：A 卡牌增强 B 卡牌效果（如龙血剑+龙鳞甲）
  4. **卡牌自身增长**：2 合 1 升 1 级，每级效果 +10%

### 3. 竞技系统

- 验证数值增长的核心出口
- **当前形式**：回合制战斗（先攻/暴击/闪避/HP）
- **设计目标**：
  - 提供**挫败感**（让玩家感到还能更强）
  - 提供**成就感**（突破极限时的爽感）
  - 提供**奖励**（正向反馈驱动继续循环）

### 4. 世界观：无限流

> **主题**：无限流 — 玩家作为被"系统"选中的轮回者，穿越到无数不同作品世界中收集力量、完成任务、不断变强。

#### 核心设定

- **系统**：一个神秘的高维存在，将轮回者投放到各个世界（位面）中。系统发放**系统点**作为基础资源，提供**次元抽取**能力，并在通关后给予奖励。
- **轮回者**：被系统选中的玩家。通过在各个世界中战斗、收集、成长，逐步解锁更强大的世界。
- **世界（位面）**：每个 `world` 对应一个作品世界（动漫/小说/影视/游戏/神话）。当前关卡机制天然适配：通关子关卡 → 战胜 Boss → 解锁下一世界。
- **世界碎片**：穿越世界时收集的次元碎片，可用于次元抽取（抽卡）。碎片是系统的通用"货币"之一。
- **竞技 = 位面任务**：每次战斗是一次位面任务/探索。胜利意味着任务完成，获得系统点与世界碎片奖励。

#### 命名映射表

> 以下映射是**代码迁移目标**。当前代码变量尚未改动，后续分批执行。

| 游戏概念 | 当前代码变量 | 规划变量 | 显示名称 | 说明 |
|----------|-------------|---------|---------|------|
| 货币 | `gold` | `points` | **系统点** | 系统发放的基础资源 |
| 抽卡资源 | `tickets` | `shards` | **世界碎片** | 穿越位面时收集的次元碎片 |
| 玩家 | `player` | — | **轮回者** | 保持 `player`，仅显示名变更 |
| 关卡通关 | — | — | **位面通关** | 叙事包装 |
| 金币加成 | `goldBonus` | `pointsBonus` | **系统点加成** | 提升系统点获取效率 |
| 抽卡 | `gacha` | — | **次元抽取** | 从无数世界中抽取物品 |
| 商店 | `shop` | — | **系统商城** | 系统提供的物资兑换 |
| 升级 | `upgrade` | — | **强化** | 提升轮回者能力 |

#### 卡牌命名风格指南

卡牌代表从各个世界中获得的**道具、技能、血统、概念**。来源不设限，全领域混搭：

- **二次元动漫**：技能/道具名（如「写轮眼」「日轮刀」「霸气」）
- **网络小说**：功法/技能/道具（如「焚诀」「秘偶大师」「心素」）
- **经典影视**：标志性物品（如「红蓝药丸」「魔戒」「光剑」）
- **游戏**：装备/道具/技能（如「大师剑」「原素瓶」「黄金树恩惠」）
- **神话传说**：神器/能力（如「雷神之锤」「昆仑镜」「七十二变」）

**原则**：
1. 用**道具/技能/概念**，避免具体角色名（不用"孙悟空"，用"金箍棒"或"七十二变"）
2. 效果描述简洁，突出"从某世界获得的力量"
3. 稀有度越高，来源作品越知名或力量层级越高

#### 成就命名风格指南

成就名融入无限流语境和梗：

- **数值成就**：用成长感词汇（「初入轮回」「位面漫步者」「万界征服者」）
- **系统成就**：用无限流专属梗（「单抽出奇迹」→「次元裂缝中捡到了SSR」）
- **隐藏成就**：搞怪、打破第四面墙（「囤积10万系统点不消费的主神空间异类」）

#### UI 风格指南

- **方向**：科幻终端风，简洁不繁琐
- **色调**：深色背景 + 荧光蓝/青文字 + 极简数据面板
- **元素**：
  - 用线条和色块分割区域，不用复杂纹理
  - 按钮用发光边框，hover 时轻微高亮
  - 数值变化用浮动数字，战斗日志用终端打字机风格
  - Emoji 占位可保留，但倾向于用纯色几何图形替代

---

## 🎨 主题化命名规范

### 代码变量与显示名称映射

系统代码变量和玩家看到的名称可以不同。以下规范确保一致性：

| 上下文 | 代码中 | UI 显示 | 备注 |
|--------|--------|---------|------|
| 货币值 | `gameState.points` | `系统点` | 迁移后从 `gold` 改来 |
| 货币标签 | `Formatter.number(n) + ' 系统点'` | — | 统一格式化 |
| 抽卡资源 | `gameState.shards` | `世界碎片` | 迁移后从 `tickets` 改来 |
| 玩家身份 | 文本硬编码 | `轮回者` | 不在状态中存储 |
| 关卡 | `world` / `subStage` | `第 X 世界 · 第 Y 关` | 现有结构，显示可加"位面"前缀 |
| Boss | `isBoss` | `位面Boss` | 叙事包装 |

### 文本替换检查清单

后续代码迁移时，按以下清单替换所有硬编码文本：

- [ ] `金币` → `系统点`
- [ ] `抽卡券` → `世界碎片`
- [ ] `金币加成` → `系统点加成`
- [ ] `抽卡` → `次元抽取`
- [ ] `商店` → `系统商城`
- [ ] `升级` → `强化`
- [ ] `关卡` → `位面探索`（视语境）
- [ ] `胜利` → `任务完成`（战斗结果）
- [ ] `失败` → `任务失败`（战斗结果）

### 5. 数值设计原则

- 前期爽快感
- 中期有目标
- 长期有追求
- 卡牌效果、竞技难度、成就奖励全部受数值设计约束

---

## 🏛️ 架构设计：EffectRegistry 效果注册层

> **状态**：设计文档阶段，待代码实现。
> **背景**：代码评审发现，当前按"功能领域"划分的模块（GachaSystem / BattleSystem / StatSystem 等）导致**卡牌特殊效果散落在 5 个文件中**。新增一张有特殊效果的卡需要改 N 个文件，这是最大的设计债。

### 问题：当前模块划分的根因

当前划分是**横向切分**（按功能领域）：

```
GachaSystem ── 抽卡流程 + 命运骰子硬编码
BattleSystem ── 战斗流程 + 火焰宝石/灵魂契约/聚宝盆硬编码
StatSystem ── 属性计算 + 创世之刃/龙血剑/龙鳞甲硬编码
IdleSystem ── 收益计算 + 时空沙漏硬编码
AchievementSystem ── 成就检测 + 永恒王冠硬编码
```

**根因**：一张卡牌的特殊效果被**纵向切碎**散落在多个系统中。

| 当前散落位置 | 涉及卡牌数 | 影响 |
|-------------|-----------|------|
| `GachaSystem.draw` | 1（命运骰子） | 改抽卡概率逻辑 |
| `BattleSystem._calcDamage` | 1（火焰宝石） | 改伤害计算 |
| `BattleSystem._handleWin` | 2（灵魂契约、聚宝盆） | 改胜利奖励 |
| `StatSystem._getCardFlatBonuses` | 5（创世之刃、龙血剑、龙鳞甲、疾风靴、生命护符） | 改属性计算 |
| `IdleSystem._getOfflineBonusPercent` | 1（时空沙漏） | 改离线收益 |
| `AchievementSystem.getTotalPowerBonus` | 1（永恒王冠） | 改成就加成 |

**结论**：按"功能领域"划分模块，与"卡牌效果跨领域"的本质矛盾。需要引入**效果注册层**解耦。

---

### 方案：EffectRegistry 效果注册层

#### 核心思想

把当前散落在 5 个文件中的 **11 张特殊卡牌效果**全部收拢到一处：

- **配置层**：卡牌定义时声明 `effects` 数组，说明有什么效果、什么时机触发
- **注册层**：`EffectRegistry` 在初始化时扫描所有卡牌，将效果注册到对应 trigger
- **系统层**：各系统只负责**流程**，在特定 hook 点调用 `EffectRegistry.trigger(trigger, gameState, context)`，不再硬编码任何卡牌 ID

**结果**：新增/修改一张有特殊效果的卡 → 只需要改 `cards.js`。

---

#### 卡牌配置新格式

在 `cards.js` 的卡牌定义中新增 `effects` 字段：

```javascript
{
    id: 'ssr_001',
    name: '创世之刃',
    rarity: 'SSR',
    basePower: 80,
    effect: 'power',  // 保留：基础效果类型（兼容旧代码）
    effects: [        // 新增：特殊效果声明
        { type: 'n_card_multiplier', value: 2, trigger: 'stat_calc' }
    ]
},
{
    id: 'ssr_003',
    name: '命运骰子',
    rarity: 'SSR',
    basePower: 30,
    effects: [
        { type: 'extra_draw', chance: 0.1, trigger: 'on_gacha_end', rarityUp: true }
    ]
},
{
    id: 'r_004',
    name: '火焰宝石',
    rarity: 'R',
    basePower: 15,
    effects: [
        { type: 'boss_damage_bonus', value: 0.2, trigger: 'on_damage_calc' }
    ]
}
```

**原则**：`effects` 中只声明"有什么效果"，不声明"怎么实现"。实现逻辑在 `EffectRegistry` 中按 `type` 分发。

---

#### EffectRegistry 接口规范

```javascript
// js/systems/effect-registry.js
const EffectRegistry = {
    // ===== 注册表 =====
    // trigger → handler[] 的映射
    _handlers: {},

    // ===== 公共方法：注册效果处理器 =====
    // 由各系统在初始化时调用，注册自己关心的 trigger
    register: function(trigger, handler) {
        if (!this._handlers[trigger]) this._handlers[trigger] = [];
        this._handlers[trigger].push(handler);
    },

    // ===== 公共方法：触发效果 =====
    // 各系统在流程的 hook 点调用
    // context 是可读写的上下文对象，效果处理器可以修改它
    trigger: function(trigger, gameState, context) {
        const handlers = this._handlers[trigger] || [];
        for (const h of handlers) {
            h(gameState, context);
        }
        return context;
    },

    // ===== 公共方法：从卡牌配置自动扫描注册 =====
    // 在游戏初始化时调用一次
    init: function() {
        for (const card of CARD_CONFIG.pool) {
            if (!card.effects) continue;
            for (const effect of card.effects) {
                this._registerCardEffect(card.id, effect);
            }
        }
    },

    // ===== 内部：把卡牌效果包装为 handler =====
    _registerCardEffect: function(cardId, effect) {
        const handler = (gameState, context) => {
            // 统一检查：玩家是否拥有此卡
            if (!GameUtils.hasCard(gameState, cardId)) return;
            // 执行效果
            this._executeEffect(effect, gameState, context);
        };
        this.register(effect.trigger, handler);
    },

    // ===== 内部：按 effect.type 分发执行 =====
    _executeEffect: function(effect, gameState, context) {
        switch (effect.type) {
            case 'extra_draw':
                if (Math.random() < effect.chance) {
                    context.extraDraws = context.extraDraws || [];
                    context.extraDraws.push({ rarityUp: effect.rarityUp });
                }
                break;
            case 'boss_damage_bonus':
                if (context.isBoss && context.isPlayer) {
                    context.damage = Math.floor(context.damage * (1 + effect.value));
                }
                break;
            case 'n_card_multiplier':
                context.nCardMultiplier = effect.value;
                break;
            case 'offline_bonus':
                context.offlineBonusPercent = (context.offlineBonusPercent || 0) + effect.value;
                break;
            case 'achievement_bonus':
                context.achievementMultiplier = (context.achievementMultiplier || 0) + effect.value;
                break;
            case 'kill_extra_drop':
                if (Math.random() < effect.chance) {
                    context.extraDrop = true;
                }
                break;
            case 'stage_ticket_bonus':
                if (context.totalStage % effect.interval === 0) {
                    context.extraTickets = (context.extraTickets || 0) + effect.value;
                }
                break;
            case 'synergy_bonus':
                // 联动效果：检查是否同时拥有配对卡牌
                if (GameUtils.hasCard(gameState, effect.pairCardId)) {
                    const bonus = effect.value * context.baseValue;
                    context.synergyBonus = (context.synergyBonus || 0) + bonus;
                }
                break;
            case 'flat_stat_bonus':
                // 固定属性加成（如生命护符+20生命）
                context.flatBonuses = context.flatBonuses || {};
                context.flatBonuses[effect.stat] = (context.flatBonuses[effect.stat] || 0) + effect.value;
                break;
            case 'dodge_rate_bonus':
                context.dodgeRate = (context.dodgeRate || 0) + effect.value;
                break;
            default:
                // 未知效果类型：静默忽略或警告
                console.warn(`未知效果类型: ${effect.type}`);
                break;
        }
    }
};
```

---

#### Trigger（钩子点）清单

各系统在以下时机触发效果：

| Trigger | 触发系统 | Context 内容 | 示例效果 |
|---------|---------|-------------|---------|
| `on_gacha_end` | `GachaSystem.draw` | `{ cards, count, extraDraws }` | 命运骰子额外抽卡 |
| `on_damage_calc` | `BattleSystem._calcDamage` | `{ damage, isPlayer, isBoss }` | 火焰宝石对BOSS增伤 |
| `stat_calc` | `StatSystem.getCharacterStats` | `{ nCardMultiplier, synergyBonus, flatBonuses }` | 创世之刃N卡翻倍 |
| `on_kill` | `BattleSystem._handleWin` | `{ totalStage, extraDrop, extraTickets }` | 灵魂契约击杀再抽、聚宝盆每10关奖励 |
| `offline_calc` | `IdleSystem.calculateOfflineGold` | `{ offlineBonusPercent }` | 时空沙漏离线加成 |
| `achievement_calc` | `AchievementSystem.getTotalPowerBonus` | `{ achievementMultiplier }` | 永恒王冠成就加成 |
| `on_battle_start` | `BattleSystem.fight` | `{ playerStats, enemy }` | 未来扩展：战前buff |
| `on_round_end` | `BattleSystem.fight` | `{ round, playerHP, enemyHP }` | 未来扩展：回合恢复 |

---

#### 系统改造示例

**GachaSystem.draw** 改造后：

```javascript
draw: function(gameState, count) {
    count = parseInt(count, 10) || 1;
    const cost = count >= 10 ? this.COST_10.tickets : this.COST.tickets * count;
    if (gameState.tickets < cost) {
        return { success: false, errorCode: 'NOT_ENOUGH_SHARDS', reason: '世界碎片不足' };
    }

    gameState.tickets -= cost;
    gameState.stats.gachaCount += count;

    const cards = [];
    for (let i = 0; i < count; i++) {
        const isLastOfTen = (count === 10 && i === 9);
        const card = this._rollCard(gameState, count === 10, isLastOfTen);
        GameUtils.addCardToInventory(gameState, card);  // 统一工具
        cards.push(card);
        this._updateStreaks(gameState, card.rarity);
    }

    // 触发效果（命运骰子等）
    const context = { cards, count };
    EffectRegistry.trigger('on_gacha_end', gameState, context);

    // 处理额外抽卡
    for (const extra of context.extraDraws || []) {
        const extraCard = this._rollCard(gameState, false, false, extra.rarityUp);
        GameUtils.addCardToInventory(gameState, extraCard);
        cards.push(extraCard);
        this._updateStreaks(gameState, extraCard.rarity);
    }

    return { success: true, cards: context.cards, count };
}
```

**BattleSystem._calcDamage** 改造后：

```javascript
_calcDamage: function(attacker, defender, isPlayer, gameState, stage) {
    let damage = Math.max(1, attacker.power - defender.defense * 0.5);

    // 触发伤害计算效果
    const context = { damage, isPlayer, isBoss: stage?.isBoss };
    EffectRegistry.trigger('on_damage_calc', gameState, context);
    damage = context.damage;

    // 暴击判定...
    // 闪避判定...

    return { damage: Math.floor(damage), isCrit, isMiss };
}
```

---

### 新的模块划分

重构后的文件结构：

```
js/
├── config/
│   ├── cards.js          # 卡牌定义 + effects 声明
│   ├── achievements.js   # 成就定义
│   ├── stages.js         # 关卡配置
│   └── stats.js          # 属性定义
├── systems/
│   ├── effect-registry.js    # 新增：效果注册中心
│   ├── gacha.js              # 抽卡流程（无硬编码效果）
│   ├── battle.js             # 战斗流程（无硬编码效果）
│   ├── achievement.js        # 成就检测（无硬编码效果）
│   ├── idle.js               # 收益计算（无硬编码效果）
│   ├── shop.js               # 商店
│   ├── stats.js              # 属性汇总（调用 EffectRegistry）
│   └── save.js               # 存档
├── ui/                           # 新增/拆分
│   ├── renderer.js               # 所有 DOM 渲染方法
│   └── components.js             # 可复用组件（toast、浮动数字）
├── utils/
│   ├── formatter.js          # 格式化工具
│   └── game-utils.js         # 新增：游戏通用操作
└── main.js                   # 精简：初始化 + 事件绑定
```

**依赖关系**：

```
Game.main → 所有系统
GachaSystem → EffectRegistry, GameUtils
BattleSystem → EffectRegistry, GameUtils, StatSystem
StatSystem → EffectRegistry, GameUtils, AchievementSystem
AchievementSystem → GameUtils
IdleSystem → EffectRegistry, GameUtils
ShopSystem → GameUtils
SaveSystem → 无外部依赖
EffectRegistry → CARD_CONFIG, GameUtils
```

---

### 配套改进

#### 1. GameUtils 通用工具（新增 `js/utils/game-utils.js`）

解决当前"检查是否拥有卡牌"和"添加卡牌到库存"代码重复的问题：

```javascript
const GameUtils = {
    // 检查玩家是否拥有某卡牌
    hasCard: function(gameState, cardId) {
        return gameState.cards[cardId]?.count > 0;
    },

    // 统一添加卡牌到库存（当前在 gacha.js/shop.js/battle.js 中重复）
    addCardToInventory: function(gameState, cardConfig) {
        if (!gameState.cards[cardConfig.id]) {
            gameState.cards[cardConfig.id] = { count: 0, level: 1, instances: [] };
        }
        gameState.cards[cardConfig.id].count++;
        const uid = Formatter.uid();
        gameState.cards[cardConfig.id].instances.push(uid);

        // 记录稀有度获得
        if (!gameState.stats.rarityObtained[cardConfig.rarity]) {
            gameState.stats.rarityObtained[cardConfig.rarity] = true;
        }
        return uid;
    },

    // 获取卡牌等级倍率
    getLevelMultiplier: function(level) {
        return 1 + (level - 1) * 0.1;
    },

    // 获取卡牌配置
    getCardConfig: function(cardId) {
        return CARD_CONFIG.pool.find(c => c.id === cardId);
    }
};
```

#### 2. main.js 拆分

当前 `main.js` 796 行，混合了状态管理、业务调度、DOM 渲染、事件绑定、动画效果。

**拆分后**：

| 文件 | 职责 | 从 main.js 提取 |
|------|------|----------------|
| `js/main.js` | 游戏初始化、状态管理、事件绑定 | `init`, `reset`, `save`, `load`, `state`, 事件回调 |
| `js/ui/renderer.js` | 所有 DOM 渲染逻辑 | `render`, `_renderShop`, `_renderStats`, `_renderAchievements`, `_renderCollection`, `_renderShopTimer` |
| `js/ui/components.js` | 可复用 UI 组件 | `_createToastContainer`, `showToast`, `_showClickFloat`, `_log` |
| `js/ui/mobile.js` | 移动端标签 | `_initMobileTabs`, `switchTab`, `TAB_PANELS` |

---

### 重构批次计划

重构按批次执行，每批独立测试保护：

| 批次 | 内容 | 涉及文件 | 测试影响 |
|------|------|---------|---------|
| **批次0** | 新增 `GameUtils`（`hasCard` + `addCardToInventory`），在各系统中替换重复代码 | `utils/game-utils.js`, `gacha.js`, `shop.js`, `battle.js` | 小：行为不变，只是提取公共逻辑 |
| **批次1** | 新增 `EffectRegistry` 骨架 + `init` / `register` / `trigger` 接口 | `systems/effect-registry.js` | 小：新增文件，不影响现有逻辑 |
| **批次2** | PoC：迁移 2 张效果最复杂的卡（命运骰子 + 火焰宝石）到 EffectRegistry | `cards.js`, `effect-registry.js`, `gacha.js`, `battle.js` | 中：验证方案可行性 |
| **批次3** | 全量迁移：剩余 9 张特殊卡牌效果 | `cards.js`, `effect-registry.js`, 各系统文件 | 中：清理所有硬编码 |
| **批次4** | 系统清理：确认无遗留硬编码，删除已迁移的冗余代码 | 各系统文件 | 小：删除死代码 |
| **批次5** | 拆分 `main.js` → `main.js` + `ui/*.js` | `main.js`, 新增 `ui/` 目录 | 中：UI 渲染逻辑迁移 |
| **批次6** | 测试升级：测试中增加 `errorCode` 断言，减少中文文本依赖 | `tests/test-*.js` | 中：断言方式升级 |

**批次 0-4 必须在主题化代码迁移（gold→points 等）之前完成**，因为 EffectRegistry 是基础设施。批次 5-6 可延后。

---

### 当前 11 张特殊卡牌的效果映射

| 卡牌ID | 名称 | 当前硬编码位置 | 迁移后 effect.type | 迁移后 trigger |
|--------|------|---------------|-------------------|---------------|
| `ssr_001` | 创世之刃 | `StatSystem._getCardFlatBonuses` | `n_card_multiplier` | `stat_calc` |
| `ssr_002` | 永恒王冠 | `AchievementSystem.getTotalPowerBonus` | `achievement_bonus` | `achievement_calc` |
| `ssr_003` | 命运骰子 | `GachaSystem.draw` | `extra_draw` | `on_gacha_end` |
| `ssr_004` | 虚空之眼 | ❌ 未实现 | `visible_hidden_achievements` | `ui_achievement` |
| `sr_001` | 龙血剑 | `StatSystem._getCardFlatBonuses` | `synergy_bonus` | `stat_calc` |
| `sr_002` | 龙鳞甲 | `StatSystem._getCardFlatBonuses` | `synergy_bonus` | `stat_calc` |
| `sr_003` | 聚宝盆 | `BattleSystem._handleWin` | `stage_ticket_bonus` | `on_kill` |
| `sr_004` | 时空沙漏 | `IdleSystem._getOfflineBonusPercent` | `offline_bonus` | `offline_calc` |
| `sr_005` | 灵魂契约 | `BattleSystem._handleWin` | `kill_extra_drop` | `on_kill` |
| `r_004` | 火焰宝石 | `BattleSystem._calcDamage` | `boss_damage_bonus` | `on_damage_calc` |
| `r_005` | 疾风靴 | `StatSystem._getCardFlatBonuses` | `dodge_rate_bonus` | `stat_calc` |
| `r_006` | 生命护符 | `StatSystem._getCardFlatBonuses` | `flat_stat_bonus` | `stat_calc` |

---

## 📝 开发规范

### 命名约定

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 配置常量 | SCREAMING_SNAKE_CASE | `CARD_CONFIG`, `BASE_CLICK_GOLD` |
| 系统对象 | PascalCase + System | `GachaSystem`, `BattleSystem` |
| 私有方法 | _camelCase | `_rollCard`, `_getSetBonus` |
| 游戏状态 | camelCase | `gameState`, `playerStats` |
| 事件回调 | camelCase | `onclick="game.gacha()"` |

### 注释规范

```javascript
/* ===== 系统名称 ===== */
const SystemName = {
    // 常量注释
    CONST: value,

    // 公共方法：简短描述
    publicMethod: function(gameState) {
        // 实现...
    },

    // 内部：详细描述
    _privateMethod: function() {
        // 实现...
    }
};
```

### 错误处理

#### 命令方法（修改状态）

所有会修改 `gameState` 的方法（抽卡、战斗、购买等）返回统一结构：

```javascript
{ success: boolean, reason?: string, ...data }

// 示例：抽卡失败
if (gameState.tickets < this.COST.tickets) {
    return { success: false, reason: '抽卡券不足' };
}
// 示例：抽卡成功
return { success: true, cards: cards, count: count };
```

#### 查询方法（只读）

只读取数据、不修改状态的方法返回纯数据对象或值，**不需要** `success` 字段：

```javascript
// 查询方法示例
getTotalPower(gameState) { return { power, defense }; }
getItems(gameState) { return items; }
getDodgeRate(gameState) { return 5; }
```

### 状态结构稳定性

`gameState` 的结构是存档兼容性的关键。修改前检查 `save.js` 和 `main.js` 中的 `reset()` 函数。

新增字段时：
- 在 `main.js` 的 `reset()` 中提供默认值
- 在 `SaveSystem.load()` 后考虑迁移逻辑（如果影响旧存档）

---

## 🤝 贡献流程

### 开发环境

纯前端项目，无需构建工具：

```bash
git clone https://github.com/Itou86/IDLE.git
cd IDLE
python -m http.server 8000
# 打开 http://localhost:8000
```

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 类型 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | 修复 bug |
| `docs:` | 文档更新 |
| `refactor:` | 重构 |
| `test:` | 测试相关 |
| `chore:` | 杂项 |

### 开发优先级

1. **先核心循环，后外围系统**
2. **数值先行** — 任何系统上线前必须有基础数值表
3. **视觉最低可用** — 功能优先，美术占位

### Issue 提交

开发前提交 Issue 描述计划，避免重复工作：
- **Bug 报告**：描述 → 复现步骤 → 期望行为 → 实际行为 → 环境
- **功能请求**：描述 → 使用场景 → 预期效果

### 代码审查检查清单

提交前自查：

- [ ] 遵循命名约定（`SCREAMING_SNAKE_CASE` 配置、`PascalCase` 系统、`_camelCase` 私有）
- [ ] 公共方法有 `// 公共方法：` 前缀注释
- [ ] 私有方法有 `// 内部：` 前缀注释
- [ ] 无硬编码数值（从 `*_CONFIG` 读取）
- [ ] 测试全部通过（192/192）
- [ ] 无 `console.log` 调试代码
- [ ] 文档已同步（如修改了公式或数据）

### PR 流程

1. Fork 仓库（外部贡献者）/ 创建功能分支 `feature/xxx`
2. 开发并提交（遵循提交规范）
3. 确保测试通过：`npm test`
4. 提交 PR，描述变更内容和测试情况
5. 等待审查

---

## 🧪 测试规范

### 测试先行

新增功能时：
1. 先写/更新测试用例（`tests/test-*.js`）
2. 运行测试确认失败（RED）
3. 修改代码使测试通过（GREEN）
4. 考虑重构（REFACTOR）

### 运行测试

```bash
npm test
# 或浏览器打开 tests/index.html
```

---

## 🚀 部署

### GitHub Pages 自动部署

项目已配置 `.github/workflows/deploy.yml`，push 到 `main` 分支后自动部署。

**快速部署**：
1. GitHub 创建 Public 仓库 `IDLE`
2. `git push -u origin main`
3. Settings → Pages → Source 选择 `GitHub Actions`
4. 等待 1-2 分钟，访问 `https://Itou86.github.io/IDLE/`

### 检查清单

- [ ] `index.html` 存在于仓库根目录
- [ ] CSS/JS 引用使用相对路径（`css/style.css` 而非 `/css/style.css`）
- [ ] `.github/workflows/deploy.yml` 已提交
- [ ] 仓库为 Public

### 常见问题

**Q: 部署后页面空白？**
检查控制台是否有 404：确认引用路径是相对路径（GitHub Pages 项目站点路径是 `/IDLE/`）。

**Q: 如何更新？**
```bash
git add -A && git commit -m "feat: 更新" && git push
```
自动重新部署，约 1-2 分钟生效。

**Q: 如何回滚？**
```bash
git revert <commit-hash> && git push
```

---

## 🌐 分支策略

- `main`：生产分支，自动部署到 GitHub Pages
- `feature/*`：功能分支

---

*本文档与 CLAUDE.md 互补：design.md 回答"设计规范和流程"，CLAUDE.md 回答"代码怎么写"。*
