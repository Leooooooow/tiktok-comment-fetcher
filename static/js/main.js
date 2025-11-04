// ========================================
// 全局变量
// ========================================

let currentComments = [];
let filteredComments = [];

// ========================================
// DOM 元素
// ========================================

const elements = {
    videoUrl: document.getElementById('videoUrl'),
    fetchBtn: document.getElementById('fetchBtn'),
    clearBtn: document.getElementById('clearBtn'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    results: document.getElementById('results'),
    totalComments: document.getElementById('totalComments'),
    videoId: document.getElementById('videoId'),
    commentsList: document.getElementById('commentsList'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    copyJsonBtn: document.getElementById('copyJsonBtn'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// 工具函数
// ========================================

/**
 * 显示 Toast 通知
 */
function showToast(message, duration = 3000) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, duration);
}

/**
 * 格式化数字（添加千位分隔符）
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化时间（相对时间）
 */
function formatRelativeTime(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} 天前`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} 个月前`;
    return `${Math.floor(diff / 31536000)} 年前`;
}

/**
 * 切换视图状态
 */
function showView(viewName) {
    elements.loading.classList.add('hidden');
    elements.error.classList.add('hidden');
    elements.results.classList.add('hidden');

    if (viewName === 'loading') {
        elements.loading.classList.remove('hidden');
    } else if (viewName === 'error') {
        elements.error.classList.remove('hidden');
    } else if (viewName === 'results') {
        elements.results.classList.remove('hidden');
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    elements.errorMessage.textContent = message;
    showView('error');
}

// ========================================
// API 调用
// ========================================

/**
 * 获取评论数据
 */
async function fetchComments(url) {
    try {
        const response = await fetch('/api/fetch-comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '获取评论失败');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * 导出数据
 */
async function exportData(format) {
    try {
        const response = await fetch(`/api/export/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comments: currentComments,
                video_id: elements.videoId.textContent
            })
        });

        if (!response.ok) {
            throw new Error('导出失败');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `tiktok_comments_${elements.videoId.textContent}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        showToast(`已导出 ${format.toUpperCase()} 文件`);
    } catch (error) {
        showToast('导出失败: ' + error.message);
    }
}

// ========================================
// 渲染函数
// ========================================

/**
 * 渲染单个评论卡片
 */
function createCommentCard(comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';

    const avatar = comment.author.avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';

    card.innerHTML = `
        <div class="comment-header">
            <img src="${avatar}" alt="${comment.author.nickname}" class="comment-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%236366f1%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">
            <div class="comment-author-info">
                <div class="comment-author">${comment.author.nickname}</div>
                ${comment.author.username ? `<div class="comment-username">@${comment.author.username}</div>` : ''}
            </div>
        </div>
        <p class="comment-text">${comment.text || '(无文字内容)'}</p>
        <div class="comment-footer">
            <div class="comment-stat likes">
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>${formatNumber(comment.likes)}</span>
            </div>
            ${comment.reply_count > 0 ? `
            <div class="comment-stat replies">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 8H17M7 12H11M21 12C21 16.9706 16.9706 21 12 21C10.4633 21 9.01778 20.6146 7.75001 19.9356L3 21L4.06442 16.25C3.38544 14.9822 3 13.5367 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${formatNumber(comment.reply_count)} 回复</span>
            </div>
            ` : ''}
            <div class="comment-stat">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${formatRelativeTime(comment.create_time)}</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * 渲染评论列表
 */
function renderComments(comments) {
    elements.commentsList.innerHTML = '';

    if (comments.length === 0) {
        elements.commentsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                <svg style="width: 64px; height: 64px; margin: 0 auto 1rem;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>没有找到匹配的评论</p>
            </div>
        `;
        return;
    }

    comments.forEach((comment, index) => {
        const card = createCommentCard(comment);
        card.style.animationDelay = `${index * 0.05}s`;
        elements.commentsList.appendChild(card);
    });
}

/**
 * 显示结果
 */
function displayResults(data) {
    currentComments = data.comments;
    filteredComments = [...currentComments];

    elements.totalComments.textContent = formatNumber(data.total);
    elements.videoId.textContent = data.video_id;

    renderComments(filteredComments);
    showView('results');

    // 滚动到结果区域
    setTimeout(() => {
        elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ========================================
// 过滤和排序
// ========================================

/**
 * 过滤评论
 */
function filterComments() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();

    filteredComments = currentComments.filter(comment => {
        const text = comment.text.toLowerCase();
        const author = comment.author.nickname.toLowerCase();
        return text.includes(searchTerm) || author.includes(searchTerm);
    });

    sortComments();
}

/**
 * 排序评论
 */
function sortComments() {
    const sortBy = elements.sortSelect.value;

    if (sortBy === 'likes') {
        filteredComments.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'time') {
        filteredComments.sort((a, b) => b.create_time - a.create_time);
    }

    renderComments(filteredComments);
}

// ========================================
// 事件处理
// ========================================

/**
 * 获取评论按钮点击事件
 */
async function handleFetchComments() {
    const url = elements.videoUrl.value.trim();

    if (!url) {
        showError('请输入 TikTok 视频链接');
        return;
    }

    elements.fetchBtn.disabled = true;
    showView('loading');

    try {
        const data = await fetchComments(url);
        displayResults(data);
    } catch (error) {
        showError(error.message || '获取评论失败，请稍后重试');
    } finally {
        elements.fetchBtn.disabled = false;
    }
}

/**
 * 清除输入
 */
function handleClearInput() {
    elements.videoUrl.value = '';
    elements.videoUrl.focus();
}

/**
 * 重试按钮点击事件
 */
function handleRetry() {
    showView(null);
    elements.videoUrl.focus();
}

/**
 * 复制 JSON 到剪贴板
 */
async function handleCopyJson() {
    try {
        const json = JSON.stringify(currentComments, null, 2);
        await navigator.clipboard.writeText(json);
        showToast('已复制到剪贴板');
    } catch (error) {
        showToast('复制失败: ' + error.message);
    }
}

/**
 * 示例链接点击事件
 */
function handleExampleClick(e) {
    if (e.target.classList.contains('example-link')) {
        const url = e.target.dataset.url;
        elements.videoUrl.value = url;
        elements.videoUrl.focus();
    }
}

// ========================================
// 事件监听器
// ========================================

// 获取评论
elements.fetchBtn.addEventListener('click', handleFetchComments);

// 回车键提交
elements.videoUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleFetchComments();
    }
});

// 清除按钮
elements.clearBtn.addEventListener('click', handleClearInput);

// 重试按钮
elements.retryBtn.addEventListener('click', handleRetry);

// 导出按钮
elements.exportJsonBtn.addEventListener('click', () => exportData('json'));
elements.exportCsvBtn.addEventListener('click', () => exportData('csv'));
elements.copyJsonBtn.addEventListener('click', handleCopyJson);

// 搜索和排序
elements.searchInput.addEventListener('input', filterComments);
elements.sortSelect.addEventListener('change', sortComments);

// 示例链接
document.addEventListener('click', handleExampleClick);

// ========================================
// 页面加载完成
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('TikTok 评论获取器已加载');
    elements.videoUrl.focus();
});
