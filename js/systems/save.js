/* ===== 存档系统 ===== */
const SaveSystem = {
    KEY: 'idle_game_save',

    // 保存游戏状态
    save: function(state) {
        try {
            const data = JSON.stringify(state);
            localStorage.setItem(this.KEY, data);
            return true;
        } catch (e) {
            console.error('存档失败:', e);
            return false;
        }
    },

    // 读取游戏状态
    load: function() {
        try {
            const data = localStorage.getItem(this.KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('读档失败:', e);
            return null;
        }
    },

    // 删除存档
    reset: function() {
        localStorage.removeItem(this.KEY);
    },

    // 导出存档（用于备份）
    export: function(state) {
        return btoa(JSON.stringify(state));
    },

    // 导入存档
    import: function(base64) {
        try {
            return JSON.parse(atob(base64));
        } catch (e) {
            console.error('导入失败:', e);
            return null;
        }
    }
};
