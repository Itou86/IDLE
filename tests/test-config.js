/* ===== 配置数据测试 ===== */
TestRunner.suite('📦 配置数据 - Cards', (test) => {

    test('cards: 配置对象存在', () => {
        Assert.exists(CARD_CONFIG, 'CARD_CONFIG 应存在');
    });

    test('cards: 概率配置完整', () => {
        Assert.exists(CARD_CONFIG.rates, 'rates 应存在');
        Assert.equal(CARD_CONFIG.rates.N, 0.60, 'N概率应为60%');
        Assert.equal(CARD_CONFIG.rates.R, 0.25, 'R概率应为25%');
        Assert.equal(CARD_CONFIG.rates.SR, 0.10, 'SR概率应为10%');
        Assert.equal(CARD_CONFIG.rates.SSR, 0.05, 'SSR概率应为5%');
    });

    test('cards: 概率总和为100%', () => {
        const total = CARD_CONFIG.rates.N + CARD_CONFIG.rates.R + CARD_CONFIG.rates.SR + CARD_CONFIG.rates.SSR;
        Assert.approx(total, 1.0, 0.0001, '概率总和应为1.0');
    });

    test('cards: 稀有度样式配置完整', () => {
        Assert.exists(CARD_CONFIG.rarityStyle, 'rarityStyle 应存在');
        Assert.exists(CARD_CONFIG.rarityStyle.N, 'N样式应存在');
        Assert.exists(CARD_CONFIG.rarityStyle.R, 'R样式应存在');
        Assert.exists(CARD_CONFIG.rarityStyle.SR, 'SR样式应存在');
        Assert.exists(CARD_CONFIG.rarityStyle.SSR, 'SSR样式应存在');
    });

    test('cards: 每个稀有度都有颜色和名称', () => {
        for (const [rarity, style] of Object.entries(CARD_CONFIG.rarityStyle)) {
            Assert.exists(style.color, `${rarity} 应有颜色`);
            Assert.exists(style.name, `${rarity} 应有名称`);
            Assert.type(style.color, 'string');
            Assert.type(style.name, 'string');
        }
    });

    test('cards: 卡牌池非空', () => {
        Assert.greaterThan(CARD_CONFIG.pool.length, 0, '卡牌池应非空');
    });

    test('cards: 每张卡都有必需字段', () => {
        for (const card of CARD_CONFIG.pool) {
            Assert.exists(card.id, `卡牌应有id`);
            Assert.exists(card.name, `卡牌应有name`);
            Assert.exists(card.rarity, `卡牌应有rarity`);
            // 新格式用 stats，旧格式用 basePower + effect
            const hasStats = card.stats && Object.keys(card.stats).length > 0;
            const hasOldFormat = card.basePower !== undefined && card.effect !== undefined;
            // 羁绊素材卡允许空 stats
            const isMaterial = card.desc && card.desc.includes('羁绊');
            Assert.true(hasStats || hasOldFormat || isMaterial, `卡牌应有stats或basePower+effect: ${card.name}`);
            Assert.exists(card.desc, `卡牌应有desc`);
        }
    });

    test('cards: 卡牌ID唯一', () => {
        const ids = new Set();
        for (const card of CARD_CONFIG.pool) {
            Assert.false(ids.has(card.id), `ID ${card.id} 应唯一`);
            ids.add(card.id);
        }
    });

    test('cards: 稀有度值合法', () => {
        const validRarities = ['N', 'R', 'SR', 'SSR'];
        for (const card of CARD_CONFIG.pool) {
            Assert.includes(validRarities, card.rarity, `${card.name} 的稀有度应合法`);
        }
    });

    test('cards: 基础战力为正数', () => {
        for (const card of CARD_CONFIG.pool) {
            // 新格式：取 stats 中的最大值；旧格式：取 basePower
            let power = 0;
            if (card.stats) {
                const values = Object.values(card.stats).filter(v => typeof v === 'number');
                power = values.length > 0 ? Math.max(...values) : 0;
            } else if (card.basePower) {
                power = card.basePower;
            }
            // 羁绊素材卡允许0战力
            if (power === 0 && card.desc && card.desc.includes('羁绊')) {
                continue;
            }
            Assert.greaterThan(power, 0, `${card.name} 战力应大于0`);
        }
    });

    test('cards: 各稀有度都有卡牌', () => {
        const counts = { N: 0, R: 0, SR: 0, SSR: 0 };
        for (const card of CARD_CONFIG.pool) {
            counts[card.rarity]++;
        }
        Assert.greaterThan(counts.N, 0, '应有N卡');
        Assert.greaterThan(counts.R, 0, '应有R卡');
        Assert.greaterThan(counts.SR, 0, '应有SR卡');
        Assert.greaterThan(counts.SSR, 0, '应有SSR卡');
    });

    test('cards: SSR卡牌战力显著高于N卡', () => {
        const nCards = CARD_CONFIG.pool.filter(c => c.rarity === 'N');
        const ssrCards = CARD_CONFIG.pool.filter(c => c.rarity === 'SSR');
        // 新格式取 stats.power，旧格式取 basePower
        const getPower = (c) => (c.stats && c.stats.power) || c.basePower || 0;
        const nPowers = nCards.map(getPower).filter(p => p > 0);
        const ssrPowers = ssrCards.map(getPower).filter(p => p > 0);
        const maxN = Math.max(...nPowers);
        const minSSR = Math.min(...ssrPowers);
        Assert.greaterThan(minSSR, maxN, 'SSR最低战力应高于N卡最高战力');
    });

    test('cards: 套装配置非空', () => {
        Assert.exists(CARD_CONFIG.sets, 'sets 应存在');
        Assert.greaterThan(CARD_CONFIG.sets.length, 0, '应有至少一个套装');
    });

    test('cards: 套装引用的卡牌ID存在', () => {
        const allIds = new Set(CARD_CONFIG.pool.map(c => c.id));
        for (const set of CARD_CONFIG.sets) {
            Assert.exists(set.ids, '套装应有ids');
            Assert.exists(set.name, '套装应有name');
            Assert.exists(set.bonus, '套装应有bonus');
            for (const id of set.ids) {
                Assert.true(allIds.has(id), `套装引用的卡牌ID ${id} 应存在`);
            }
        }
    });

    test('cards: 套装有实际加成', () => {
        for (const set of CARD_CONFIG.sets) {
            const hasBonus = (set.bonus.power || 0) > 0 ||
                           (set.bonus.defense || 0) > 0 ||
                           (set.bonus.points || 0) > 0;
            Assert.true(hasBonus, `套装 ${set.name} 应有实际加成`);
        }
    });
});

TestRunner.suite('📦 配置数据 - Achievements', (test) => {

    test('achievements: 配置对象存在', () => {
        Assert.exists(ACHIEVEMENT_CONFIG, 'ACHIEVEMENT_CONFIG 应存在');
        Assert.exists(ACHIEVEMENT_CONFIG.list, 'list 应存在');
    });

    test('achievements: 成就列表非空', () => {
        Assert.greaterThan(ACHIEVEMENT_CONFIG.list.length, 0, '应有至少一个成就');
    });

    test('achievements: 每个成就都有必需字段', () => {
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            Assert.exists(ach.id, '成就应有id');
            Assert.exists(ach.name, '成就应有name');
            Assert.exists(ach.desc, '成就应有desc');
            Assert.exists(ach.condition, '成就应有condition');
            Assert.exists(ach.reward, '成就应有reward');
            Assert.type(ach.hidden, 'boolean', 'hidden应为布尔值');
        }
    });

    test('achievements: 成就ID唯一', () => {
        const ids = new Set();
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            Assert.false(ids.has(ach.id), `成就ID ${ach.id} 应唯一`);
            ids.add(ach.id);
        }
    });

    test('achievements: 条件类型合法', () => {
        const validTypes = [
            'points_total', 'gacha_count', 'battle_win', 'stage',
            'card_count', 'card_unique', 'card_all', 'card_level',
            'rarity_obtain', 'set_active', 'set_active_count',
            'has_cards', 'set_active_specific',
            'gacha_streak_no_rare', 'gacha_streak_no_ssr', 'gacha_single_ssr',
            'speedrun_stage5', 'hoarder', 'gamble',
            'lose_streak', 'underdog_win', 'click_spam', 'midnight_login',
            'win_streak', 'world_unlock', 'battle_drop_ssr', 'gacha_single_streak',
            'gacha_total_no_ssr', 'has_all_rarity', 'exact_points',
            'no_gacha_hour', 'first_battle_lose', 'exact_power_win',
            'low_power_stage10', 'unlucky_time'
        ];
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            Assert.includes(validTypes, ach.condition.type, `${ach.id} 的条件类型应合法`);
        }
    });

    test('achievements: 奖励数值非负', () => {
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            if (ach.reward.points !== undefined) {
                Assert.greaterThanOrEqual(ach.reward.points, 0, `${ach.id} 系统点奖励应非负`);
            }
            if (ach.reward.shards !== undefined) {
                Assert.greaterThanOrEqual(ach.reward.shards, 0, `${ach.id} 碎片奖励应非负`);
            }
            if (ach.reward.powerBonus !== undefined) {
                Assert.greaterThanOrEqual(ach.reward.powerBonus, 0, `${ach.id} 战力加成应非负`);
            }
        }
    });

    test('achievements: 有隐藏成就', () => {
        const hiddenCount = ACHIEVEMENT_CONFIG.list.filter(a => a.hidden).length;
        Assert.greaterThan(hiddenCount, 0, '应有隐藏成就');
    });

    test('achievements: 有非隐藏成就', () => {
        const visibleCount = ACHIEVEMENT_CONFIG.list.filter(a => !a.hidden).length;
        Assert.greaterThan(visibleCount, 0, '应有非隐藏成就');
    });

    test('achievements: 数值成就有递增梯度', () => {
        const pointsAchs = ACHIEVEMENT_CONFIG.list
            .filter(a => a.condition.type === 'points_total')
            .sort((a, b) => a.condition.value - b.condition.value);
        Assert.greaterThan(pointsAchs.length, 1, '应有多个系统点成就');
        for (let i = 1; i < pointsAchs.length; i++) {
            Assert.greaterThan(pointsAchs[i].condition.value, pointsAchs[i-1].condition.value,
                '系统点成就目标应递增');
        }
    });
});

TestRunner.suite('📦 配置数据 - Stages', (test) => {

    test('stages: 配置对象存在', () => {
        Assert.exists(STAGE_CONFIG, 'STAGE_CONFIG 应存在');
    });

    test('stages: 世界配置正确', () => {
        Assert.equal(STAGE_CONFIG.SUB_STAGES_PER_WORLD, 6, '每个世界应有6关');
        Assert.equal(STAGE_CONFIG.BOSS_STAGE, 6, '第6关应为BOSS');
        Assert.exists(STAGE_CONFIG.getWorldName, '应有getWorldName方法');
    });

    test('stages: 世界内敌人战力递增', () => {
        const w1s1 = STAGE_CONFIG.generate(1, 1);
        const w1s2 = STAGE_CONFIG.generate(1, 2);
        const w1s3 = STAGE_CONFIG.generate(1, 3);
        Assert.greaterThan(w1s2.enemyPower, w1s1.enemyPower, '同世界内战力应递增');
        Assert.greaterThan(w1s3.enemyPower, w1s2.enemyPower, '同世界内战力应递增');
    });

    test('stages: 世界内奖励递增', () => {
        const s1 = STAGE_CONFIG.generate(1, 1);
        const s2 = STAGE_CONFIG.generate(1, 2);
        Assert.greaterThanOrEqual(s2.reward.points, s1.reward.points, '系统点奖励应递增');
    });

    test('stages: BOSS关卡配置正确', () => {
        const boss = STAGE_CONFIG.generate(1, 6);
        Assert.equal(boss.isBoss, true, '第6关应为BOSS');
        Assert.exists(boss.bossMultiplier, 'BOSS关卡应有bossMultiplier');
        Assert.greaterThan(boss.bossMultiplier, 1.0, 'BOSS倍率应大于1');
    });

    test('stages: 生成函数存在', () => {
        Assert.type(STAGE_CONFIG.generate, 'function', '应有generate函数');
    });

    test('stages: 生成关卡战力合理', () => {
        const stage = STAGE_CONFIG.generate(1, 3);
        Assert.exists(stage.world, '生成关卡应有world');
        Assert.exists(stage.subStage, '生成关卡应有subStage');
        Assert.exists(stage.enemyPower, '生成关卡应有enemyPower');
        Assert.greaterThan(stage.enemyPower, 0, '敌人战力应大于0');
    });

    test('stages: 跨世界难度衔接合理', () => {
        const w1s4 = STAGE_CONFIG.generate(1, 4);
        const w2s1 = STAGE_CONFIG.generate(2, 1);
        // 世界2第1关 ≈ 世界1第4关
        const ratio = Math.max(w2s1.enemyPower, w1s4.enemyPower) / Math.min(w2s1.enemyPower, w1s4.enemyPower);
        Assert.lessThan(ratio, 2.0, '相邻世界难度衔接不应跳跃过大');
    });

    test('stages: 高关卡战力增长合理', () => {
        const s50 = STAGE_CONFIG.generate(9, 2);  // 约等于原第50关
        const s100 = STAGE_CONFIG.generate(17, 4); // 约等于原第100关
        Assert.greaterThan(s100.enemyPower, s50.enemyPower, '高关卡应更强');
    });

    test('stages: 世界解锁条件', () => {
        Assert.equal(STAGE_CONFIG.UNLOCK_NEXT_WORLD_AT, 5, '通关第5关可进入下一世界');
        Assert.equal(STAGE_CONFIG.canUnlockNextWorld({ world: 1, subStage: 1, worldProgress: { '1': 3 } }), false, '第3关不能解锁');
        Assert.equal(STAGE_CONFIG.canUnlockNextWorld({ world: 1, subStage: 1, worldProgress: { '1': 5 } }), true, '第5关可解锁');
    });
});

TestRunner.suite('📦 配置数据 - 世界卡组', (test) => {

    test('worlds: 至少3个世界', () => {
        Assert.greaterThanOrEqual(CARD_CONFIG.worlds.length, 3, '应有至少3个世界');
    });

    test('worlds: 每个世界都有必需字段', () => {
        for (const world of CARD_CONFIG.worlds) {
            Assert.exists(world.id, '世界应有id');
            Assert.exists(world.name, '世界应有name');
            Assert.exists(world.description, '世界应有description');
            Assert.exists(world.cardIds, '世界应有cardIds');
            Assert.greaterThan(world.cardIds.length, 0, '世界应有至少一张卡牌');
            Assert.exists(world.sets, '世界应有sets');
            Assert.exists(world.completionBonus, '世界应有completionBonus');
        }
    });

    test('worlds: 世界1名称正确', () => {
        const w1 = CARD_CONFIG.worlds.find(w => w.id === 1);
        Assert.equal(w1.name, '生化危机1', '世界1应命名为生化危机1');
    });

    test('worlds: 世界2和世界3存在', () => {
        const w2 = CARD_CONFIG.worlds.find(w => w.id === 2);
        const w3 = CARD_CONFIG.worlds.find(w => w.id === 3);
        Assert.exists(w2, '世界2应存在');
        Assert.exists(w3, '世界3应存在');
        Assert.equal(w2.name, '哈利波特与魔法石', '世界2应命名为哈利波特与魔法石');
        Assert.equal(w3.name, '进击的巨人', '世界3应命名为进击的巨人');
    });

    test('worlds: 世界cardIds引用都存在于pool', () => {
        const allIds = new Set(CARD_CONFIG.pool.map(c => c.id));
        for (const world of CARD_CONFIG.worlds) {
            for (const cardId of world.cardIds) {
                Assert.true(allIds.has(cardId), `世界${world.name}引用的卡牌ID ${cardId} 应存在于pool`);
            }
        }
    });

    test('worlds: 每张卡牌都有worldId', () => {
        for (const card of CARD_CONFIG.pool) {
            Assert.exists(card.worldId, `卡牌 ${card.name} 应有worldId`);
        }
    });

    test('worlds: 世界2卡牌worldId正确', () => {
        const w2 = CARD_CONFIG.worlds.find(w => w.id === 2);
        for (const cardId of w2.cardIds) {
            const card = CARD_CONFIG.pool.find(c => c.id === cardId);
            Assert.equal(card.worldId, 2, `卡牌 ${card.name} 的worldId应为2`);
        }
    });

    test('worlds: 世界3卡牌worldId正确', () => {
        const w3 = CARD_CONFIG.worlds.find(w => w.id === 3);
        for (const cardId of w3.cardIds) {
            const card = CARD_CONFIG.pool.find(c => c.id === cardId);
            Assert.equal(card.worldId, 3, `卡牌 ${card.name} 的worldId应为3`);
        }
    });

    test('worlds: 世界套装引用的卡牌ID存在', () => {
        const allIds = new Set(CARD_CONFIG.pool.map(c => c.id));
        for (const world of CARD_CONFIG.worlds) {
            for (const set of world.sets || []) {
                Assert.exists(set.name, '套装应有name');
                for (const id of set.ids) {
                    Assert.true(allIds.has(id), `世界${world.name}的套装${set.name}引用的卡牌ID ${id} 应存在`);
                }
            }
        }
    });

    test('cards: 新增卡牌数量正确', () => {
        const w2Cards = CARD_CONFIG.pool.filter(c => c.worldId === 2);
        const w3Cards = CARD_CONFIG.pool.filter(c => c.worldId === 3);
        Assert.equal(w2Cards.length, 9, '世界2应有9张卡');
        Assert.equal(w3Cards.length, 9, '世界3应有9张卡');
    });

    test('cards: 世界2和世界3有SSR卡', () => {
        const w2SSR = CARD_CONFIG.pool.filter(c => c.worldId === 2 && c.rarity === 'SSR');
        const w3SSR = CARD_CONFIG.pool.filter(c => c.worldId === 3 && c.rarity === 'SSR');
        Assert.equal(w2SSR.length, 1, '世界2应有1张SSR');
        Assert.equal(w3SSR.length, 1, '世界3应有1张SSR');
    });

    test('cards: 世界2和世界3有SR卡', () => {
        const w2SR = CARD_CONFIG.pool.filter(c => c.worldId === 2 && c.rarity === 'SR');
        const w3SR = CARD_CONFIG.pool.filter(c => c.worldId === 3 && c.rarity === 'SR');
        Assert.equal(w2SR.length, 2, '世界2应有2张SR');
        Assert.equal(w3SR.length, 2, '世界3应有2张SR');
    });

    test('stages: 新世界名称正确', () => {
        Assert.equal(STAGE_CONFIG.getWorldName(2), '哈利波特与魔法石', '世界2名称应为哈利波特与魔法石');
        Assert.equal(STAGE_CONFIG.getWorldName(3), '进击的巨人', '世界3名称应为进击的巨人');
    });
});
