/* ===== 抽卡系统 ===== */
const GachaSystem = {
    // 抽卡消耗
    COST: { tickets: 1 },
    
    // 十连抽消耗
    COST_10: { tickets: 10 },

    // 执行抽卡 (count=1 单抽, count=10 十连)
    draw: function(gameState, count) {
        count = parseInt(count, 10) || 1;
        const cost = count >= 10 ? this.COST_10.tickets : this.COST.tickets * count;
        
        if (gameState.tickets < cost) {
            return { success: false, reason: '抽卡券不足' };
        }

        gameState.tickets -= cost;
        gameState.stats.gachaCount += count;

        const cards = [];
        for (let i = 0; i < count; i++) {
            const isLastOfTen = (count === 10 && i === 9);
            const card = this._rollCard(count === 10, isLastOfTen);
            this._addCard(gameState, card);
            cards.push(card);
            // 检查保底相关
            this._updateStreaks(gameState, card.rarity);
        }

        return { success: true, cards: cards, count: count };
    },

    // 稀有度保底概率提升（十连时SR/SSR概率提升，第10张保底SR）
    _rollCard: function(isTenPull, isLastOfTen) {
        let rarity;
        
        // 十连最后一张保底SR
        if (isLastOfTen) {
            const rand = Math.random();
            if (rand < 0.15) rarity = 'SSR';  // 15%
            else rarity = 'SR'; // 85%
            const pool = CARD_CONFIG.pool.filter(c => c.rarity === rarity);
            const card = Formatter.clone(pool[Math.floor(Math.random() * pool.length)]);
            card.uid = Formatter.uid();
            card.level = 1;
            return card;
        }
        
        const rand = Math.random();
        
        // 十连抽整体稀有度概率提升
        if (isTenPull) {
            if (rand < 0.08) rarity = 'SSR';      // 8% (vs 平时5%)
            else if (rand < 0.08 + 0.18) rarity = 'SR'; // 18% (vs 平时10%)
            else if (rand < 0.08 + 0.18 + 0.35) rarity = 'R'; // 35% (vs 平时25%)
            else rarity = 'N'; // 39% (vs 平时60%)
        } else {
            // 单抽用原概率
            if (rand < CARD_CONFIG.rates.SSR) rarity = 'SSR';
            else if (rand < CARD_CONFIG.rates.SSR + CARD_CONFIG.rates.SR) rarity = 'SR';
            else if (rand < CARD_CONFIG.rates.SSR + CARD_CONFIG.rates.SR + CARD_CONFIG.rates.R) rarity = 'R';
            else rarity = 'N';
        }

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

        // 成就战力加成
        const achBonus = AchievementSystem.getTotalPowerBonus(gameState);
        if (achBonus > 0) {
            power = power * (1 + achBonus / 100);
            defense = defense * (1 + achBonus / 100);
        }

        return { power: Math.floor(power), defense: Math.floor(defense) };
    },

    // 内部：计算套装加成
    _getSetBonus: function(gameState) {
        const bonus = { power: 0, defense: 0, gold: 0, speed: 0, dropRate: 0 };
        for (const set of CARD_CONFIG.sets) {
            const hasAll = set.ids.every(id => gameState.cards[id] && gameState.cards[id].count > 0);
            if (hasAll) {
                bonus.power += set.bonus.power || 0;
                bonus.defense += set.bonus.defense || 0;
                bonus.gold += set.bonus.gold || 0;
                bonus.speed += set.bonus.speed || 0;
                bonus.dropRate += set.bonus.dropRate || 0;
            }
        }
        return bonus;
    },

    // 获取玩家已激活的套装列表
    getActiveSets: function(gameState) {
        const active = [];
        for (const set of CARD_CONFIG.sets) {
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
        const totalSets = CARD_CONFIG.sets.length;
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
