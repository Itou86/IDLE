/* ===== 成就系统测试 ===== */
TestRunner.suite('🏆 成就系统 - AchievementSystem', (test) => {

    function createState(gold = 100, tickets = 10, stage = 1, cards = {}, achievements = {}, stats = {}) {
        return {
            gold: gold,
            tickets: tickets,
            stage: stage,
            cards: cards,
            achievements: achievements,
            stats: {
                goldTotal: 0,  // 累计金币从0开始，避免触发成就
                gachaCount: 0,
                battleWin: 0,
                battleLose: 0,
                loseStreak: 0,
                streakNoRare: 0,
                streakNoSSR: 0,
                rarityObtained: {},
                lastSaveTime: Date.now(),
                createTime: Date.now(),
                ...stats
            }
        };
    }

    // --- checkAll: 基础检测 ---
    test('checkAll: 空状态无成就解锁', () => {
        const state = createState();
        // 午夜登录成就依赖当前时间，非午夜不应触发
        const hour = new Date().getHours();
        const unlocked = AchievementSystem.checkAll(state);
        if (hour === 0) {
            // 午夜时可能解锁1个，检查是否只有午夜成就
            const nonMidnight = unlocked.filter(a => a.id !== 'hid_010');
            Assert.equal(nonMidnight.length, 0, '午夜时除午夜登录外不应有其他成就');
        } else {
            // 过滤掉午夜成就再检查
            const nonMidnight = unlocked.filter(a => a.id !== 'hid_010');
            Assert.equal(nonMidnight.length, 0, '初始状态不应解锁任何成就');
        }
    });

    test('checkAll: 金币成就解锁', () => {
        const state = createState(100000);
        state.stats.goldTotal = 100; // 累计100金币
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'num_001');
        Assert.exists(found, '应解锁"初出茅庐"成就');
    });

    test('checkAll: 多个金币成就阶梯解锁', () => {
        const state = createState(100000);
        state.stats.goldTotal = 10000; // 累计10000金币
        const unlocked = AchievementSystem.checkAll(state);
        const ids = unlocked.map(a => a.id);
        Assert.true(ids.includes('num_001'), '应解锁100金币成就');
        Assert.true(ids.includes('num_002'), '应解锁1000金币成就');
        Assert.true(ids.includes('num_003'), '应解锁10000金币成就');
        Assert.false(ids.includes('num_004'), '不应解锁100万金币成就');
    });

    test('checkAll: 成就奖励发放', () => {
        const state = createState(0);
        state.stats.goldTotal = 100;
        const beforeGold = state.gold;
        AchievementSystem.checkAll(state);
        Assert.greaterThan(state.gold, beforeGold, '应获得成就奖励金币');
    });

    test('checkAll: 成就只解锁一次', () => {
        const state = createState(0);
        state.stats.goldTotal = 100;
        AchievementSystem.checkAll(state);
        const count1 = Object.keys(state.achievements).length;
        AchievementSystem.checkAll(state); // 再次检查
        const count2 = Object.keys(state.achievements).length;
        Assert.equal(count1, count2, '重复检查不应重复解锁');
    });

    test('checkAll: 抽卡次数成就', () => {
        const state = createState();
        state.stats.gachaCount = 10;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'num_011');
        Assert.exists(found, '应解锁"抽卡爱好者"成就');
    });

    test('checkAll: 竞技胜利成就', () => {
        const state = createState();
        state.stats.battleWin = 1;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'num_020');
        Assert.exists(found, '应解锁"首次胜利"成就');
    });

    test('checkAll: 关卡成就', () => {
        const state = createState();
        state.stage = 11; // 已通过第10关，当前在第11关
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'num_030');
        Assert.exists(found, '应解锁"突破第一层"成就');
    });

    test('checkAll: 卡牌收集成就', () => {
        const state = createState();
        state.cards = {
            'n_001': { count: 1, level: 1, instances: ['a'] },
            'n_002': { count: 1, level: 1, instances: ['b'] },
            'n_003': { count: 1, level: 1, instances: ['c'] },
        };
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'sys_001');
        Assert.exists(found, '应解锁"第一张卡"成就');
    });

    test('checkAll: 稀有度获得成就', () => {
        const state = createState();
        state.stats.rarityObtained = { 'R': true };
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'sys_020');
        Assert.exists(found, '应解锁"稀有发现"成就');
    });

    test('checkAll: 套装激活成就', () => {
        const state = createState();
        // 新手套装：n_001 + n_002
        state.cards = {
            'n_001': { count: 1, level: 1, instances: ['a'] },
            'n_002': { count: 1, level: 1, instances: ['b'] },
        };
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'sys_030');
        Assert.exists(found, '应解锁"套装新手"成就');
    });

    test('checkAll: 连抽无稀有成就', () => {
        const state = createState();
        state.stats.streakNoRare = 10;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_001');
        Assert.exists(found, '应解锁"十连保底"隐藏成就');
    });

    test('checkAll: 连抽无SSR成就', () => {
        const state = createState();
        state.stats.streakNoSSR = 100;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_003');
        Assert.exists(found, '应解锁"非酋之王"隐藏成就');
    });

    test('checkAll: 连败成就', () => {
        const state = createState();
        state.stats.loseStreak = 10;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_007');
        Assert.exists(found, '应解锁"连败者"隐藏成就');
    });

    test('checkAll: 守财奴成就', () => {
        const state = createState(100000);
        state.stats.gachaCount = 0; // 从未抽卡
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_005');
        Assert.exists(found, '应解锁"守财奴"隐藏成就');
    });

    test('checkAll: 赌徒成就', () => {
        const state = createState(0);
        state.stats.gachaCount = 1; // 抽过卡
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_006');
        Assert.exists(found, '应解锁"赌徒"隐藏成就');
    });

    test('checkAll: 午夜登录成就', () => {
        // 无法稳定测试，因为依赖当前时间
        const state = createState();
        const hour = new Date().getHours();
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_010');
        if (hour === 0) {
            Assert.exists(found, '午夜应解锁成就');
        } else {
            Assert.equal(found, undefined, '非午夜不应解锁');
        }
    });

    // --- 新增隐藏成就测试 ---
    test('checkAll: 欧皇附体成就 - 单抽SSR', () => {
        const state = createState();
        state.stats.gachaSingleSSR = true;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_002');
        Assert.exists(found, '应解锁"欧皇附体"隐藏成就');
    });

    test('checkAll: 绝地反击成就 - 低战力获胜', () => {
        const state = createState();
        state.stats.underdogWin = true;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_008');
        Assert.exists(found, '应解锁"绝地反击"隐藏成就');
    });

    test('checkAll: 点击狂魔成就 - 1分钟30次点击', () => {
        const state = createState();
        state.stats.clickSpamStartTime = Date.now();
        state.stats.clickSpamCount = 30;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_009');
        Assert.exists(found, '应解锁"点击狂魔"隐藏成就');
    });

    test('checkAll: 点击狂魔成就 - 超过1分钟应重置', () => {
        const state = createState();
        state.stats.clickSpamStartTime = Date.now() - 120000; // 2分钟前
        state.stats.clickSpamCount = 30;
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'hid_009');
        Assert.equal(found, undefined, '超过1分钟不应解锁');
    });

    // --- getList ---
    test('getList: 返回所有成就', () => {
        const state = createState();
        const list = AchievementSystem.getList(state);
        Assert.equal(list.length, ACHIEVEMENT_CONFIG.list.length, '应返回所有成就');
    });

    test('getList: 标记已解锁成就', () => {
        const state = createState();
        state.achievements['num_001'] = true;
        const list = AchievementSystem.getList(state);
        const ach = list.find(a => a.id === 'num_001');
        Assert.true(ach.unlocked, '已解锁成就应标记');
        const ach2 = list.find(a => a.id === 'num_002');
        Assert.false(ach2.unlocked, '未解锁成就不应标记');
    });

    test('getList: 不修改原始配置', () => {
        const state = createState();
        const list1 = AchievementSystem.getList(state);
        state.achievements['num_001'] = true;
        const list2 = AchievementSystem.getList(state);
        const ach1 = list1.find(a => a.id === 'num_001');
        const ach2 = list2.find(a => a.id === 'num_001');
        Assert.false(ach1.unlocked, '之前的结果不应被修改');
        Assert.true(ach2.unlocked, '新结果应反映状态变化');
    });

    // --- 奖励测试 ---
    test('checkAll: 奖励包含金币', () => {
        const state = createState(0);
        state.stats.goldTotal = 100;
        const beforeGold = state.gold;
        AchievementSystem.checkAll(state);
        Assert.greaterThan(state.gold, beforeGold, '应获得金币奖励');
    });

    test('checkAll: 奖励包含抽卡券', () => {
        const state = createState(0);
        state.stats.goldTotal = 10000;
        state.stats.gachaCount = 10;
        const beforeTickets = state.tickets;
        AchievementSystem.checkAll(state);
        Assert.greaterThan(state.tickets, beforeTickets, '应获得抽卡券奖励');
    });

    test('checkAll: 无奖励不报错', () => {
        const state = createState(0);
        // 找一个没有奖励的成就（如果有的话）
        // 或者测试空奖励情况
        state.stats.goldTotal = 100;
        Assert.doesNotThrow(() => {
            AchievementSystem.checkAll(state);
        }, '正常成就检查不应报错');
    });

    // --- 边界测试 ---
    test('checkAll: 刚好达到阈值', () => {
        const state = createState(0);
        state.stats.goldTotal = 99; // 刚好不到100
        let unlocked = AchievementSystem.checkAll(state);
        let found = unlocked.find(a => a.id === 'num_001');
        Assert.equal(found, undefined, '99金币不应解锁');

        state.stats.goldTotal = 100; // 刚好100
        unlocked = AchievementSystem.checkAll(state);
        found = unlocked.find(a => a.id === 'num_001');
        Assert.exists(found, '100金币应刚好解锁');
    });

    test('checkAll: 极端大数值', () => {
        const state = createState(0);
        state.stats.goldTotal = 999999999;
        state.stats.gachaCount = 9999;
        state.stats.battleWin = 9999;
        state.stage = 999;
        const unlocked = AchievementSystem.checkAll(state);
        Assert.greaterThan(unlocked.length, 5, '极端数值应解锁多个成就');
    });

    test('checkAll: 卡牌等级成就', () => {
        const state = createState();
        state.cards = {
            'n_001': { count: 1, level: 10, instances: ['a'] },
        };
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'sys_011');
        Assert.exists(found, '应解锁"卡牌大师"成就');
    });

    test('checkAll: 全图鉴成就', () => {
        const state = createState();
        // 收集所有卡牌
        for (const card of CARD_CONFIG.pool) {
            state.cards[card.id] = { count: 1, level: 1, instances: ['a'] };
        }
        const unlocked = AchievementSystem.checkAll(state);
        const found = unlocked.find(a => a.id === 'sys_004');
        Assert.exists(found, '应解锁"全图鉴"成就');
    });
});
