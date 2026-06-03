/* ===== 抽卡系统（无限流世界版） ===== */
const GachaSystem = {
    // 抽卡消耗
    COST: { tickets: 1 },

    // 十连抽消耗
    COST_10: { tickets: 10 },

    // 公共方法：执行抽卡 (count=1 单抽, count=10 十连)
    draw: function(gameState, count) {
        count = parseInt(count, 10) || 1;
        const cost = count >= 10 ? this.COST_10.tickets : this.COST.tickets * count;

        if (gameState.tickets < cost) {
            return { success: false, reason: '抽卡券不足' };
        }

        gameState.tickets -= cost;
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

            // ssr_003 命运骰子: 10%概率额外抽1张，且稀有度+1
            if (hasDice && Math.random() < 0.1) {
                const extraCard = this._rollCard(gameState, false, false, true); // rarityUp=true
                this._addCard(gameState, extraCard);
                cards.push(extraCard);
                this._updateStreaks(gameState, extraCard.rarity);
            }
        }

        return { success: true, cards: cards, count: count };
    },

    // 内部：稀有度保底概率提升（十连时SR/SSR概率提升，第10张保底SR）
    // rarityUp: 命运骰子效果，稀有度+1
    _rollCard: function(gameState, isTenPull, isLastOfTen, rarityUp) {
        // 获取当前世界的卡池
        const worldId = gameState.world || 1;
        const worldPool = CARD_CONFIG.getWorldCards(worldId);

        let rarity;

        // 十连最后一张保底SR
        if (isLastOfTen) {
            const rand = Math.random();
            if (rand < 0.15) rarity = 'SSR';  // 15%
            else rarity = 'SR'; // 85%
            const pool = worldPool.filter(c => c.rarity === rarity);
            // 如果该世界没有这个稀有度，降级
            if (pool.length === 0) {
                const fallbackRarity = rarity === 'SSR' ? 'SR' : 'R';
                const fallbackPool = worldPool.filter(c => c.rarity === fallbackRarity);
                if (fallbackPool.length === 0) {
                    // 最终降级到N
                    const nPool = worldPool.filter(c => c.rarity === 'N');
                    const card = Formatter.clone(nPool[Math.floor(Math.random() * nPool.length)]);
                    card.uid = Formatter.uid();
                    card.level = 1;
                    return card;
                }
                const card = Formatter.clone(fallbackPool[Math.floor(Math.random() * fallbackPool.length)]);
                card.uid = Formatter.uid();
                card.level = 1;
                return card;
            }
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

        // 命运骰子效果: 稀有度+1
        if (rarityUp) {
            const upMap = { 'N': 'R', 'R': 'SR', 'SR': 'SSR', 'SSR': 'SSR' };
            rarity = upMap[rarity] || rarity;
        }

        // 从当前世界对应稀有度中随机选一张
        const pool = worldPool.filter(c => c.rarity === rarity);
        if (pool.length === 0) {
            // 该世界没有这个稀有度，降级到N
            const nPool = worldPool.filter(c => c.rarity === 'N');
            if (nPool.length === 0) {
                // 保底：从总池随机取一张
                const fallbackPool = CARD_CONFIG.pool.filter(c => c.rarity === 'N');
                const card = Formatter.clone(fallbackPool[Math.floor(Math.random() * fallbackPool.length)]);
                card.uid = Formatter.uid();
                card.level = 1;
                return card;
            }
            const card = Formatter.clone(nPool[Math.floor(Math.random() * nPool.length)]);
            card.uid = Formatter.uid();
            card.level = 1;
            return card;
        }
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

    // 公共方法：计算玩家总战力
    getTotalPower: function(gameState) {
        // 如果 StatSystem 可用，使用新属性系统
        if (typeof StatSystem !== 'undefined' && StatSystem.getCharacterStats) {
            const stats = StatSystem.getCharacterStats(gameState);
            return {
                power: stats.power,
                defense: stats.defense,
                effectivePower: stats.effectivePower
            };
        }

        // 降级：使用旧版计算（兼容测试环境 + 新版卡牌格式）
        let power = 10;
        let defense = 0;
        for (const [id, cardData] of Object.entries(gameState.cards)) {
            const config = CARD_CONFIG.pool.find(c => c.id === id);
            if (!config) continue;
            const level = cardData.level || 1;
            const multiplier = 1 + (level - 1) * 0.1;
            const count = cardData.count || 1;

            // 兼容新版 stats 格式
            if (config.stats) {
                if (config.stats.power) {
                    power += config.stats.power * count * multiplier;
                }
                if (config.stats.defense) {
                    defense += config.stats.defense * count * multiplier;
                }
            } else if (config.basePower !== undefined && config.effect) {
                // 旧版格式
                if (config.effect === 'power') {
                    power += config.basePower * count * multiplier;
                } else if (config.effect === 'defense') {
                    defense += config.basePower * count * multiplier;
                }
            }
        }
        const setBonus = this._getSetBonus(gameState);
        power += setBonus.power || 0;
        defense += setBonus.defense || 0;
        return { power: Math.floor(power), defense: Math.floor(defense) };
    },

    // 内部：计算套装加成
    _getSetBonus: function(gameState) {
        const bonus = { power: 0, defense: 0, gold: 0, speed: 0, dropRate: 0, hp: 0, hpRegen: 0, ticketBonus: 0, critRate: 0, critDamage: 0, expBonus: 0 };
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

    // 公共方法：获取玩家已激活的套装列表
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

    // 公共方法：获取玩家卡组图鉴进度
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

    // 公共方法：升级卡牌
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

    // 公共方法：批量升级卡牌（消耗多张提升更多等级）
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
