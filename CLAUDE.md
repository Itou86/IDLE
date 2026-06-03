# IDLE 网页放置游戏 — AI 开发脚手架

> 本文档是 AI 协作者（Claude / Cursor / Copilot / 其他 AI）的开发指南。
> 涵盖项目结构、开发准则、代码规范，以及游戏设计意图。
> 遵循 Hermes Agent 准则：明确上下文、结构化指令、可验证的输出。

---

## 📋 项目速览

| 属性 | 值 |
|------|-----|
| 项目路径 | `D:\Work\IDLE`（Windows）/ `/mnt/d/Work/IDLE`（WSL） |
| 技术栈 | 纯 HTML + CSS + JavaScript（Vanilla JS） |
| 存储 | localStorage |
| 核心循环 | 抽卡 → 竞技 → 奖励 → 再抽卡 |
| 测试 | 浏览器打开 `tests/index.html` / `npm test` |
| 部署 | GitHub Pages（`.github/workflows/deploy.yml`） |

---

## 🚀 快速开始（AI）

> 每次开发会话的标准流程。新接手项目的 AI 从这里开始。

### 1. 读取上下文（必读）

按顺序阅读：
1. **本文档**（CLAUDE.md）— 项目结构、代码规范、设计意图
2. **docs/roadmap.md** — 当前任务、优先级、已知问题
3. **docs/codemap.md** — 定位相关代码模块和函数

### 2. 开发流程（RED → GREEN → REFACTOR）

```
读取配置(js/config/*.js) → 读取系统(js/systems/*.js) → 读取测试(tests/test-*.js)
    ↓
写/更新测试用例 → 运行测试确认失败(RED)
    ↓
修改代码 → 运行测试确认通过(GREEN)
    ↓
考虑重构 → 运行全部测试 npm test
```

### 3. 文档同步规则

| 修改内容 | 必须同步更新 |
|---------|------------|
| 新增/删除卡牌 | `cards.js` + `test-config.js` + `docs/codemap.md` |
| 新增/删除成就 | `achievements.js` + `test-achievement.js` + `docs/codemap.md` + `docs/roadmap.md` |
| 修改数值公式 | `system.js` + `test-*.js` + `docs/design.md` + `docs/codemap.md` |
| 新增系统模块 | `newsystem.js` + `test-newsystem.js` + `index.html` + `docs/codemap.md` |
| 修改存档结构 | `save.js` + `test-save.js` + `main.js reset()` + `CLAUDE.md`（状态结构说明） |
| 修改 UI/入口 | `main.js` + 必要时更新 `css/style.css` |
| 修改设计决策 | `docs/design.md` |
| 完成任务/里程碑 | `docs/roadmap.md` |

### 4. 提交规范

```bash
# 类型: 简短描述（包含测试状态）
git commit -m "feat: 添加xxx功能

- 具体变更点1
- 具体变更点2

测试: 192/192全部通过"
```

类型：`feat` / `fix` / `docs` / `refactor` / `test` / `chore`

### 5. 自检清单（提交前必做）

```bash
# 一键验证（推荐）
bash scripts/verify.sh

# 或手动逐项检查：
npm test                          # 1. 测试全部通过
```

- [ ] **没有硬编码数值** — 使用 `*_CONFIG`，参见 `docs/errata.md` 模式1
- [ ] **index.html 引用完整** — 新增 JS 文件已引入
- [ ] **tests/index.html 引用完整** — 新增测试已引入
- [ ] **gameState 有默认值** — `main.js` 的 `reset()` 已更新
- [ ] **docs/codemap.md 已更新** — 新增模块/函数已索引
- [ ] **命名符合约定** — 配置 `SCREAMING_SNAKE_CASE`、系统 `PascalCase`、私有 `_camelCase`
- [ ] **注释风格正确** — 公共方法 `// 公共方法:`、私有 `// 内部:`
- [ ] **测试期望值同步** — 如修改公式，测试断言已更新
- [ ] **成就检测逻辑** — 如新增成就，`_checkCondition` 已添加分支
- [ ] **npm test 全部通过** — 192/192

常见错误修复参见 `docs/errata.md`。
代码生成模板参见 `docs/templates.md`。
测试映射参见 `docs/testmap.md`。

---

## 🗂️ 文件结构（AI 必须熟知）

```
IDLE/
├── index.html              # 入口：加载所有模块
├── css/style.css           # 全局样式
├── js/
│   ├── main.js             # 游戏主入口、UI渲染、事件绑定
│   ├── config/
│   │   ├── cards.js        # CARD_CONFIG：23张卡 + 4套装
│   │   ├── achievements.js # ACHIEVEMENT_CONFIG：68个成就定义
│   │   ├── stages.js       # STAGE_CONFIG：关卡生成规则
│   │   └── stats.js        # STAT_CONFIG：11种属性定义
│   ├── systems/
│   │   ├── gacha.js        # GachaSystem：抽卡、战力计算、升级
│   │   ├── battle.js       # BattleSystem：回合制战斗、胜负判定
│   │   ├── achievement.js  # AchievementSystem：成就检测与奖励
│   │   ├── idle.js         # IdleSystem：点击/自动/离线收益
│   │   ├── shop.js         # ShopSystem：商店购买
│   │   ├── stats.js        # StatSystem：角色属性计算
│   │   └── save.js         # SaveSystem：存档读写
│   └── utils/
│       └── formatter.js    # Formatter：数字/时间格式化、深拷贝
├── tests/
│   ├── index.html          # 测试套件入口
│   ├── test-framework.js   # TestRunner + Assert
│   ├── test-*.js           # 各系统测试文件（10个，192用例）
│   └── run-node.js         # Node.js 运行测试（可选）
├── docs/
│   ├── roadmap.md          # 开发计划：版本历史、任务、待办队列
│   ├── design.md           # 设计指南：规范、流程、部署
│   └── codemap.md          # 代码地图：模块职责、函数索引
├── CLAUDE.md               # 本文档（AI 开发脚手架 + 设计意图）
├── README.md               # 项目说明与快速开始
└── .github/workflows/      # CI/CD
```

**关键约定**：
- 所有配置以 `*_CONFIG` 全局常量暴露
- 所有系统以 `*System` 全局对象暴露
- 游戏状态是单一对象，各系统接收 `gameState` 参数并直接修改
- 测试框架不依赖任何外部库，纯浏览器运行

---

## 🎮 系统设计意图

> 以下内容来自原 `AGENTS.md`，帮助 AI 理解"为什么要这样设计"。

### 核心玩法循环

```
进入游戏 → 抽卡 → 竞技 → 获得奖励 → 抽卡（循环）
```

- **抽卡**：获取各类卡牌，提供数值增长和玩法变化
- **竞技**：验证当前数值强度，提供挫败感、成就感和奖励
- **奖励**：反馈到抽卡资源或角色成长上，形成正循环

### 1. 成就系统

- 目标：至少 **1000+** 个成就（当前实现 68 个，持续扩展中）
- 不能乱弹，要有节奏感
- 三类成就：
  1. **数值成就**：随进度和时间自然解锁（如累计产出 100 万金币、在线 10 小时等）
  2. **系统成就**：随各系统深度触发的特殊成就（如首次合成、抽到 SSR 等）
  3. **隐藏成就**：搞怪、诡异但不恶心，鼓励玩家探索和社群传播
- 成就本身提供 **powerBonus**（战力加成百分比），累加后提升角色属性

### 2. 抽卡系统（贵重系统）

- 卡牌/物品种类丰富，效果"乱七八糟"但有设计逻辑
- 核心维度：
  1. **统一的框架**：一致的稀有度（N/R/SR/SSR）、等级、升级规则
  2. **卡组收集奖励**：特定组合激活额外加成（套装羁绊）
  3. **卡牌间的联动**：A 卡牌增强 B 卡牌效果（如龙血剑+龙鳞甲）
  4. **卡牌自身的增长**：卡牌可升级/进化，效果随成长提升（2 合 1 升 1 级）

### 3. 竞技系统

- 验证数值增长的核心出口
- 当前形式：**回合制战斗**（先攻/暴击/闪避/HP）
- 设计目标：
  - 提供**挫败感**（让玩家感到还能更强）
  - 提供**成就感**（突破极限时的爽感）
  - 提供**奖励**（正向反馈驱动继续循环）

### 4. 世界观

- 为主题和叙事提供框架
- 所有系统（成就命名、卡牌描述、竞技场景）应融入世界观
- **当前状态：主题尚未确定**，后续由用户决策补充

### 5. 数值设计原则

- 放置游戏的核心，需保证：
  - 前期爽快感
  - 中期有目标
  - 长期有追求
- 卡牌效果、竞技难度、成就奖励全部受数值设计约束
- **配置驱动**：所有数值在 `js/config/` 中定义，不在逻辑中硬编码

---

## 🧠 AI 开发准则

### 1. 修改前必读

每次修改代码前，AI 必须：
1. 读取相关配置文件（`js/config/*.js`）
2. 读取相关系统模块（`js/systems/*.js`）
3. 读取相关测试文件（`tests/test-*.js`）
4. 确认修改不会影响其他系统（检查交叉引用）

### 2. 配置驱动原则

**所有游戏数据必须放在 `js/config/` 中，禁止在系统逻辑中硬编码数值。**

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

### 3. 公式修改必须同步文档

任何数值公式的修改，必须同步更新：
1. `docs/PLAYER_GUIDE.md` 的数值参考章节
2. 相关测试文件中的期望值
3. 本文件中涉及的设计说明

### 4. 测试先行

新增功能或修改逻辑时，AI 必须：
1. 先写/更新测试用例（`tests/test-*.js`）
2. 运行测试确认失败（RED）
3. 修改代码使测试通过（GREEN）
4. 考虑重构（REFACTOR）

运行测试：浏览器打开 `tests/index.html`

### 5. 状态结构稳定性

`gameState` 的结构是存档兼容性的关键。修改前检查 `save.js` 和 `main.js` 中的 `reset()` 函数。

新增字段时：
- 在 `main.js` 的 `reset()` 中提供默认值
- 在 `SaveSystem.load()` 后考虑迁移逻辑（如果影响旧存档）

### 6. 开发优先级

1. **先核心循环，后外围系统**
   - 第一步：搭建最简单的"抽卡→竞技→奖励"闭环 ✅
   - 第二步：填充少量卡牌和成就验证手感 ✅
   - 第三步：扩展成就数量和卡牌联动 🔄

2. **数值先行**
   - 放置游戏的乐趣在数值，任何系统上线前必须有基础数值表
   - 用配置驱动，不要硬编码

3. **视觉优先最低可用**
   - Demo 阶段优先功能可用，UI 整洁即可
   - 不必追求完美美术，可用 Emoji/纯色块占位

---

## 🔧 系统交互图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   玩家操作   │────▶│   Game.main │────▶│  各System    │
│ (点击/按钮)  │     │  (入口调度)  │     │ (业务逻辑)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                 │
    ┌────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  GachaSystem │◀───▶│ BattleSystem│◀───▶│Achievement  │
│  (抽卡/战力) │     │ (回合制战斗) │     │  (成就检测)  │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │                                    │
       ▼                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CARD_CONFIG │     │ STAGE_CONFIG│     │ACHIEVEMENT_ │
│  (卡池配置)  │     │ (关卡配置)  │     │  CONFIG     │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                    ▲
       │                                    │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  StatSystem  │     │  IdleSystem  │     │  ShopSystem  │
│ (属性计算)   │     │ (放置收益)   │     │  (商店购买)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**依赖关系**：
- `GachaSystem` 依赖 `CARD_CONFIG`、`Formatter`
- `BattleSystem` 依赖 `STAGE_CONFIG`、`StatSystem`
- `StatSystem` 依赖 `STAT_CONFIG`、`CARD_CONFIG`、`AchievementSystem`
- `AchievementSystem` 依赖 `ACHIEVEMENT_CONFIG`、`CARD_CONFIG`
- `ShopSystem` 依赖 `CARD_CONFIG`、`Formatter`
- `IdleSystem` 无外部依赖（纯数值系统）
- `SaveSystem` 无外部依赖
- `Game.main` 依赖所有系统

---

## 📝 代码规范

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
```javascript
// 所有系统方法返回统一结构
{ success: boolean, reason?: string, ...data }

// 示例
if (gameState.tickets < this.COST.tickets) {
    return { success: false, reason: '抽卡券不足' };
}
return { success: true, card: card };
```

---

## 🎯 常见任务速查

### 添加新卡牌
1. 在 `js/config/cards.js` 的 `pool` 数组中添加卡牌对象
2. 确保 `id` 唯一，格式为 `{rarity}_###`
3. 在 `tests/test-config.js` 中验证卡牌字段完整性
4. 更新 `docs/codemap.md` 中的函数/配置索引

### 添加新成就
1. 在 `js/config/achievements.js` 的 `list` 数组中添加成就对象
2. 在 `js/systems/achievement.js` 的 `_checkCondition` 中添加检测逻辑
3. 在 `tests/test-achievement.js` 中添加测试用例
4. 更新 `docs/roadmap.md` 中的里程碑进度

### 修改数值公式
1. 修改 `js/systems/*.js` 中的公式
2. 同步修改 `tests/test-*.js` 中的期望值
3. 更新 `docs/design.md` 中的设计说明
4. 运行测试验证

### 添加新系统模块
1. 创建 `js/systems/newsystem.js`
2. 在 `index.html` 中 `<script src="">` 引入
3. 在 `tests/index.html` 中引入（用于测试）
4. 创建 `tests/test-newsystem.js`
5. 在 `main.js` 中集成调用

---

## 🐛 调试技巧

### 浏览器调试
```javascript
// 在控制台直接访问游戏状态
game.state           // 当前游戏状态
GachaSystem.getTotalPower(game.state)  // 查看战力
STAGE_CONFIG.getStage(50)              // 查看第50关
AchievementSystem.checkAll(game.state) // 手动检测成就
```

### 测试调试
```javascript
// 在 tests/index.html 控制台
TestRunner.suites    // 查看所有测试套件
TestRunner.results   // 查看测试结果
```

### Node.js 运行测试（可选）
```bash
cd tests
node run-node.js
```

---

## 🔄 版本控制

### 提交规范
```
type: 简短描述

可选的详细说明
```

类型：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 杂项

### 分支策略
- `main`：生产分支，自动部署到 GitHub Pages
- `dev`：开发分支（可选）
- `feature/*`：功能分支

---

## 📝 待实现规划

以下内容来自游戏设计阶段，尚未实现：

- [ ] **游戏主题**：决定整体美术风格、世界观、叙事基调
- [ ] **核心资源/货币**：主题化的资源名称和产出方式（当前为"金币"）
- [x] **卡牌框架细节**：稀有度分级(N/R/SR/SSR)、升级规则(2合1升1级)、联动逻辑
- [x] **竞技形式**：回合制战斗（先攻/暴击/闪避/HP）
- [x] **存档机制**：localStorage 本地存档，支持导出/导入
- [x] **属性系统**：11 种角色属性，成就奖励为战力加成百分比

---

## 📚 参考文档

| 文档 | 用途 |
|------|------|
| `docs/roadmap.md` | 开发计划：版本历史、当前任务、待办队列 |
| `docs/design.md` | 设计指南：规范、流程、部署、贡献流程 |
| `docs/codemap.md` | 代码地图：模块职责、函数索引、依赖关系、影响分析 |
| `docs/testmap.md` | 测试映射：文件变更 → 必须测试清单 |
| `docs/errata.md` | 错误模式库：常见 AI 错误 + 检测 + 修复 |
| `docs/templates.md` | 代码生成模板：新系统/卡牌/成就/测试标准结构 |
| `README.md` | 项目说明与快速开始 |
| 本文档 | AI 开发脚手架（怎么做）+ 设计意图（做什么） |

---

*本文档遵循 Hermes Agent 准则编写*
*版本: 1.3.0 | 更新: 2026-06-03 | 外部文档已重构为 docs/roadmap+design+codemap*
