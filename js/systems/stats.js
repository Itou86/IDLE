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

        // 检查是否有N卡翻倍效果（ssr_001 创世之刃）
        const hasCreationBlade = cards['ssr_001'] && cards['ssr_001'].count > 0;
        const nCardMultiplier = hasCreationBlade ? 2 : 1;

        // 检查是否有联动效果（sr_001 + sr_002）
        const hasDragonSword = cards['sr_001'] && cards['sr_001'].count > 0;
        const hasDragonArmor = cards['sr_002'] && cards['sr_002'].count > 0;
        const dragonSynergy = hasDragonSword && hasDragonArmor;

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

            // ===== 特殊卡牌效果 =====

            // r_006 生命护符: 生命上限+20
            if (id === 'r_006') {
                const hpBonus = 20 * count * levelMultiplier;
                bonuses.hp = (bonuses.hp || 0) + hpBonus;
            }

            // r_005 疾风靴: 闪避+5%
            if (id === 'r_005') {
                const dodgeBonus = 5 * count * levelMultiplier;
                bonuses.dodgeRate = (bonuses.dodgeRate || 0) + dodgeBonus;
            }

            // sr_001 龙血剑: 与龙鳞甲同时装备时+50%攻击力
            if (id === 'sr_001' && dragonSynergy) {
                const synergyBonus = config.basePower * 0.5 * count * levelMultiplier;
                bonuses.power = (bonuses.power || 0) + synergyBonus;
            }

            // sr_002 龙鳞甲: 与龙血剑同时装备时+50%防御力
            if (id === 'sr_002' && dragonSynergy) {
                const synergyBonus = config.basePower * 0.5 * count * levelMultiplier;
                bonuses.defense = (bonuses.defense || 0) + synergyBonus;
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
