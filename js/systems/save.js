/* ===== 存档系统 ===== */
const SaveSystem = {
    KEY: 'idle_game_save_v2',
    OLD_KEY: 'idle_game_save', // 旧版存档key（兼容迁移）
    CURRENT_VERSION: 2,

    // 迁移链: 索引 i 对应 v(i+1) → v(i+2) 的迁移函数
    // 例如 _migrations[0] = v1 → v2, _migrations[1] = v2 → v3
    _migrations: [
        // v1 → v2: 旧版线性stage → 新版 world+subStage
        function v1_to_v2(state) {
            if (state.stage !== undefined && state.world === undefined) {
                const stage = state.stage || 1;
                state.world = 1;
                state.subStage = Math.min(stage, STAGE_CONFIG.SUB_STAGES_PER_WORLD);
                state.worldProgress = { "1": Math.min(stage, STAGE_CONFIG.SUB_STAGES_PER_WORLD) };
                delete state.stage;
            }
            if (!state.worldProgress) {
                state.worldProgress = {};
            }
            state.saveVersion = 2;
            return state;
        }
    ],

    // 内部：按迁移链逐版本升级存档
    _applyMigrations: function(state) {
        const fromVersion = state.saveVersion || 1;
        for (let i = fromVersion - 1; i < this._migrations.length; i++) {
            if (this._migrations[i]) {
                state = this._migrations[i](state);
            }
        }
        // 确保最终版本号正确
        state.saveVersion = this.CURRENT_VERSION;
        return state;
    },

    // 公共方法：保存游戏状态
    save: function(state) {
        try {
            // 确保保存时版本号是最新的
            state.saveVersion = this.CURRENT_VERSION;
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
                    const migratedState = this._applyMigrations(oldState);
                    // 保存迁移后的存档
                    this.save(migratedState);
                    // 删除旧存档
                    localStorage.removeItem(this.OLD_KEY);
                    return migratedState;
                }
            }

            if (!data) return null;
            const state = JSON.parse(data);
            // 检查是否需要迁移（读取新版存档但版本号低于当前）
            if ((state.saveVersion || 1) < this.CURRENT_VERSION) {
                const migratedState = this._applyMigrations(state);
                this.save(migratedState);
                return migratedState;
            }
            return state;
        } catch (e) {
            console.error('读档失败:', e);
            return null;
        }
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
