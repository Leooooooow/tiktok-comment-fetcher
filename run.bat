@echo off
chcp 65001 >nul
cls

echo ========================================
echo   TikTok 评论获取器
echo ========================================
echo.
echo 正在启动应用...
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 安装依赖
pip install -q -r requirements.txt

REM 启动应用
python app.py

pause
