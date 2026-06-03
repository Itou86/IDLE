# 贡献指南

感谢你对 IDLE 项目的兴趣！本文档帮助你快速参与开发。

## 📚 开始之前

1. 阅读 [CLAUDE.md](CLAUDE.md) — 了解项目结构、开发规范和系统交互
2. 阅读 [README.md](README.md) — 了解项目概览
3. 阅读 [DEPLOY.md](DEPLOY.md) — 了解部署流程（如需）

## 🚀 开发环境

纯前端项目，无需构建工具：

```bash
git clone https://github.com/Itou86/IDLE.git
cd IDLE

# 启动本地服务器
python -m http.server 8000
# 或
npx serve .

# 打开 http://localhost:8000
```

## 🧪 运行测试

```bash
# Node.js 方式
npm test

# 浏览器方式
打开 tests/index.html
```

所有提交前必须确保 **测试全部通过**（192/192）。

## 📝 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 类型 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | 修复 bug |
| `docs:` | 文档更新 |
| `refactor:` | 重构 |
| `test:` | 测试相关 |
| `chore:` | 构建/工具/杂项 |

示例：
```bash
git commit -m "feat: 添加新卡牌'虚空之刃'"
git commit -m "fix: 修复战斗日志重复显示"
git commit -m "docs: 更新玩家手册成就数量"
```

## 🔧 开发流程

### 1. 提交 Issue（推荐）

在开发前提交 Issue 描述你的计划，避免重复工作：

- **Bug 报告**：描述问题 → 复现步骤 → 期望行为 → 实际行为 → 环境信息
- **功能请求**：描述需求 → 使用场景 → 预期效果

### 2. 开发规范

**配置驱动原则** — 所有游戏数据放在 `js/config/`，禁止在系统逻辑中硬编码数值。

**公式修改同步** — 修改数值公式时，同步更新：
1. 相关代码
2. `docs/PLAYER_GUIDE.md` 的数值参考
3. 相关测试文件的期望值

**测试先行** — 新增功能时：
1. 先写/更新测试用例
2. 运行测试确认失败（RED）
3. 修改代码使测试通过（GREEN）
4. 考虑重构（REFACTOR）

**状态结构稳定性** — 修改 `gameState` 结构前：
- 检查 `main.js` 的 `reset()` 是否提供默认值
- 检查 `save.js` 是否需要迁移逻辑

### 3. 代码审查检查清单

提交 PR 前自查：

- [ ] 代码遵循项目命名约定（`SCREAMING_SNAKE_CASE` 配置、`PascalCase` 系统、`_camelCase` 私有）
- [ ] 公共方法有 `// 公共方法：` 前缀注释
- [ ] 私有方法有 `// 内部：` 前缀注释
- [ ] 无硬编码数值（从 `*_CONFIG` 读取）
- [ ] 测试全部通过
- [ ] 无 `console.log` 调试代码
- [ ] 文档已同步（如修改了公式或数据）

### 4. PR 流程

1. Fork 仓库（如果是外部贡献者）
2. 创建功能分支：`git checkout -b feature/xxx`
3. 开发并提交（遵循提交规范）
4. 确保测试通过
5. 提交 PR，描述变更内容和测试情况
6. 等待审查（维护者会在 3 天内响应）

## 🌐 部署

Push 到 `main` 分支后，GitHub Actions 自动部署到 Pages。

详见 [DEPLOY.md](DEPLOY.md)。

## 🐛 报告问题

在 [Issues](https://github.com/Itou86/IDLE/issues) 页面提交，请包含：
- 问题描述
- 复现步骤
- 浏览器版本
- 控制台错误信息（F12）
