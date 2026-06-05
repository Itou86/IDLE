/* ===== UI 组件 ===== */
// 职责：与 gameState 无关的纯 DOM 组件和视觉效果
const UIComponents = {
    // ===== Toast 通知 =====

    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'achievement' ? 'achievement-toast' : ''}`;
        toast.innerHTML = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    createToastContainer: function() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    },

    // ===== 日志系统 =====

    log: function(message, type = 'info') {
        const logList = document.getElementById('log-list');
        if (!logList) return;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<span class="log-time">${timeStr}</span>${message}`;
        logList.insertBefore(entry, logList.firstChild);

        // 限制日志数量
        while (logList.children.length > 50) {
            logList.removeChild(logList.lastChild);
        }
    },

    // ===== 视觉效果 =====

    showClickFloat: function(amount, targetElement) {
        const btn = targetElement || document.getElementById('click-btn');
        if (!btn) return;
        const float = document.createElement('div');
        float.textContent = `+${amount}`;
        float.style.cssText = `
            position: absolute;
            color: #ffd700;
            font-weight: bold;
            font-size: 1.2rem;
            pointer-events: none;
            animation: floatUp 0.8s ease-out forwards;
        `;
        const rect = btn.getBoundingClientRect();
        float.style.left = (rect.left + rect.width / 2) + 'px';
        float.style.top = rect.top + 'px';
        document.body.appendChild(float);
        setTimeout(() => float.remove(), 800);
    },
};

// 全局暴露
if (typeof window !== 'undefined') {
    window.UIComponents = UIComponents;
}
