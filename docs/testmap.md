# 测试映射

> 文件变更 → 必须运行的测试清单。
> 改完代码后按此表跑测试，确保没有遗漏。

---

## 配置变更

| 修改文件 | 必须测试 | 原因 |
|----------|---------|------|
| `js/config/cards.js` | `test-config.js` + `test-gacha.js` + `test-battle.js` + `test-stats.js` + `test-integration.js` | 卡牌配置影响抽卡、战斗、属性计算、集成 |
| `js/config/achievements.js` | `test-config.js` + `test-achievement.js` | 成就定义影响配置验证和成就检测 |
| `js/config/stages.js` | `test-config.js` + `test-battle.js` | 关卡配置影响战斗 |
| `js/config/stats.js` | `test-config.js` + `test-stats.js` | 属性定义影响属性计算 |

## 系统变更

| 修改文件 | 必须测试 | 原因 |
|----------|---------|------|
| `js/systems/gacha.js` | `test-gacha.js` + `test-integration.js` | 抽卡是核心循环 |
| `js/systems/battle.js` | `test-battle.js` + `test-integration.js` | 战斗是核心循环 |
| `js/systems/achievement.js` | `test-achievement.js` + `test-integration.js` | 成就奖励影响战力，进而影响战斗 |
| `js/systems/stats.js` | `test-stats.js` + `test-battle.js` + `test-integration.js` | 属性计算影响战斗和综合战力 |
| `js/systems/idle.js` | `test-idle.js` | 放置收益独立 |
| `js/systems/shop.js` | `test-shop.js` + `test-integration.js` | 商店购买卡牌影响库存 |
| `js/systems/save.js` | `test-save.js` + `test-integration.js` | 存档影响全状态持久化 |
| `js/utils/formatter.js` | `test-formatter.js` + 所有使用 Formatter 的测试 | 工具函数广泛依赖 |

## 入口/UI 变更

| 修改文件 | 必须测试 | 原因 |
|----------|---------|------|
| `js/main.js` | `test-integration.js` + `test-save.js` | main.js 是集成点，修改可能破坏存档结构 |
| `index.html` | `test-integration.js` | script 加载顺序影响系统可用性 |
| `css/style.css` | 无需测试 | 纯样式，不影响逻辑 |

## 测试框架变更

| 修改文件 | 必须测试 | 原因 |
|----------|---------|------|
| `tests/test-framework.js` | **全部测试** | 框架变更影响所有用例 |
| `tests/run-node.js` | **全部测试** | 运行器变更影响执行 |
| `tests/index.html` | 浏览器方式跑全部测试 | 测试入口变更 |

## 快速命令

```bash
# 跑单个测试文件
node tests/run-node.js 2>&1 | grep -A5 "GachaSystem"

# 跑全部测试
npm test

# 只跑失败的测试（重新运行）
npm test  # 当前框架不支持过滤，全部重跑
```

---

*修改测试文件本身时不需要额外的测试（自验证）。*
