# 🚀 GitHub + Vercel 部署完整指南

## ✅ 已完成

- ✅ Git 仓库已初始化
- ✅ 所有文件已提交
- ✅ 准备就绪，可以推送到 GitHub

## 📝 接下来的步骤

### 方法 1：使用 GitHub CLI（最快）

如果您安装了 GitHub CLI：

```bash
# 1. 创建 GitHub 仓库（公开）
gh repo create tiktok-comment-fetcher --public --source=. --remote=origin

# 2. 推送代码
git push -u origin main

# 3. 在浏览器中打开仓库
gh repo view --web
```

### 方法 2：使用 GitHub 网页（推荐）

#### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `tiktok-comment-fetcher`
   - **Description**: `🎵 优雅的 TikTok 评论获取器 - 现代化 Web 应用`
   - **Public** 或 **Private**（选择公开或私有）
   - ⚠️ **不要**勾选 "Add a README file"
   - ⚠️ **不要**勾选 "Add .gitignore"
   - ⚠️ **不要**选择 "Choose a license"
3. 点击 **"Create repository"**

#### 步骤 2：推送代码到 GitHub

创建仓库后，GitHub 会显示推送指令。复制并执行以下命令：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/tiktok-comment-fetcher.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**示例：**
```bash
# 如果你的 GitHub 用户名是 leroyyang
git remote add origin https://github.com/leroyyang/tiktok-comment-fetcher.git
git branch -M main
git push -u origin main
```

#### 步骤 3：部署到 Vercel

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 **"Add New Project"** 或 **"Import Project"**
   - 选择 **"Import Git Repository"**
   - 找到并选择 `tiktok-comment-fetcher` 仓库
   - 点击 **"Import"**

3. **配置项目**

   **Framework Preset**: 选择 **"Other"**

   **Environment Variables**（环境变量）- 点击 "Add" 添加：

   | Name | Value |
   |------|-------|
   | `TIKHUB_API_KEY` | `yY08aG9D6Gt45xNfyVW/s2oZ0kAkzYzcqMxwkGb27TJErnoTdfwowAWLEA==` |

   **Build Settings**（保持默认即可）:
   - Build Command: (留空)
   - Output Directory: (留空)
   - Install Command: `pip install -r requirements.txt`

4. **部署**
   - 点击 **"Deploy"**
   - 等待 1-3 分钟
   - 部署完成！🎉

5. **访问应用**
   - Vercel 会提供一个 URL，例如：
     ```
     https://tiktok-comment-fetcher.vercel.app
     ```
   - 点击链接即可访问你的应用

### 方法 3：使用 GitHub Desktop（图形界面）

#### 步骤 1：在 GitHub Desktop 中发布

1. 打开 **GitHub Desktop**
2. 点击 **"File"** → **"Add Local Repository"**
3. 选择项目文件夹：`/Users/leroyyang/Desktop/Company/Projects/TK评论获取器`
4. 点击 **"Publish repository"**
5. 填写信息：
   - Name: `tiktok-comment-fetcher`
   - Description: `🎵 优雅的 TikTok 评论获取器`
   - 选择 Public 或 Private
6. 点击 **"Publish Repository"**

#### 步骤 2：部署到 Vercel
按照方法 2 的步骤 3 操作即可。

## 🔒 安全提示

### 保护 API Key

虽然当前 API Key 在代码中作为默认值，但建议：

1. **在 Vercel 中使用环境变量**
   - 这样可以避免 API Key 暴露在代码中

2. **如果仓库是公开的**
   - 考虑从 `api/index.py` 中移除默认 API Key
   - 仅通过环境变量提供

修改 `api/index.py` 第 18 行：
```python
# 修改前
API_KEY = os.environ.get('TIKHUB_API_KEY', "yY08aG9D6Gt45xNfyVW/s2oZ0kAkzYzcqMxwkGb27TJErnoTdfwowAWLEA==")

# 修改后（更安全）
API_KEY = os.environ.get('TIKHUB_API_KEY')
if not API_KEY:
    raise ValueError("TIKHUB_API_KEY environment variable is required")
```

## 🔄 自动部署

配置完成后，每次推送代码到 GitHub，Vercel 会自动重新部署：

```bash
# 修改代码后
git add .
git commit -m "Update: 添加新功能"
git push

# Vercel 会自动检测并重新部署
```

## 📊 部署后的操作

### 查看部署状态
```bash
# 使用 Vercel CLI
vercel list

# 查看最新部署
vercel inspect
```

### 查看日志
1. 访问 Vercel 项目控制台
2. 点击 **"Deployments"**
3. 选择最新的部署
4. 点击 **"View Function Logs"**

### 自定义域名
1. 在 Vercel 项目设置中
2. 点击 **"Domains"**
3. 添加你的域名
4. 按照指引配置 DNS

## 🎯 完整命令参考

假设你的 GitHub 用户名是 `YOUR_USERNAME`：

```bash
# 进入项目目录
cd "/Users/leroyyang/Desktop/Company/Projects/TK评论获取器"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/tiktok-comment-fetcher.git

# 推送到 GitHub
git branch -M main
git push -u origin main

# 后续更新
git add .
git commit -m "Update: 描述你的修改"
git push
```

## 🔍 验证部署

部署完成后，测试以下功能：

- ✅ 访问主页
- ✅ 输入 TikTok 视频链接
- ✅ 获取评论
- ✅ 搜索功能
- ✅ 排序功能
- ✅ 导出 JSON
- ✅ 导出 CSV
- ✅ 复制 JSON

## 🐛 常见问题

### Q: 推送时要求输入密码

**A:** GitHub 不再支持密码认证，需要使用以下方式之一：

1. **Personal Access Token**
   - 访问 https://github.com/settings/tokens
   - 生成新 token
   - 推送时使用 token 代替密码

2. **SSH Key**（推荐）
   ```bash
   # 生成 SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"

   # 添加到 ssh-agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519

   # 复制公钥
   cat ~/.ssh/id_ed25519.pub

   # 添加到 GitHub: Settings → SSH and GPG keys
   ```

   然后修改远程地址：
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/tiktok-comment-fetcher.git
   ```

### Q: Vercel 部署失败

**A:** 检查以下几点：
1. 环境变量 `TIKHUB_API_KEY` 是否正确设置
2. `vercel.json` 配置是否正确
3. `requirements.txt` 依赖是否完整
4. 查看 Vercel 部署日志获取详细错误

### Q: 如何更新 GitHub 上的代码

```bash
# 修改代码后
git add .
git commit -m "描述你的修改"
git push
```

## 📚 相关文档

- [GitHub 文档](https://docs.github.com)
- [Vercel 文档](https://vercel.com/docs)
- [Git 教程](https://git-scm.com/book/zh/v2)

## 🎉 完成！

现在你的应用已经：
- ✅ 推送到 GitHub
- ✅ 部署到 Vercel
- ✅ 自动 HTTPS 和全球 CDN
- ✅ 支持自动部署

**分享你的应用链接：**
```
https://tiktok-comment-fetcher.vercel.app
```

---

需要帮助？查看 [DEPLOYMENT.md](DEPLOYMENT.md) 或提交 Issue。
