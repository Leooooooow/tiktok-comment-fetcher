// ========================================
// 全局变量
// ========================================

let currentVideos = [];
let processedVideos = [];

// ========================================
// DOM 元素
// ========================================

const elements = {
    videoUrls: document.getElementById('videoUrls'),
    urlCount: document.getElementById('urlCount'),
    fetchBtn: document.getElementById('fetchBtn'),
    clearBtn: document.getElementById('clearBtn'),
    loading: document.getElementById('loading'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    results: document.getElementById('results'),
    totalVideos: document.getElementById('totalVideos'),
    totalComments: document.getElementById('totalComments'),
    successRate: document.getElementById('successRate'),
    tableContainer: document.getElementById('tableContainer'),
    videosTable: document.getElementById('videosTable'),
    exportExcelBtn: document.getElementById('exportExcelBtn'),
    clearResultsBtn: document.getElementById('clearResultsBtn'),
    toggleScrollBtn: document.getElementById('toggleScrollBtn'),
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

/**
 * 验证 TikTok URL
 */
function isValidTikTokUrl(url) {
    const patterns = [
        /tiktok\.com\/.*\/video\/\d+/,
        /vm\.tiktok\.com\/\w+/,
        /vt\.tiktok\.com\/\w+/
    ];

    return patterns.some(pattern => pattern.test(url));
}

/**
 * 解析和清理输入的URL
 */
function parseUrls(text) {
    const lines = text.split('\n');
    const urls = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && isValidTikTokUrl(trimmed)) {
            urls.push(trimmed);
        }
    }

    // 去重
    return [...new Set(urls)];
}

/**
 * 更新URL计数
 */
function updateUrlCount() {
    const urls = parseUrls(elements.videoUrls.value);
    const count = urls.length;
    elements.urlCount.textContent = `已输入 ${count}/10 个视频链接`;
    elements.urlCount.className = count > 10 ? 'url-count error' : 'url-count';

    // 更新按钮状态
    elements.fetchBtn.disabled = count === 0 || count > 10;
}

// ========================================
// API 调用
// ========================================

/**
 * 批量获取评论数据
 */
async function fetchBatchComments(urls) {
    try {
        const response = await fetch('/api/fetch-comments-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ urls })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '批量获取评论失败');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * 导出Excel文件
 */
async function exportExcel() {
    try {
        const response = await fetch('/api/export/excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                videos: processedVideos
            })
        });

        if (!response.ok) {
            throw new Error('导出Excel失败');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `tiktok_comments_batch_${new Date().toISOString().slice(0, 19).replace(/[:\s]/g, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        showToast('Excel文件已导出');
    } catch (error) {
        showToast('导出Excel失败: ' + error.message);
    }
}

// ========================================
// 渲染函数
// ========================================

/**
 * 创建评论单元格
 */
function createCommentsCell(comments) {
    const container = document.createElement('div');
    container.className = 'comments-list';

    if (!comments || comments.length === 0) {
        container.innerHTML = '<div class="no-comments">暂无评论</div>';
        return container;
    }

    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';

        const avatar = comment.author?.avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';

        commentEl.innerHTML = `
            <div class="comment-header">
                <img src="${avatar}" alt="${comment.author?.nickname || 'Unknown'}" class="comment-avatar"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%236366f1%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">
                <div class="comment-author">${comment.author?.nickname || '未知用户'}</div>
            </div>
            <div class="comment-content">${comment.text || '(无文字内容)'}</div>
            <div class="comment-footer">
                <span class="comment-likes">👍 ${formatNumber(comment.likes || 0)}</span>
                ${comment.reply_count > 0 ? `<span class="comment-replies">💬 ${formatNumber(comment.reply_count)}</span>` : ''}
            </div>
        `;

        container.appendChild(commentEl);
    });

    return container;
}

/**
 * 创建操作按钮单元格
 */
function createActionsCell(videoIndex, video) {
    const container = document.createElement('div');
    container.className = 'actions-cell';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-excel';
    exportBtn.innerHTML = `
        <span class="btn-icon">📊</span>
        <span class="btn-text">Excel</span>
    `;
    exportBtn.title = '导出此视频Excel';
    exportBtn.onclick = () => exportSingleVideo(video);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.innerHTML = `
        <span class="btn-icon">📋</span>
        <span class="btn-text">复制</span>
    `;
    copyBtn.title = '复制评论';
    copyBtn.onclick = () => copyVideoComments(video);

    container.appendChild(exportBtn);
    container.appendChild(copyBtn);

    return container;
}

/**
 * 渲染表格
 */
function renderTable(videos) {
    const thead = elements.videosTable.querySelector('thead tr');
    const tbody = elements.videosTable.querySelector('tbody');

    // 清空现有内容
    thead.innerHTML = '<th>视频信息</th>';
    tbody.innerHTML = '';

    // 成功的视频
    const successfulVideos = videos.filter(v => v.success);

    if (successfulVideos.length === 0) {
        elements.tableContainer.innerHTML = '<div class="no-data">没有成功获取的视频数据</div>';
        return;
    }

    // 创建表头
    successfulVideos.forEach((video, index) => {
        const th = document.createElement('th');
        th.innerHTML = `
            <div class="video-header">
                <span class="video-icon">📹</span>
                <span class="video-title">视频 ${index + 1}</span>
            </div>
        `;
        thead.appendChild(th);
    });

    // 创建表格行
    const rows = [
        { class: 'video-title-row', label: '标题' },
        { class: 'url-row', label: 'URL' },
        { class: 'video-id-row', label: '视频ID' },
        { class: 'comment-count-row', label: '评论总数' },
        { class: 'comments-row', label: '评论列表' }
    ];

    rows.forEach((rowConfig, rowIndex) => {
        const tr = document.createElement('tr');
        tr.className = rowConfig.class;

        // 标签列
        const labelTd = document.createElement('td');
        labelTd.textContent = rowConfig.label;
        tr.appendChild(labelTd);

        // 数据列
        successfulVideos.forEach((video, videoIndex) => {
            const td = document.createElement('td');

            switch (rowConfig.class) {
                case 'video-title-row':
                    td.innerHTML = `<div class="video-number">视频 ${videoIndex + 1}</div>`;
                    break;
                case 'url-row':
                    td.innerHTML = `<div class="url-text" title="${video.url}">${video.url}</div>`;
                    break;
                case 'video-id-row':
                    td.innerHTML = `<div class="video-id">${video.video_id || 'N/A'}</div>`;
                    break;
                case 'comment-count-row':
                    td.innerHTML = `<div class="comment-count"><span class="count-number">${formatNumber(video.total_comments)}</span><span class="count-unit">条</span></div>`;
                    break;
                case 'comments-row':
                    td.appendChild(createCommentsCell(video.comments));
                    break;
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

/**
 * 显示结果
 */
function displayResults(data) {
    currentVideos = data.videos || [];
    processedVideos = currentVideos.filter(v => v.success);

    // 更新统计信息
    elements.totalVideos.textContent = data.total_videos || 0;
    elements.totalComments.textContent = formatNumber(data.total_comments || 0);
    const successRate = data.total_videos > 0 ? Math.round((data.successful_videos / data.total_videos) * 100) : 0;
    elements.successRate.textContent = `${successRate}%`;

    // 渲染表格
    renderTable(currentVideos);

    showView('results');

    // 滚动到结果区域
    setTimeout(() => {
        elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ========================================
// 导出和复制功能
// ========================================

/**
 * 导出单个视频的Excel
 */
async function exportSingleVideo(video) {
    // 这里可以实现单个视频的Excel导出
    showToast('单个视频导出功能开发中...');
}

/**
 * 复制视频评论
 */
async function copyVideoComments(video) {
    if (!video.comments || video.comments.length === 0) {
        showToast('没有可复制的评论');
        return;
    }

    const text = video.comments.map(comment => {
        const author = comment.author?.nickname || '未知用户';
        const content = comment.text || '';
        const likes = comment.likes || 0;
        return `${author}: ${content} 👍 ${likes}`;
    }).join('\n\n');

    try {
        await navigator.clipboard.writeText(text);
        showToast('评论已复制到剪贴板');
    } catch (error) {
        showToast('复制失败: ' + error.message);
    }
}

// ========================================
// 事件处理
// ========================================

/**
 * 批量获取评论按钮点击事件
 */
async function handleFetchBatchComments() {
    const urls = parseUrls(elements.videoUrls.value);

    if (urls.length === 0) {
        showError('请输入至少一个有效的 TikTok 视频链接');
        return;
    }

    if (urls.length > 10) {
        showError('最多支持同时处理 10 个视频链接');
        return;
    }

    elements.fetchBtn.disabled = true;
    showView('loading');

    try {
        // 模拟进度更新
        let progress = 0;
        elements.progressText.textContent = '正在处理请求...';
        elements.progressFill.style.width = '10%';

        const data = await fetchBatchComments(urls);

        // 完成进度
        elements.progressFill.style.width = '100%';
        elements.progressText.textContent = '处理完成！';

        setTimeout(() => {
            displayResults(data);
        }, 1000);

    } catch (error) {
        showError(error.message || '批量获取评论失败，请稍后重试');
    } finally {
        elements.fetchBtn.disabled = false;
        // 重置进度条
        setTimeout(() => {
            elements.progressFill.style.width = '0%';
            elements.progressText.textContent = '准备中...';
        }, 2000);
    }
}

/**
 * 清除输入
 */
function handleClearInput() {
    elements.videoUrls.value = '';
    updateUrlCount();
    elements.videoUrls.focus();
}

/**
 * 重试按钮点击事件
 */
function handleRetry() {
    showView(null);
    elements.videoUrls.focus();
}

/**
 * 清空结果
 */
function handleClearResults() {
    currentVideos = [];
    processedVideos = [];
    elements.videosTable.innerHTML = `
        <thead>
            <tr>
                <th>视频信息</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    showView(null);
    elements.videoUrls.focus();
}

/**
 * 切换滚动方向
 */
function handleToggleScroll() {
    const container = elements.tableContainer;
    if (container.style.overflowX === 'hidden') {
        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        showToast('已切换为横向滚动');
    } else {
        container.style.overflowX = 'hidden';
        container.style.overflowY = 'auto';
        showToast('已切换为纵向滚动');
    }
}

/**
 * 示例链接点击事件
 */
function handleExampleClick(e) {
    if (e.target.classList.contains('example-link')) {
        const url = e.target.dataset.url;
        const currentText = elements.videoUrls.value;
        const newText = currentText ? `${currentText}\n${url}` : url;
        elements.videoUrls.value = newText;
        updateUrlCount();
        elements.videoUrls.focus();
    }
}

// ========================================
// 事件监听器
// ========================================

// 输入变化监听
elements.videoUrls.addEventListener('input', updateUrlCount);

// 批量获取评论
elements.fetchBtn.addEventListener('click', handleFetchBatchComments);

// 清除按钮
elements.clearBtn.addEventListener('click', handleClearInput);

// 重试按钮
elements.retryBtn.addEventListener('click', handleRetry);

// 导出Excel
elements.exportExcelBtn.addEventListener('click', exportExcel);

// 清空结果
elements.clearResultsBtn.addEventListener('click', handleClearResults);

// 切换滚动方向
elements.toggleScrollBtn.addEventListener('click', handleToggleScroll);

// 示例链接
document.addEventListener('click', handleExampleClick);

// ========================================
// 页面加载完成
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('TikTok 批量评论获取器已加载');
    elements.videoUrls.focus();
    updateUrlCount();
});