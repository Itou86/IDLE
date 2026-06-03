/* ===== 属性系统测试 ===== */
TestRunner.suite('⚔️ 属性系统 - StatSystem', (test) => {

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
        Assert.equal(stats.power, 15, '装备生锈的剑后攻击力应为15');
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
        Assert.equal(stats.defense, 3, '装备破木盾后防御力应为3');
    });

    test('getCharacterStats: 金币卡增加金币加成', () => {
        const state = createState({ 'n_003': { count: 2, level: 1, instances: ['a','b'] } });
        const stats = StatSystem.getCharacterStats(state);
        // n_003 basePower=2, effect='gold' → 2*2 = 4
        Assert.equal(stats.goldBonus, 4, '2张铜币袋金币加成应为4');
    });

    // --- 特殊卡牌效果 ---
    test('getCharacterStats: 生命护符增加生命值', () => {
        const state = createState({ 'r_006': { count: 1, level: 1, instances: ['a'] } });
        const stats = StatSystem.getCharacterStats(state);
        // r_006: effect='heal' → hpRegen +8, 特殊效果 hp +20
        Assert.equal(stats.hp, 220, '生命护符应增加20生命值');
        Assert.equal(stats.hpRegen, 58, '生命护符应增加8生命恢复');
    });

    test('getCharacterStats: 疾风靴增加闪避率', () => {
        const state = createState({ 'r_005': { count: 1, level: 1, instances: ['a'] } });
        const stats = StatSystem.getCharacterStats(state);
        // r_005: effect='speed' → speed +8, 特殊效果 dodgeRate +5
        Assert.equal(stats.dodgeRate, 5, '疾风靴应增加5%闪避');
        Assert.equal(stats.speed, 13, '疾风靴应增加8速度');
    });

    // --- N卡翻倍效果 ---
    test('getCharacterStats: 创世之刃使N卡效果翻倍', () => {
        const stateNoSSR = createState({ 'n_001': { count: 1, level: 1, instances: ['a'] } });
        const statsNoSSR = StatSystem.getCharacterStats(stateNoSSR);

        const stateWithSSR = createState({
            'n_001': { count: 1, level: 1, instances: ['a'] },
            'ssr_001': { count: 1, level: 1, instances: ['b'] }
        });
        const statsWithSSR = StatSystem.getCharacterStats(stateWithSSR);

        // noSSR: n_001 power=5 → total = 15
        // withSSR: n_001 power=10 (翻倍), ssr_001 power=80 → total = 10+80+10 = 100
        Assert.equal(statsNoSSR.power, 15, '无创世之刃时N卡攻击力应为15');
        Assert.equal(statsWithSSR.power, 100, '有创世之刃时攻击力应为100');
    });

    // --- 联动效果 ---
    test('getCharacterStats: 龙血剑+龙鳞甲联动加成', () => {
        const stateSwordOnly = createState({ 'sr_001': { count: 1, level: 1, instances: ['a'] } });
        const statsSwordOnly = StatSystem.getCharacterStats(stateSwordOnly);

        const stateBoth = createState({
            'sr_001': { count: 1, level: 1, instances: ['a'] },
            'sr_002': { count: 1, level: 1, instances: ['b'] }
        });
        const statsBoth = StatSystem.getCharacterStats(stateBoth);

        // sr_001: power=30, 联动额外+15 → total power = 10+30+15 = 55
        // sr_002: defense=25, 联动额外+12.5 → total defense = 0+25+12 = 37 (floor)
        Assert.equal(statsSwordOnly.power, 40, '单独龙血剑攻击力应为40');
        Assert.equal(statsBoth.power, 55, '联动后攻击力应为55');
        Assert.equal(statsBoth.defense, 37, '联动后防御力应为37');
    });

    // --- 套装加成 ---
    test('getCharacterStats: 新手套装固定值加成', () => {
        const state = createState({
            'n_001': { count: 1, level: 1, instances: ['a'] },
            'n_002': { count: 1, level: 1, instances: ['b'] }
        });
        const stats = StatSystem.getCharacterStats(state);
        // n_001 power=5, n_002 defense=3, 套装 power+5
        Assert.equal(stats.power, 20, '新手套装攻击力应为20');
        Assert.equal(stats.defense, 3, '新手套装防御力应为3');
    });

    test('getCharacterStats: 套装百分比加成', () => {
        const state = createState({
            'ssr_001': { count: 1, level: 1, instances: ['a'] },
            'ssr_002': { count: 1, level: 1, instances: ['b'] }
        });
        const stats = StatSystem.getCharacterStats(state);
        // ssr_001 power=80, ssr_002 goldBonus=50 (gold effect)
        // 套装: power+100, gold+"30%"
        // 固定值: power=10+80+100=190, goldBonus=0+50=50
        // 百分比: goldBonus=50*1.3=65 → floor=65
        Assert.equal(stats.power, 190, '神王套装攻击力应为190');
        Assert.equal(stats.goldBonus, 65, '百分比加成后金币加成应为65');
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

    // --- getDodgeRate ---
    test('getDodgeRate: 无卡返回0，疾风靴增加闪避', () => {
        const stateEmpty = createState();
        Assert.equal(StatSystem.getDodgeRate(stateEmpty), 0, '无卡时闪避率应为0');

        const stateBoots = createState({ 'r_005': { count: 2, level: 1, instances: ['a','b'] } });
        Assert.equal(StatSystem.getDodgeRate(stateBoots), 10, '2张疾风靴闪避率应为10');
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
            { effect: 'gold', expected: 'goldBonus' },
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
        Assert.equal(statsN.power, 10, '有创世之刃时N卡应翻倍');

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
});
