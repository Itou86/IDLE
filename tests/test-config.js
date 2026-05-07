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
                           (set.bonus.gold || 0) > 0;
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
            'gold_total', 'gacha_count', 'battle_win', 'stage',
            'card_count', 'card_unique', 'card_all', 'card_level',
            'rarity_obtain', 'set_active', 'set_active_count',
            'has_cards', 'set_active_specific',
            'gacha_streak_no_rare', 'gacha_streak_no_ssr', 'gacha_single_ssr',
            'speedrun_stage5', 'hoarder', 'gamble',
            'lose_streak', 'underdog_win', 'click_spam', 'midnight_login'
        ];
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            Assert.includes(validTypes, ach.condition.type, `${ach.id} 的条件类型应合法`);
        }
    });

    test('achievements: 奖励数值非负', () => {
        for (const ach of ACHIEVEMENT_CONFIG.list) {
            if (ach.reward.gold !== undefined) {
                Assert.greaterThanOrEqual(ach.reward.gold, 0, `${ach.id} 金币奖励应非负`);
            }
            if (ach.reward.tickets !== undefined) {
                Assert.greaterThanOrEqual(ach.reward.tickets, 0, `${ach.id} 券奖励应非负`);
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
        const goldAchs = ACHIEVEMENT_CONFIG.list
            .filter(a => a.condition.type === 'gold_total')
            .sort((a, b) => a.condition.value - b.condition.value);
        Assert.greaterThan(goldAchs.length, 1, '应有多个金币成就');
        for (let i = 1; i < goldAchs.length; i++) {
            Assert.greaterThan(goldAchs[i].condition.value, goldAchs[i-1].condition.value,
                '金币成就目标应递增');
        }
    });
});

TestRunner.suite('📦 配置数据 - Stages', (test) => {

    test('stages: 配置对象存在', () => {
        Assert.exists(STAGE_CONFIG, 'STAGE_CONFIG 应存在');
    });

    test('stages: 有预设关卡', () => {
        Assert.exists(STAGE_CONFIG.preset, 'preset 应存在');
        Assert.greaterThan(STAGE_CONFIG.preset.length, 0, '应有预设关卡');
    });

    test('stages: 预设关卡字段完整', () => {
        for (const stage of STAGE_CONFIG.preset) {
            Assert.exists(stage.stage, '关卡应有stage编号');
            Assert.exists(stage.enemyPower, '关卡应有enemyPower');
            Assert.exists(stage.reward, '关卡应有reward');
            Assert.exists(stage.reward.gold, '奖励应有gold');
        }
    });

    test('stages: 预设关卡编号连续', () => {
        for (let i = 0; i < STAGE_CONFIG.preset.length; i++) {
            Assert.equal(STAGE_CONFIG.preset[i].stage, i + 1, `预设关卡应连续编号`);
        }
    });

    test('stages: 敌人战力递增', () => {
        for (let i = 1; i < STAGE_CONFIG.preset.length; i++) {
            Assert.greaterThan(
                STAGE_CONFIG.preset[i].enemyPower,
                STAGE_CONFIG.preset[i-1].enemyPower,
                '敌人战力应递增'
            );
        }
    });

    test('stages: 奖励递增', () => {
        for (let i = 1; i < STAGE_CONFIG.preset.length; i++) {
            Assert.greaterThanOrEqual(
                STAGE_CONFIG.preset[i].reward.gold,
                STAGE_CONFIG.preset[i-1].reward.gold,
                '金币奖励应递增'
            );
        }
    });

    test('stages: BOSS关卡配置正确', () => {
        const bossStages = STAGE_CONFIG.preset.filter(s => s.isBoss);
        for (const boss of bossStages) {
            Assert.exists(boss.bossMultiplier, 'BOSS关卡应有bossMultiplier');
            Assert.greaterThan(boss.bossMultiplier, 1.0, 'BOSS倍率应大于1');
        }
    });

    test('stages: 生成函数存在', () => {
        Assert.type(STAGE_CONFIG.generate, 'function', '应有generate函数');
    });

    test('stages: 生成关卡战力合理', () => {
        const stage50 = STAGE_CONFIG.generate(50);
        Assert.exists(stage50.stage, '生成关卡应有编号');
        Assert.exists(stage50.enemyPower, '生成关卡应有enemyPower');
        Assert.greaterThan(stage50.enemyPower, 0, '敌人战力应大于0');
    });

    test('stages: getStage函数统一访问', () => {
        const preset = STAGE_CONFIG.getStage(1);
        Assert.equal(preset.stage, 1, 'getStage(1)应返回第1关');

        const generated = STAGE_CONFIG.getStage(100);
        Assert.equal(generated.stage, 100, 'getStage(100)应返回第100关');
        Assert.greaterThan(generated.enemyPower, 0, '第100关应有敌人战力');
    });

    test('stages: 高关卡战力增长合理', () => {
        const s100 = STAGE_CONFIG.getStage(100);
        const s200 = STAGE_CONFIG.getStage(200);
        Assert.greaterThan(s200.enemyPower, s100.enemyPower, '第200关应强于第100关');
        // 增长不应过于夸张 - 1.15^100 ≈ 1000倍，所以放宽到2000000倍
        Assert.lessThan(s200.enemyPower / s100.enemyPower, 2000000, '200关战力不应超过100关2000000倍');
    });
});
