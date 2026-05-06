/* ===== 集成测试 - 核心游戏循环 ===== */
TestRunner.suite('🎮 集成测试 - 核心循环', (test) => {

    function createFreshGame() {
        return {
            gold: 100,
            tickets: 10,
            stage: 1,
            cards: {},
            achievements: {},
            stats: {
                goldTotal: 100,
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

    // --- 完整循环：抽卡 → 竞技 → 奖励 → 再抽卡 ---
    test('integration: 抽卡获得卡牌提升战力', () => {
        const state = createFreshGame();
        const powerBefore = GachaSystem.getTotalPower(state);

        // 抽卡
        const result = GachaSystem.draw(state);
        Assert.true(result.success, '应成功抽卡');

        const powerAfter = GachaSystem.getTotalPower(state);
        Assert.greaterThan(powerAfter.power, powerBefore.power,
            '抽卡后战力应提升');
    });

    test('integration: 抽卡后竞技变强', () => {
        const state = createFreshGame();
        state.stage = 5;

        // 先不抽卡，记录战力
        const weakInfo = BattleSystem.getCurrentStageInfo(state);

        // 抽卡增强
        for (let i = 0; i < 5; i++) {
            GachaSystem.draw(state);
        }

        const strongInfo = BattleSystem.getCurrentStageInfo(state);
        Assert.greaterThan(strongInfo.playerPower, weakInfo.playerPower,
            '抽卡后玩家战力应更高');
    });

    test('integration: 竞技胜利获得资源可再抽卡', () => {
        const state = createFreshGame();
        // 装备强力卡牌确保胜利
        state.cards['ssr_001'] = { count: 1, level: 1, instances: ['a'] };

        const beforeTickets = state.tickets;

        // 竞技胜利
        const battleResult = BattleSystem.fight(state);
        Assert.true(battleResult.win, '应胜利');

        // 检查获得奖励
        Assert.greaterThan(state.gold, 100, '应获得金币');
        // 高关卡可能有券奖励

        // 用获得的资源继续抽卡（如果有券的话）
        if (state.tickets >= 10) {
            const gachaResult = GachaSystem.draw(state);
            Assert.true(gachaResult.success, '应有足够券再抽卡');
        }
    });

    test('integration: 完整循环10次', () => {
        const state = createFreshGame();
        state.tickets = 100; // 给足够券

        let wins = 0;
        let draws = 0;

        for (let i = 0; i < 10; i++) {
            // 抽卡
            if (state.tickets >= 10) {
                const r = GachaSystem.draw(state);
                if (r.success) draws++;
            }

            // 竞技
            const br = BattleSystem.fight(state);
            if (br.win) wins++;
        }

        Assert.greaterThan(draws, 0, '应至少抽卡几次');
        Assert.greaterThan(wins, 0, '应至少赢几次');
        Assert.greaterThan(Object.keys(state.cards).length, 0, '应获得卡牌');
    });

    test('integration: 存档保存完整游戏进度', () => {
        const state = createFreshGame();
        state.tickets = 50;

        // 玩几轮
        for (let i = 0; i < 5; i++) {
            if (state.tickets >= 10) GachaSystem.draw(state);
            BattleSystem.fight(state);
            AchievementSystem.checkAll(state);
        }

        // 保存
        SaveSystem.save(state);
        const loaded = SaveSystem.load();

        // 验证所有字段
        Assert.equal(loaded.gold, state.gold, '金币应一致');
        Assert.equal(loaded.tickets, state.tickets, '券应一致');
        Assert.equal(loaded.stage, state.stage, '关卡应一致');
        Assert.equal(
            Object.keys(loaded.cards).length,
            Object.keys(state.cards).length,
            '卡牌数应一致'
        );
        Assert.equal(
            Object.keys(loaded.achievements).length,
            Object.keys(state.achievements).length,
            '成就数应一致'
        );
        Assert.equal(loaded.stats.gachaCount, state.stats.gachaCount, '抽卡数应一致');
        Assert.equal(loaded.stats.battleWin, state.stats.battleWin, '胜利数应一致');
    });

    test('integration: 读取存档后继续游戏', () => {
        const state = createFreshGame();
        state.tickets = 30;

        // 玩一轮
        GachaSystem.draw(state);
        BattleSystem.fight(state);
        SaveSystem.save(state);

        // 模拟"重新打开游戏"
        const loaded = SaveSystem.load();

        // 继续玩
        if (loaded.tickets >= 10) {
            const r = GachaSystem.draw(loaded);
            Assert.true(r.success, '读档后应能继续抽卡');
        }
        const br = BattleSystem.fight(loaded);
        Assert.exists(br.win !== undefined, '读档后应能继续竞技');
    });

    test('integration: 成就系统与抽卡联动', () => {
        const state = createFreshGame();
        state.tickets = 100;

        // 抽10次
        for (let i = 0; i < 10; i++) {
            GachaSystem.draw(state);
        }

        const unlocked = AchievementSystem.checkAll(state);
        const ach = unlocked.find(a => a.id === 'num_011');
        Assert.exists(ach, '抽10次应解锁"抽卡爱好者"');
    });

    test('integration: 成就系统与竞技联动', () => {
        const state = createFreshGame();
        state.cards['ssr_001'] = { count: 1, level: 1, instances: ['a'] };

        // 赢10次
        for (let i = 0; i < 10; i++) {
            BattleSystem.fight(state);
        }

        const unlocked = AchievementSystem.checkAll(state);
        const ach = unlocked.find(a => a.id === 'num_021');
        Assert.exists(ach, '赢10次应解锁"连胜新手"');
    });

    test('integration: 卡牌升级提升战力帮助通关', () => {
        const state = createFreshGame();
        state.stage = 8; // 有点难的关卡
        state.cards['n_001'] = { count: 5, level: 1, instances: ['a','b','c','d','e'] };

        const info1 = BattleSystem.getCurrentStageInfo(state);

        // 升级卡牌
        const upgradeResult = GachaSystem.upgradeCard(state, 'n_001');
        if (upgradeResult.success) {
            const info2 = BattleSystem.getCurrentStageInfo(state);
            Assert.greaterThan(info2.playerPower, info1.playerPower,
                '升级后应更强');
        }
    });

    test('integration: 套装羁绊激活', () => {
        const state = createFreshGame();
        // 装备新手套装
        state.cards['n_001'] = { count: 1, level: 1, instances: ['a'] };
        state.cards['n_002'] = { count: 1, level: 1, instances: ['b'] };

        const power = GachaSystem.getTotalPower(state);
        // 新手套装 bonus: power +5
        // 基础10 + 剑5 + 盾3(防御) + 套装5 = 约23
        Assert.greaterThan(power.power, 15, '套装加成应提升战力');
    });

    test('integration: 连败后抽卡变强再胜利', () => {
        const state = createFreshGame();
        state.stage = 20; // 高难度

        // 连败几次
        let loses = 0;
        for (let i = 0; i < 5; i++) {
            const r = BattleSystem.fight(state);
            if (!r.win) loses++;
        }

        Assert.greaterThan(loses, 0, '应连败几次');

        // 给强力装备
        state.cards['ssr_001'] = { count: 5, level: 10, instances: Array(5).fill('x') };

        // 再挑战
        const r = BattleSystem.fight(state);
        Assert.true(r.win, '变强后应能胜利');
        Assert.equal(state.stats.loseStreak, 0, '胜利后连败应重置');
    });

    test('integration: 导出导入完整进度', () => {
        const state = createFreshGame();
        state.tickets = 50;

        // 玩一段时间
        for (let i = 0; i < 5; i++) {
            if (state.tickets >= 10) GachaSystem.draw(state);
            BattleSystem.fight(state);
        }
        AchievementSystem.checkAll(state);

        // 导出
        const exported = SaveSystem.export(state);
        // 模拟"分享存档"
        const imported = SaveSystem.import(exported);

        Assert.equal(imported.gold, state.gold, '导入后金币应一致');
        Assert.equal(imported.stage, state.stage, '导入后关卡应一致');
        Assert.equal(
            Object.keys(imported.cards).length,
            Object.keys(state.cards).length,
            '导入后卡牌应一致'
        );
        Assert.equal(
            Object.keys(imported.achievements).length,
            Object.keys(state.achievements).length,
            '导入后成就应一致'
        );
    });

    test('integration: 从零开始到第10关', () => {
        const state = createFreshGame();
        state.tickets = 200; // 足够资源

        // 目标是到达第10关
        let rounds = 0;
        const maxRounds = 100;

        while (state.stage < 10 && rounds < maxRounds) {
            rounds++;

            // 抽卡增强
            if (state.tickets >= 10) {
                GachaSystem.draw(state);
            }

            // 挑战
            BattleSystem.fight(state);

            // 检查成就
            AchievementSystem.checkAll(state);
        }

        Assert.greaterThanOrEqual(state.stage, 10,
            `应在${maxRounds}轮内到达第10关，实际用了${rounds}轮到达第${state.stage}关`);
    });

    // --- 清理 ---
    test('cleanup: 清理测试存档', () => {
        SaveSystem.reset();
        const data = localStorage.getItem(SaveSystem.KEY);
        Assert.equal(data, null, '应清理测试存档');
    });
});
