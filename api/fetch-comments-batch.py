"""
批量获取 TikTok 评论的 Vercel Serverless 函数
"""

from flask import Flask, request, jsonify
import requests
import re
import os
import sys
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# 获取项目根目录
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

app = Flask(__name__)

# API 配置
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
    max_pages = 50

    while has_more and len(all_comments) < 1500:
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


@app.route('/', methods=['POST'])
@app.route('/api/fetch-comments-batch', methods=['POST'])
def handler():
    """批量获取评论的 API 端点"""
    try:
        data = request.get_json()
        urls = data.get('urls', [])

        if not urls:
            return jsonify({
                "success": False,
                "error": "请输入至少一个 TikTok 视频 URL"
            }), 400

        # 去重和清理
        clean_urls = list(set(url.strip() for url in urls if url.strip()))

        if len(clean_urls) == 0:
            return jsonify({
                "success": False,
                "error": "没有有效的 TikTok 视频 URL"
            }), 400

        if len(clean_urls) > 10:
            return jsonify({
                "success": False,
                "error": "最多支持同时处理 10 个视频链接"
            }), 400

        # 处理每个视频
        results = []
        total_comments = 0
        successful_videos = 0

        def process_single_video(url):
            try:
                video_id = extract_video_id(url)
                if not video_id:
                    return {
                        "url": url,
                        "success": False,
                        "error": "无法从 URL 中提取视频 ID",
                        "video_id": None,
                        "total_comments": 0,
                        "comments": []
                    }

                result = fetch_all_comments(video_id)
                if not result["success"]:
                    return {
                        "url": url,
                        "success": False,
                        "error": result.get("error", "获取评论失败"),
                        "video_id": video_id,
                        "total_comments": 0,
                        "comments": []
                    }

                formatted_comments = [format_comment(c) for c in result["comments"]]
                return {
                    "url": url,
                    "success": True,
                    "error": None,
                    "video_id": video_id,
                    "total_comments": len(formatted_comments),
                    "comments": formatted_comments
                }
            except Exception as e:
                return {
                    "url": url,
                    "success": False,
                    "error": f"处理失败: {str(e)}",
                    "video_id": None,
                    "total_comments": 0,
                    "comments": []
                }

        # 使用线程池并发处理（最多5个线程）
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_url = {executor.submit(process_single_video, url): url for url in clean_urls}

            for future in as_completed(future_to_url):
                result = future.result()
                results.append(result)

                if result["success"]:
                    successful_videos += 1
                    total_comments += result["total_comments"]

        # 保持原始URL顺序
        url_to_result = {r["url"]: r for r in results}
        ordered_results = [url_to_result[url] for url in clean_urls if url in url_to_result]

        return jsonify({
            "success": True,
            "total_videos": len(clean_urls),
            "successful_videos": successful_videos,
            "total_comments": total_comments,
            "videos": ordered_results
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"批量处理失败: {str(e)}"
        }), 500
