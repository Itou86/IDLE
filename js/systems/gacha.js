/* ===== 抽卡系统（无限流世界版） ===== */
const GachaSystem = {
    // 抽卡消耗
    COST: { shards: 1 },

    // 十连抽消耗
    COST_10: { shards: 10 },

    // 执行抽卡 (count=1 单抽, count=10 十连)
    draw: function(gameState, count) {
        count = parseInt(count, 10) || 1;
        const cost = count >= 10 ? this.COST_10.shards : this.COST.shards * count;

        if (gameState.shards < cost) {
            return { success: false, reason: '世界碎片不足', errorCode: ERROR_CODES.NOT_ENOUGH_SHARDS };
        }

        gameState.shards -= cost;
        gameState.stats.gachaCount += count;

        const cards = [];
        const hasDice = gameState.cards['ssr_003'] && gameState.cards['ssr_003'].count > 0;

        for (let i = 0; i < count; i++) {
            const isLastOfTen = (count === 10 && i === 9);
            const card = this._rollCard(gameState, count === 10, isLastOfTen);
            this._addCard(gameState, card);
            cards.push(card);
            // 检查保底相关
            this._updateStreaks(gameState, card.rarity);

            // ssr_003 卢恩弯弧: 10%概率额外抽1张，且稀有度+1
            if (hasDice && Math.random() < 0.1) {
                const extraCard = this._rollCard(gameState, false, false, true); // rarityUp=true
                this._addCard(gameState, extraCard);
                cards.push(extraCard);
                this._updateStreaks(gameState, extraCard.rarity);
            }
        }

        return { success: true, cards: cards, count: count };
    },

    // 内部：从指定卡池按稀有度选卡，空池时自动降级（SSR→SR→R→N→总池N）
    _createCardFromPool: function(pool, rarity) {
        let targetPool = pool.filter(c => c.rarity === rarity);
        // 降级链
        const downgrade = { 'SSR': 'SR', 'SR': 'R', 'R': 'N' };
        while (targetPool.length === 0 && downgrade[rarity]) {
            rarity = downgrade[rarity];
            targetPool = pool.filter(c => c.rarity === rarity);
        }
        // 当前池全空时，从总池保底
        if (targetPool.length === 0) {
            targetPool = CARD_CONFIG.pool.filter(c => c.rarity === 'N');
        }
        const card = Formatter.clone(targetPool[Math.floor(Math.random() * targetPool.length)]);
        card.uid = Formatter.uid();
        card.level = 1;
        return card;
    },

    // 稀有度保底概率提升（十连时SR/SSR概率提升，第10张保底SR）
    // rarityUp: 卢恩弯弧效果，稀有度+1
    _rollCard: function(gameState, isTenPull, isLastOfTen, rarityUp) {
        const currentPool = CARD_CONFIG.getCurrentPool(gameState);
        let rarity;

        if (isLastOfTen) {
            // 十连最后一张保底：15% SSR, 85% SR
            rarity = Math.random() < 0.15 ? 'SSR' : 'SR';
        } else {
            const rand = Math.random();
            if (isTenPull) {
                // 十连概率提升
                if (rand < 0.08) rarity = 'SSR';
                else if (rand < 0.26) rarity = 'SR';
                else if (rand < 0.61) rarity = 'R';
                else rarity = 'N';
            } else {
                // 单抽用基础概率
                if (rand < CARD_CONFIG.rates.SSR) rarity = 'SSR';
                else if (rand < CARD_CONFIG.rates.SSR + CARD_CONFIG.rates.SR) rarity = 'SR';
                else if (rand < CARD_CONFIG.rates.SSR + CARD_CONFIG.rates.SR + CARD_CONFIG.rates.R) rarity = 'R';
                else rarity = 'N';
            }
        }

        // 卢恩弯弧效果: 稀有度+1
        if (rarityUp) {
            const upMap = { 'N': 'R', 'R': 'SR', 'SR': 'SSR', 'SSR': 'SSR' };
            rarity = upMap[rarity] || rarity;
        }

        return this._createCardFromPool(currentPool, rarity);
    },

    // 内部：添加卡牌到玩家库存（委托给 GameUtils）
    _addCard: function(gameState, card) {
        GameUtils.addCardToInventory(gameState, card);
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
        if (typeof StatSystem !== 'undefined' && StatSystem.getCharacterStats) {
            const stats = StatSystem.getCharacterStats(gameState);
            return {
                power: stats.power,
                defense: stats.defense,
                effectivePower: stats.effectivePower
            };
        }
        // 降级：StatSystem 不可用时返回最小兼容值
        return { power: 10, defense: 0, effectivePower: 10 };
    },

    // 内部：计算套装加成
    _getSetBonus: function(gameState) {
        const bonus = { power: 0, defense: 0, points: 0, speed: 0, dropRate: 0, hp: 0, hpRegen: 0, shardBonus: 0, critRate: 0, critDamage: 0, expBonus: 0 };
        const sets = CARD_CONFIG.getCurrentSets(gameState);
        for (const set of sets) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (hasAll) {
                for (const [key, value] of Object.entries(set.bonus)) {
                    if (typeof value === 'number') {
                        bonus[key] = (bonus[key] || 0) + value;
                    }
                }
            }
        }
        return bonus;
    },

    // 获取玩家已激活的套装列表
    getActiveSets: function(gameState) {
        const active = [];
        const sets = CARD_CONFIG.getCurrentSets(gameState);
        for (const set of sets) {
            const collected = [];
            const hasAll = set.ids.every(id => {
                const has = gameState.cards[id] && gameState.cards[id].count > 0;
                collected.push({ id: id, has: has });
                return has;
            });
            active.push({
                ...set,
                collected: collected,
                isComplete: hasAll
            });
        }
        return active;
    },

    // 获取玩家卡组图鉴进度
    getCollectionProgress: function(gameState) {
        const totalCards = CARD_CONFIG.pool.length;
        const ownedCards = Object.keys(gameState.cards).length;
        const totalSets = CARD_CONFIG.getCurrentSets(gameState).length;
        const completeSets = this.getActiveSets(gameState).filter(s => s.isComplete).length;
        return {
            cardsOwned: ownedCards,
            cardsTotal: totalCards,
            setsComplete: completeSets,
            setsTotal: totalSets,
            cardPercent: Math.floor((ownedCards / totalCards) * 100),
            setPercent: Math.floor((completeSets / totalSets) * 100)
        };
    },

    // 升级卡牌
    upgradeCard: function(gameState, cardId) {
        const cardData = gameState.cards[cardId];
        if (!cardData) {
            return { success: false, reason: '卡牌不存在', errorCode: ERROR_CODES.CARD_NOT_FOUND };
        }
        if (cardData.count < 2) {
            return { success: false, reason: '需要2张相同卡牌才能升级', errorCode: ERROR_CODES.NOT_ENOUGH_CARDS };
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
            return { success: false, reason: '卡牌不存在', errorCode: ERROR_CODES.CARD_NOT_FOUND };
        }

        const currentLevel = cardData.level || 1;
        const levelsNeeded = targetLevel - currentLevel;
        const cardsNeeded = levelsNeeded; // 每升1级需要1张

        if (cardData.count < cardsNeeded + 1) { // 至少留1张
            return { success: false, reason: `需要${cardsNeeded}张卡牌升到${targetLevel}级`, errorCode: ERROR_CODES.NOT_ENOUGH_CARDS };
        }

        cardData.count -= cardsNeeded;
        cardData.level = targetLevel;
        for (let i = 0; i < cardsNeeded; i++) {
            cardData.instances.pop();
        }

        return { success: true, newLevel: cardData.level };
    }
};
