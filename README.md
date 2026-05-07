# IDLE - 网页放置游戏

一款围绕「抽卡→竞技→获得奖励→再抽卡」循环的网页放置游戏。

## 🎮 在线游玩

👉 **[点击这里开始游戏](https://你的用户名.github.io/IDLE/)**

## 📁 项目结构

```
.
├── index.html              # 入口页面
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── main.js             # 入口逻辑、游戏循环
│   ├── config/             # 配置数据
│   │   ├── cards.js        # 卡牌定义
│   │   ├── achievements.js # 成就定义
│   │   └── stages.js       # 竞技关卡
│   ├── systems/            # 系统模块
│   │   ├── gacha.js        # 抽卡逻辑
│   │   ├── battle.js       # 竞技逻辑
│   │   ├── achievement.js  # 成就检测
│   │   └── save.js         # 存档读写
│   └── utils/
│       └── formatter.js    # 工具函数
├── AGENTS.md               # 项目设计文档
└── README.md               # 本文件
```

## 🚀 本地开发

本项目是纯前端项目，无需构建工具：

1. 克隆仓库
2. 直接用浏览器打开 `index.html`
3. 或使用任意静态服务器：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   ```

### 运行测试

```bash
cd /mnt/d/Work/IDLE/tests && node run-node.js
```

### Git 推送（WSL 环境）

WSL 内直接 `git push` 可能因网络问题失败。使用 Windows 的 Git 可解决：

```bash
# 方案：使用 Windows 的 git.exe 推送
cd /mnt/d/Work/IDLE
/mnt/d/Git/cmd/git.exe push origin main
```

或者配置 Git alias：

```bash
git config --global alias.wpush '!/mnt/d/Git/cmd/git.exe push'
# 以后使用：git wpush origin main
```

### Windows 一键推送脚本

项目根目录有 `push.bat`，在 Windows CMD 中运行：

```batch
cd D:\Work\IDLE
push.bat "提交信息"
```

## 🌐 部署到 GitHub Pages

### 方式一：GitHub 网页界面（推荐新手）

1. 在 GitHub 创建仓库，上传代码
2. 进入仓库 → **Settings** → **Pages**
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `main` / `root`，点击 **Save**
5. 等待几分钟，访问 `https://你的用户名.github.io/IDLE/`

### 方式二：GitHub Actions 自动部署

项目已配置 `.github/workflows/deploy.yml`，push 到 main 分支后自动部署。

## 💾 存档说明

- 使用浏览器 `localStorage` 本地存档
- 支持手动保存/读取
- 支持离线收益（最多计算24小时）

## 📝 开发计划

- [x] 核心循环 Demo（抽卡、竞技、奖励）
- [x] 基础卡牌系统（N/R/SR/SSR）
- [x] 成就系统（30+ 基础成就）
- [x] 离线收益
- [ ] 卡牌升级/进化系统
- [ ] 套装羁绊系统
- [ ] 隐藏成就完善
- [ ] 数值平衡调优
- [ ] 主题与世界观
- [ ] 音效与动画

## 📄 协议

MIT License
