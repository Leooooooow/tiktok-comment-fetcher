# 🎵 TikTok 评论获取器

一个优雅、现代化的 Web 应用，用于快速获取任意 TikTok 视频的所有评论数据。

![TikTok Comment Fetcher](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ 功能特性

- 🚀 **快速获取** - 自动获取指定视频的所有评论（支持自动翻页）
- 🎨 **优雅界面** - 现代化设计，流畅动画，响应式布局
- 📊 **数据统计** - 显示总评论数、视频 ID 等关键信息
- 🔍 **搜索过滤** - 实时搜索评论内容和作者
- 📈 **智能排序** - 支持按点赞数、时间等排序
- 💾 **多格式导出** - 支持导出为 JSON、CSV 格式
- 📋 **一键复制** - 快速复制 JSON 数据到剪贴板
- 📱 **移动友好** - 完美适配手机、平板等移动设备
- ☁️ **云端部署** - 支持一键部署到 Vercel

## 🖼️ 界面预览

应用采用深色主题设计，配合渐变色和流畅动画，提供优雅的用户体验。

## 📋 系统要求

- Python 3.8 或更高版本
- 网络连接（用于调用 TikHub API）

## 🚀 快速开始

### 本地运行

#### 1. 安装依赖

```bash
pip install -r requirements.txt
```

#### 2. 启动应用

```bash
# 使用便捷脚本（推荐）
./run.sh          # macOS/Linux
run.bat           # Windows

# 或直接运行
python app.py
```

#### 3. 访问应用

打开浏览器访问：`http://localhost:5001`

### ☁️ 部署到 Vercel

#### 快速部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/tiktok-comment-fetcher)

#### 手动部署

1. Fork 或克隆本项目到你的 GitHub
2. 在 [Vercel](https://vercel.com) 上导入项目
3. 配置环境变量：
   - `TIKHUB_API_KEY`: 你的 TikHub API Key
4. 点击部署

详细部署步骤请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 📖 使用说明

### 获取评论

1. 在输入框中粘贴 TikTok 视频链接
   - 示例：`https://www.tiktok.com/@username/video/1234567890`
2. 点击"获取评论"按钮
3. 等待数据加载完成
4. 查看评论列表

### 导出数据

应用支持将评论数据导出为以下格式：

- **JSON** - 完整的评论数据，包含所有字段
- **CSV** - 表格格式，适合在 Excel 中打开
- **复制** - 将 JSON 数据复制到剪贴板

### 搜索和排序

- **搜索**：在搜索框中输入关键词，实时过滤评论
- **排序**：
  - 默认排序 - 按获取顺序
  - 按点赞数 - 点赞数从高到低
  - 按时间 - 从新到旧

## 🏗️ 项目结构

```
TK评论获取器/
├── app.py                # Flask 应用（本地开发）
├── api/
│   └── index.py         # Vercel Serverless 函数
├── templates/
│   └── index.html       # 主页面模板
├── static/
│   ├── css/
│   │   └── style.css    # 样式文件
│   └── js/
│       └── main.js      # 前端逻辑
├── requirements.txt     # Python 依赖
├── vercel.json         # Vercel 配置
├── .vercelignore       # Vercel 忽略文件
├── .gitignore          # Git 忽略文件
├── README.md           # 项目说明
├── DEPLOYMENT.md       # 部署指南
└── QUICKSTART.md       # 快速开始
```

## 🔧 技术栈

### 后端
- **Flask 3.0.0** - 轻量级 Web 框架
- **Requests 2.31.0** - HTTP 请求库
- **TikHub API** - TikTok 数据接口

### 前端
- **HTML5** - 语义化标记
- **CSS3** - 现代样式和动画
- **JavaScript (ES6+)** - 交互逻辑
- **Fetch API** - 异步数据请求

### 部署
- **Vercel** - Serverless 部署平台
- **GitHub** - 代码托管和 CI/CD

## 📡 API 接口

应用提供以下 API 端点：

### 获取评论
```
POST /api/fetch-comments
```

**请求体：**
```json
{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

**响应：**
```json
{
  "success": true,
  "video_id": "1234567890",
  "total": 95,
  "comments": [...]
}
```

### 导出数据
```
POST /api/export/{format}
```

支持的格式：`json`, `csv`

### 健康检查
```
GET /health
```

## ⚙️ 配置说明

### API Key 配置

#### 本地开发
在 `app.py` 中修改：

```python
API_KEY = "your_api_key_here"
```

#### Vercel 部署
在 Vercel 项目设置中添加环境变量：

```
TIKHUB_API_KEY=your_api_key_here
```

### 基础 URL 配置

```python
BASE_URL = "https://api.tikhub.io"  # 或 "https://api.tikhub.dev"
```

## 🎨 自定义样式

所有样式变量定义在 `static/css/style.css` 的 `:root` 部分：

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #ec4899;
    --accent-color: #14b8a6;
    /* ... 更多变量 */
}
```

修改这些变量即可自定义配色方案。

## 🐛 常见问题

### Q: 提示"无法从 URL 中提取视频 ID"

**A:** 请确保输入的是完整的 TikTok 视频链接，格式如：
- `https://www.tiktok.com/@username/video/1234567890`
- `https://vm.tiktok.com/xxxxx`

### Q: 获取评论失败

**A:** 可能的原因：
1. 网络连接问题
2. API Key 无效或过期
3. 视频不存在或已被删除
4. 视频设置为私密

### Q: 导出的 CSV 文件乱码

**A:** 使用 Excel 打开 CSV 时，请选择 UTF-8 编码导入。

### Q: Vercel 部署超时

**A:** Vercel 免费版 Serverless Functions 有 10 秒超时限制。如果评论数量过多，考虑：
1. 升级到 Pro 版本（60 秒超时）
2. 限制单次获取的评论数量

## 📝 开发说明

### 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 运行应用
python app.py
```

### 测试 API

```bash
python test_api.py
```

### 生产部署

使用 WSGI 服务器（如 Gunicorn）：

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🚢 部署选项

### Vercel（推荐）
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ GitHub 集成
- ⚠️ 10 秒超时限制（免费版）

### 其他平台
- **Heroku** - 传统 PaaS
- **Railway** - 现代化部署
- **Render** - 简单易用
- **自建服务器** - 完全控制

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目仅供学习和研究使用。

## 🙏 致谢

- [TikHub API](https://api.tikhub.io/) - 提供 TikTok 数据接口
- [Flask](https://flask.palletsprojects.com/) - 优秀的 Python Web 框架
- [Vercel](https://vercel.com/) - 强大的部署平台
- [Inter Font](https://fonts.google.com/specimen/Inter) - 现代化字体

## 📧 联系方式

如有问题或建议，请提交 Issue。

## 🔗 相关链接

- [在线演示](https://your-app.vercel.app) - 查看实际效果
- [部署指南](DEPLOYMENT.md) - 详细部署步骤
- [快速开始](QUICKSTART.md) - 5 分钟上手
- [API 文档](https://api.tikhub.io/) - TikHub API 文档

---

⭐ 如果这个项目对你有帮助，请给个 Star！

🚀 [立即部署到 Vercel](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/tiktok-comment-fetcher)
