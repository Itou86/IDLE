/* ===== 工具函数 ===== */
const Formatter = {
    // 格式化大数字（K/M/B/T）
    number: function(num) {
        if (num < 1000) return Math.floor(num).toString();
        const units = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac'];
        const unitIndex = Math.floor(Math.log10(num) / 3);
        const scaled = num / Math.pow(1000, unitIndex);
        return scaled.toFixed(scaled < 10 ? 2 : 1) + units[unitIndex];
    },

    // 格式化时间
    time: function(seconds) {
        if (seconds < 60) return Math.floor(seconds) + '秒';
        if (seconds < 3600) return Math.floor(seconds / 60) + '分';
        if (seconds < 86400) return Math.floor(seconds / 3600) + '小时';
        return Math.floor(seconds / 86400) + '天';
    },

    // 生成唯一ID
    uid: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 深拷贝
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};
