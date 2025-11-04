"""
TikTok 评论获取器 - Vercel Serverless 版本
"""

from flask import Flask, render_template, request, jsonify, send_file
import requests
import re
import json
import csv
import os
import sys
from io import StringIO, BytesIO
from datetime import datetime
from typing import Dict, Any

# 获取项目根目录
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

# 设置模板和静态文件路径
template_dir = os.path.join(base_dir, 'templates')
static_dir = os.path.join(base_dir, 'static')

app = Flask(__name__,
            template_folder=template_dir,
            static_folder=static_dir,
            static_url_path='/static')

# API 配置 - 从环境变量读取（更安全）
API_KEY = os.environ.get('TIKHUB_API_KEY', "yY08aG9D6Gt45xNfyVW/s2oZ0kAkzYzcqMxwkGb27TJErnoTdfwowAWLEA==")
BASE_URL = "https://api.tikhub.io"


def extract_video_id(url: str) -> str:
    """从 TikTok URL 中提取视频 ID"""
    patterns = [
        r'/video/(\d+)',
        r'/v/(\d+)',
        r'tiktok\.com/.*?/video/(\d+)',
        r'vm\.tiktok\.com/(\w+)',
        r'vt\.tiktok\.com/(\w+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    return None


def fetch_comments_app_v3(aweme_id: str, cursor: int = 0, count: int = 30) -> Dict[Any, Any]:
    """使用 APP V3 接口获取评论"""
    endpoint = f"{BASE_URL}/api/v1/tiktok/app/v3/fetch_video_comments"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    params = {
        "aweme_id": aweme_id,
        "cursor": cursor,
        "count": count
    }

    try:
        response = requests.get(endpoint, params=params, headers=headers, timeout=30)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "error": f"HTTP {response.status_code}",
                "message": response.text[:200]
            }
    except requests.exceptions.Timeout:
        return {"error": "请求超时，请重试"}
    except requests.exceptions.ConnectionError:
        return {"error": "网络连接失败，请检查网络"}
    except Exception as e:
        return {"error": f"请求失败: {str(e)}"}


def fetch_all_comments(aweme_id: str) -> Dict[str, Any]:
    """获取视频的所有评论（自动翻页）"""
    all_comments = []
    cursor = 0
    count = 30
    has_more = True
    max_pages = 50  # 限制最大页数，防止 serverless 超时

    while has_more and len(all_comments) < 1500:  # 限制最大评论数
        result = fetch_comments_app_v3(aweme_id, cursor=cursor, count=count)

        if "error" in result:
            return {
                "success": False,
                "error": result.get("error", "未知错误"),
                "message": result.get("message", ""),
                "total_comments": 0,
                "comments": []
            }

        data = result.get("data", {})
        comments = data.get("comments", [])

        if not comments:
            break

        all_comments.extend(comments)

        has_more = data.get("has_more", False)
        cursor = data.get("cursor", 0)

        if not has_more or cursor == 0:
            break

    return {
        "success": True,
        "aweme_id": aweme_id,
        "total_comments": len(all_comments),
        "comments": all_comments
    }


def format_comment(comment: Dict) -> Dict:
    """格式化评论数据"""
    user = comment.get("user", {})
    avatar_data = user.get("avatar_thumb", {})
    avatar_urls = avatar_data.get("url_list", [])

    return {
        "id": comment.get("cid", ""),
        "text": comment.get("text", ""),
        "author": {
            "uid": user.get("uid", ""),
            "nickname": user.get("nickname", "Unknown"),
            "username": user.get("unique_id", ""),
            "avatar": avatar_urls[0] if avatar_urls else "",
            "signature": user.get("signature", "")
        },
        "likes": comment.get("digg_count", 0),
        "create_time": comment.get("create_time", 0),
        "create_time_formatted": datetime.fromtimestamp(
            comment.get("create_time", 0)
        ).strftime("%Y-%m-%d %H:%M:%S"),
        "reply_count": comment.get("reply_comment_total", 0),
        "status": comment.get("status", 0)
    }


@app.route('/')
def index():
    """主页"""
    try:
        return render_template('index.html')
    except Exception as e:
        # 调试信息
        import traceback
        error_details = {
            "error": str(e),
            "template_folder": app.template_folder,
            "static_folder": app.static_folder,
            "base_dir": base_dir,
            "template_exists": os.path.exists(os.path.join(template_dir, 'index.html')),
            "traceback": traceback.format_exc()
        }
        return jsonify(error_details), 500


@app.route('/api/fetch-comments', methods=['POST'])
def fetch_comments_route():
    """获取评论的 API 端点"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()

        if not url:
            return jsonify({
                "success": False,
                "error": "请输入 TikTok 视频 URL"
            }), 400

        video_id = extract_video_id(url)

        if not video_id:
            return jsonify({
                "success": False,
                "error": "无法从 URL 中提取视频 ID，请检查 URL 格式"
            }), 400

        result = fetch_all_comments(video_id)

        if not result["success"]:
            return jsonify(result), 500

        formatted_comments = [format_comment(c) for c in result["comments"]]

        return jsonify({
            "success": True,
            "video_id": video_id,
            "total": result["total_comments"],
            "comments": formatted_comments
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器错误: {str(e)}"
        }), 500


@app.route('/api/export/<format>', methods=['POST'])
def export_comments(format):
    """导出评论数据"""
    try:
        data = request.get_json()
        comments = data.get('comments', [])
        video_id = data.get('video_id', 'unknown')

        if format == 'json':
            output = BytesIO()
            output.write(json.dumps(comments, ensure_ascii=False, indent=2).encode('utf-8'))
            output.seek(0)

            return send_file(
                output,
                mimetype='application/json',
                as_attachment=True,
                download_name=f'tiktok_comments_{video_id}.json'
            )

        elif format == 'csv':
            output = StringIO()
            writer = csv.writer(output)

            writer.writerow([
                'Comment ID', 'Author', 'Username', 'Comment Text',
                'Likes', 'Reply Count', 'Created Time'
            ])

            for comment in comments:
                writer.writerow([
                    comment.get('id', ''),
                    comment.get('author', {}).get('nickname', ''),
                    comment.get('author', {}).get('username', ''),
                    comment.get('text', ''),
                    comment.get('likes', 0),
                    comment.get('reply_count', 0),
                    comment.get('create_time_formatted', '')
                ])

            output.seek(0)
            output_bytes = BytesIO(output.getvalue().encode('utf-8-sig'))

            return send_file(
                output_bytes,
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'tiktok_comments_{video_id}.csv'
            )

        else:
            return jsonify({
                "success": False,
                "error": "不支持的导出格式"
            }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"导出失败: {str(e)}"
        }), 500


@app.route('/health')
def health():
    """健康检查端点"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })


# Vercel serverless handler - 这是关键！
# Vercel 会查找名为 app 的 WSGI 应用
# 不需要额外的 handler 函数
