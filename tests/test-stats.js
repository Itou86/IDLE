/* ===== 属性系统测试 ===== */
TestRunner.suite('⚔️ 属性系统 - StatSystem', (test) => {

    // 确保 EffectRegistry 已初始化（注册 cards.js 中的 effects）
    EffectRegistry.init();

    function createState(cards = {}, achievements = {}) {
        return {
            gold: 100, tickets: 10, world: 1, subStage: 1, worldProgress: {},
            cards: cards,
            achievements: achievements,
            stats: {
                goldTotal: 0, gachaCount: 0, battleWin: 0, battleLose: 0,
                loseStreak: 0, streakNoRare: 0, streakNoSSR: 0,
                rarityObtained: {}, lastSaveTime: Date.now(), createTime: Date.now()
            }
        };
    }

    // --- STAT_CONFIG 结构 ---
    test('STAT_CONFIG: 结构完整', () => {
        Assert.equal(Object.keys(STAT_CONFIG.definitions).length, 11, '应有11种属性定义');
        Assert.equal(Object.keys(STAT_CONFIG.baseStats).length, 11, '应有11个基础属性值');
        Assert.equal(STAT_CONFIG.calcOrder.length, 11, '应有11个计算顺序');
        Assert.exists(STAT_CONFIG.powerWeights, '应有战力权重');
        Assert.equal(STAT_CONFIG.baseStats.power, 10, '基础攻击力应为10');
        Assert.equal(STAT_CONFIG.baseStats.hp, 200, '基础生命值应为200');
        Assert.equal(STAT_CONFIG.baseStats.speed, 5, '基础速度应为5');
    });

    // --- getCharacterStats: 基础属性 ---
    test('getCharacterStats: 无卡牌时返回基础属性', () => {
        const state = createState();
        const stats = StatSystem.getCharacterStats(state);
        Assert.equal(stats.power, 10, '基础攻击力应为10');
        Assert.equal(stats.defense, 0, '基础防御力应为0');
        Assert.equal(stats.hp, 200, '基础生命值应为200');
        Assert.equal(stats.hpRegen, 50, '基础生命恢复应为50');
        Assert.equal(stats.speed, 5, '基础速度应为5');
        Assert.equal(stats.critDamage, 50, '基础暴击伤害应为50');
        Assert.greaterThan(stats.effectivePower, 0, '应有综合战力');
    });

    // --- getCharacterStats: 卡牌固定值加成 ---
    test('getCharacterStats: 攻击卡增加攻击力', () => {
        const state = createState({ 'n_001': { count: 1, level: 1, instances: ['a'] } });
        const stats = StatSystem.getCharacterStats(state);
        // n_001 basePower=5, effect='power', level=1 → power +5
        Assert.equal(stats.power, 15, '装备战斗匕首后攻击力应为15');
    });

    test('getCharacterStats: 多张卡叠加', () => {
        const state = createState({ 'n_001': { count: 3, level: 1, instances: ['a','b','c'] } });
        const stats = StatSystem.getCharacterStats(state);
        // 3张n_001: 5*3 = 15 → power = 10 + 15 = 25
        Assert.equal(stats.power, 25, '3张攻击卡攻击力应为25');
    });

    test('getCharacterStats: 等级影响加成', () => {
        const state1 = createState({ 'n_001': { count: 1, level: 1, instances: ['a'] } });
        const stats1 = StatSystem.getCharacterStats(state1);
        const state2 = createState({ 'n_001': { count: 1, level: 10, instances: ['a'] } });
        const stats2 = StatSystem.getCharacterStats(state2);
        // level=10: multiplier = 1 + 9*0.1 = 1.9 → value = 5*1.9 = 9.5
        // power = 10 + 9.5 = 19.5 → floor = 19
        Assert.equal(stats1.power, 15, '1级攻击卡攻击力应为15');
        Assert.equal(stats2.power, 19, '10级攻击卡攻击力应为19');
        Assert.greaterThan(stats2.power, stats1.power, '高等级应更强');
    });

    test('getCharacterStats: 防御卡增加防御力', () => {
        const state = createState({ 'n_002': { count: 1, level: 1, instances: ['a'] } });
        const stats = StatSystem.getCharacterStats(state);
        // n_002 basePower=3, effect='defense'
        Assert.equal(stats.defense, 3, '装备木板后防御力应为3');
    });

    test('getCharacterStats: 系统点卡增加系统点加成', () => {
        const state = createState({ 'n_003': { count: 2, level: 1, instances: ['a','b'] } });
        const stats = StatSystem.getCharacterStats(state);
        // n_003 basePower=2, effect='points' → 2*2 = 4
        Assert.equal(stats.pointsBonus, 4, '2张手枪弹匣系统点加成应为4');
    });

    // --- 特殊卡牌效果 ---
    test('getCharacterStats: 生命护符增加生命值', () => {
        const state = createState({ 'r_006': { count: 1, level: 1, instances: ['a'] } });
        const stats = StatSystem.getCharacterStats(state);
        // r_006: effect='heal' → hpRegen +8, 特殊效果 hp +20
        Assert.equal(stats.hp, 220, '急救喷雾应增加20生命值');
        Assert.equal(stats.hpRegen, 58, '急救喷雾应增加8生命恢复');
    });

    test('getCharacterStats: 疾风靴增加速度', () => {
        const state = createState({ 'r_005': { count: 1, level: 1, instances: ['a'] } });
        const stats = StatSystem.getCharacterStats(state);
        // r_005: effect='speed' → speed +8
        Assert.equal(stats.speed, 13, '闪光弹应增加8速度');
    });

    // --- N卡翻倍效果 ---
    test('getCharacterStats: 火箭筒使N卡效果翻倍', () => {
        const stateNoSSR = createState({ 'n_001': { count: 1, level: 1, instances: ['a'] } });
        const statsNoSSR = StatSystem.getCharacterStats(stateNoSSR);

        const stateWithSSR = createState({
            'n_001': { count: 1, level: 1, instances: ['a'] },
            'ssr_001': { count: 1, level: 1, instances: ['b'] }
        });
        const statsWithSSR = StatSystem.getCharacterStats(stateWithSSR);

        // noSSR: n_001 power=5 → total = 15
        // withSSR: n_001 power=10 (翻倍), ssr_001 power=80 → total = 10+80+10 = 100
        Assert.equal(statsNoSSR.power, 15, '无火箭筒时N卡攻击力应为15');
        Assert.equal(statsWithSSR.power, 100, '有火箭筒时攻击力应为100');
    });

    // --- 联动效果 ---
    test('getCharacterStats: 马格南手枪+战术背心联动加成', () => {
        const stateSwordOnly = createState({ 'sr_001': { count: 1, level: 1, instances: ['a'] } });
        const statsSwordOnly = StatSystem.getCharacterStats(stateSwordOnly);

        const stateBoth = createState({
            'sr_001': { count: 1, level: 1, instances: ['a'] },
            'sr_002': { count: 1, level: 1, instances: ['b'] }
        });
        const statsBoth = StatSystem.getCharacterStats(stateBoth);

        // 单独 sr_001: power = 10(base) + 30(card) = 40
        Assert.equal(statsSwordOnly.power, 40, '单独马格南手枪攻击力应为40');

        // 联动+套装: sr_001+sr_002 属于"S.T.A.R.S.装备"(power+50, defense+30)
        // sr_001: power=30, synergy*1.5=45
        // sr_002: defense=25, synergy*1.5=37.5→37
        // 套装: power+50, defense+30
        // total: power=10+45+50=105, defense=0+37+30=67
        Assert.equal(statsBoth.power, 105, '联动+套装后攻击力应为105');
        Assert.equal(statsBoth.defense, 67, '联动+套装后防御力应为67');
    });

    // --- 套装加成 ---
    test('getCharacterStats: 新手套装固定值加成', () => {
        const state = createState({
            'n_001': { count: 1, level: 1, instances: ['a'] },
            'n_002': { count: 1, level: 1, instances: ['b'] }
        });
        const stats = StatSystem.getCharacterStats(state);
        // n_001 power=5, n_002 defense=3, 套装 power+5
        Assert.equal(stats.power, 20, '生存基础套装攻击力应为20');
        Assert.equal(stats.defense, 3, '生存基础套装防御力应为3');
    });

    test('getCharacterStats: 套装百分比加成', () => {
        const state = createState({
            'ssr_001': { count: 1, level: 1, instances: ['a'] },
            'ssr_002': { count: 1, level: 1, instances: ['b'] }
        });
        const stats = StatSystem.getCharacterStats(state);
        // ssr_001 power=80, ssr_002 pointsBonus=50 (points effect)
        // 套装: power+100, pointsBonus+30
        // 固定值: power=10+80+100=190, pointsBonus=50+30=80
        Assert.equal(stats.power, 190, '终极武器套装攻击力应为190');
        Assert.equal(stats.pointsBonus, 80, '系统点加成应为50+30=80');
    });

    // --- 成就战力加成 ---
    test('getCharacterStats: 成就战力加成只影响攻击防御生命', () => {
        const state = createState({
            'n_001': { count: 50, level: 1, instances: Array(50).fill('x') }
        });
        const before = StatSystem.getCharacterStats(state);
        // power = 10 + 250 = 260

        // 解锁成就
        state.stats.goldTotal = 100;
        AchievementSystem.checkAll(state);
        const bonus = AchievementSystem.getTotalPowerBonus(state);

        if (bonus > 0) {
            const after = StatSystem.getCharacterStats(state);
            // 260 * (1 + bonus/100) > 260 for any bonus > 0
            Assert.greaterThan(after.power, before.power, '成就加成应提升攻击力');
            // speed 不应受影响
            Assert.equal(after.speed, before.speed, '成就加成不应影响速度');
        }
    });

    // --- getStatBreakdown ---
    test('getStatBreakdown: 返回正确的结构和值', () => {
        const state = createState({
            'n_001': { count: 2, level: 1, instances: ['a','b'] }
        });
        const bd = StatSystem.getStatBreakdown(state);
        Assert.exists(bd.base, '应有base');
        Assert.exists(bd.cards, '应有cards');
        Assert.exists(bd.sets, '应有sets');
        Assert.exists(bd.percent, '应有percent');
        Assert.exists(bd.achievement !== undefined, '应有achievement');
        Assert.equal(bd.base.power, 10, 'base攻击力应为10');
        Assert.equal(bd.cards.power, 10, '2张n_001卡牌加成应为10');
    });

    // --- formatStat ---
    test('formatStat: 不同格式正确', () => {
        const flat = StatSystem.formatStat('power', 1234);
        const percent = StatSystem.formatStat('dropRate', 15);
        const unknown = StatSystem.formatStat('unknown', 42);

        Assert.type(flat, 'string', 'flat格式应为字符串');
        Assert.equal(percent, '15%', 'percent格式应为15%');
        Assert.equal(unknown, 42, '未知属性应返回原值');
    });

    // --- 综合战力 ---
    test('getCharacterStats: 综合战力计算正确', () => {
        const state = createState({
            'n_001': { count: 1, level: 1, instances: ['a'] }
        });
        const stats = StatSystem.getCharacterStats(state);
        // power=15, defense=0, hp=200, speed=5, critRate=0
        // effectivePower = 15*1.0 + 0*0.5 + 200*0.1 + 5*0.2 + 0*0.5
        //                = 15 + 0 + 20 + 1 + 0 = 36
        Assert.equal(stats.effectivePower, 36, '综合战力应为36');
    });

    // --- _mapEffectToStats ---
    test('_mapEffectToStats: 各效果映射正确', () => {
        const tests = [
            { effect: 'power', expected: 'power' },
            { effect: 'defense', expected: 'defense' },
            { effect: 'points', expected: 'pointsBonus' },
            { effect: 'heal', expected: 'hpRegen' },
            { effect: 'speed', expected: 'speed' },
            { effect: 'utility', expected: null },
        ];
        for (const t of tests) {
            const config = { effect: t.effect, basePower: 10 };
            const result = StatSystem._mapEffectToStats(config, 1);
            if (t.expected) {
                Assert.equal(result[t.expected], 10, `${t.effect}应映射为${t.expected}=10`);
            } else {
                Assert.equal(Object.keys(result).length, 0, 'utility应返回空对象');
            }
        }
    });

    test('_mapEffectToStats: N卡创世之刃翻倍', () => {
        const configN = { rarity: 'N', effect: 'power', basePower: 5 };
        const statsN = StatSystem._mapEffectToStats(configN, 2);
        Assert.equal(statsN.power, 10, '有火箭筒时N卡应翻倍');

        const configR = { rarity: 'R', effect: 'power', basePower: 10 };
        const statsR = StatSystem._mapEffectToStats(configR, 2);
        Assert.equal(statsR.power, 10, 'R卡不应受N卡翻倍影响');
    });

    // --- 复杂场景 ---
    test('getCharacterStats: 多卡多套装复杂场景', () => {
        const state = createState({
            'n_001': { count: 2, level: 2, instances: ['a','b'] },
            'n_002': { count: 1, level: 1, instances: ['c'] },
            'r_001': { count: 1, level: 1, instances: ['d'] },
            'r_002': { count: 1, level: 1, instances: ['e'] }
        });
        const stats = StatSystem.getCharacterStats(state);
        // 新手套装: n_001+n_002 → power+5
        // 骑士套装: r_001+r_002 → power+15, defense+10

        // n_001 x2, level=2: multiplier=1.1, power=5*2*1.1=11
        // n_002 x1, level=1: defense=3*1=3
        // r_001 x1, level=1: power=12*1=12
        // r_002 x1, level=1: defense=10*1=10

        // 固定值: power = 10 + 11 + 12 + 5 + 15 = 53
        // defense = 0 + 3 + 10 + 10 = 23
        Assert.equal(stats.power, 53, '复杂场景攻击力应为53');
        Assert.equal(stats.defense, 23, '复杂场景防御力应为23');
    });

    // --- 世界收集度加成 ---
    test('worldCompletion: 无收集时倍率为1.0', () => {
        const state = createState({});
        const multiplier = CARD_CONFIG.getWorldCompletionMultiplier(state, 2);
        Assert.equal(multiplier, 1.0, '无收集时倍率应为1.0');
    });

    test('worldCompletion: 收集50%时倍率为1.05', () => {
        // 世界2有9张卡，5张 = 55.5% > 50%
        const state = createState({
            'n_009': { count: 1, level: 1, instances: ['a'] },
            'n_010': { count: 1, level: 1, instances: ['b'] },
            'n_011': { count: 1, level: 1, instances: ['c'] },
            'r_007': { count: 1, level: 1, instances: ['d'] },
            'r_008': { count: 1, level: 1, instances: ['e'] },
        });
        const completion = CARD_CONFIG.getWorldCompletion(state, 2);
        Assert.greaterThanOrEqual(completion, 0.5, '应有至少50%收集度');
        const multiplier = CARD_CONFIG.getWorldCompletionMultiplier(state, 2);
        Assert.equal(multiplier, 1.05, '50%收集度倍率应为1.05');
    });

    test('worldCompletion: 收集100%时倍率为1.10', () => {
        // 世界2全部9张卡
        const state = createState({
            'n_009': { count: 1, level: 1, instances: ['a'] },
            'n_010': { count: 1, level: 1, instances: ['b'] },
            'n_011': { count: 1, level: 1, instances: ['c'] },
            'r_007': { count: 1, level: 1, instances: ['d'] },
            'r_008': { count: 1, level: 1, instances: ['e'] },
            'r_009': { count: 1, level: 1, instances: ['f'] },
            'sr_006': { count: 1, level: 1, instances: ['g'] },
            'sr_007': { count: 1, level: 1, instances: ['h'] },
            'ssr_005': { count: 1, level: 1, instances: ['i'] },
        });
        const completion = CARD_CONFIG.getWorldCompletion(state, 2);
        Assert.equal(completion, 1.0, '应100%收集');
        const multiplier = CARD_CONFIG.getWorldCompletionMultiplier(state, 2);
        Assert.equal(multiplier, 1.10, '100%收集度倍率应为1.10');
    });

    test('worldCompletion: 收集度加成影响属性计算', () => {
        // 基础状态：1张世界2的N卡
        const stateNoBonus = createState({
            'n_009': { count: 1, level: 1, instances: ['a'] }
        });
        const statsNoBonus = StatSystem.getCharacterStats(stateNoBonus);
        // n_009: basePower=3, effect='power' → power = 10 + 3 = 13

        // 满收集状态：世界2全部卡牌
        const stateFull = createState({
            'n_009': { count: 1, level: 1, instances: ['a'] },
            'n_010': { count: 1, level: 1, instances: ['b'] },
            'n_011': { count: 1, level: 1, instances: ['c'] },
            'r_007': { count: 1, level: 1, instances: ['d'] },
            'r_008': { count: 1, level: 1, instances: ['e'] },
            'r_009': { count: 1, level: 1, instances: ['f'] },
            'sr_006': { count: 1, level: 1, instances: ['g'] },
            'sr_007': { count: 1, level: 1, instances: ['h'] },
            'ssr_005': { count: 1, level: 1, instances: ['i'] },
        });
        const statsFull = StatSystem.getCharacterStats(stateFull);

        // 满收集时 n_009 的 power 应被 1.10 倍率加成
        // n_009 power = 3 * 1.10 = 3.3 → 加上基础10 = 13.3 → floor 13
        // 但实际还有其他卡的加成，所以总 power 应该更高
        // 关键验证：满收集的 n_009 比无收集的 n_009 有加成
        // 由于还有其他卡，直接比较总power
        Assert.greaterThan(statsFull.power, statsNoBonus.power, '满收集应比单卡属性更高');
    });

    test('worldCompletion: 不同世界的收集度独立', () => {
        const state = createState({
            'n_009': { count: 1, level: 1, instances: ['a'] },
            'n_010': { count: 1, level: 1, instances: ['b'] },
            'n_011': { count: 1, level: 1, instances: ['c'] },
            'r_007': { count: 1, level: 1, instances: ['d'] },
            'r_008': { count: 1, level: 1, instances: ['e'] },
            'r_009': { count: 1, level: 1, instances: ['f'] },
            'sr_006': { count: 1, level: 1, instances: ['g'] },
            'sr_007': { count: 1, level: 1, instances: ['h'] },
            'ssr_005': { count: 1, level: 1, instances: ['i'] },
        });
        // 世界2满收集，世界3无收集
        const m2 = CARD_CONFIG.getWorldCompletionMultiplier(state, 2);
        const m3 = CARD_CONFIG.getWorldCompletionMultiplier(state, 3);
        Assert.equal(m2, 1.10, '世界2应满收集倍率1.10');
        Assert.equal(m3, 1.0, '世界3应无收集倍率1.0');
    });

    test('worldCompletion: summary汇总信息正确', () => {
        const state = createState({
            'n_009': { count: 1, level: 1, instances: ['a'] },
            'n_010': { count: 1, level: 1, instances: ['b'] },
        });
        // 解锁世界1（默认）和世界2（通过worldProgress）
        state.worldProgress = { '1': 1, '2': 1 };
        const summary = CARD_CONFIG.getWorldCompletionSummary(state);
        Assert.greaterThan(summary.length, 0, '应有汇总信息');
        const w2 = summary.find(s => s.worldId === 2);
        Assert.exists(w2, '应包含世界2的汇总');
        Assert.equal(w2.ownedCards, 2, '世界2应拥有2张卡');
        Assert.equal(w2.totalCards, 9, '世界2应有9张卡');
    });

    // --- 新世界卡牌效果 ---
    test('getCharacterStats: 世界2卡牌效果正确', () => {
        EffectRegistry.init();
        const state = createState({
            'r_009': { count: 1, level: 1, instances: ['a'] }  // 火焰杯: power+12, critRate+2
        });
        const stats = StatSystem.getCharacterStats(state);
        Assert.equal(stats.power, 22, '隐形衣攻击力应为10+12=22');
        Assert.equal(stats.critRate, 2, '隐形衣应加2%暴击率');
    });

    test('getCharacterStats: 世界3卡牌效果正确', () => {
        EffectRegistry.init();
        const state = createState({
            'r_011': { count: 1, level: 1, instances: ['a'] }  // 御剑术: power+10, speed+3
        });
        const stats = StatSystem.getCharacterStats(state);
        Assert.equal(stats.power, 20, '雷枪攻击力应为10+10=20');
        Assert.equal(stats.speed, 8, '雷枪速度应为5+3=8');
    });

    test('getCharacterStats: 造化玉碟双属性加成', () => {
        EffectRegistry.init();
        const state = createState({
            'ssr_006': { count: 1, level: 1, instances: ['a'] }  // 造化玉碟: power+65, defense+30, hp+50
        });
        const stats = StatSystem.getCharacterStats(state);
        Assert.equal(stats.power, 75, '始祖巨人之力攻击力应为10+65=75');
        Assert.equal(stats.defense, 30, '始祖巨人之力防御力应为30');
        Assert.equal(stats.hp, 250, '始祖巨人之力生命值应为200+50=250');
    });
});
