/* ===== 游戏通用工具 ===== */
const GameUtils = {
    // 公共方法：检查玩家是否拥有指定卡牌
    hasCard: function(gameState, cardId) {
        return gameState.cards[cardId] && gameState.cards[cardId].count > 0;
    },

    // 公共方法：统一添加卡牌到玩家库存
    // cardConfig: 卡牌配置对象（来自 CARD_CONFIG.pool），必须包含 id 和 rarity
    addCardToInventory: function(gameState, cardConfig) {
        if (!gameState.cards[cardConfig.id]) {
            gameState.cards[cardConfig.id] = { count: 0, level: 1, instances: [] };
        }
        gameState.cards[cardConfig.id].count++;
        gameState.cards[cardConfig.id].instances.push(cardConfig.uid);

        // 记录稀有度获得
        if (!gameState.stats.rarityObtained[cardConfig.rarity]) {
            gameState.stats.rarityObtained[cardConfig.rarity] = true;
        }
    },

    // 公共方法：计算等级倍率
    getLevelMultiplier: function(level) {
        return 1 + (level - 1) * 0.1;
    },

    // 公共方法：根据卡牌ID获取配置
    getCardConfig: function(cardId) {
        return CARD_CONFIG.pool.find(c => c.id === cardId);
    }
};
