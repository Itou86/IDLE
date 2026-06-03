# IDLE 网页放置游戏 — AI 开发脚手架

> 本文档是 AI 协作者（Hermes / Cursor / Copilot / 其他 AI）的开发指南。
> 遵循 Hermes Agent 准则：明确上下文、结构化指令、可验证的输出。
> 与 `AGENTS.md`（设计文档）互补：AGENTS.md 回答"做什么"，本文档回答"怎么做"。

---

## 📋 项目速览

| 属性 | 值 |
|------|-----|
| 项目路径 | `D:\Work\IDLE`（Windows）/ `/mnt/d/Work/IDLE`（WSL） |
| 技术栈 | 纯 HTML + CSS + JavaScript（Vanilla JS） |
| 存储 | localStorage |
| 核心循环 | 抽卡 → 竞技 → 奖励 → 再抽卡 |
| 测试 | 浏览器打开 `tests/index.html` |
| 部署 | GitHub Pages（`.github/workflows/deploy.yml`） |

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
├── AGENTS.md               # 游戏设计文档（做什么）
├── CLAUDE.md               # AI 开发脚手架（怎么做）
├── GAME_MANUAL.md          # 完整公式与数据手册
├── CHANGELOG.md            # 开发日志与版本历史
├── TODO.md                 # 当前任务与待办事项
├── README.md               # 项目说明
├── DEPLOY.md               # 部署指南
└── .github/workflows/      # CI/CD
```

**关键约定**：
- 所有配置以 `*_CONFIG` 全局常量暴露
- 所有系统以 `*System` 全局对象暴露
- 游戏状态是单一对象，各系统接收 `gameState` 参数并直接修改
- 测试框架不依赖任何外部库，纯浏览器运行

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
1. `GAME_MANUAL.md` 的"计算公式汇总"章节
2. 相关测试文件中的期望值
3. `AGENTS.md` 中涉及的设计说明

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
4. 更新 `GAME_MANUAL.md` 卡牌列表

### 添加新成就
1. 在 `js/config/achievements.js` 的 `list` 数组中添加成就对象
2. 在 `js/systems/achievement.js` 的 `_checkCondition` 中添加检测逻辑
3. 在 `tests/test-achievement.js` 中添加测试用例
4. 更新 `GAME_MANUAL.md` 成就列表

### 修改数值公式
1. 修改 `js/systems/*.js` 中的公式
2. 同步修改 `tests/test-*.js` 中的期望值
3. 更新 `GAME_MANUAL.md` 公式章节
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
- `fix:` 修复bug
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 杂项

### 分支策略
- `main`：生产分支，自动部署到 GitHub Pages
- `dev`：开发分支（可选）
- `feature/*`：功能分支

---

## 📚 参考文档

| 文档 | 用途 |
|------|------|
| `AGENTS.md` | 游戏设计文档（做什么） |
| `GAME_MANUAL.md` | 完整公式与数据手册 |
| `README.md` | 项目说明与快速开始 |
| `DEPLOY.md` | 部署指南 |
| `CONTRIBUTING.md` | 贡献指南 |
| 本文档 | AI 开发脚手架（怎么做） |

---

*本文档遵循 Hermes Agent 准则编写*
*版本: 1.1.0 | 更新: 2026-06-03*
