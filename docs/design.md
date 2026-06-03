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

### 4. 世界观

- 为主题和叙事提供框架
- 所有系统（成就命名、卡牌描述、竞技场景）应融入世界观
- **当前状态**：主题尚未确定，见 [roadmap.md](roadmap.md) P0 任务

### 5. 数值设计原则

- 前期爽快感
- 中期有目标
- 长期有追求
- 卡牌效果、竞技难度、成就奖励全部受数值设计约束

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

```javascript
// 所有系统方法返回统一结构
{ success: boolean, reason?: string, ...data }

// 示例
if (gameState.tickets < this.COST.tickets) {
    return { success: false, reason: '抽卡券不足' };
}
return { success: true, card: card };
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
