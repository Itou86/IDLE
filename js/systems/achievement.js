/* ===== 成就系统 ===== */
const AchievementSystem = {
    // 检查所有成就
    checkAll: function(gameState) {
        const unlocked = [];
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            if (gameState.achievements[ach.id]) continue; // 已解锁
            if (this._checkCondition(ach.condition, gameState)) {
                gameState.achievements[ach.id] = true;
                unlocked.push(ach);
            }
        }
        return unlocked;
    },

    // 获取当前总战力加成百分比
    getTotalPowerBonus: function(gameState) {
        let totalBonus = 0;
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            if (gameState.achievements[ach.id] && ach.reward.powerBonus) {
                totalBonus += ach.reward.powerBonus;
            }
        }
        return totalBonus;
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
            case 'set_active_count':
                const activeCount = CARD_CONFIG.sets.filter(s =>
                    s.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0)
                ).length;
                return activeCount >= condition.value;
            case 'has_cards':
                return condition.value.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            case 'set_active_specific':
                const targetSet = CARD_CONFIG.sets.find(s => s.name === condition.value);
                if (!targetSet) return false;
                return targetSet.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            case 'gacha_streak_no_rare':
                return stats.streakNoRare >= condition.value;
            case 'gacha_streak_no_ssr':
                return stats.streakNoSSR >= condition.value;
            case 'gacha_single_ssr':
                return !!stats.gachaSingleSSR;
            case 'speedrun_stage5':
                return false;
            case 'hoarder':
                return gameState.gold >= condition.value && stats.gachaCount === 0;
            case 'gamble':
                return gameState.gold === 0 && stats.gachaCount > 0;
            case 'lose_streak':
                return stats.loseStreak >= condition.value;
            case 'underdog_win':
                return !!stats.underdogWin;
            case 'click_spam':
                if (!stats.clickSpamStartTime || !stats.clickSpamCount) return false;
                const clickNow = Date.now();
                if (clickNow - stats.clickSpamStartTime > 60000) {
                    stats.clickSpamCount = 0;
                    return false;
                }
                return stats.clickSpamCount >= condition.value;
            case 'midnight_login':
                const hour = new Date().getHours();
                return hour === 0;
            default:
                return false;
        }
    },

    // 获取成就列表（用于UI显示）
    getList: function(gameState) {
        return ACHIEVEMENT_CONFIG.list.map(ach => ({
            ...ach,
            unlocked: !!gameState.achievements[ach.id]
        }));
    }
};
