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
    
    // 内部：计算卡牌固定值加成
    _getCardFlatBonuses: function(gameState) {
        const bonuses = {};
        for (const [id, cardData] of Object.entries(gameState.cards)) {
            const config = CARD_CONFIG.pool.find(c => c.id === id);
            if (!config) continue;
            
            // 兼容新旧格式
            let cardStats = config.stats;
            if (!cardStats && config.basePower) {
                // 旧格式转换
                cardStats = {};
                if (config.effect === 'power') cardStats.power = config.basePower;
                else if (config.effect === 'defense') cardStats.defense = config.basePower;
                else if (config.effect === 'gold') cardStats.goldBonus = config.basePower;
                else if (config.effect === 'heal') cardStats.hpRegen = config.basePower;
                else if (config.effect === 'speed') cardStats.speed = config.basePower;
                else if (config.effect === 'dropRate') cardStats.dropRate = config.basePower;
            }
            if (!cardStats) continue;
            
            const level = cardData.level || 1;
            const multiplier = 1 + (level - 1) * 0.1; // 每级+10%
            const count = cardData.count || 1;
            
            for (const [stat, baseValue] of Object.entries(cardStats)) {
                if (baseValue === 0) continue;
                const totalValue = baseValue * count * multiplier;
                bonuses[stat] = (bonuses[stat] || 0) + totalValue;
            }
        }
        return bonuses;
    },
    
    // 内部：计算套装固定值加成
    _getSetFlatBonuses: function(gameState) {
        const bonuses = {};
        for (const set of CARD_CONFIG.sets) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (!hasAll) continue;
            
            for (const [stat, value] of Object.entries(set.bonus)) {
                if (value === 0 || value === undefined) continue;
                // 套装bonus中，百分比属性用字符串标记如 "10%"
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
        for (const set of CARD_CONFIG.sets) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (!hasAll) continue;
            
            for (const [stat, value] of Object.entries(set.bonus)) {
                if (typeof value === 'string' && value.endsWith('%')) {
                    const pct = parseFloat(value);
                    bonuses[stat] = (bonuses[stat] || 0) + pct;
                }
            }
        }
        
        // 从卡牌特殊效果获取百分比加成（如SSR卡的"所有N卡效果翻倍"）
        // 这里预留扩展点
        
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
