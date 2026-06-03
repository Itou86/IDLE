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

    // 公共方法：获取属性来源明细（用于属性界面展示）
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

        // 触发 stat_calc 效果，获取N卡倍率、闪避加成、生命加成、联动加成等
        const context = EffectRegistry.trigger('stat_calc', gameState, {});
        const nCardMultiplier = context.nCardMultiplier || 1;

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

            // 计算基础值
            for (const [stat, baseValue] of Object.entries(cardStats)) {
                if (baseValue === 0) continue;
                const totalValue = baseValue * count * levelMultiplier;
                bonuses[stat] = (bonuses[stat] || 0) + totalValue;
            }

            // 联动加成（来自 EffectRegistry 的 synergy_bonus）
            if (context.synergyBonuses && context.synergyBonuses[id]) {
                const synergyPct = context.synergyBonuses[id];
                const synergyBonus = config.basePower * synergyPct * count * levelMultiplier;
                // 龙血剑(effect='power')联动加power，龙鳞甲(effect='defense')联动加defense
                const targetStat = config.effect === 'power' ? 'power' :
                                   config.effect === 'defense' ? 'defense' : 'power';
                bonuses[targetStat] = (bonuses[targetStat] || 0) + synergyBonus;
            }
        }

        // 应用 flat_stat_bonus（如生命护符+20HP）
        if (context.flatStatBonus) {
            for (const [stat, value] of Object.entries(context.flatStatBonus)) {
                bonuses[stat] = (bonuses[stat] || 0) + value;
            }
        }

        // 应用 dodge_rate_bonus（如疾风靴+5%闪避）
        if (context.dodgeRateBonus) {
            bonuses.dodgeRate = (bonuses.dodgeRate || 0) + context.dodgeRateBonus;
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
            case 'gold':
                cardStats.goldBonus = effectiveBase;
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

    // 公共方法：获取玩家闪避率（用于 BattleSystem）
    getDodgeRate: function(gameState) {
        const bonuses = this._getCardFlatBonuses(gameState);
        return bonuses.dodgeRate || 0;
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

    // 公共方法：格式化属性值显示
    formatStat: function(statKey, value) {
        const def = STAT_CONFIG.definitions[statKey];
        if (!def) return value;

        if (def.format === 'percent') {
            return `${value}%`;
        }
        return Formatter.number(value);
    }
};
