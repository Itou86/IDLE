/* ===== 错误码常量 ===== */
const ERROR_CODES = {
    NOT_ENOUGH_SHARDS: 'NOT_ENOUGH_SHARDS',   // 世界碎片不足
    NOT_ENOUGH_POINTS: 'NOT_ENOUGH_POINTS',   // 系统点不足
    CARD_NOT_FOUND: 'CARD_NOT_FOUND',         // 卡牌不存在
    NOT_ENOUGH_CARDS: 'NOT_ENOUGH_CARDS',     // 卡牌数量不足（升级/合成）
    SHOP_NOT_INITIALIZED: 'SHOP_NOT_INITIALIZED', // 商店未初始化
    UNKNOWN_ITEM: 'UNKNOWN_ITEM',             // 商品不存在
    OUT_OF_STOCK: 'OUT_OF_STOCK',             // 库存不足
};

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
