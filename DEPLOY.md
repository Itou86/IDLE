# GitHub Pages 部署指南

## 方式一：GitHub 网页创建（最简单）

### 步骤 1：创建仓库
1. 打开 https://github.com/new
2. **Repository name** 填 `IDLE`
3. 选择 **Public**（GitHub Pages 免费版需要公开仓库）
4. 不要勾选 README / .gitignore / license（我们已经有了）
5. 点击 **Create repository**

### 步骤 2：上传代码
创建后 GitHub 会显示推送命令，复制以下命令在终端执行：

```bash
cd /mnt/d/Work/IDLE
git remote add origin https://github.com/你的用户名/IDLE.git
git branch -M main
git push -u origin main
```

### 步骤 3：开启 GitHub Pages
1. 进入仓库页面 → 点击 **Settings**
2. 左侧菜单找到 **Pages**
3. **Build and deployment** → **Source** 选择 `GitHub Actions`
4. 因为我们已经配置了 `.github/workflows/deploy.yml`，push 后会自动部署

### 步骤 4：访问游戏
等待 1-2 分钟后，访问：
```
https://你的用户名.github.io/IDLE/
```

---

## 方式二：手动上传（不用命令行）

如果不想用 git push，可以直接在网页上传：
1. 创建空仓库后
2. 点击 **uploading an existing file**
3. 拖拽或选择 `index.html`, `css/`, `js/` 等文件
4. 点击 **Commit changes**
5. 然后到 Settings → Pages 开启

---

## 自动部署说明

项目已配置 `.github/workflows/deploy.yml`，每次 push 到 main 分支后：
- 自动构建并部署到 GitHub Pages
- 约 1-2 分钟后生效
- 可在仓库的 **Actions** 标签页查看部署状态

---

## 常见问题

**Q: 部署后页面空白？**
A: 检查浏览器控制台(F12)是否有 404 错误。可能是路径问题，GitHub Pages 项目站点路径是 `/IDLE/`，确保资源引用使用相对路径 `./`。

**Q: 如何更新游戏？**
A: 修改代码后执行：
```bash
git add -A
git commit -m "更新内容"
git push
```
GitHub Actions 会自动重新部署。

**Q: 想用自定义域名？**
A: 在仓库根目录创建 `CNAME` 文件，写入你的域名（如 `game.example.com`），然后在域名 DNS 添加 CNAME 记录指向 `你的用户名.github.io`。
