/* ===== 竞技系统测试 ===== */
TestRunner.suite('⚔️ 竞技系统 - BattleSystem', (test) => {

    function createState(gold = 100, tickets = 10, stage = 1, cards = {}) {
        return {
            gold: gold,
            tickets: tickets,
            stage: stage,
            cards: cards,
            achievements: {},
            stats: {
                goldTotal: gold,
                gachaCount: 0,
                battleWin: 0,
                battleLose: 0,
                loseStreak: 0,
                streakNoRare: 0,
                streakNoSSR: 0,
                rarityObtained: {},
                lastSaveTime: Date.now(),
                createTime: Date.now()
            }
        };
    }

    // --- fight: 基本战斗 ---
    test('fight: 战力碾压时胜利', () => {
        const state = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] } // 创世之刃 +80攻
        });
        const result = BattleSystem.fight(state);
        Assert.true(result.win, '高战力应获胜');
    });

    test('fight: 战力不足时失败', () => {
        const state = createState(100, 10, 100); // 第100关，无装备
        const result = BattleSystem.fight(state);
        Assert.false(result.win, '低战力应失败');
    });

    test('fight: 胜利获得奖励', () => {
        const state = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const beforeGold = state.gold;
        const beforeTickets = state.tickets;
        const result = BattleSystem.fight(state);
        Assert.greaterThan(state.gold, beforeGold, '应获得金币');
        Assert.greaterThanOrEqual(result.reward.gold, 0, '返回应有金币奖励');
    });

    test('fight: 胜利后关卡推进', () => {
        const state = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const beforeStage = state.stage;
        BattleSystem.fight(state);
        Assert.equal(state.stage, beforeStage + 1, '胜利后应进入下一关');
    });

    test('fight: 失败不推进关卡', () => {
        const state = createState(100, 10, 50); // 无装备，高关卡
        const beforeStage = state.stage;
        BattleSystem.fight(state);
        Assert.equal(state.stage, beforeStage, '失败不应推进关卡');
    });

    test('fight: 胜利统计增加', () => {
        const state = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        Assert.equal(state.stats.battleWin, 0);
        BattleSystem.fight(state);
        Assert.equal(state.stats.battleWin, 1, '胜利统计应+1');
    });

    test('fight: 失败统计增加', () => {
        const state = createState(100, 10, 50);
        Assert.equal(state.stats.battleLose, 0);
        BattleSystem.fight(state);
        Assert.equal(state.stats.battleLose, 1, '失败统计应+1');
    });

    test('fight: 连败统计', () => {
        const state = createState(100, 10, 50);
        BattleSystem.fight(state);
        Assert.equal(state.stats.loseStreak, 1, '连败应+1');
        BattleSystem.fight(state);
        Assert.equal(state.stats.loseStreak, 2, '连败应+2');
    });

    test('fight: 胜利重置连败', () => {
        const state = createState(100, 10, 50);
        BattleSystem.fight(state); // 失败
        Assert.equal(state.stats.loseStreak, 1);
        // 装备后胜利 - 用足够强的装备确保胜利
        state.cards['ssr_001'] = { count: 5, level: 10, instances: Array(5).fill('x') };
        state.stage = 1; // 回到第1关确保能赢
        BattleSystem.fight(state);
        Assert.equal(state.stats.loseStreak, 0, '胜利应重置连败');
    });

    test('fight: 金币累计统计', () => {
        const state = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const beforeTotal = state.stats.goldTotal;
        BattleSystem.fight(state);
        Assert.greaterThan(state.stats.goldTotal, beforeTotal, '金币累计应增加');
    });

    test('fight: 返回结果结构完整', () => {
        const state = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const result = BattleSystem.fight(state);
        Assert.exists(result.win, '应有win字段');
        Assert.exists(result.stage, '应有stage字段');
        Assert.exists(result.enemyPower, '应有enemyPower字段');
        Assert.exists(result.playerPower, '应有playerPower字段');
        Assert.type(result.isBoss, 'boolean', 'isBoss应为布尔值');
    });

    test('fight: BOSS关卡有标记', () => {
        const state = createState(100, 10, 10, {
            'ssr_001': { count: 10, level: 1, instances: Array(10).fill('x') }
        });
        const result = BattleSystem.fight(state);
        Assert.true(result.isBoss, '第10关应为BOSS');
        // 第10关BOSS战力 = 600 * 1.3 = 780 (调整后)
        Assert.greaterThan(result.enemyPower, 700, 'BOSS战力应增强');
    });

    test('fight: 高关卡敌人更强', () => {
        const state1 = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const state2 = createState(100, 10, 20, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        // 都失败，比较敌人战力
        const r1 = BattleSystem.fight(state1);
        const r2 = BattleSystem.fight(state2);
        // state1 有SSR应该能赢，换个弱点的
        const weak1 = createState(100, 10, 1);
        const weak20 = createState(100, 10, 20);
        const wr1 = BattleSystem.fight(weak1);
        const wr2 = BattleSystem.fight(weak20);
        Assert.greaterThan(wr2.enemyPower, wr1.enemyPower, '第20关敌人应强于第1关');
    });

    // --- getCurrentStageInfo ---
    test('getCurrentStageInfo: 返回当前关卡信息', () => {
        const state = createState(100, 10, 5);
        const info = BattleSystem.getCurrentStageInfo(state);
        Assert.equal(info.stage, 5, '应返回第5关');
        Assert.exists(info.enemyPower, '应有敌人战力');
        Assert.exists(info.playerPower, '应有玩家战力');
        Assert.exists(info.reward, '应有奖励信息');
    });

    test('getCurrentStageInfo: 玩家战力计算正确', () => {
        const weak = createState(100, 10, 1);
        const strong = createState(100, 10, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const i1 = BattleSystem.getCurrentStageInfo(weak);
        const i2 = BattleSystem.getCurrentStageInfo(strong);
        Assert.greaterThan(i2.playerPower, i1.playerPower, '装备后玩家战力应更高');
    });

    test('getCurrentStageInfo: 敌人战力与fight一致', () => {
        const state = createState(100, 10, 5);
        const info = BattleSystem.getCurrentStageInfo(state);
        // 失败时返回的enemyPower应与getCurrentStageInfo一致
        const weak = createState(100, 10, 5); // 无装备，大概率失败
        const result = BattleSystem.fight(weak);
        Assert.equal(result.enemyPower, info.enemyPower, '敌人战力应一致');
    });

    // --- 边界测试 ---
    test('fight: 第1关敌人战力合理', () => {
        const state = createState(100, 10, 1);
        const info = BattleSystem.getCurrentStageInfo(state);
        Assert.greaterThan(info.enemyPower, 0, '第1关应有敌人');
        Assert.lessThan(info.enemyPower, 500, '第1关不应过强');
    });

    test('fight: 极端高关卡', () => {
        const state = createState(100, 10, 999);
        const info = BattleSystem.getCurrentStageInfo(state);
        Assert.greaterThan(info.enemyPower, 0, '第999关应有敌人');
        Assert.exists(info.reward.gold, '应有奖励');
    });

    test('fight: 防御力影响有效战力', () => {
        const attackOnly = createState(100, 10, 5, {
            'n_001': { count: 5, level: 1, instances: ['a','b','c','d','e'] } // 纯攻击
        });
        const withDefense = createState(100, 10, 5, {
            'n_001': { count: 3, level: 1, instances: ['a','b','c'] },
            'n_002': { count: 2, level: 1, instances: ['d','e'] } // 加防御
        });
        const i1 = BattleSystem.getCurrentStageInfo(attackOnly);
        const i2 = BattleSystem.getCurrentStageInfo(withDefense);
        // 防御按0.5折算，所以有效战力可能不同
        Assert.notEqual(i1.playerPower, i2.playerPower, '有防御时有效战力应不同');
    });
});
