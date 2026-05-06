# GitHub Pages 部署指南

## 🚀 快速开始

### 步骤 1：创建 GitHub 仓库
1. 打开 https://github.com/new
2. **Repository name** 填 `IDLE`
3. 选择 **Public**（GitHub Pages 免费版需要公开仓库）
4. **不要**勾选 README / .gitignore / license（我们已经有了）
5. 点击 **Create repository**

### 步骤 2：推送代码
创建后 GitHub 会显示推送命令，在终端执行：

```bash
cd /mnt/d/Work/IDLE
git remote add origin https://github.com/Itou86/IDLE.git
git branch -M main
git push -u origin main
```

### 步骤 3：开启 GitHub Pages
1. 进入仓库页面 → 点击 **Settings**
2. 左侧菜单找到 **Pages**
3. **Build and deployment** → **Source** 选择 `GitHub Actions`
4. 因为我们已配置 `.github/workflows/deploy.yml`，push 后会自动部署

### 步骤 4：访问游戏
等待 1-2 分钟后，访问：
```
https://Itou86.github.io/IDLE/
```

---

## 📋 部署前检查清单

推送前请确认：

- [ ] `index.html` 存在于仓库根目录
- [ ] `css/style.css` 路径正确
- [ ] `js/` 下所有脚本引用路径正确
- [ ] `.github/workflows/deploy.yml` 已提交
- [ ] 仓库是 Public（Private 仓库 Pages 有功能限制）

---

## 🔄 自动部署流程

```
git push → GitHub Actions 触发 → 构建验证 → 部署到 Pages
```

每次 push 到 `main` 分支后：
1. Actions 自动运行部署工作流
2. 验证文件结构完整性
3. 上传构建产物
4. 部署到 GitHub Pages

可在仓库的 **Actions** 标签页查看部署状态。

---

## 🛠️ 本地预览

推送前建议本地预览：

```bash
cd /mnt/d/Work/IDLE

# 方式1：Python
python -m http.server 8000

# 方式2：Node.js
npx serve .

# 方式3：PHP
php -S localhost:8000

# 然后打开 http://localhost:8000
```

---

## 📁 项目结构要求

GitHub Pages 部署的是仓库根目录内容，确保结构如下：

```
.
├── index.html          ← 必须存在，作为入口
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── config/
│   ├── systems/
│   └── utils/
├── tests/              ← 可选，测试页面
├── .github/
│   └── workflows/
│       └── deploy.yml  ← 自动部署配置
├── README.md
└── LICENSE
```

---

## 🌐 自定义域名（可选）

1. 在仓库根目录创建 `CNAME` 文件
2. 写入你的域名，如 `game.example.com`
3. 在域名 DNS 添加 CNAME 记录指向 `Itou86.github.io`
4. 在 Settings → Pages 中配置自定义域名

---

## ❓ 常见问题

**Q: 部署后页面空白？**

检查浏览器控制台(F12)是否有 404 错误：
- 确认 `index.html` 引用的 CSS/JS 路径是相对路径（如 `css/style.css` 而非 `/css/style.css`）
- GitHub Pages 项目站点路径是 `/IDLE/`，绝对路径 `/css/style.css` 会 404

**Q: Actions 部署失败？**

1. 进入仓库 → **Actions** 标签页
2. 查看失败的工作流日志
3. 常见原因：
   - 文件路径错误
   - 权限不足（检查仓库 Settings → Actions → General）
   - `index.html` 不存在

**Q: 如何更新游戏？**

```bash
git add -A
git commit -m "feat: 更新内容"
git push
```

GitHub Actions 会自动重新部署，约 1-2 分钟后生效。

**Q: 测试页面也能访问吗？**

可以，测试页面会一起部署：
```
https://Itou86.github.io/IDLE/tests/
```

**Q: 如何回滚？**

```bash
# 查看历史
git log --oneline

# 回滚到某个版本
git revert <commit-hash>
git push
```

---

## 📝 部署状态检查命令

```bash
# 检查远程仓库
git remote -v

# 检查分支
git branch -a

# 查看提交历史
git log --oneline -5

# 检查是否有未推送的更改
git status
```

---

## 🎉 部署成功标志

1. 仓库 **Actions** 页面显示绿色 ✓
2. **Settings** → **Pages** 显示绿色勾
3. 访问 `https://Itou86.github.io/IDLE/` 能看到游戏界面
4. 访问 `https://Itou86.github.io/IDLE/tests/` 能看到测试套件

---

## 📞 获取帮助

- [GitHub Pages 官方文档](https://docs.github.com/zh/pages)
- [GitHub Actions 官方文档](https://docs.github.com/zh/actions)
- 在仓库 [Issues](https://github.com/Itou86/IDLE/issues) 提问
