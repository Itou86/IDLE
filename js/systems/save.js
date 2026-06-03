/* ===== 存档系统 ===== */
const SaveSystem = {
    KEY: 'idle_game_save_v2',
    OLD_KEY: 'idle_game_save', // 旧版存档key（兼容迁移）

    // 公共方法：保存游戏状态
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

    // 公共方法：读取游戏状态
    load: function() {
        try {
            // 先尝试读取新版存档
            let data = localStorage.getItem(this.KEY);

            // 如果没有新版存档，尝试读取旧版并迁移
            if (!data) {
                data = localStorage.getItem(this.OLD_KEY);
                if (data) {
                    const oldState = JSON.parse(data);
                    const migratedState = this._migrate(oldState);
                    // 保存迁移后的存档
                    this.save(migratedState);
                    // 删除旧存档
                    localStorage.removeItem(this.OLD_KEY);
                    return migratedState;
                }
            }

            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('读档失败:', e);
            return null;
        }
    },

    // 存档迁移：旧版（线性stage）→ 新版（world+subStage）
    _migrate: function(oldState) {
        const newState = { ...oldState };

        // 如果旧存档有stage但没有world，进行迁移
        if (oldState.stage !== undefined && oldState.world === undefined) {
            const stage = oldState.stage || 1;
            newState.world = 1;
            newState.subStage = Math.min(stage, STAGE_CONFIG.SUB_STAGES_PER_WORLD);
            newState.worldProgress = { "1": Math.min(stage, STAGE_CONFIG.SUB_STAGES_PER_WORLD) };
            delete newState.stage;
        }

        // 确保worldProgress存在
        if (!newState.worldProgress) {
            newState.worldProgress = {};
        }

        return newState;
    },

    // 公共方法：删除存档
    reset: function() {
        localStorage.removeItem(this.KEY);
        localStorage.removeItem(this.OLD_KEY);
    },

    // 公共方法：导出存档（用于备份）
    export: function(state) {
        return btoa(JSON.stringify(state));
    },

    // 公共方法：导入存档
    import: function(base64) {
        try {
            return JSON.parse(atob(base64));
        } catch (e) {
            console.error('导入失败:', e);
            return null;
        }
    }
};
