/* ===== IdleSystem 测试 ===== */

TestRunner.suite('IdleSystem', (test) => {

// 创建测试用的游戏状态
function createIdleState(gold = 100) {
    return {
        gold: gold,
        tickets: 10,
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

test('IdleSystem - 点击获得金币', () => {
    const state = createIdleState(100);
    const earned = IdleSystem.click(state);
    Assert.equal(earned, 1, '基础点击应获得1金币');
    Assert.equal(state.gold, 101, '金币应增加1');
    Assert.equal(state.stats.goldTotal, 101, '金币总计应增加1');
});

test('IdleSystem - 升级后点击收益增加', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 2, autoLevel: 0 };
    const earned = IdleSystem.click(state);
    Assert.equal(earned, 3, '2级点击应获得3金币');
    Assert.equal(state.gold, 103, '金币应增加3');
});

test('IdleSystem - 购买升级A', () => {
    const state = createIdleState(100);
    const result = IdleSystem.buyClickUpgrade(state);
    Assert.true(result.success, '应有足够金币购买升级A');
    Assert.equal(result.newLevel, 1, '等级应为1');
    Assert.equal(result.newValue, 2, '点击收益应为2');
    Assert.equal(state.gold, 90, '应扣除10金币');
    Assert.equal(state.idle.clickLevel, 1, '状态应记录等级');
});

test('IdleSystem - 金币不足无法购买升级A', () => {
    const state = createIdleState(5);
    const result = IdleSystem.buyClickUpgrade(state);
    Assert.false(result.success, '金币不足应失败');
    Assert.equal(result.reason, '金币不足', '应返回正确原因');
    Assert.equal(state.gold, 5, '金币不应变化');
});

test('IdleSystem - 升级A价格递增', () => {
    const state = createIdleState(1000);
    const cost0 = IdleSystem.getClickUpgradeCost(state);
    Assert.equal(cost0, 10, '初始价格应为10');

    IdleSystem.buyClickUpgrade(state);
    const cost1 = IdleSystem.getClickUpgradeCost(state);
    Assert.equal(cost1, 15, '1级后价格应为15');

    IdleSystem.buyClickUpgrade(state);
    const cost2 = IdleSystem.getClickUpgradeCost(state);
    Assert.equal(cost2, 22, '2级后价格应为22（10*1.5^2=22.5取整）');
});

test('IdleSystem - 购买升级B', () => {
    const state = createIdleState(100);
    const result = IdleSystem.buyAutoUpgrade(state);
    Assert.true(result.success, '应有足够金币购买升级B');
    Assert.equal(result.newLevel, 1, '等级应为1');
    Assert.equal(result.newValue, 1, '每秒收益应为1');
    Assert.equal(state.gold, 50, '应扣除50金币');
    Assert.equal(state.idle.autoLevel, 1, '状态应记录等级');
});

test('IdleSystem - 金币不足无法购买升级B', () => {
    const state = createIdleState(30);
    const result = IdleSystem.buyAutoUpgrade(state);
    Assert.false(result.success, '金币不足应失败');
    Assert.equal(state.gold, 30, '金币不应变化');
});

test('IdleSystem - 升级B价格递增', () => {
    const state = createIdleState(1000);
    const cost0 = IdleSystem.getAutoUpgradeCost(state);
    Assert.equal(cost0, 50, '初始价格应为50');

    IdleSystem.buyAutoUpgrade(state);
    const cost1 = IdleSystem.getAutoUpgradeCost(state);
    Assert.equal(cost1, 90, '1级后价格应为90（50*1.8=90）');
});

test('IdleSystem - 获取每秒自动收益', () => {
    const state = createIdleState(100);
    Assert.equal(IdleSystem.getAutoGoldPerSecond(state), 0, '初始应为0');

    state.idle = { clickLevel: 0, autoLevel: 3 };
    Assert.equal(IdleSystem.getAutoGoldPerSecond(state), 3, '3级应为3/秒');
});

test('IdleSystem - 离线收益计算', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 2 };  // 2金币/秒
    state.stats.lastSaveTime = Date.now() - 5000;  // 5秒前

    const result = IdleSystem.calculateOfflineGold(state);
    Assert.equal(result.gold, 10, '5秒离线应获得10金币');
    Assert.equal(result.seconds, 5, '应报告5秒');
    Assert.false(result.capped, '不应被限制');
});

test('IdleSystem - 离线收益上限8小时', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 1 };  // 1金币/秒
    state.stats.lastSaveTime = Date.now() - 10 * 3600 * 1000;  // 10小时前

    const result = IdleSystem.calculateOfflineGold(state);
    Assert.equal(result.seconds, 8 * 3600, '最多计算8小时');
    Assert.equal(result.gold, 8 * 3600, '8小时应获得28800金币');
    Assert.true(result.capped, '应标记为被限制');
});

test('IdleSystem - 应用离线收益', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 1 };
    state.stats.lastSaveTime = Date.now() - 3000;

    const result = IdleSystem.applyOfflineGold(state);
    Assert.equal(result.gold, 3, '应获得3金币');
    Assert.equal(state.gold, 103, '金币应增加');
    Assert.equal(state.stats.goldTotal, 103, '总计应增加');
});

test('IdleSystem - 离线收益为0时不变化', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 0 };
    state.stats.lastSaveTime = Date.now() - 3000;

    const result = IdleSystem.applyOfflineGold(state);
    Assert.equal(result.gold, 0, '自动收益为0时应获得0');
    Assert.equal(state.gold, 100, '金币不应变化');
});

test('IdleSystem - getInfo 返回完整信息', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 2, autoLevel: 1 };

    const info = IdleSystem.getInfo(state);
    Assert.equal(info.clickValue, 3, '点击值应为3');
    Assert.equal(info.autoValue, 1, '自动值应为1');
    Assert.equal(info.clickLevel, 2, '点击等级应为2');
    Assert.equal(info.autoLevel, 1, '自动等级应为1');
    Assert.equal(info.clickUpgradeCost, 22, '点击升级价格应为22');
    Assert.equal(info.autoUpgradeCost, 90, '自动升级价格应为90');
    Assert.true(info.canAffordClick, '100金币应够买点击升级');
    Assert.true(info.canAffordAuto, '100金币应够买自动升级');
});

test('IdleSystem - getInfo 金币不足时', () => {
    const state = createIdleState(15);
    const info = IdleSystem.getInfo(state);
    Assert.true(info.canAffordClick, '15金币够买点击升级（10）');
    Assert.false(info.canAffordAuto, '15金币不够买自动升级（50）');
});

test('IdleSystem - 处理无idle状态', () => {
    const state = createIdleState(100);
    // 不设置 state.idle

    Assert.equal(IdleSystem.getAutoGoldPerSecond(state), 0, '无idle状态应为0');
    Assert.equal(IdleSystem.getClickUpgradeCost(state), 10, '无idle状态升级价格应为初始值');
    Assert.equal(IdleSystem.getAutoUpgradeCost(state), 50, '无idle状态自动升级价格应为初始值');

    const earned = IdleSystem.click(state);
    Assert.equal(earned, 1, '无idle状态点击应为1');
});

});
