/* ===== 成就系统 ===== */
const AchievementSystem = {
    // 检查所有成就
    checkAll: function(gameState) {
        const unlocked = [];
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            if (gameState.achievements[ach.id]) continue; // 已解锁
            if (this._checkCondition(ach.condition, gameState)) {
                gameState.achievements[ach.id] = true;
                this._grantReward(ach.reward, gameState);
                unlocked.push(ach);
            }
        }
        return unlocked;
    },

    // 内部：检查单个条件
    _checkCondition: function(condition, gameState) {
        const stats = gameState.stats;
        switch (condition.type) {
            case 'gold_total':
                return stats.goldTotal >= condition.value;
            case 'gacha_count':
                return stats.gachaCount >= condition.value;
            case 'battle_win':
                return stats.battleWin >= condition.value;
            case 'stage':
                return gameState.stage > condition.value;
            case 'card_count':
                return Object.keys(gameState.cards).length >= condition.value;
            case 'card_unique':
                return Object.keys(gameState.cards).length >= condition.value;
            case 'card_all':
                return Object.keys(gameState.cards).length >= CARD_CONFIG.pool.length;
            case 'card_level':
                return Object.values(gameState.cards).some(c => c.level >= condition.value);
            case 'rarity_obtain':
                return !!stats.rarityObtained[condition.value];
            case 'set_active':
                if (condition.value === 0) {
                    return CARD_CONFIG.sets.every(s =>
                        s.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0)
                    );
                }
                return CARD_CONFIG.sets.some(s =>
                    s.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0)
                );
            case 'gacha_streak_no_rare':
                return stats.streakNoRare >= condition.value;
            case 'gacha_streak_no_ssr':
                return stats.streakNoSSR >= condition.value;
            case 'gacha_single_ssr':
                // 这个需要在抽卡时单独记录
                return false;
            case 'speedrun_stage5':
                // 需要记录创建时间
                return false;
            case 'hoarder':
                return gameState.gold >= condition.value && stats.gachaCount === 0;
            case 'gamble':
                return gameState.gold === 0 && stats.gachaCount > 0;
            case 'lose_streak':
                return stats.loseStreak >= condition.value;
            case 'underdog_win':
                // 需要记录最近一场战斗的战力比
                return false;
            case 'click_spam':
                // 需要前端记录点击次数
                return false;
            case 'midnight_login':
                const hour = new Date().getHours();
                return hour === 0;
            default:
                return false;
        }
    },

    // 内部：发放奖励
    _grantReward: function(reward, gameState) {
        if (reward.gold) gameState.gold += reward.gold;
        if (reward.tickets) gameState.tickets += reward.tickets;
    },

    // 获取成就列表（用于UI显示）
    getList: function(gameState) {
        return ACHIEVEMENT_CONFIG.list.map(ach => ({
            ...ach,
            unlocked: !!gameState.achievements[ach.id]
        }));
    }
};
