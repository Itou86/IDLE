# 贡献指南

## 🚀 开发环境

本项目是纯前端项目，无需构建工具：

```bash
# 克隆仓库
git clone https://github.com/你的用户名/IDLE.git
cd IDLE

# 启动本地服务器
python -m http.server 8000
# 或
npx serve .

# 打开浏览器访问
open http://localhost:8000
```

## 📁 项目结构

```
.
├── index.html          # 游戏入口
├── css/style.css       # 全局样式
├── js/
│   ├── main.js         # 游戏主循环
│   ├── config/         # 配置文件
│   │   ├── cards.js        # 卡牌定义
│   │   ├── achievements.js # 成就定义
│   │   └── stages.js       # 关卡配置
│   ├── systems/        # 游戏系统
│   │   ├── gacha.js        # 抽卡
│   │   ├── battle.js       # 竞技
│   │   ├── achievement.js  # 成就
│   │   └── save.js         # 存档
│   └── utils/
│       └── formatter.js    # 工具函数
├── tests/              # 测试套件
│   ├── index.html          # 测试入口
│   ├── test-framework.js   # 测试框架
│   └── test-*.js           # 各模块测试
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 自动部署
```

## 🧪 运行测试

```bash
# 方式1：浏览器打开
open tests/index.html

# 方式2：通过本地服务器
python -m http.server 8000
# 访问 http://localhost:8000/tests/
```

## 📝 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `test:` 测试相关
- `refactor:` 重构
- `style:` 代码格式
- `chore:` 构建/工具

## 🌐 部署

Push 到 `main` 分支后，GitHub Actions 自动部署到 Pages。

访问 `https://你的用户名.github.io/IDLE/` 查看效果。

## 🐛 报告问题

在 [Issues](https://github.com/你的用户名/IDLE/issues) 页面提交，请包含：
- 问题描述
- 复现步骤
- 浏览器版本
- 控制台错误信息（F12）
