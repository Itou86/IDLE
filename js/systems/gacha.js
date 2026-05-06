/* ===== 抽卡系统 ===== */
const GachaSystem = {
    // 抽卡消耗
    COST: { tickets: 10 },

    // 执行抽卡
    draw: function(gameState) {
        if (gameState.tickets < this.COST.tickets) {
            return { success: false, reason: '抽卡券不足' };
        }

        gameState.tickets -= this.COST.tickets;
        gameState.stats.gachaCount++;

        const card = this._rollCard();
        this._addCard(gameState, card);

        // 检查保底相关
        this._updateStreaks(gameState, card.rarity);

        return { success: true, card: card };
    },

    // 内部：随机抽取一张卡
    _rollCard: function() {
        const rand = Math.random();
        let rarity;
        if (rand < CARD_CONFIG.rates.SSR) rarity = 'SSR';
        else if (rand < CARD_CONFIG.rates.SSR + CARD_CONFIG.rates.SR) rarity = 'SR';
        else if (rand < CARD_CONFIG.rates.SSR + CARD_CONFIG.rates.SR + CARD_CONFIG.rates.R) rarity = 'R';
        else rarity = 'N';

        // 从对应稀有度中随机选一张
        const pool = CARD_CONFIG.pool.filter(c => c.rarity === rarity);
        const card = Formatter.clone(pool[Math.floor(Math.random() * pool.length)]);
        card.uid = Formatter.uid();
        card.level = 1;
        return card;
    },

    // 内部：添加卡牌到玩家库存
    _addCard: function(gameState, card) {
        if (!gameState.cards[card.id]) {
            gameState.cards[card.id] = { count: 0, level: 1, instances: [] };
        }
        gameState.cards[card.id].count++;
        gameState.cards[card.id].instances.push(card.uid);

        // 记录稀有度获得
        if (!gameState.stats.rarityObtained[card.rarity]) {
            gameState.stats.rarityObtained[card.rarity] = true;
        }
    },

    // 内部：更新连抽统计
    _updateStreaks: function(gameState, rarity) {
        if (rarity === 'N') {
            gameState.stats.streakNoRare++;
        } else {
            gameState.stats.streakNoRare = 0;
        }
        if (rarity !== 'SSR') {
            gameState.stats.streakNoSSR++;
        } else {
            gameState.stats.streakNoSSR = 0;
        }
    },

    // 计算玩家总战力
    getTotalPower: function(gameState) {
        let power = 10; // 基础战力
        let defense = 0;

        for (const [id, cardData] of Object.entries(gameState.cards)) {
            const config = CARD_CONFIG.pool.find(c => c.id === id);
            if (!config) continue;

            const level = cardData.level || 1;
            const multiplier = 1 + (level - 1) * 0.1; // 每级+10%

            if (config.effect === 'power') power += config.basePower * cardData.count * multiplier;
            if (config.effect === 'defense') defense += config.basePower * cardData.count * multiplier;
        }

        // 套装加成
        const setBonus = this._getSetBonus(gameState);
        power += setBonus.power || 0;
        defense += setBonus.defense || 0;

        return { power: Math.floor(power), defense: Math.floor(defense) };
    },

    // 内部：计算套装加成
    _getSetBonus: function(gameState) {
        const bonus = { power: 0, defense: 0, gold: 0 };
        for (const set of CARD_CONFIG.sets) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (hasAll) {
                bonus.power += set.bonus.power || 0;
                bonus.defense += set.bonus.defense || 0;
                bonus.gold += set.bonus.gold || 0;
            }
        }
        return bonus;
    },

    // 升级卡牌
    upgradeCard: function(gameState, cardId) {
        const cardData = gameState.cards[cardId];
        if (!cardData || cardData.count < 2) {
            return { success: false, reason: '需要2张相同卡牌才能升级' };
        }

        cardData.count -= 1; // 消耗1张
        cardData.level += 1;
        cardData.instances.pop(); // 移除一个实例

        return { success: true, newLevel: cardData.level };
    },

    // 批量升级卡牌（消耗多张提升更多等级）
    upgradeCardBatch: function(gameState, cardId, targetLevel) {
        const cardData = gameState.cards[cardId];
        if (!cardData) {
            return { success: false, reason: '卡牌不存在' };
        }

        const currentLevel = cardData.level || 1;
        const levelsNeeded = targetLevel - currentLevel;
        const cardsNeeded = levelsNeeded; // 每升1级需要1张

        if (cardData.count < cardsNeeded + 1) { // 至少留1张
            return { success: false, reason: `需要${cardsNeeded}张卡牌升到${targetLevel}级` };
        }

        cardData.count -= cardsNeeded;
        cardData.level = targetLevel;
        for (let i = 0; i < cardsNeeded; i++) {
            cardData.instances.pop();
        }

        return { success: true, newLevel: cardData.level };
    }
};
