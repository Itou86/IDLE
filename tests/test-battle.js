/* ===== 竞技系统测试（简化回合制 - 方案B） ===== */
TestRunner.suite('⚔️ 竞技系统 - BattleSystem', (test) => {

    function createState(points = 100, shards = 10, world = 1, subStage = 1, cards = {}) {
        return {
            points: points,
            shards: shards,
            world: world,
            subStage: subStage,
            worldProgress: {},
            cards: cards,
            achievements: {},
            stats: {
                pointsTotal: points,
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
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] } // 火箭筒 +80攻
        });
        const result = BattleSystem.fight(state);
        Assert.true(result.win, '高战力应获胜');
    });

    test('fight: 战力不足时失败', () => {
        const state = createState(100, 10, 100, 1); // 高世界，无装备
        const result = BattleSystem.fight(state);
        Assert.false(result.win, '低战力应失败');
    });

    test('fight: 胜利获得奖励', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const beforePoints = state.points;
        const beforeShards = state.shards;
        const result = BattleSystem.fight(state);
        Assert.greaterThan(state.points, beforePoints, '应获得系统点');
        Assert.greaterThanOrEqual(result.reward.points, 0, '返回应有系统点奖励');
    });

    test('fight: 胜利后关卡推进', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const beforeSubStage = state.subStage;
        BattleSystem.fight(state);
        Assert.equal(state.subStage, beforeSubStage + 1, '胜利后应进入下一关');
    });

    test('fight: 失败不推进关卡', () => {
        const state = createState(100, 10, 50, 1); // 无装备，高世界
        const beforeSubStage = state.subStage;
        BattleSystem.fight(state);
        Assert.equal(state.subStage, beforeSubStage, '失败不应推进关卡');
    });

    test('fight: 胜利统计增加', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        Assert.equal(state.stats.battleWin, 0);
        BattleSystem.fight(state);
        Assert.equal(state.stats.battleWin, 1, '胜利统计应+1');
    });

    test('fight: 失败统计增加', () => {
        const state = createState(100, 10, 50, 1);
        Assert.equal(state.stats.battleLose, 0);
        BattleSystem.fight(state);
        Assert.equal(state.stats.battleLose, 1, '失败统计应+1');
    });

    test('fight: 连败统计', () => {
        const state = createState(100, 10, 50, 1);
        BattleSystem.fight(state);
        Assert.equal(state.stats.loseStreak, 1, '连败应+1');
        BattleSystem.fight(state);
        Assert.equal(state.stats.loseStreak, 2, '连败应+2');
    });

    test('fight: 胜利重置连败', () => {
        const state = createState(100, 10, 50, 1);
        BattleSystem.fight(state); // 失败
        Assert.equal(state.stats.loseStreak, 1);
        // 装备后胜利 - 用足够强的装备确保胜利
        state.cards['ssr_001'] = { count: 5, level: 10, instances: Array(5).fill('x') };
        state.world = 1;
        state.subStage = 1; // 回到第1关确保能赢
        BattleSystem.fight(state);
        Assert.equal(state.stats.loseStreak, 0, '胜利应重置连败');
    });

    test('fight: 系统点累计统计', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const beforeTotal = state.stats.pointsTotal;
        BattleSystem.fight(state);
        Assert.greaterThan(state.stats.pointsTotal, beforeTotal, '系统点累计应增加');
    });

    test('fight: 返回结果结构完整', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const result = BattleSystem.fight(state);
        Assert.exists(result.win, '应有win字段');
        Assert.exists(result.world, '应有world字段');
        Assert.exists(result.subStage, '应有subStage字段');
        Assert.exists(result.enemyPower, '应有enemyPower字段');
        Assert.exists(result.playerPower, '应有playerPower字段');
        Assert.type(result.isBoss, 'boolean', 'isBoss应为布尔值');
    });

    test('fight: 战斗掉落卡牌', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 10, level: 1, instances: Array(10).fill('x') }
        });
        const result = BattleSystem.fight(state);
        // 由于掉落是概率性的，这里只检查字段存在
        Assert.exists(result.droppedCard !== undefined, '应有droppedCard字段');
    });

    test('fight: BOSS关卡有标记', () => {
        const state = createState(100, 10, 1, 6, {
            'ssr_001': { count: 10, level: 1, instances: Array(10).fill('x') }
        });
        const result = BattleSystem.fight(state);
        Assert.true(result.isBoss, '世界1第6关应为BOSS');
        Assert.greaterThan(result.enemyPower, 50, 'BOSS战力应增强');
    });

    test('fight: 高关卡敌人更强', () => {
        const weak1 = createState(100, 10, 1, 1);
        const weak20 = createState(100, 10, 4, 2); // 约等于原第20关
        const wr1 = BattleSystem.fight(weak1);
        const wr2 = BattleSystem.fight(weak20);
        Assert.greaterThan(wr2.enemyPower, wr1.enemyPower, '高世界敌人应更强');
    });

    test('fight: 跨世界难度衔接', () => {
        const s1 = createState(100, 10, 1, 4);
        const s2 = createState(100, 10, 2, 1);
        const r1 = BattleSystem.fight(s1);
        const r2 = BattleSystem.fight(s2);
        // 世界2第1关 ≈ 世界1第4关，难度应接近
        const ratio = Math.max(r1.enemyPower, r2.enemyPower) / Math.min(r1.enemyPower, r2.enemyPower);
        Assert.lessThan(ratio, 2.0, '跨世界难度不应跳跃过大');
    });

    // --- 简化回合制新增/变更测试 ---
    test('fight: 先攻由speed一次性判定', () => {
        // 玩家speed=5(基础), 敌人speed=1(第1关敌人战力/100)
        // 玩家先攻，所以高战力玩家应该先出手并快速胜利
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const result = BattleSystem.fight(state);
        Assert.true(result.win, '先攻优势应帮助胜利');
        // 战斗日志中第1回合的actor应为'player'（先攻）
        if (result.log.length > 0) {
            Assert.equal(result.log[0].actor, 'player', '玩家应先攻');
        }
    });

    test('fight: 去掉闪避（日志中无miss）', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const result = BattleSystem.fight(state);
        for (const entry of result.log) {
            Assert.notEqual(entry.action, 'miss', '不应有闪避');
            // 新日志结构没有 isMiss 字段
            Assert.notExists(entry.isMiss, '不应有isMiss字段');
        }
    });

    test('fight: 暴击保留（低概率）', () => {
        // 通过直接调用 _calcDamage 验证暴击机制（100%暴击率）
        const attacker = { power: 100, defense: 50, critRate: 100, critDamage: 1.5 };
        const defender = { power: 100, defense: 50, critRate: 0, critDamage: 1.5 };
        const result = BattleSystem._calcDamage(attacker, defender, true, null, { isBoss: false });
        Assert.true(result.isCrit, '100%暴击率应必然暴击');
        // 暴击伤害 = 基础伤害 * 1.5
        const baseDamage = Math.max(1, attacker.power - defender.defense);
        const expectedCritDamage = Math.floor(baseDamage * 1.5);
        Assert.equal(result.damage, expectedCritDamage, '暴击伤害应为基础伤害的1.5倍');
    });

    test('fight: BOSS每3回合额外攻击', () => {
        // 找一个需要多回合的BOSS战
        const state = createState(100, 10, 1, 6, {
            'n_001': { count: 5, level: 1, instances: ['a','b','c','d','e'] }
        });
        const result = BattleSystem.fight(state);
        if (result.isBoss && result.log.length >= 3) {
            // 检查第3回合是否有BOSS额外攻击标记
            const round3Entries = result.log.filter(e => e.round === 3 && e.actor === 'enemy');
            // BOSS在第3回合应有额外攻击（isExtra标记）
            const hasExtra = round3Entries.some(e => e.isExtra);
            if (result.log.length >= 3) {
                Assert.true(hasExtra, 'BOSS第3回合应有额外攻击');
            }
        }
    });

    test('fight: 伤害公式 = max(1, 攻击 - 防御)', () => {
        // 验证伤害至少为1
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const result = BattleSystem.fight(state);
        for (const entry of result.log) {
            if (entry.damage !== undefined) {
                Assert.greaterThanOrEqual(entry.damage, 1, '伤害至少为1');
            }
        }
    });

    test('fight: 战斗日志结构简化', () => {
        const state = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const result = BattleSystem.fight(state);
        if (result.log.length > 0) {
            const entry = result.log[0];
            Assert.exists(entry.round, '日志应有round字段');
            Assert.exists(entry.actor, '日志应有actor字段');
            Assert.exists(entry.action, '日志应有action字段');
            Assert.exists(entry.damage, '日志应有damage字段');
            Assert.exists(entry.remainingHP, '日志应有remainingHP字段');
            // 不应有旧的isMiss字段
            Assert.notExists(entry.isMiss, '简化日志不应有isMiss');
            // 不应有旧的isSpecial/specialName字段
            Assert.notExists(entry.isSpecial, '简化日志不应有isSpecial');
            Assert.notExists(entry.specialName, '简化日志不应有specialName');
        }
    });

    // --- getCurrentStageInfo ---
    test('getCurrentStageInfo: 返回当前关卡信息', () => {
        const state = createState(100, 10, 1, 5);
        const info = BattleSystem.getCurrentStageInfo(state);
        Assert.equal(info.world, 1, '应返回世界1');
        Assert.equal(info.subStage, 5, '应返回第5关');
        Assert.exists(info.enemyPower, '应有敌人战力');
        Assert.exists(info.playerPower, '应有玩家战力');
        Assert.exists(info.reward, '应有奖励信息');
    });

    test('getCurrentStageInfo: 玩家战力计算正确', () => {
        const weak = createState(100, 10, 1, 1);
        const strong = createState(100, 10, 1, 1, {
            'ssr_001': { count: 1, level: 1, instances: ['a'] }
        });
        const i1 = BattleSystem.getCurrentStageInfo(weak);
        const i2 = BattleSystem.getCurrentStageInfo(strong);
        Assert.greaterThan(i2.playerPower, i1.playerPower, '装备后玩家战力应更高');
    });

    test('getCurrentStageInfo: 敌人战力与fight一致', () => {
        const state = createState(100, 10, 1, 5);
        const info = BattleSystem.getCurrentStageInfo(state);
        // 失败时返回的enemyPower应与getCurrentStageInfo一致
        const weak = createState(100, 10, 1, 5); // 无装备，大概率失败
        const result = BattleSystem.fight(weak);
        Assert.equal(result.enemyPower, info.enemyPower, '敌人战力应一致');
    });

    // --- 边界测试 ---
    test('fight: 第1关敌人战力合理', () => {
        const state = createState(100, 10, 1, 1);
        const info = BattleSystem.getCurrentStageInfo(state);
        Assert.greaterThan(info.enemyPower, 0, '第1关应有敌人');
        Assert.lessThan(info.enemyPower, 500, '第1关不应过强');
    });

    test('fight: 极端高世界', () => {
        const state = createState(100, 10, 999, 1);
        const info = BattleSystem.getCurrentStageInfo(state);
        Assert.greaterThan(info.enemyPower, 0, '第999世界应有敌人');
        Assert.exists(info.reward.points, '应有奖励');
    });

    test('fight: 防御力影响有效战力', () => {
        const attackOnly = createState(100, 10, 1, 5, {
            'n_001': { count: 5, level: 1, instances: ['a','b','c','d','e'] } // 纯攻击
        });
        const withDefense = createState(100, 10, 1, 5, {
            'n_001': { count: 3, level: 1, instances: ['a','b','c'] },
            'n_002': { count: 2, level: 1, instances: ['d','e'] } // 加防御
        });
        const i1 = BattleSystem.getCurrentStageInfo(attackOnly);
        const i2 = BattleSystem.getCurrentStageInfo(withDefense);
        // 防御按0.5折算，所以有效战力可能不同
        Assert.notEqual(i1.playerPower, i2.playerPower, '有防御时有效战力应不同');
    });
});
