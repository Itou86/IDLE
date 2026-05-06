/* ===== 商店系统 ===== */
const ShopSystem = {
    // 配置
    TICKET_COST: 500,        // 券价格
    CARD_COST: 300,          // N卡价格
    REFRESH_INTERVAL: 20 * 60 * 1000,  // 20分钟刷新（毫秒）

    // 获取商店当前商品
    getItems: function(gameState) {
        // 确保商店数据存在
        if (!gameState.shop) {
            gameState.shop = {
                lastRefresh: 0,
                cardStock: {}  // 库存
            };
        }

        // 检查是否需要刷新
        const now = Date.now();
        if (now - gameState.shop.lastRefresh >= this.REFRESH_INTERVAL) {
            this._refresh(gameState);
        }

        const items = [];

        // 券商品
        items.push({
            id: 'ticket',
            name: '抽卡券',
            type: 'ticket',
            cost: this.TICKET_COST,
            desc: '用于抽卡',
            icon: '🎫'
        });

        // N卡商品（从库存中）
        for (const [cardId, stock] of Object.entries(gameState.shop.cardStock)) {
            if (stock > 0) {
                const config = CARD_CONFIG.pool.find(c => c.id === cardId);
                if (config) {
                    items.push({
                        id: cardId,
                        name: config.name,
                        type: 'card',
                        rarity: config.rarity,
                        cost: this.CARD_COST,
                        desc: config.desc,
                        icon: this._getRarityIcon(config.rarity),
                        stock: stock
                    });
                }
            }
        }

        return items;
    },

    // 购买商品
    buy: function(gameState, itemId) {
        // 先检查库存（不触发刷新）
        if (!gameState.shop) {
            return { success: false, reason: '商店未初始化' };
        }

        // 检查是否是券
        if (itemId === 'ticket') {
            if (gameState.gold < this.TICKET_COST) {
                return { success: false, reason: '金币不足' };
            }
            gameState.gold -= this.TICKET_COST;
            gameState.tickets += 1;
            return { success: true, item: { id: 'ticket', name: '抽卡券', type: 'ticket', cost: this.TICKET_COST }, received: '抽卡券 x1' };
        }

        // 检查是否是卡牌且库存足够
        const stock = gameState.shop.cardStock[itemId];
        if (stock === undefined) {
            return { success: false, reason: '商品不存在' };
        }
        if (stock <= 0) {
            return { success: false, reason: '库存不足' };
        }

        if (gameState.gold < this.CARD_COST) {
            return { success: false, reason: '金币不足' };
        }

        // 扣除金币和库存
        gameState.gold -= this.CARD_COST;
        gameState.shop.cardStock[itemId]--;

        // 添加卡牌到库存
        const config = CARD_CONFIG.pool.find(c => c.id === itemId);
        const card = Formatter.clone(config);
        card.uid = Formatter.uid();
        card.level = 1;

        if (!gameState.cards[itemId]) {
            gameState.cards[itemId] = { count: 0, level: 1, instances: [] };
        }
        gameState.cards[itemId].count++;
        gameState.cards[itemId].instances.push(card.uid);

        // 记录稀有度获得
        if (!gameState.stats.rarityObtained[card.rarity]) {
            gameState.stats.rarityObtained[card.rarity] = true;
        }

        return { success: true, item: { id: itemId, name: config.name, type: 'card', cost: this.CARD_COST }, received: card.name };
    },

    // 刷新商店
    refresh: function(gameState) {
        // 手动刷新不消耗，只是重置时间
        this._refresh(gameState);
        return { success: true };
    },

    // 获取下次刷新时间
    getNextRefreshTime: function(gameState) {
        if (!gameState.shop) return 0;
        const next = gameState.shop.lastRefresh + this.REFRESH_INTERVAL;
        return Math.max(0, next - Date.now());
    },

    // 内部：刷新商品
    _refresh: function(gameState) {
        gameState.shop.lastRefresh = Date.now();
        gameState.shop.cardStock = {};

        // 随机选择3-5张N卡作为库存
        const nCards = CARD_CONFIG.pool.filter(c => c.rarity === 'N');
        const stockCount = 3 + Math.floor(Math.random() * 3);  // 3-5种

        for (let i = 0; i < stockCount; i++) {
            const card = nCards[Math.floor(Math.random() * nCards.length)];
            const amount = 1 + Math.floor(Math.random() * 3);  // 1-3张库存
            gameState.shop.cardStock[card.id] = amount;
        }
    },

    // 内部：稀有度图标
    _getRarityIcon: function(rarity) {
        const icons = { N: '⚪', R: '🔵', SR: '🟣', SSR: '🟡' };
        return icons[rarity] || '⚪';
    }
};
