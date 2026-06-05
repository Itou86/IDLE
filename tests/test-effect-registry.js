/* ===== EffectRegistry 测试 ===== */

// 辅助：创建最小 gameState
function createEffectState() {
    return {
        cards: {},
        stats: { rarityObtained: {} }
    };
}

TestRunner.suite('EffectRegistry - 接口存在性', (test) => {
    test('EffectRegistry 对象存在', () => {
        Assert.exists(EffectRegistry, 'EffectRegistry 应存在');
    });

    test('register 方法存在', () => {
        Assert.type(EffectRegistry.register, 'function', 'register 应为函数');
    });

    test('trigger 方法存在', () => {
        Assert.type(EffectRegistry.trigger, 'function', 'trigger 应为函数');
    });

    test('init 方法存在', () => {
        Assert.type(EffectRegistry.init, 'function', 'init 应为函数');
    });

    test('_handlers 是对象', () => {
        Assert.type(EffectRegistry._handlers, 'object', '_handlers 应为对象');
    });
});

TestRunner.suite('EffectRegistry - register / trigger', (test) => {
    test('注册处理器后触发能执行', () => {
        EffectRegistry._handlers = {}; // 清空
        let called = false;
        EffectRegistry.register('test_event', (gs, ctx) => {
            called = true;
            ctx.called = true;
            return ctx;
        });
        const gs = createEffectState();
        const ctx = EffectRegistry.trigger('test_event', gs, {});
        Assert.true(called, '处理器应被调用');
        Assert.true(ctx.called, '上下文应被修改');
    });

    test('同 trigger 可注册多个处理器', () => {
        EffectRegistry._handlers = {};
        let count = 0;
        EffectRegistry.register('multi', (gs, ctx) => { count++; return ctx; });
        EffectRegistry.register('multi', (gs, ctx) => { count++; return ctx; });
        EffectRegistry.trigger('multi', createEffectState(), {});
        Assert.equal(count, 2, '两个处理器都应执行');
    });

    test('未注册的 trigger 返回空对象', () => {
        EffectRegistry._handlers = {};
        const ctx = EffectRegistry.trigger('nonexistent', createEffectState(), {});
        Assert.type(ctx, 'object', '应返回对象');
    });

    test('未提供 context 时默认返回空对象', () => {
        EffectRegistry._handlers = {};
        const ctx = EffectRegistry.trigger('nonexistent', createEffectState());
        Assert.type(ctx, 'object', '应返回对象');
    });

    test('处理器修改的 context 会被后续处理器看到', () => {
        EffectRegistry._handlers = {};
        EffectRegistry.register('chain', (gs, ctx) => { ctx.value = 1; return ctx; });
        EffectRegistry.register('chain', (gs, ctx) => { ctx.value = (ctx.value || 0) + 1; return ctx; });
        const ctx = EffectRegistry.trigger('chain', createEffectState(), {});
        Assert.equal(ctx.value, 2, '第二个处理器应看到第一个的修改');
    });
});

TestRunner.suite('EffectRegistry - _executeEffect 各类型', (test) => {
    test('extra_draw: 累加额外抽卡数', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'extra_draw', value: 2 }, createEffectState(), {});
        Assert.equal(ctx.extraDrawCount, 2, 'extraDrawCount 应为 2');

        const ctx2 = EffectRegistry._executeEffect({ type: 'extra_draw', value: 1 }, createEffectState(), ctx);
        Assert.equal(ctx2.extraDrawCount, 3, 'extraDrawCount 应累加为 3');
    });

    test('boss_damage_bonus: 累加百分比', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'boss_damage_bonus', value: 0.2 }, createEffectState(), {});
        Assert.equal(ctx.bossDamageBonus, 0.2, 'bossDamageBonus 应为 0.2');
    });

    test('n_card_multiplier: 乘法累加', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'n_card_multiplier', value: 2 }, createEffectState(), {});
        Assert.equal(ctx.nCardMultiplier, 2, 'nCardMultiplier 应为 2');

        const ctx2 = EffectRegistry._executeEffect({ type: 'n_card_multiplier', value: 2 }, createEffectState(), ctx);
        Assert.equal(ctx2.nCardMultiplier, 4, 'nCardMultiplier 应相乘为 4');
    });

    test('offline_bonus: 累加百分比', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'offline_bonus', value: 0.5 }, createEffectState(), {});
        Assert.equal(ctx.offlineBonus, 0.5, 'offlineBonus 应为 0.5');
    });

    test('achievement_bonus: 累加百分比', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'achievement_bonus', value: 0.3 }, createEffectState(), {});
        Assert.equal(ctx.achievementBonus, 0.3, 'achievementBonus 应为 0.3');
    });

    test('kill_extra_drop: 设置概率和数量', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'kill_extra_drop', chance: 0.2, count: 1 }, createEffectState(), {});
        Assert.equal(ctx.killExtraDropChance, 0.2, 'killExtraDropChance 应为 0.2');
        Assert.equal(ctx.killExtraDropCount, 1, 'killExtraDropCount 应为 1');
    });

    test('stage_ticket_bonus: 设置间隔和奖励', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'stage_ticket_bonus', interval: 10, value: 1 }, createEffectState(), {});
        Assert.equal(ctx.stageTicketInterval, 10, 'stageTicketInterval 应为 10');
        Assert.equal(ctx.stageTicketBonus, 1, 'stageTicketBonus 应为 1');
    });

    test('synergy_bonus: 无联动卡时不加成', () => {
        const gs = createEffectState();
        const ctx = EffectRegistry._executeEffect({ type: 'synergy_bonus', pairCardId: 'sr_002', value: 0.5, _cardId: 'sr_001' }, gs, {});
        Assert.equal(ctx.synergyBonuses, undefined, '无联动卡时应无 synergyBonuses');
    });

    test('synergy_bonus: 有联动卡时加成', () => {
        const gs = createEffectState();
        gs.cards['sr_002'] = { count: 1, level: 1 };
        const ctx = EffectRegistry._executeEffect({ type: 'synergy_bonus', pairCardId: 'sr_002', value: 0.5, _cardId: 'sr_001' }, gs, {});
        Assert.equal(ctx.synergyBonuses['sr_001'], 0.5, '有联动卡时 synergyBonuses[sr_001] 应为 0.5');
    });

    test('flat_stat_bonus: 累加固定属性', () => {
        const ctx = EffectRegistry._executeEffect({ type: 'flat_stat_bonus', stat: 'hpMax', value: 20, _cardId: 'r_006' }, createEffectState(), {});
        Assert.equal(ctx.flatStatBonuses.length, 1, '应有1个flat_stat_bonus条目');
        Assert.equal(ctx.flatStatBonuses[0].stat, 'hpMax', 'stat应为hpMax');
        Assert.equal(ctx.flatStatBonuses[0].value, 20, 'value应为20');
        Assert.equal(ctx.flatStatBonuses[0].cardId, 'r_006', 'cardId应为r_006');

        const ctx2 = EffectRegistry._executeEffect({ type: 'flat_stat_bonus', stat: 'hpMax', value: 10, _cardId: 'r_007' }, createEffectState(), ctx);
        Assert.equal(ctx2.flatStatBonuses.length, 2, '应有2个flat_stat_bonus条目');
        Assert.equal(ctx2.flatStatBonuses[1].value, 10, '第二个value应为10');
    });

    test('未知 type 不抛异常', () => {
        Assert.doesNotThrow(() => {
            EffectRegistry._executeEffect({ type: 'unknown_type' }, createEffectState(), {});
        }, '未知类型应静默忽略');
    });
});

TestRunner.suite('EffectRegistry - _registerCardEffect', (test) => {
    test('无 trigger 的 effect 不注册', () => {
        EffectRegistry._handlers = {};
        EffectRegistry._registerCardEffect('n_001', { type: 'extra_draw', value: 1 });
        Assert.equal(Object.keys(EffectRegistry._handlers).length, 0, '无 trigger 时不应注册');
    });

    test('有 trigger 时注册到对应触发器', () => {
        EffectRegistry._handlers = {};
        EffectRegistry._registerCardEffect('n_001', { trigger: 'on_draw', type: 'extra_draw', value: 1 });
        Assert.equal(EffectRegistry._handlers['on_draw'].length, 1, '应注册到 on_draw');
    });

    test('handler 检查 hasCard: 无卡时不执行效果', () => {
        EffectRegistry._handlers = {};
        EffectRegistry._registerCardEffect('n_001', { trigger: 'on_draw', type: 'extra_draw', value: 1 });
        const gs = createEffectState();
        const ctx = EffectRegistry.trigger('on_draw', gs, {});
        Assert.equal(ctx.extraDrawCount, undefined, '无卡时不应有 extraDrawCount');
    });

    test('handler 检查 hasCard: 有卡时执行效果', () => {
        EffectRegistry._handlers = {};
        EffectRegistry._registerCardEffect('n_001', { trigger: 'on_draw', type: 'extra_draw', value: 3 });
        const gs = createEffectState();
        gs.cards['n_001'] = { count: 1, level: 1 };
        const ctx = EffectRegistry.trigger('on_draw', gs, {});
        Assert.equal(ctx.extraDrawCount, 3, '有卡时 extraDrawCount 应为 3');
    });
});

TestRunner.suite('EffectRegistry - init', (test) => {
    test('init 扫描 CARD_CONFIG.pool 中的 effects', () => {
        // 保存原始 pool
        const originalPool = CARD_CONFIG.pool;

        // 构造带 effects 的测试 pool
        CARD_CONFIG.pool = [
            { id: 'test_001', name: '测试卡1', rarity: 'N', basePower: 1, effects: [
                { trigger: 'on_draw', type: 'extra_draw', value: 1 }
            ]},
            { id: 'test_002', name: '测试卡2', rarity: 'R', basePower: 5, effects: [
                { trigger: 'on_battle_start', type: 'boss_damage_bonus', value: 0.2 },
                { trigger: 'on_idle_tick', type: 'offline_bonus', value: 0.5 }
            ]},
            { id: 'test_003', name: '测试卡3', rarity: 'N', basePower: 1 } // 无 effects
        ];

        EffectRegistry._handlers = {};
        EffectRegistry.init();

        Assert.equal(EffectRegistry._handlers['on_draw'].length, 1, 'on_draw 应有 1 个 handler');
        Assert.equal(EffectRegistry._handlers['on_battle_start'].length, 1, 'on_battle_start 应有 1 个 handler');
        Assert.equal(EffectRegistry._handlers['on_idle_tick'].length, 1, 'on_idle_tick 应有 1 个 handler');

        // 恢复
        CARD_CONFIG.pool = originalPool;
    });

    test('init 后触发效果正常工作', () => {
        const originalPool = CARD_CONFIG.pool;
        CARD_CONFIG.pool = [
            { id: 'test_init_001', name: 'Init卡', rarity: 'N', basePower: 1, effects: [
                { trigger: 'on_test', type: 'extra_draw', value: 5 }
            ]}
        ];

        EffectRegistry._handlers = {};
        EffectRegistry.init();

        const gs = createEffectState();
        gs.cards['test_init_001'] = { count: 1, level: 1 };
        const ctx = EffectRegistry.trigger('on_test', gs, {});
        Assert.equal(ctx.extraDrawCount, 5, 'init 注册的效果应正常工作');

        CARD_CONFIG.pool = originalPool;
    });
});

TestRunner.suite('EffectRegistry - 多效果组合', (test) => {
    test('同 trigger 多个不同效果累加', () => {
        EffectRegistry._handlers = {};
        EffectRegistry.register('combo', (gs, ctx) => {
            ctx.bossDamageBonus = (ctx.bossDamageBonus || 0) + 0.2;
            return ctx;
        });
        EffectRegistry.register('combo', (gs, ctx) => {
            ctx.offlineBonus = (ctx.offlineBonus || 0) + 0.5;
            return ctx;
        });

        const ctx = EffectRegistry.trigger('combo', createEffectState(), {});
        Assert.equal(ctx.bossDamageBonus, 0.2, 'bossDamageBonus 应为 0.2');
        Assert.equal(ctx.offlineBonus, 0.5, 'offlineBonus 应为 0.5');
    });

    test('不同 trigger 互不干扰', () => {
        EffectRegistry._handlers = {};
        EffectRegistry.register('trigger_a', (gs, ctx) => { ctx.a = 1; return ctx; });
        EffectRegistry.register('trigger_b', (gs, ctx) => { ctx.b = 2; return ctx; });

        const ctxA = EffectRegistry.trigger('trigger_a', createEffectState(), {});
        Assert.equal(ctxA.a, 1, 'trigger_a 应设置 a');
        Assert.equal(ctxA.b, undefined, 'trigger_a 不应设置 b');

        const ctxB = EffectRegistry.trigger('trigger_b', createEffectState(), {});
        Assert.equal(ctxB.b, 2, 'trigger_b 应设置 b');
        Assert.equal(ctxB.a, undefined, 'trigger_b 不应设置 a');
    });
});
