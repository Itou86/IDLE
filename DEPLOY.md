# GitHub Pages 部署指南

> 本地开发环境搭建参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 🚀 快速部署

### 步骤 1：创建 GitHub 仓库

1. 打开 https://github.com/new
2. **Repository name** 填 `IDLE`
3. 选择 **Public**（GitHub Pages 免费版需要公开仓库）
4. **不要**勾选 README / .gitignore / license（项目已包含）
5. 点击 **Create repository**

### 步骤 2：推送代码

```bash
cd /mnt/d/Work/IDLE
git remote add origin https://github.com/Itou86/IDLE.git
git branch -M main
git push -u origin main
```

### 步骤 3：开启 GitHub Pages

1. 进入仓库 → **Settings** → **Pages**
2. **Build and deployment** → **Source** 选择 `GitHub Actions`
3. 项目已配置 `.github/workflows/deploy.yml`，push 后自动部署

### 步骤 4：访问

等待 1-2 分钟后访问：
```
https://Itou86.github.io/IDLE/
```

---

## 📋 部署前检查清单

- [ ] `index.html` 存在于仓库根目录
- [ ] `css/style.css` 和 `js/` 路径正确（相对路径，非绝对路径）
- [ ] `.github/workflows/deploy.yml` 已提交
- [ ] 仓库是 Public

---

## 🔄 自动部署

```
git push → GitHub Actions 触发 → 验证结构 → 部署到 Pages
```

可在仓库 **Actions** 标签页查看状态。

---

## 🌐 自定义域名（可选）

1. 仓库根目录创建 `CNAME` 文件，写入域名
2. DNS 添加 CNAME 记录指向 `Itou86.github.io`
3. Settings → Pages 中配置自定义域名

---

## ❓ 常见问题

**Q: 部署后页面空白？**

检查控制台(F12)是否有 404：
- 确认引用路径是相对路径（`css/style.css` 而非 `/css/style.css`）
- GitHub Pages 项目站点路径是 `/IDLE/`，绝对路径会 404

**Q: Actions 部署失败？**

1. 进入仓库 → **Actions** 查看日志
2. 常见原因：文件路径错误、权限不足、`index.html` 缺失

**Q: 如何更新？**

```bash
git add -A
git commit -m "feat: 更新内容"
git push
```

自动重新部署，约 1-2 分钟生效。

**Q: 测试页面也能访问吗？**

可以：`https://Itou86.github.io/IDLE/tests/`

**Q: 如何回滚？**

```bash
git revert <commit-hash>
git push
```
