/* ===== 抽卡系统测试 ===== */
TestRunner.suite('🎲 抽卡系统 - GachaSystem', (test) => {

    // 辅助：创建干净的测试状态
    function createState(gold = 100, tickets = 100) {
        return {
            gold: gold,
            tickets: tickets,
            stage: 1,
            cards: {},
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

    test('draw: 正常抽卡消耗券', () => {
        const state = createState(100, 10);
        const result = GachaSystem.draw(state);
        Assert.true(result.success, '应有足够券抽卡');
        Assert.equal(state.tickets, 0, '应消耗10张券');
    });

    test('draw: 券不足时失败', () => {
        const state = createState(100, 5);
        const result = GachaSystem.draw(state);
        Assert.false(result.success, '券不足应失败');
        Assert.includes(result.reason, '不足', '应提示券不足');
        Assert.equal(state.tickets, 5, '不应消耗券');
    });

    test('draw: 返回卡牌信息', () => {
        const state = createState(100, 10);
        const result = GachaSystem.draw(state);
        Assert.exists(result.card, '应返回卡牌');
        Assert.exists(result.card.id, '卡牌应有id');
        Assert.exists(result.card.name, '卡牌应有name');
        Assert.exists(result.card.rarity, '卡牌应有rarity');
    });

    test('draw: 卡牌稀有度合法', () => {
        const validRarities = ['N', 'R', 'SR', 'SSR'];
        const state = createState(100, 100);
        for (let i = 0; i < 20; i++) {
            const result = GachaSystem.draw(state);
            Assert.includes(validRarities, result.card.rarity, `第${i+1}次抽卡稀有度应合法`);
        }
    });

    test('draw: 卡牌添加到库存', () => {
        const state = createState(100, 10);
        const result = GachaSystem.draw(state);
        const cardId = result.card.id;
        Assert.exists(state.cards[cardId], `卡牌${cardId}应加入库存`);
        Assert.equal(state.cards[cardId].count, 1, '数量应为1');
        Assert.equal(state.cards[cardId].level, 1, '等级应为1');
    });

    test('draw: 重复卡牌增加计数', () => {
        const state = createState(100, 100);
        // 抽到同一张卡（概率低，多抽几次）
        for (let i = 0; i < 50; i++) {
            GachaSystem.draw(state);
        }
        let hasDuplicate = false;
        for (const data of Object.values(state.cards)) {
            if (data.count > 1) {
                hasDuplicate = true;
                break;
            }
        }
        // 50次抽卡大概率有重复，但不一定，所以用警告而非失败
        Assert.warn(hasDuplicate, '50次抽卡应有重复卡牌（概率事件，可能偶发失败）');
    });

    test('draw: 统计计数增加', () => {
        const state = createState(100, 20);
        Assert.equal(state.stats.gachaCount, 0);
        GachaSystem.draw(state);
        Assert.equal(state.stats.gachaCount, 1, '抽卡计数应+1');
        GachaSystem.draw(state);
        Assert.equal(state.stats.gachaCount, 2, '抽卡计数应+2');
    });

    test('draw: 稀有度获得记录', () => {
        const state = createState(100, 100);
        // 大量抽卡确保各稀有度都有
        for (let i = 0; i < 100; i++) {
            GachaSystem.draw(state);
        }
        // 至少应有N卡记录
        Assert.true(state.stats.rarityObtained.N, '应记录获得N卡');
    });

    test('draw: 连抽统计', () => {
        const state = createState(100, 100);
        // 连续抽到N卡会增加streakNoRare
        let foundStreak = false;
        for (let i = 0; i < 20; i++) {
            GachaSystem.draw(state);
            if (state.stats.streakNoRare > 1) {
                foundStreak = true;
                break;
            }
        }
        Assert.warn(foundStreak, '应有连抽统计变化（概率事件）');
    });

    test('draw: 卡牌有唯一UID', () => {
        const state = createState(100, 20);
        const uids = new Set();
        for (let i = 0; i < 2; i++) {
            const result = GachaSystem.draw(state);
            uids.add(result.card.uid);
        }
        Assert.equal(uids.size, 2, '两次抽卡的UID应不同');
    });

    test('draw: 卡牌等级初始为1', () => {
        const state = createState(100, 10);
        const result = GachaSystem.draw(state);
        Assert.equal(result.card.level, 1, '新卡牌等级应为1');
    });

    // --- getTotalPower ---
    test('getTotalPower: 无卡牌时有基础战力', () => {
        const state = createState();
        const power = GachaSystem.getTotalPower(state);
        Assert.greaterThan(power.power, 0, '应有基础战力');
        Assert.equal(power.defense, 0, '无防御卡时防御应为0');
    });

    test('getTotalPower: 攻击卡增加战力', () => {
        const state = createState();
        state.cards['n_001'] = { count: 1, level: 1, instances: ['a'] }; // 生锈的剑 basePower=5
        const power = GachaSystem.getTotalPower(state);
        Assert.greaterThan(power.power, 10, '装备攻击卡后战力应增加');
    });

    test('getTotalPower: 多张卡叠加', () => {
        const state = createState();
        state.cards['n_001'] = { count: 3, level: 1, instances: ['a', 'b', 'c'] }; // 3把剑
        const power1 = GachaSystem.getTotalPower(state);
        state.cards['n_001'].count = 1;
        const power2 = GachaSystem.getTotalPower(state);
        Assert.greaterThan(power1.power, power2.power, '3张卡应比1张卡强');
    });

    test('getTotalPower: 防御卡增加防御', () => {
        const state = createState();
        state.cards['n_002'] = { count: 1, level: 1, instances: ['a'] }; // 破木盾
        const power = GachaSystem.getTotalPower(state);
        Assert.greaterThan(power.defense, 0, '装备防御卡后防御应增加');
    });

    test('getTotalPower: 等级影响战力', () => {
        const state = createState();
        state.cards['n_001'] = { count: 1, level: 1, instances: ['a'] };
        const power1 = GachaSystem.getTotalPower(state);
        state.cards['n_001'].level = 10;
        const power2 = GachaSystem.getTotalPower(state);
        Assert.greaterThan(power2.power, power1.power, '高等级应更强');
    });

    test('getTotalPower: 返回值为整数', () => {
        const state = createState();
        state.cards['n_001'] = { count: 1, level: 3, instances: ['a'] };
        const power = GachaSystem.getTotalPower(state);
        Assert.equal(Math.floor(power.power), power.power, '战力应为整数');
        Assert.equal(Math.floor(power.defense), power.defense, '防御应为整数');
    });

    // --- upgradeCard ---
    test('upgradeCard: 需要2张相同卡牌', () => {
        const state = createState();
        state.cards['n_001'] = { count: 1, level: 1, instances: ['a'] };
        const result = GachaSystem.upgradeCard(state, 'n_001');
        Assert.false(result.success, '1张卡不应能升级');
    });

    test('upgradeCard: 2张卡可升级', () => {
        const state = createState();
        state.cards['n_001'] = { count: 2, level: 1, instances: ['a', 'b'] };
        const result = GachaSystem.upgradeCard(state, 'n_001');
        Assert.true(result.success, '2张卡应能升级');
        Assert.equal(result.newLevel, 2, '应升到2级');
        Assert.equal(state.cards['n_001'].count, 1, '应消耗1张');
        Assert.equal(state.cards['n_001'].level, 2, '等级应为2');
    });

    test('upgradeCard: 升级后战力提升', () => {
        const state = createState();
        state.cards['n_001'] = { count: 2, level: 1, instances: ['a', 'b'] };
        const power1 = GachaSystem.getTotalPower(state);
        GachaSystem.upgradeCard(state, 'n_001');
        const power2 = GachaSystem.getTotalPower(state);
        Assert.greaterThan(power2.power, power1.power, '升级后战力应提升');
    });

    test('upgradeCard: 不存在的卡牌', () => {
        const state = createState();
        const result = GachaSystem.upgradeCard(state, 'nonexistent');
        Assert.false(result.success, '不存在的卡牌不应能升级');
    });

    // --- 概率分布测试（统计检验）---
    test('draw: 概率分布大致正确（1000次抽样）', () => {
        const state = createState(10000, 10000);
        const counts = { N: 0, R: 0, SR: 0, SSR: 0 };
        for (let i = 0; i < 1000; i++) {
            const result = GachaSystem.draw(state);
            counts[result.card.rarity]++;
        }
        // 允许±10%误差
        Assert.greaterThan(counts.N, 500, 'N卡应占约60%');
        Assert.lessThan(counts.N, 700, 'N卡不应过多');
        Assert.greaterThan(counts.R, 150, 'R卡应占约25%');
        Assert.greaterThan(counts.SR, 50, 'SR卡应占约10%');
        // SSR 5% = 期望50张，但方差大，用警告
        Assert.warn(counts.SSR >= 20, `SSR仅${counts.SSR}张，期望约50（概率事件）`);
    });
});
