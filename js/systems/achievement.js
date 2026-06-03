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
            case 'points_total':
                return stats.pointsTotal >= condition.value;
            case 'gacha_count':
                return stats.gachaCount >= condition.value;
            case 'battle_win':
                return stats.battleWin >= condition.value;
            case 'stage':
                // 使用总关卡数计算
                const totalStage = STAGE_CONFIG.getTotalStage(gameState);
                return totalStage > condition.value;
            case 'world_stage':
                // 指定世界的关卡进度
                const worldProgress = gameState.worldProgress || {};
                const worldNum = condition.world || 1;
                return (worldProgress[worldNum] || 0) >= condition.value;
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
                    return CARD_CONFIG.getCurrentSets(gameState).every(s =>
                        s.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0)
                    );
                }
                return CARD_CONFIG.getCurrentSets(gameState).some(s =>
                    s.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0)
                );
            case 'set_active_count':
                const activeSets = GachaSystem.getActiveSets(gameState);
                return activeSets.filter(s => s.isComplete).length >= condition.value;
            case 'set_active_specific':
                const sets = CARD_CONFIG.getCurrentSets(gameState);
                return sets.some(s =>
                    s.name === condition.value &&
                    s.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0)
                );
            case 'has_cards':
                const requiredCards = condition.value || [];
                return requiredCards.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            case 'gacha_streak_no_rare':
                return stats.streakNoRare >= condition.value;
            case 'gacha_streak_no_ssr':
                return stats.streakNoSSR >= condition.value;
            case 'gacha_single_ssr':
                // 单抽获得SSR
                return !!stats.gachaSingleSSR;
            case 'speedrun_stage5':
                // 速通：创建后1小时内到达第5关
                if (!stats.createTime) return false;
                const worldProgress5 = gameState.worldProgress || {};
                return (worldProgress5[1] || 0) >= 5 && (Date.now() - stats.createTime) < 3600000;
            case 'hoarder':
                return gameState.points >= condition.value && stats.gachaCount === 0;
            case 'gamble':
                return gameState.points === 0 && stats.gachaCount > 0;
            case 'lose_streak':
                return stats.loseStreak >= condition.value;
            case 'underdog_win':
                // 低战力获胜
                return !!stats.underdogWin;
            case 'click_spam':
                // 1分钟内点击N次（支持30次和60次两个阈值）
                if (!stats.clickSpamStartTime || !stats.clickSpamCount) return false;
                const elapsed = Date.now() - stats.clickSpamStartTime;
                return elapsed < 60000 && stats.clickSpamCount >= condition.value;
            case 'midnight_login':
                const hour = new Date().getHours();
                return hour === 0;
            case 'win_streak':
                return (stats.winStreak || 0) >= condition.value;
            case 'world_unlock':
                return (gameState.world || 1) > condition.value;
            case 'battle_drop_ssr':
                return !!stats.battleDropSSR;
            case 'gacha_single_streak':
                return (stats.gachaSingleStreak || 0) >= condition.value;
            case 'gacha_total_no_ssr':
                return (stats.gachaTotalNoSSR || 0) >= condition.value;
            case 'has_all_rarity':
                const allCardsOfRarity = CARD_CONFIG.pool.filter(c => c.rarity === condition.value);
                return allCardsOfRarity.length > 0 && allCardsOfRarity.every(c =>
                    gameState.cards[c.id] && gameState.cards[c.id].count > 0
                );
            case 'exact_points':
                return gameState.points === condition.value;
            case 'no_gacha_hour':
                if (!stats.lastGachaTime) return false;
                return (Date.now() - stats.lastGachaTime) >= 3600000;
            case 'first_battle_lose':
                return stats.battleLose >= 1 && stats.battleWin === 0;
            case 'exact_power_win':
                return !!stats.exactPowerWin;
            case 'low_power_stage10':
                return !!stats.lowPowerStage10;
            case 'unlucky_time':
                const now = new Date();
                return now.getHours() === 13 && now.getMinutes() === 13;
            default:
                return false;
        }
    },

    // 内部：发放奖励
    _grantReward: function(reward, gameState) {
        if (reward.points) gameState.points += reward.points;
        if (reward.shards) gameState.shards += reward.shards;
    },

    // 获取成就列表（用于UI显示）
    getList: function(gameState) {
        return ACHIEVEMENT_CONFIG.list.map(ach => ({
            ...ach,
            unlocked: !!gameState.achievements[ach.id]
        }));
    },

    // 计算总战力加成（来自已解锁成就）
    getTotalPowerBonus: function(gameState) {
        let bonus = 0;
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            if (gameState.achievements[ach.id] && ach.reward && ach.reward.powerBonus) {
                bonus += ach.reward.powerBonus;
            }
        }

        // ssr_002 王之财宝: 成就奖励+30%
        const hasEternalCrown = gameState.cards && gameState.cards['ssr_002']
            && gameState.cards['ssr_002'].count > 0;
        if (hasEternalCrown) {
            bonus = Math.floor(bonus * 1.3);
        }

        return bonus;
    }
};

// 全局暴露（兼容浏览器和Node.js测试环境）
if (typeof window !== 'undefined') {
    window.AchievementSystem = AchievementSystem;
}
