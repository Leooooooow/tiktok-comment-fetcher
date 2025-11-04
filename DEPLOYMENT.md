# 🚀 Vercel 部署指南

本指南将帮助您将 TikTok 评论获取器部署到 Vercel。

## 📋 前置要求

1. **GitHub 账号**
2. **Vercel 账号**（可使用 GitHub 登录）
3. **TikHub API Key**

## 🔧 部署步骤

### 1️⃣ 准备 GitHub 仓库

#### 方法一：使用命令行

```bash
# 进入项目目录
cd "TK评论获取器"

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: TikTok Comment Fetcher"

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/tiktok-comment-fetcher.git

# 推送到 GitHub
git push -u origin main
```

#### 方法二：使用 GitHub Desktop

1. 打开 GitHub Desktop
2. 选择 "Add Local Repository"
3. 选择项目文件夹
4. 点击 "Publish repository"

### 2️⃣ 连接 Vercel

1. 访问 [Vercel 官网](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 **"Add New Project"**
4. 从列表中选择你的 GitHub 仓库
5. 点击 **"Import"**

### 3️⃣ 配置项目

在 Vercel 项目配置页面：

#### Framework Preset
- 选择：**Other** 或 **Flask**

#### Build & Development Settings
- **Build Command**: `pip install -r requirements.txt`
- **Output Directory**: 留空
- **Install Command**: `pip install -r requirements.txt`

#### Environment Variables（环境变量）

添加以下环境变量：

| Name | Value |
|------|-------|
| `TIKHUB_API_KEY` | `你的 TikHub API Key` |
| `FLASK_ENV` | `production` |

**重要**：建议将 API Key 存储在环境变量中，而不是硬编码在代码里！

### 4️⃣ 部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常需要 1-3 分钟）
3. 部署成功后，Vercel 会提供一个访问链接

## 🌐 访问应用

部署成功后，你会得到类似以下的 URL：

```
https://your-project-name.vercel.app
```

## 🔄 自动部署

配置完成后，每次推送代码到 GitHub，Vercel 会自动重新部署应用。

```bash
git add .
git commit -m "Update features"
git push
```

## ⚙️ 环境变量配置

### 添加/修改环境变量

1. 进入 Vercel 项目控制台
2. 点击 **"Settings"** 标签
3. 选择 **"Environment Variables"**
4. 添加或修改变量
5. 重新部署应用

### 推荐的环境变量

```
TIKHUB_API_KEY=your_api_key_here
FLASK_ENV=production
```

## 📁 项目结构（Vercel 版本）

```
TK评论获取器/
├── api/
│   └── index.py          # Serverless 函数入口
├── templates/
│   └── index.html        # 前端页面
├── static/
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       └── main.js       # 前端逻辑
├── vercel.json           # Vercel 配置
├── requirements.txt      # Python 依赖
├── .vercelignore        # Vercel 忽略文件
├── .gitignore           # Git 忽略文件
└── README.md            # 项目说明
```

## 🔍 关键配置文件

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.py"
    }
  ]
}
```

### requirements.txt

```
Flask==3.0.0
requests==2.31.0
Werkzeug==3.0.1
```

## 🐛 常见问题

### Q1: 部署失败，显示 "Build Error"

**解决方法：**
- 检查 `requirements.txt` 文件是否正确
- 确保所有依赖版本兼容
- 查看 Vercel 部署日志中的详细错误信息

### Q2: 页面显示 500 错误

**解决方法：**
- 检查环境变量是否正确设置
- 查看 Vercel Functions 日志
- 确认 API Key 有效

### Q3: 静态文件（CSS/JS）无法加载

**解决方法：**
- 检查 `vercel.json` 中的路由配置
- 确保 `static` 文件夹在正确位置
- 清除浏览器缓存

### Q4: 请求超时

**解决方法：**
- Vercel Serverless Functions 有 10 秒超时限制（免费版）
- 考虑升级到 Pro 版本（60 秒超时）
- 优化代码，减少 API 调用次数

### Q5: 如何查看日志

1. 进入 Vercel 项目控制台
2. 点击 **"Deployments"**
3. 选择最新的部署
4. 点击 **"View Function Logs"**

## 🎯 性能优化建议

### 1. 启用缓存

在 `vercel.json` 中添加缓存配置：

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. 限制评论数量

在 Serverless 环境中，建议限制单次请求获取的评论数量：

```python
# api/index.py 中已经添加了限制
max_pages = 50  # 最大页数
max_comments = 1500  # 最大评论数
```

### 3. 添加速率限制

考虑添加 API 请求频率限制，防止滥用。

## 🔒 安全建议

1. **不要在代码中硬编码 API Key**
   - 始终使用环境变量

2. **启用 CORS 保护**
   ```python
   from flask_cors import CORS
   CORS(app, origins=['https://your-domain.vercel.app'])
   ```

3. **添加请求验证**
   - 验证输入参数
   - 限制请求频率
   - 记录异常访问

## 📊 监控和分析

### Vercel Analytics

1. 进入项目设置
2. 启用 **Vercel Analytics**
3. 查看访问统计、性能指标等

### 自定义监控

可以集成第三方监控服务：
- Sentry（错误追踪）
- LogRocket（用户行为分析）
- Google Analytics（访问统计）

## 🔗 有用的链接

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [TikHub API 文档](https://api.tikhub.io/)
- [Flask 文档](https://flask.palletsprojects.com/)

## 💡 高级功能

### 自定义域名

1. 进入 Vercel 项目设置
2. 点击 **"Domains"**
3. 添加你的自定义域名
4. 按照指引配置 DNS

### 多环境部署

- **Production**: `main` 分支自动部署
- **Preview**: 其他分支自动生成预览链接
- **Development**: 本地开发环境

### CI/CD 集成

Vercel 原生支持 GitHub Actions，可以添加自动化测试：

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          pip install -r requirements.txt
          python -m pytest
```

## 🎉 完成！

现在你的 TikTok 评论获取器已经成功部署到 Vercel！

**记得分享你的应用链接！** 🚀

---

如有问题，请查看 [README.md](README.md) 或提交 Issue。
