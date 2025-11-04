#!/bin/bash

# TikTok 评论获取器启动脚本

echo "========================================"
echo "  TikTok 评论获取器"
echo "========================================"
echo ""
echo "正在启动应用..."
echo ""

# 检查依赖
if ! python -c "import flask" 2>/dev/null; then
    echo "正在安装依赖..."
    pip install -q -r requirements.txt
fi

# 启动应用
python app.py
