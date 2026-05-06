/* ===== 存档系统测试 ===== */
TestRunner.suite('💾 存档系统 - SaveSystem', (test) => {

    // 辅助：创建测试状态
    function createState() {
        return {
            gold: 12345,
            tickets: 50,
            stage: 42,
            cards: {
                'n_001': { count: 3, level: 2, instances: ['a', 'b', 'c'] },
                'r_001': { count: 1, level: 1, instances: ['d'] }
            },
            achievements: {
                'num_001': true,
                'num_002': true
            },
            stats: {
                goldTotal: 20000,
                gachaCount: 15,
                battleWin: 8,
                battleLose: 3,
                loseStreak: 0,
                streakNoRare: 5,
                streakNoSSR: 15,
                rarityObtained: { 'N': true, 'R': true },
                lastSaveTime: Date.now(),
                createTime: Date.now() - 3600000
            }
        };
    }

    // --- save / load ---
    test('save: 能保存状态', () => {
        const state = createState();
        const result = SaveSystem.save(state);
        Assert.true(result, '保存应成功');
    });

    test('save: 保存后localStorage有数据', () => {
        const state = createState();
        SaveSystem.save(state);
        const data = localStorage.getItem(SaveSystem.KEY);
        Assert.exists(data, 'localStorage应有存档数据');
        Assert.greaterThan(data.length, 0, '存档数据应非空');
    });

    test('load: 能读取保存的状态', () => {
        const state = createState();
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        Assert.exists(loaded, '应成功读取');
        Assert.equal(loaded.gold, state.gold, '金币应一致');
        Assert.equal(loaded.tickets, state.tickets, '抽卡券应一致');
        Assert.equal(loaded.stage, state.stage, '关卡应一致');
    });

    test('load: 读取的数据结构完整', () => {
        const state = createState();
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        Assert.exists(loaded.cards, '应有cards');
        Assert.exists(loaded.achievements, '应有achievements');
        Assert.exists(loaded.stats, '应有stats');
    });

    test('load: 嵌套对象正确还原', () => {
        const state = createState();
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        Assert.equal(loaded.cards['n_001'].count, 3, '卡牌数量应一致');
        Assert.equal(loaded.cards['n_001'].level, 2, '卡牌等级应一致');
        Assert.equal(loaded.cards['n_001'].instances.length, 3, '实例数应一致');
    });

    test('load: 数组正确还原', () => {
        const state = createState();
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        Assert.includes(loaded.cards['n_001'].instances, 'a', '应包含实例a');
        Assert.includes(loaded.cards['n_001'].instances, 'c', '应包含实例c');
    });

    test('load: 无存档时返回null', () => {
        SaveSystem.reset();
        const loaded = SaveSystem.load();
        Assert.equal(loaded, null, '无存档时应返回null');
    });

    test('load: 修改读取数据不影响存档', () => {
        const state = createState();
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        loaded.gold = 99999;
        const loaded2 = SaveSystem.load();
        Assert.equal(loaded2.gold, state.gold, '修改读取数据不应影响存档');
    });

    // --- reset ---
    test('reset: 删除存档', () => {
        const state = createState();
        SaveSystem.save(state);
        SaveSystem.reset();
        const data = localStorage.getItem(SaveSystem.KEY);
        Assert.equal(data, null, '重置后应无存档');
    });

    test('reset: 重置后可重新存档', () => {
        const state = createState();
        SaveSystem.save(state);
        SaveSystem.reset();
        const result = SaveSystem.save(state);
        Assert.true(result, '重置后应能重新存档');
        const loaded = SaveSystem.load();
        Assert.exists(loaded, '应能读取新存档');
    });

    // --- export / import ---
    test('export: 导出为base64字符串', () => {
        const state = createState();
        const exported = SaveSystem.export(state);
        Assert.type(exported, 'string', '导出应为字符串');
        Assert.greaterThan(exported.length, 0, '导出应非空');
        // base64特征
        Assert.true(/^[A-Za-z0-9+/=]+$/.test(exported), '应为base64格式');
    });

    test('import: 导入后数据一致', () => {
        const state = createState();
        const exported = SaveSystem.export(state);
        const imported = SaveSystem.import(exported);
        Assert.exists(imported, '导入应成功');
        Assert.equal(imported.gold, state.gold, '导入后金币应一致');
        Assert.equal(imported.stage, state.stage, '导入后关卡应一致');
        Assert.equal(imported.stats.gachaCount, state.stats.gachaCount, '导入后统计应一致');
    });

    test('import: 嵌套对象正确', () => {
        const state = createState();
        const exported = SaveSystem.export(state);
        const imported = SaveSystem.import(exported);
        Assert.equal(imported.cards['r_001'].count, 1, '卡牌数据应一致');
        Assert.true(imported.achievements['num_001'], '成就数据应一致');
    });

    test('import: 损坏数据返回null', () => {
        const imported = SaveSystem.import('invalid_base64!!!');
        Assert.equal(imported, null, '损坏数据应返回null');
    });

    test('import: 空字符串返回null', () => {
        const imported = SaveSystem.import('');
        Assert.equal(imported, null, '空字符串应返回null');
    });

    // --- 边界测试 ---
    test('save: 空对象', () => {
        const result = SaveSystem.save({});
        Assert.true(result, '空对象应能保存');
        const loaded = SaveSystem.load();
        Assert.equal(JSON.stringify(loaded), '{}', '空对象应正确还原');
    });

    test('save: 超大数值', () => {
        const state = {
            gold: Number.MAX_SAFE_INTEGER,
            tickets: 999999,
            stage: 999999,
            cards: {},
            achievements: {},
            stats: { goldTotal: Number.MAX_SAFE_INTEGER }
        };
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        Assert.equal(loaded.gold, Number.MAX_SAFE_INTEGER, '超大数值应正确保存');
    });

    test('save: 特殊字符', () => {
        const state = {
            name: '测试🎮<script>alert(1)</script>',
            cards: {},
            achievements: {},
            stats: {}
        };
        SaveSystem.save(state);
        const loaded = SaveSystem.load();
        Assert.equal(loaded.name, state.name, '特殊字符应正确保存');
    });

    test('save: 多次覆盖', () => {
        const state1 = createState();
        state1.gold = 100;
        SaveSystem.save(state1);

        const state2 = createState();
        state2.gold = 200;
        SaveSystem.save(state2);

        const loaded = SaveSystem.load();
        Assert.equal(loaded.gold, 200, '应读取最后一次保存');
    });

    // --- 清理 ---
    test('cleanup: 测试后清理存档', () => {
        SaveSystem.reset();
        const data = localStorage.getItem(SaveSystem.KEY);
        Assert.equal(data, null, '测试结束应清理存档');
    });
});
