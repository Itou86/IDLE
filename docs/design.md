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
| 系统点加成 | `pointsBonus` | — | **系统点加成** | 原 `goldBonus` 已合并 ✅ |
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

- [x] `金币` → `系统点` ✅
- [x] `抽卡券` → `世界碎片` ✅
- [x] `金币加成` → `系统点加成` ✅
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

## 🎨 主页布局设计

> **状态**：设计文档阶段，待代码实现。  
> **背景**：当前桌面端所有 9 个面板同时显示在 2 列 grid 中，信息密度过高，新玩家容易迷失。底部 `mobile-tabs` 只在移动端生效，桌面端缺少导航。

### 当前问题

1. **信息密度过高**：桌面端 9 个 `section` 同时堆叠，视觉焦点分散
2. **缺少导航**：桌面端没有"当前我在哪个功能模块"的明确感知
3. **模块混杂**：战斗/卡片/商店/增量等核心功能挤在同一页面
4. **底部 tab 桌面端不可用**：`mobile-tabs` 通过 `@media (max-width: 768px)` 隐藏，桌面端用户只能滚动页面切换关注点

### 目标

1. 新增**顶部导航栏**，桌面端和移动端统一可见
2. 将 9 个面板组织成 **4 个功能视图**，每个视图聚焦一个核心功能
3. 视图内部合理布局，保持科幻终端风格

### 视图划分

| 导航项 | 图标 | 包含面板 | 核心功能 |
|--------|------|---------|---------|
| **抽取** | 🎲 | gacha-panel + log-panel | 抽卡操作 + 结果/历史日志 |
| **征战** | ⚔️ | battle-panel + stats-panel + achievements-panel | 战斗 + 角色属性 + 成就 |
| **收集** | 🃏 | cards-panel + collection-panel | 背包 + 图鉴 |
| **收益** | 🏠 | life-panel + shop-panel | 点击/自动收益 + 商店 |

### HTML 结构调整

```html
<header>
  <h1>INFINITE</h1>
  <div id="resources">...</div>
</header>

<!-- 新增：顶部导航栏 -->
<nav id="main-nav">
  <button data-view="gacha" class="nav-item active">
    <span class="nav-icon">🎲</span>
    <span class="nav-label">抽取</span>
  </button>
  <button data-view="battle" class="nav-item">
    <span class="nav-icon">⚔️</span>
    <span class="nav-label">征战</span>
  </button>
  <button data-view="collection" class="nav-item">
    <span class="nav-icon">🃏</span>
    <span class="nav-label">收集</span>
  </button>
  <button data-view="idle" class="nav-item">
    <span class="nav-icon">🏠</span>
    <span class="nav-label">收益</span>
  </button>
</nav>

<main>
  <!-- 抽取视图 -->
  <div id="view-gacha" class="view view-active">
    <section id="gacha-panel">...</section>
    <section id="log-panel">...</section>
  </div>

  <!-- 征战视图 -->
  <div id="view-battle" class="view">
    <section id="battle-panel">...</section>
    <section id="stats-panel">...</section>
    <section id="achievements-panel">...</section>
  </div>

  <!-- 收集视图 -->
  <div id="view-collection" class="view">
    <section id="cards-panel">...</section>
    <section id="collection-panel">...</section>
  </div>

  <!-- 收益视图 -->
  <div id="view-idle" class="view">
    <section id="life-panel">...</section>
    <section id="shop-panel">...</section>
  </div>
</main>
```

**关键变更**：
- 新增 `<nav id="main-nav">` 顶部导航栏
- `main` 内用 `<div class="view">` 包裹相关 `section`
- 移除底部 `<nav class="mobile-tabs">`

### CSS 设计

```css
/* ===== 顶部导航栏 ===== */
#main-nav {
    display: flex;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-lg);
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-lg);
    position: sticky;
    top: var(--space-sm);
    z-index: 40;
}

.nav-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius);
    color: var(--text-dim);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-family: var(--font-mono);
}

.nav-item:hover {
    color: var(--text);
    background: var(--bg-card);
    border-color: var(--border);
}

.nav-item.active {
    color: var(--accent);
    background: var(--accent-dim);
    border-color: var(--accent);
    box-shadow: var(--accent-glow);
}

/* ===== 视图容器 ===== */
.view {
    display: none;
    gap: var(--space-lg);
}

.view.view-active {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

/* 抽取视图：单列全宽 */
#view-gacha {
    grid-template-columns: 1fr;
}

/* 征战视图：战斗 + 属性并列，成就全宽在下方 */
#view-battle {
    grid-template-columns: 1fr 1fr;
}
#view-battle #achievements-panel {
    grid-column: 1 / -1;
}

/* 收集视图：背包 + 图鉴（图鉴全宽在下方） */
#view-collection {
    grid-template-columns: 1fr 2fr;
}
#view-collection #collection-panel {
    grid-column: 1 / -1;
}

/* 收益视图：收益 + 商店并列 */
#view-idle {
    grid-template-columns: 1fr 1fr;
}

/* 移动端适配 */
@media (max-width: 768px) {
    #main-nav {
        padding: var(--space-xs) var(--space-sm);
        gap: var(--space-xs);
    }

    .nav-item {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--text-xs);
    }

    .nav-icon {
        font-size: 1.1rem;
    }

    .view.view-active {
        grid-template-columns: 1fr;
    }

    /* 移除旧的 mobile-tabs 样式 */
    .mobile-tabs {
        display: none !important;
    }
}
```

### JS 调整

```javascript
// main.js — 替换 TAB_PANELS 和 switchTab

// 旧：面板级映射
// TAB_PANELS: { gacha: ['gacha-panel'], battle: ['battle-panel'], ... }

// 新：视图级映射
VIEW_MAP: {
    gacha: 'view-gacha',
    battle: 'view-battle',
    collection: 'view-collection',
    idle: 'view-idle'
},

// 替换 switchTab 为 switchView
switchView: function(viewName) {
    // 更新导航按钮
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // 切换视图显示
    document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('view-active', view.id === `view-${viewName}`);
    });

    // 保存当前视图（下次加载恢复）
    this.state.currentView = viewName;
},

// 初始化时恢复上次视图
init: function() {
    // ... 原有初始化逻辑 ...
    const savedView = this.state.currentView || 'gacha';
    this.switchView(savedView);
}
```

### 底部 mobile-tabs 处理

**方案：统一用顶部导航，移除底部 mobile-tabs**

理由：
- 桌面端和移动端体验统一，一套代码维护
- 顶部导航在移动端也易于点击（只有 4 个项，不拥挤）
- 减少维护两套导航的复杂度
- `position: sticky` 在移动端也生效，滚动时导航始终可见

### 与 main.js 拆分的配合

此布局重设计与批次5（main.js 拆分）**可独立实施**：
- 布局重设计主要改 HTML/CSS/少量 JS，不影响业务逻辑
- main.js 拆分是代码组织重构，不改功能

**建议顺序**：先实施布局重设计（改动面较小），再实施 main.js 拆分（此时 `renderer.js` 可按视图组织渲染方法，如 `renderGachaView()` / `renderBattleView()` 等）。

### 遗漏补充

**补充1：`gameState.currentView` 默认值**
- 新增字段 `currentView`，需要在 `main.js reset()` 中提供默认值 `'gacha'`
- `SaveSystem.load()` 读取旧存档时该字段为 `undefined`，`init()` 中通过 `|| 'gacha'` 兜底

**补充2：`_startAutoTick` 局部更新在新视图下的调用**
```javascript
// 自动收益 tick 中只更新当前视图相关的 DOM，避免全量 render
const pointsEl = document.getElementById('gold');
if (pointsEl) pointsEl.textContent = Formatter.number(this.state.points);

// 成就检测若有新解锁，只更新成就列表（无论当前在哪个视图）
if (newAchievements.length > 0) {
    UIRenderer.renderAchievements(this.state);  // 调用 renderer 的局部方法
}
```

**补充3：视图切换与滚动位置**
- 当前无需保存滚动位置（每个视图内容不多，且 sticky 导航始终可见）
- 若未来视图内容增加，可在 `switchView()` 中通过 `view.scrollTop = 0` 重置滚动

### 实施检查清单

1. [ ] 更新 `index.html` — 包裹 view div + 新增 nav + 移除 mobile-tabs
2. [ ] 更新 `css/style.css` — 导航样式 + 视图布局 + 清理 mobile-tabs 样式
3. [ ] 更新 `js/main.js` — `switchView()` + `VIEW_MAP` + `init()` + `reset()` 添加 `currentView`
4. [ ] 更新 `tests/index.html` — 同步 DOM 结构（如有测试依赖）
5. [ ] 检查测试用例 — DOM 选择器是否需要更新
6. [ ] 运行测试确认通过（192/192）
7. [ ] 更新 `docs/codemap.md` — DOM 结构索引
8. [ ] 更新 `docs/roadmap.md` — 标记新任务

---

## 🃏 卡牌联动与世界卡组设计

> **状态**：设计文档阶段，待代码实现。  
> **背景**：当前 23 张卡牌是扁平池，仅有 4 组套装羁绊和 1 对硬编码联动。用户目标是 **1000+ 世界**，每个世界有独立卡组，卡牌之间形成多层次的收集与联动。

### 核心概念

```
世界 (World) ──→ 卡组 (Deck) ──→ 卡牌 (Card)
   │                  │                │
   │                  │                ├── 属性（固定数值，随等级提升）
   │                  │                └── 效果（特殊机制，高稀有度才有）
   │                  │
   │                  ├── 世界内小组合（如 9 张巨人之力）
   │                  └── 世界全收集（该世界所有卡）
   │
   └── 跨世界联动（预留，后续按卡牌设计扩展）
```

### 卡牌属性与效果的分离

| 维度 | 属性 (Stats) | 效果 (Effects) |
|------|-------------|---------------|
| **来源** | 所有卡牌都有 | 高稀有度卡牌才有 |
| **数值特征** | 固定值（如攻击力 +5） | 百分比（如货币获取 +0.1%） |
| **成长方式** | 随卡牌等级线性提升 | 固定值，不随等级变化 |
| **叠加方式** | 同类属性累加 | 同类效果累加（乘法或加法） |
| **感知度** | 单卡明显（+5 攻击看得见） | 单卡几乎无感（+0.1% 看不见） |
| **累积效应** | 100 张 N 卡 = +500 攻击 | 100 张效果卡 = +10% 货币 |

**设计意图**：效果数值极小（0.1% 量级），让玩家不会感觉"抽到某张卡 = 质变"，但长期累积后形成显著差异。这是放置游戏的核心爽感——**量变引起质变**。

### 稀有度与等级上限

| 稀有度 | 等级上限 | 效果数量 | 定位 |
|--------|---------|---------|------|
| **N** | 10 级 | 0~1 个极弱效果 | 填充卡、升级素材 |
| **R** | 8 级 | 0~1 个弱效果 | 过渡卡 |
| **SR** | 6 级 | 1 个标准效果 | 核心功能卡 |
| **SSR** | 5 级 | 1~2 个强力效果 | 稀有驱动卡 |

**升级消耗**：不同稀有度升级所需的**同卡数量相同**（如每级都需要 2 张同卡合成）。这样低稀有度卡虽然上限高，但因为容易获得，实际不会比高稀有度卡更难升满。

### 升级公式

```javascript
// 升级：N 张同卡 → 1 张等级+1 的卡
// 消耗卡数 = mergeCost（所有稀有度相同）
// 当前等级属性值 = baseValue * (1 + (level - 1) * 0.1) * count

const LEVEL_GROWTH_RATE = 0.1;  // 每级 +10%

function getCardStat(config, level, count) {
    const levelMultiplier = 1 + (level - 1) * LEVEL_GROWTH_RATE;
    return config.basePower * levelMultiplier * count;
}
```

### 效果类型框架

> **原则**：先定 6 大类别，具体数值和效果条目后续迭代填充。  
> ⚠️ **注意**：战斗相关 trigger（`on_damage_calc` / `on_kill` / `on_battle_start`）可能随战斗模块重构调整，见 §`战斗模块重构`。

| 类别 | 触发时机 (trigger) | 上下文 (context) | 示例 |
|------|-------------------|-----------------|------|
| **货币类** | `idle_tick` | `{ pointsPerSec }` | 系统点产出 +0.1% |
| **战斗类** | `on_damage_calc` | `{ damage, isBoss }` | 对BOSS伤害 +0.1% |
| **属性类** | `stat_calc` | `{ stats }` | 全属性 +0.1% |
| **抽卡类** | `on_gacha_end` | `{ cards, count }` | SSR概率 +0.01% |
| **商店类** | `shop_refresh` | `{ refreshCost }` | 商店刷新费用 -0.1% |
| **掉落类** | `on_kill` | `{ droppedCard }` | 战斗掉落概率 +0.1% |

**效果数值范围**：
- N 卡效果：0.05% ~ 0.1%
- R 卡效果：0.1% ~ 0.2%
- SR 卡效果：0.2% ~ 0.5%
- SSR 卡效果：0.5% ~ 1.0%

### 现有 23 张卡的世界归属

当前 `pool` 中的 23 张卡**暂时全部归属世界 1**（作为占位）。批次B实施时：
- 给每张卡添加 `worldId: 1`
- `CARD_CONFIG.worlds[0].cardIds` 更新为这 23 张卡的 ID 列表
- 不修改卡牌名称和描述（已无限流化过）

### 效果叠加方式

**同类效果采用加法叠加**：
```javascript
// 两张 +0.1% 货币 = +0.2%
// 而非乘法：1.001 * 1.001 = 1.002001（差异极小但计算复杂）

totalEffect = effect1 + effect2 + ... + effectN;
```

理由：放置游戏中大量微小百分比效果，加法叠加直观易懂，玩家可以心算预期收益。

### 升级消耗具体数值

```javascript
const MERGE_COST = 2;  // 每升1级需要 2 张同卡合成

// 示例：将 N卡"立体机动装置"从 Lv.1 → Lv.10
// 需要 2^9 = 512 张同名卡（考虑合成链）
// 实际实现：玩家选择"升级"时，消耗 N 张同卡，等级+1
```

### 世界卡组结构

每个世界包含 **8~12 张卡牌**，分为两个收集层次：

#### 层次1：世界内小组合（Partial Set）

世界内部的部分卡牌形成组合，凑齐后获得额外效果。

**示例：进击的巨人世界（10张卡）**

```
立体机动装置 (N)     ─┐
调查兵团披风 (N)     ─┤
雷枪 (R)             ─┼── 调查兵团套装（3张）→ 闪避 +2%
锋利钢刀 (R)         ─┘

女巨人之力 (SR)      ─┐
铠之巨人 (SR)        ─┤
超大巨人 (SR)        ─┼── 九大巨人之力（9张）→ 战斗后恢复 +10%
兽之巨人 (SR)        ─┤
车力巨人 (SR)        ─┤
战锤巨人 (SR)        ─┤
进击的巨人 (SSR)     ─┤
始祖巨人 (SSR)       ─┘
```

#### 层次2：世界全收集（World Completion）

凑齐该世界**所有卡牌**后，激活世界终极效果。

| 世界完成度 | 效果 |
|-----------|------|
| 收集该世界 50% 卡牌 | 该世界卡牌属性 +5% |
| 收集该世界 100% 卡牌 | 该世界卡牌效果 +10%，且解锁跨世界联动槽位 |

#### 层次3：跨世界联动（Cross-World）— 预留

不同世界的卡牌之间允许联动，但需要**通关两个世界**后才激活。

**示例（预留，后续按卡牌设计填充）**：

```
进击的巨人·立体机动装置 + 某魔法世界·飞行扫帚 → 闪避 +3%
火影·写轮眼 + Fate·魔眼 → 暴击率 +2%
```

**解锁条件**：只有同时通关两个世界后，跨世界联动才生效。这是后期（50+ 世界）的深度内容。

### 卡池解锁：渐进式（方案A）

```
世界1（默认解锁）→ 通关世界1 → 解锁世界2卡池
                            → 通关世界2 → 解锁世界3卡池
                                          → ...
```

- **抽卡**：只能抽出已解锁世界的卡牌
- **战斗掉落**：当前世界 + 已解锁世界的低概率混合掉落
- **商店**：已解锁世界的卡牌可出现在商店中

**叙事包装**：轮回者每通关一个世界，系统开放该世界的"次元抽取权限"。

### 卡牌配置格式

```javascript
// js/config/cards.js — 卡牌定义新格式
{
    id: 'w1_n_001',              // 卡牌ID（世界编码可选，见下方ID设计）
    name: '立体机动装置',
    rarity: 'N',                  // N/R/SR/SSR
    worldId: 1,                   // 新增：所属世界
    basePower: 5,                 // 基础属性值
    effect: 'power',              // 基础属性类型（power/defense/heal/speed 等）
    effects: [                    // 特殊效果数组（高稀有度才有）
        // N卡通常无 effects，或只有极弱的 0.05% 级效果
    ],
    maxLevel: 10,                 // 等级上限（由稀有度决定，可覆盖）
    desc: '攻击力 +5',
    tags: ['aot', 'gear', 'survey-corps'],  // 标签，用于主题共鸣/跨世界联动
    
    // 以下字段可选
    setId: 'survey-corps',        // 所属套装ID
    synergyWith: ['w1_n_002'],    // 联动卡牌ID列表
}
```

### 世界配置格式

```javascript
// js/config/cards.js — 世界定义
{
    id: 1,
    name: '进击的巨人',
    description: '自由之翼的世界，巨人与人类的终极对抗',
    cardIds: ['w1_n_001', 'w1_n_002', ..., 'w1_ssr_002'],  // 该世界全部卡牌
    sets: [
        {
            id: 'survey-corps',
            name: '调查兵团套装',
            cardIds: ['w1_n_001', 'w1_n_002', 'w1_r_001'],
            bonus: { dodgeRate: 2 }  // 闪避 +2%
        },
        {
            id: 'nine-titans',
            name: '九大巨人之力',
            cardIds: ['w1_sr_001', 'w1_sr_002', ..., 'w1_ssr_002'],
            bonus: { hpRegen: 10 }   // 战斗后恢复 +10%
        }
    ],
    completionBonus: {              // 世界全收集奖励
        cardStatMultiplier: 1.10,   // 该世界卡牌属性 +10%
        unlockCrossWorldSlot: true  // 解锁跨世界联动槽位
    }
}
```

### 卡牌ID设计

> 用户明确："卡牌id是代码层的东西，你觉得哪个好就用哪个，不要怕破坏现有代码"

**选择：简洁ID + `worldId` 字段**

```javascript
// 格式：{worldId}_{rarity}_{seq}
// 示例：
'1_n_001'     // 世界1的N卡第1张
'1_ssr_002'   // 世界1的SSR卡第2张
'12_r_005'    // 世界12的R卡第5张
```

**理由**：
- 保留现有 `n_001` / `r_001` 的编码直觉
- 前缀 `worldId_` 支持 1000+ 世界（`999_n_001`）
- 不嵌套世界信息到数据结构，保持扁平查询效率
- `worldId` 字段独立存在，便于筛选和索引

### 与现有系统的兼容

| 现有系统 | 影响 | 处理方式 |
|---------|------|---------|
| `CARD_CONFIG.pool` | 增加 `worldId`/`effects`/`maxLevel`/`tags` 字段 | 向后兼容：旧字段保留，新字段可选 |
| `CARD_CONFIG.sets` | 重构为按世界分组 | 提供迁移函数，旧格式自动转换 |
| `GachaSystem.draw` | 抽卡池从"全池"改为"已解锁世界池" | 修改 `getCurrentPool()` 逻辑 |
| `AchievementSystem` | 套装成就条件需适配新结构 | `set_active` 等条件从检测全局 sets 改为检测当前世界的 sets + 跨世界累计 |
| `EffectRegistry` | 新增效果类型 | 在 `_executeEffect` 中补充 |
| `StatSystem` | 需读取 `effects` 中的属性类效果 | 在 `stat_calc` trigger 中处理 |
| `SaveSystem` | 卡牌数据结构不变 | 无需迁移 |

### 实施路径

建议分 **3 个批次**，每批有独立测试保护：

| 批次 | 内容 | 涉及文件 | 风险 |
|------|------|---------|------|
| **A** | EffectRegistry 真正落地：给现有 23 张卡补上 `effects` 字段，将 `stats.js` 中的硬编码效果迁移到 EffectRegistry | `cards.js`, `effect-registry.js`, `stats.js` | 中：需要验证所有效果等效迁移 |
| **B** | 世界卡组结构改造：`worldId` 字段 + 世界配置重构 + 卡池渐进解锁 | `cards.js`, `gacha.js`, `stages.js` | 中：改变抽卡池逻辑 |
| **C** | 新增世界卡牌 + 联动效果填充：新增 2~3 个世界（20~30 张卡），实现世界内组合和世界全收集效果 | `cards.js`, `effect-registry.js`, `stat.js` | 低：主要是配置和数据 |

### 设计决策记录

| 问题 | 决策 | 理由 |
|------|------|------|
| 世界数量 | 首期 10~12 个世界，长期目标 1000+ | 支持扩展，ID 格式兼容 |
| 效果数值 | 极小（0.05%~1%） | 单卡无感，累积显著，避免断层感 |
| 跨世界联动 | 允许，但需通关后解锁 | 后期深度内容，前期不分散注意力 |
| 升级消耗 | 所有稀有度相同 | 低稀有度卡容易获得，抵消上限差异 |
| ID 格式 | `worldId_rarity_seq` | 简洁、可扩展、兼容现有代码 |

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

#### 2. main.js 拆分（批次5）

> **状态**：设计文档阶段，待代码实现。
> **背景**：当前 `main.js` 约 800 行，混合了 5 层职责（状态管理、业务调度、DOM 渲染、UI 组件、定时器），任何 UI 调整都要改主入口文件。

##### 问题分析

当前 `main.js` 的职责矩阵：

| 区域 | 行数 | 职责 | 问题 |
|------|------|------|------|
| 状态管理 | ~70 | `state`, `init`, `reset`, `save`, `load` | 合理，留在 main.js |
| 核心操作 | ~100 | `gacha`, `battle`, `click`, `buyXxx`, `shop` | 合理，留在 main.js 作为调度层 |
| 主渲染器 | ~110 | `render()` 统筹 + 各面板状态更新 | **应提取到 renderer.js** |
| 子渲染方法 | ~350 | `_renderShop`, `_renderAchievements`, `_renderStats`, `_renderCollection` | **应提取到 renderer.js** |
| UI 组件/效果 | ~170 | Toast、日志、浮动数字、标签页、定时器 | **应提取到 components.js** |

##### 拆分方案

```
js/
├── main.js              # 游戏入口 + 状态 + 核心操作调度（~250行）
└── ui/
    ├── renderer.js      # 所有 DOM 渲染逻辑（~380行）
    └── components.js    # UI 组件与效果（~200行）
```

**为什么只拆成 3 个文件，不把 mobile.js 也独立？**

移动端标签逻辑仅 30 行（`TAB_PANELS` + `_initMobileTabs` + `switchTab`），独立成文件的维护成本大于收益。归入 `components.js` 更合适。

##### `js/ui/renderer.js` — 渲染层

职责：所有 `innerHTML` / `textContent` / DOM 操作集中于此。

```javascript
/* ===== UI 渲染器 ===== */
const UIRenderer = {
    // 主渲染入口：统筹所有面板
    render: function(gameState) {
        this._renderResources(gameState);
        this._renderStageInfo(gameState);
        this._renderButtons(gameState);
        this._renderCardList(gameState);
        this.renderCollection(gameState);
        this.renderStats(gameState);
        this.renderAchievements(gameState);
        this._renderIdleInfo(gameState);
        this.renderShop(gameState);
    },

    // 各面板渲染（公共方法，供局部更新调用）
    renderShop: function(gameState) { /* ... */ },
    renderAchievements: function(gameState) { /* ... */ },
    renderStats: function(gameState) { /* ... */ },
    renderCollection: function(gameState) { /* ... */ },

    // 内部：资源显示
    _renderResources: function(gameState) { /* ... */ },

    // 内部：关卡信息
    _renderStageInfo: function(gameState) { /* ... */ },

    // 内部：按钮状态（抽卡/升级/商店等）
    _renderButtons: function(gameState) { /* ... */ },

    // 内部：卡牌背包列表
    _renderCardList: function(gameState) { /* ... */ },

    // 内部：放置收益信息
    _renderIdleInfo: function(gameState) { /* ... */ },
};
```

**设计要点**：
- 纯函数风格，接收 `gameState` 参数，不隐式依赖 `Game` 全局对象
- 所有 `document.getElementById` / `innerHTML` 操作集中在这里
- 便于单独测试渲染输出（输入 gameState → 验证 DOM）
- 局部更新场景（如自动收益 tick）可直接调用 `UIRenderer.renderXxx()`，无需全量 `render()`

##### `js/ui/components.js` — UI 组件层

职责：与 `gameState` 无关的纯 DOM 组件和视觉效果。

```javascript
/* ===== UI 组件 ===== */
const UIComponents = {
    // ===== Toast 通知 =====
    showToast: function(message, type = 'info') { /* ... */ },
    createToastContainer: function() { /* ... */ },

    // ===== 日志系统 =====
    log: function(message, type = 'info') { /* ... */ },

    // ===== 视觉效果 =====
    showClickFloat: function(amount, targetElement) { /* ... */ },

    // ===== 移动端标签页 =====
    switchTab: function(tabName) { /* ... */ },
    initMobileTabs: function() { /* ... */ },
    TAB_PANELS: { /* ... */ },

    // ===== 计时器显示 =====
    renderShopTimer: function(remainingMs) { /* ... */ },
};
```

**设计要点**：
- 不接收 `gameState`，纯 DOM 操作
- `showClickFloat` 接收可选的 `targetElement` 参数，替代原来内部读取 `getElementById`
- 日志和 Toast 是全局组件，任何系统/操作都可调用

##### `js/main.js` — 精简后

职责：状态管理 + 业务调度 + 定时器管理。

```javascript
/* ===== 游戏主入口 ===== */
const Game = {
    state: null,

    // ===== 生命周期 =====
    init: function() { /* 初始化 → 调用 UIRenderer + UIComponents */ },
    reset: function() { /* ... */ },
    save: function() { /* ... */ },
    load: function() { /* ... */ },

    // ===== 核心操作（调度层，thin controller）=====
    gacha: function(count) {
        const result = GachaSystem.draw(this.state, count);
        if (!result.success) {
            UIComponents.showToast(result.reason, 'error');
            return;
        }
        // 业务逻辑（构建结果 DOM）...
        this._checkAchievements();
        UIRenderer.render(this.state);
    },

    battle: function() { /* ... */ },
    click: function() { /* ... */ },
    buyClickUpgrade: function() { /* ... */ },
    buyAutoUpgrade: function() { /* ... */ },
    refreshShop: function() { /* ... */ },
    buyShopItem: function(itemId) { /* ... */ },
    nextWorld: function() { /* ... */ },

    // ===== 内部：成就检查（业务+UI桥接）=====
    _checkAchievements: function() {
        const unlocked = AchievementSystem.checkAll(this.state);
        for (const ach of unlocked) {
            UIComponents.showToast(`🏆 成就解锁：${ach.name}...`, 'achievement');
            UIComponents.log(`🏆 成就解锁: ${ach.name}...`, 'achievement');
        }
    },

    // ===== 内部：定时器管理 =====
    _startAutoTick: function() { /* 调用 UIRenderer.renderAchievements() 做局部更新 */ },
    _startShopTimer: function() { /* 调用 UIComponents.renderShopTimer() */ },
    _calcOfflineEarnings: function() { /* ... */ },
};
```

**设计要点**：
- `_startAutoTick` 保留在 main.js，因为"局部更新 vs 全量渲染"是调度决策，不是渲染逻辑
- 自动收益 tick 中只调用 `UIRenderer.renderAchievements()` + `UIRenderer._renderResources()`，不触发 `UIRenderer.render()` 全量刷新（避免图鉴面板跳动）
- `_handleBattleResult` 拆分为两部分：业务逻辑（记录 underdogWin）留在 main.js，UI 渲染移到 `UIRenderer.renderBattleResult()`

##### 加载顺序

```html
<!-- index.html -->
<script src="js/utils/formatter.js"></script>
<script src="js/utils/game-utils.js"></script>
<!-- config -->
<script src="js/config/cards.js"></script>
<script src="js/config/achievements.js"></script>
<script src="js/config/stages.js"></script>
<script src="js/config/stats.js"></script>
<!-- systems -->
<script src="js/systems/effect-registry.js"></script>
<script src="js/systems/gacha.js"></script>
<script src="js/systems/battle.js"></script>
<script src="js/systems/achievement.js"></script>
<script src="js/systems/idle.js"></script>
<script src="js/systems/shop.js"></script>
<script src="js/systems/stats.js"></script>
<script src="js/systems/save.js"></script>
<!-- ui（新增）-->
<script src="js/ui/components.js"></script>    <!-- 不依赖 gameState，先加载 -->
<script src="js/ui/renderer.js"></script>      <!-- 依赖 Game.state，后加载 -->
<!-- main -->
<script src="js/main.js"></script>
```

##### 依赖关系

```
UIRenderer → 读取 gameState, CARD_CONFIG, STAT_CONFIG, Formatter, GachaSystem, AchievementSystem, IdleSystem, ShopSystem, StatSystem
UIComponents → 无外部依赖（纯 DOM）
Game.main → UIRenderer, UIComponents, 所有系统
```

##### 关键设计决策

| 问题 | 决策 | 理由 |
|------|------|------|
| 渲染方法是否接收 `gameState` 参数？ | ✅ 是 | 纯函数，便于测试，不隐式依赖全局 |
| `showToast` 是否接收 `gameState`？ | ❌ 否 | 纯 DOM 组件，与业务无关 |
| `_handleBattleResult` 怎么拆？ | 拆成两部分 | 业务逻辑（记录 underdogWin）留在 main.js，UI 渲染移到 `UIRenderer.renderBattleResult()` |
| `_startAutoTick` 的局部更新放哪？ | 保留在 main.js | 它是"调度决策"（局部 vs 全量），不是渲染逻辑 |
| `mobile.js` 是否独立？ | ❌ 否，归入 components.js | 仅 30 行，独立文件维护成本 > 收益 |
| `gacha()` 中的结果 DOM 构建（十连/单抽的 innerHTML）放哪？ | **方案A：留在 main.js** | 抽卡结果涉及 SSR 特殊提示、隐藏成就记录（gachaSingleSSR）等业务逻辑，留在调度层更合适。renderer 只负责"显示已有数据"，不处理"因数据产生的分支逻辑" |
| `_handleBattleResult` 的 UI 渲染对应哪个 renderer 方法？ | `UIRenderer.renderBattleResult(gameState, result)` | 统一命名规范，battle/click/shop 等操作的结果渲染都走 renderer |
| `UIComponents.showClickFloat` 的参数变化？ | `showClickFloat(amount, targetElement?)` | 原代码内部 `getElementById('click-btn')`，改为接收可选的 `targetElement` 参数，没有时退化为原行为 |
| 测试文件是否需要拆分？ | **否，保持现有测试结构** | `test-integration.js` 已覆盖 UI 交互，新增 `test-ui-renderer.js` 和 `test-ui-components.js` 可作为可选补充，非必须 |
| `renderer.js` 的完整依赖列表？ | `gameState, CARD_CONFIG, STAT_CONFIG, Formatter, GachaSystem, AchievementSystem, IdleSystem, ShopSystem, StatSystem` | 所有从配置/系统读取数据的依赖，纯 DOM 操作不依赖任何系统 |

##### 迁移检查清单

实施批次5时按以下顺序执行：

1. [ ] 创建 `js/ui/` 目录
2. [ ] 新建 `js/ui/components.js` — 迁移 Toast / 日志 / 浮动数字 / 标签页
3. [ ] 新建 `js/ui/renderer.js` — 迁移 `render` + 4 个子渲染方法
4. [ ] 精简 `js/main.js` — 删除已迁移代码，改为调用 `UIRenderer` / `UIComponents`
5. [ ] 更新 `index.html` — 添加 `js/ui/components.js` 和 `js/ui/renderer.js` 的 `<script>` 标签
6. [ ] 更新 `tests/index.html` — 同上
7. [ ] 运行测试确认全部通过（192/192）
8. [ ] 更新 `docs/codemap.md` — 新增模块/函数索引
9. [ ] 更新本文档 — 标记批次5为已完成

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

## ⚔️ 战斗模块重构

> **状态**：设计文档阶段，方向待决策。  
> **背景**：当前回合制战斗包含先攻判定、暴击、闪避、BOSS 大招等机制，用户反馈"最讨厌乱七八糟的闪避"。需要重新设计一个**简洁但有策略感**的战斗系统。

### 当前战斗系统的问题

```
当前机制清单：
├── 回合制（最多100回合防死循环）
├── 先攻判定（speed 比较，每回合交换）
├── 伤害计算（攻击 - 防御×0.5，至少1）
├── 暴击判定（概率触发，伤害加成50%）
├── 闪避判定（速度差 + 卡牌加成，最高50%）← 用户明确讨厌
├── BOSS 第3回合大招（无视部分防御）
├── 战斗掉落卡牌
└── 硬编码卡牌效果（现实宝石+20%对BOSS等）
```

**核心问题**：
1. **闪避机制**——概率性完全免伤，破坏数值预期，玩家体验"明明战力高却打不中"
2. **机制过多**——先攻/暴击/闪避/大招，新手难以形成直觉
3. **硬编码效果**——`r_004` 现实宝石对 BOSS +20% 等效果散落在 `battle.js` 中

### 重构目标

1. **去掉闪避**——用户明确需求
2. **降低随机性**——放置游戏的核心爽感是"数值增长的可预期性"，随机性应控制在"锦上添花"级别
3. **保留战斗反馈**——不能退化为"战力高=赢"的纯数值比拼，需要有"过程感"
4. **EffectRegistry 兼容**——所有战斗相关卡牌效果通过 EffectRegistry 触发，不再硬编码

### 候选方案

#### 方案 A：纯数值比拼（最简）

```
玩家战力 vs 敌人战力
战力高 = 赢，战力低 = 输
没有任何随机性，无回合制
```

**优点**：
- 最简单，代码最少
- 数值预期100%准确，玩家能精确计算能否打过

**缺点**：
- 没有"战斗过程"，点击按钮直接出结果，缺乏反馈
- 无法体现角色属性差异（speed/crit/hp 等失去意义）
- 放置游戏中战斗是核心出口，过于简陋会导致"抽了卡但战斗没感觉"

**结论**：❌ 不推荐。太简陋，丢失战斗系统的存在意义。

---

#### 方案 B：简化回合制（推荐）

保留回合制框架，但大幅精简机制：

```
1. 双方各有 HP
2. 每回合：攻击方造成伤害 = 攻击 - 防御（至少1）
3. 先攻由 speed 一次性判定（不交换）
4. 暴击保留但简化：固定概率（如5%），伤害×1.5
5. ❌ 去掉闪避
6. BOSS 保留特殊机制但简化：每3回合一次额外攻击（非大招）
7. 100回合上限不变
```

**战斗流程**：
```
判定先攻（比较 speed）→ 先手攻击 → 后手攻击 → 循环直到一方HP归零
```

**优点**：
- 保留"过程感"和"角色属性有意义"
- 去掉最烦人的闪避，其他机制足够简单
- 暴击概率低（5%），不影响整体预期
- BOSS 机制提供差异化体验

**缺点**：
- 相比纯数值仍然复杂一些
- 需要保留 `speed` 属性

**结论**：✅ **倾向推荐**。平衡了简洁度和反馈感。

---

#### 方案 C：一击制（折中）

```
1. 双方各攻击 N 次（N=1~3，由 speed 决定）
2. 每次攻击：伤害 = 攻击 - 防御（至少1）
3. 比较"谁先打死对方"
4. 无闪避，暴击可保留（低概率）
```

**示例**：
```
玩家：HP=500, 攻击=100, 防御=30, speed=10
敌人：HP=300, 攻击=80, 防御=20, speed=8

先攻：玩家（speed 10 > 8）
玩家攻击：100 - 20 = 80 伤害 → 敌人 HP=220
敌人攻击：80 - 30 = 50 伤害 → 玩家 HP=450
玩家攻击：80 伤害 → 敌人 HP=140
敌人攻击：50 伤害 → 玩家 HP=400
玩家攻击：80 伤害 → 敌人 HP=60
敌人攻击：50 伤害 → 玩家 HP=350
玩家攻击：80 伤害 → 敌人 HP=-20 → 玩家胜利（4轮）
```

**优点**：
- 战斗过程短（通常 3~8 次攻击结束）
- 保留了"先攻有价值"的策略感
- 没有闪避的烦躁

**缺点**：
- 和方案B本质相似，只是限制了回合数
- 如果 N=1 就变成"对砍一刀看谁血多"

**结论**：⚖️ 可作为方案B的变体，若方案B实现后觉得回合太多，再调整为固定回合制。

---

#### 方案 D：时间轴制（创新）

```
1. 战斗是一条时间轴（如 30 秒）
2. 玩家和敌人按 speed 决定攻击频率（speed 高 = 攻击间隔短）
3. 每次攻击：伤害 = 攻击 - 防御（至少1）
4. 时间内先打死对方 = 胜利，时间结束双方都没死 = 超时失败
5. 无闪避，暴击低概率触发
```

**示例**：
```
玩家 speed=10 → 每 3 秒攻击一次
敌人 speed=5  → 每 6 秒攻击一次

时间轴：
t=0s  玩家攻击
t=3s  玩家攻击
t=6s  玩家攻击 + 敌人攻击
t=9s  玩家攻击
t=12s 玩家攻击 + 敌人攻击 → 敌人HP归零 → 胜利
```

**优点**：
- `speed` 的意义被放大（不是一次性判定，而是持续收益）
- 战斗过程感强，但计算规则极简
- 适合后期扩展"技能冷却"等机制

**缺点**：
- 需要前端动画支持（时间轴可视化）
- 和现有代码差异较大，重构成本高

**结论**：⚖️ 长期方向很好，但实施成本高。可作为 P3 长期目标。

---

### 方案对比

| 维度 | 方案A 纯数值 | 方案B 简化回合 | 方案C 一击制 | 方案D 时间轴 |
|------|------------|--------------|------------|------------|
| 代码复杂度 | ⭐ 最低 | ⭐⭐ 中 | ⭐⭐ 中 | ⭐⭐⭐ 高 |
| 战斗反馈感 | ❌ 无 | ✅ 有 | ✅ 有 | ✅✅ 强 |
| 属性利用率 | ❌ 只有战力 | ✅ 攻/防/速/暴 | ✅ 攻/防/速 | ✅✅ 攻/防/速 |
| 随机性控制 | ✅ 无 | ✅ 低（仅暴击） | ✅ 低 | ✅ 低 |
| 重构工作量 | 1天 | 2~3天 | 2天 | 5~7天 |
| 扩展空间 | ❌ 无 | ⭐⭐ 中 | ⭐⭐ 中 | ⭐⭐⭐ 高 |

---

### 推荐决策

**首选：方案B（简化回合制）**

理由：
1. 去掉闪避，解决用户最烦的问题
2. 保留回合制框架，现有代码可复用 70%+
3. 角色属性（攻/防/速/暴）全部有意义
4. EffectRegistry 兼容性好（`on_damage_calc` / `on_kill` trigger 保留）
5. 2~3 天可完成，不阻塞其他并行任务

**长期（P3）：方案D（时间轴制）**

当战斗系统需要更多深度时（如技能、Buff、Debuff），时间轴制是更好的扩展基础。

---

### 方案B的具体设计

#### 伤害公式

```javascript
// 基础伤害 = 攻击者攻击力 - 防御者防御力（至少为1）
let damage = Math.max(1, attacker.power - defender.defense);

// 暴击（低概率，固定倍率）
if (Math.random() < attacker.critRate / 100) {
    damage = Math.floor(damage * attacker.critDamage);
}

// EffectRegistry 触发（替代硬编码）
const context = { damage, isPlayer, isBoss: stage.isBoss };
EffectRegistry.trigger('on_damage_calc', gameState, context);
damage = context.damage;
```

#### 先攻规则

```javascript
// 一次性判定：speed 高者先攻，speed 相同则玩家先攻
const playerFirst = stats.speed >= enemy.speed;

// 每回合不交换先攻（简化）
// 攻击顺序：先攻方 → 后攻方 → 循环
```

#### BOSS 机制简化

```javascript
// 原：第3回合大招（无视部分防御的巨额伤害）
// 新：每3回合一次额外攻击（正常伤害计算，不无视防御）
// 这样既保留 BOSS 压迫感，又不破坏数值预期

if (stage.isBoss && round % 3 === 0) {
    // BOSS 额外攻击一次（同正常伤害公式）
}
```

#### 战斗日志简化

```javascript
// 原日志包含：crit / miss / special 等复杂标记
// 新日志只保留：
// { round, actor: 'player'|'enemy', damage, remainingHP }
// 暴击用视觉标记（如伤害数字变红），不在数据结构层面复杂化
```

---

### 硬编码效果迁移

当前 `battle.js` 中的硬编码效果，全部迁移到 EffectRegistry：

| 当前硬编码 | 卡牌 | 迁移后 effect.type | trigger |
|-----------|------|-------------------|---------|
| 对BOSS+20%伤害 | r_004 现实宝石 | `boss_damage_bonus` | `on_damage_calc` |
| 击败20%概率再抽 | sr_005 黑暗印记 | `kill_extra_drop` | `on_kill` |
| 每10关额外碎片 | sr_003 大千录残页 | `stage_ticket_bonus` | `on_kill` |

迁移后 `battle.js` 只负责**战斗流程**，所有卡牌效果通过 `EffectRegistry.trigger()` 注入。

---

### 与卡牌联动设计的配合

战斗重构和卡牌联动设计**有交叉依赖**：

- 卡牌联动的效果类型框架中定义了 `on_damage_calc` / `on_kill` trigger
- 战斗重构后这些 trigger 仍然保留（只是战斗流程变了，触发点不变）
- **建议顺序**：先战斗重构（确定 trigger 接口稳定），再卡牌联动的 EffectRegistry 落地

---

### 实施检查清单

1. [ ] 确认方案（B 推荐，待用户决策）
2. [ ] 更新 `js/systems/battle.js` — 重写 fight() / _calcDamage() / _calcEnemyStats()
3. [ ] 移除 `StatSystem.getDodgeRate()` 及相关逻辑
4. [ ] 迁移硬编码效果到 EffectRegistry（r_004 / sr_005 / sr_003）
5. [ ] 更新 `js/config/stats.js` — 移除 dodgeRate 属性（或标记为弃用）
6. [ ] 更新 `js/config/cards.js` — 给相关卡添加 effects 字段
7. [ ] 更新 `js/main.js` — `_handleBattleResult` 适配新的 result 结构
8. [ ] 更新 `tests/test-battle.js` — 重写战斗测试用例
9. [ ] 更新 `tests/test-stats.js` — 移除 dodgeRate 相关测试
10. [ ] 运行测试确认通过
11. [ ] 更新 `docs/codemap.md`

---

*本文档与 CLAUDE.md 互补：design.md 回答"设计规范和流程"，CLAUDE.md 回答"代码怎么写"。*
