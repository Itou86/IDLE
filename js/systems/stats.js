/* ===== 属性系统 ===== */
const StatSystem = {
    // 计算角色完整属性面板
    getCharacterStats: function(gameState) {
        const result = {};

        // 1. 基础值
        for (const stat of STAT_CONFIG.calcOrder) {
            result[stat] = STAT_CONFIG.baseStats[stat] || 0;
        }

        // 2. 卡牌固定值加成
        const cardStats = this._getCardFlatBonuses(gameState);
        for (const [stat, value] of Object.entries(cardStats)) {
            result[stat] += value;
        }

        // 3. 套装固定值加成
        const setStats = this._getSetFlatBonuses(gameState);
        for (const [stat, value] of Object.entries(setStats)) {
            result[stat] += value;
        }

        // 4. 百分比加成（在固定值之后乘算）
        const percentBonuses = this._getPercentBonuses(gameState);
        for (const stat of STAT_CONFIG.calcOrder) {
            const pct = percentBonuses[stat] || 0;
            if (pct > 0) {
                result[stat] = result[stat] * (1 + pct / 100);
            }
        }

        // 5. 成就战力加成（只影响power/defense/hp）
        const achBonus = AchievementSystem.getTotalPowerBonus(gameState);
        if (achBonus > 0) {
            result.power = result.power * (1 + achBonus / 100);
            result.defense = result.defense * (1 + achBonus / 100);
            result.hp = result.hp * (1 + achBonus / 100);
        }

        // 取整
        for (const stat of STAT_CONFIG.calcOrder) {
            result[stat] = Math.floor(result[stat]);
        }

        // 计算综合战力（用于对比）
        result.effectivePower = this._calcEffectivePower(result);
        result.achievementBonus = achBonus;

        return result;
    },

    // 获取属性来源明细（用于属性界面展示）
    getStatBreakdown: function(gameState) {
        const breakdown = {
            base: { ...STAT_CONFIG.baseStats },
            cards: this._getCardFlatBonuses(gameState),
            sets: this._getSetFlatBonuses(gameState),
            percent: this._getPercentBonuses(gameState),
            achievement: AchievementSystem.getTotalPowerBonus(gameState),
        };
        return breakdown;
    },

    // 内部：计算卡牌固定值加成（含特殊效果）
    _getCardFlatBonuses: function(gameState) {
        const bonuses = {};
        const cards = gameState.cards || {};

        // 通过 EffectRegistry 获取 stat_calc 触发的效果上下文
        const effectContext = EffectRegistry.trigger('stat_calc', gameState, { nCardMultiplier: 1 });
        const nCardMultiplier = effectContext.nCardMultiplier || 1;
        const synergyBonuses = effectContext.synergyBonuses || {};
        const flatStatBonuses = effectContext.flatStatBonuses || [];

        for (const [id, cardData] of Object.entries(cards)) {
            const config = CARD_CONFIG.pool.find(c => c.id === id);
            if (!config) continue;

            // 基础效果映射
            let cardStats = config.stats;
            if (!cardStats && config.basePower) {
                cardStats = this._mapEffectToStats(config, nCardMultiplier);
            }
            if (!cardStats) continue;

            const level = cardData.level || 1;
            const levelMultiplier = 1 + (level - 1) * 0.1;
            const count = cardData.count || 1;

            // 计算基础值（含联动加成）
            const synergyRatio = synergyBonuses[id] || 0;
            // 世界收集度倍率（全收集奖励）
            const worldMultiplier = CARD_CONFIG.getWorldCompletionMultiplier(gameState, config.worldId);
            for (const [stat, baseValue] of Object.entries(cardStats)) {
                if (baseValue === 0) continue;
                let totalValue = baseValue * count * levelMultiplier;
                // 应用联动加成
                if (synergyRatio > 0) {
                    totalValue = totalValue * (1 + synergyRatio);
                }
                // 应用世界收集度加成
                totalValue = totalValue * worldMultiplier;
                bonuses[stat] = (bonuses[stat] || 0) + totalValue;
            }
        }

        // 应用固定属性加成（含 count * levelMultiplier 缩放）
        for (const bonus of flatStatBonuses) {
            const cardData = cards[bonus.cardId];
            if (cardData) {
                const count = cardData.count || 1;
                const level = cardData.level || 1;
                const levelMultiplier = 1 + (level - 1) * 0.1;
                const totalValue = bonus.value * count * levelMultiplier;
                bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + totalValue;
            }
        }

        return bonuses;
    },

    // 将旧格式 effect 映射为 stats 对象
    _mapEffectToStats: function(config, nCardMultiplier) {
        const cardStats = {};
        const base = config.basePower || 0;

        // N卡翻倍效果
        const multiplier = (config.rarity === 'N' && nCardMultiplier > 1) ? nCardMultiplier : 1;
        const effectiveBase = base * multiplier;

        switch (config.effect) {
            case 'power':
                cardStats.power = effectiveBase;
                break;
            case 'defense':
                cardStats.defense = effectiveBase;
                break;
            case 'points':
                cardStats.pointsBonus = effectiveBase;
                break;
            case 'points':
                cardStats.pointsBonus = effectiveBase;
                break;
            case 'heal':
                cardStats.hpRegen = effectiveBase;
                break;
            case 'speed':
                cardStats.speed = effectiveBase;
                break;
            case 'dropRate':
                cardStats.dropRate = effectiveBase;
                break;
            case 'utility':
                // utility 卡牌不贡献基础属性，效果在其他系统实现
                break;
            default:
                break;
        }
        return cardStats;
    },

    // 内部：计算套装固定值加成
    _getSetFlatBonuses: function(gameState) {
        const bonuses = {};
        for (const set of CARD_CONFIG.getCurrentSets(gameState)) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (!hasAll) continue;

            for (const [stat, value] of Object.entries(set.bonus)) {
                if (value === 0 || value === undefined) continue;
                const isPercent = typeof value === 'string' && value.endsWith('%');
                if (!isPercent) {
                    bonuses[stat] = (bonuses[stat] || 0) + value;
                }
            }
        }
        return bonuses;
    },

    // 内部：计算百分比加成
    _getPercentBonuses: function(gameState) {
        const bonuses = {};

        // 从套装获取百分比加成
        for (const set of CARD_CONFIG.getCurrentSets(gameState)) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (!hasAll) continue;

            for (const [stat, value] of Object.entries(set.bonus)) {
                if (typeof value === 'string' && value.endsWith('%')) {
                    const pct = parseFloat(value);
                    bonuses[stat] = (bonuses[stat] || 0) + pct;
                }
            }
        }

        return bonuses;
    },

    // 计算有效战力（用于战斗对比）
    _calcEffectivePower: function(stats) {
        let power = 0;
        for (const [stat, weight] of Object.entries(STAT_CONFIG.powerWeights)) {
            power += (stats[stat] || 0) * weight;
        }
        return Math.floor(power);
    },

    // 格式化属性值显示
    formatStat: function(statKey, value) {
        const def = STAT_CONFIG.definitions[statKey];
        if (!def) return value;

        if (def.format === 'percent') {
            return `${value}%`;
        }
        return Formatter.number(value);
    }
};

// 全局暴露
// 全局暴露（兼容浏览器和Node.js测试环境）
if (typeof window !== 'undefined') {
    window.StatSystem = StatSystem;
}
