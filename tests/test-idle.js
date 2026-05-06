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
    Assert.equal(earned, 2, '基础点击应获得2金币');
    Assert.equal(state.gold, 102, '金币应增加2');
    Assert.equal(state.stats.goldTotal, 102, '金币总计应增加2');
});

test('IdleSystem - 升级后点击收益增加', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 2, autoLevel: 0 };
    const earned = IdleSystem.click(state);
    Assert.equal(earned, 4, '2级点击应获得4金币');
    Assert.equal(state.gold, 104, '金币应增加4');
});

test('IdleSystem - 购买升级A', () => {
    const state = createIdleState(100);
    const result = IdleSystem.buyClickUpgrade(state);
    Assert.true(result.success, '应有足够金币购买升级A');
    Assert.equal(result.newLevel, 1, '等级应为1');
    Assert.equal(result.newValue, 3, '点击收益应为3');
    Assert.equal(state.gold, 95, '应扣除5金币');
    Assert.equal(state.idle.clickLevel, 1, '状态应记录等级');
});

test('IdleSystem - 金币不足无法购买升级A', () => {
    const state = createIdleState(3);
    const result = IdleSystem.buyClickUpgrade(state);
    Assert.false(result.success, '金币不足应失败');
    Assert.equal(result.reason, '金币不足', '应返回正确原因');
    Assert.equal(state.gold, 3, '金币不应变化');
});

test('IdleSystem - 升级A价格递增', () => {
    const state = createIdleState(1000);
    const cost0 = IdleSystem.getClickUpgradeCost(state);
    Assert.equal(cost0, 5, '初始价格应为5');

    IdleSystem.buyClickUpgrade(state);
    const cost1 = IdleSystem.getClickUpgradeCost(state);
    Assert.equal(cost1, 6, '1级后价格应为6（5*1.3=6.5取整）');

    IdleSystem.buyClickUpgrade(state);
    const cost2 = IdleSystem.getClickUpgradeCost(state);
    Assert.equal(cost2, 8, '2级后价格应为8（5*1.3^2=8.45取整）');
});

test('IdleSystem - 购买升级B', () => {
    const state = createIdleState(100);
    const result = IdleSystem.buyAutoUpgrade(state);
    Assert.true(result.success, '应有足够金币购买升级B');
    Assert.equal(result.newLevel, 1, '等级应为1');
    Assert.equal(result.newValue, 2, '每秒收益应为2');
    Assert.equal(state.gold, 80, '应扣除20金币');
    Assert.equal(state.idle.autoLevel, 1, '状态应记录等级');
});

test('IdleSystem - 金币不足无法购买升级B', () => {
    const state = createIdleState(15);
    const result = IdleSystem.buyAutoUpgrade(state);
    Assert.false(result.success, '金币不足应失败');
    Assert.equal(state.gold, 15, '金币不应变化');
});

test('IdleSystem - 升级B价格递增', () => {
    const state = createIdleState(1000);
    const cost0 = IdleSystem.getAutoUpgradeCost(state);
    Assert.equal(cost0, 20, '初始价格应为20');

    IdleSystem.buyAutoUpgrade(state);
    const cost1 = IdleSystem.getAutoUpgradeCost(state);
    Assert.equal(cost1, 30, '1级后价格应为30（20*1.5=30）');
});

test('IdleSystem - 获取每秒自动收益', () => {
    const state = createIdleState(100);
    // 无idle状态时使用默认值，但BASE_AUTO_GOLD=1
    Assert.equal(IdleSystem.getAutoGoldPerSecond(state), 1, '初始应为1（基础自动收益）');

    state.idle = { clickLevel: 0, autoLevel: 3 };
    Assert.equal(IdleSystem.getAutoGoldPerSecond(state), 4, '3级应为4/秒 (1+3)');
});

test('IdleSystem - 离线收益计算', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 2 };  // 基础1 + 2 = 3金币/秒
    state.stats.lastSaveTime = Date.now() - 5000;  // 5秒前

    const result = IdleSystem.calculateOfflineGold(state);
    Assert.equal(result.gold, 15, '5秒离线应获得15金币 (3*5)');
    Assert.equal(result.seconds, 5, '应报告5秒');
    Assert.false(result.capped, '不应被限制');
});

test('IdleSystem - 离线收益上限8小时', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 1 };  // 基础1 + 1 = 2金币/秒
    state.stats.lastSaveTime = Date.now() - 10 * 3600 * 1000;  // 10小时前

    const result = IdleSystem.calculateOfflineGold(state);
    Assert.equal(result.seconds, 8 * 3600, '最多计算8小时');
    Assert.equal(result.gold, 16 * 3600, '8小时应获得57600金币 (2*28800)');
    Assert.true(result.capped, '应标记为被限制');
});

test('IdleSystem - 应用离线收益', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 1 };
    state.stats.lastSaveTime = Date.now() - 3000;

    const result = IdleSystem.applyOfflineGold(state);
    Assert.equal(result.gold, 6, '应获得6金币 (2*3)');
    Assert.equal(state.gold, 106, '金币应增加');
    Assert.equal(state.stats.goldTotal, 106, '总计应增加');
});

test('IdleSystem - 离线收益为0时不变化', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 0, autoLevel: 0 };  // 基础1 + 0 = 1金币/秒
    state.stats.lastSaveTime = Date.now() - 3000;

    const result = IdleSystem.applyOfflineGold(state);
    // 即使autoLevel=0，BASE_AUTO_GOLD=1，所以还是有收益
    Assert.equal(result.gold, 3, '基础自动收益为1/秒，3秒应获得3');
    Assert.equal(state.gold, 103, '金币应增加3');
});

test('IdleSystem - getInfo 返回完整信息', () => {
    const state = createIdleState(100);
    state.idle = { clickLevel: 2, autoLevel: 1 };

    const info = IdleSystem.getInfo(state);
    Assert.equal(info.clickValue, 4, '点击值应为4');
    Assert.equal(info.autoValue, 2, '自动值应为2 (1+1)');
    Assert.equal(info.clickLevel, 2, '点击等级应为2');
    Assert.equal(info.autoLevel, 1, '自动等级应为1');
    Assert.equal(info.clickUpgradeCost, 8, '点击升级价格应为8');
    Assert.equal(info.autoUpgradeCost, 30, '自动升级价格应为30');
    Assert.true(info.canAffordClick, '100金币应够买点击升级');
    Assert.true(info.canAffordAuto, '100金币应够买自动升级');
});

test('IdleSystem - getInfo 金币不足时', () => {
    const state = createIdleState(15);
    const info = IdleSystem.getInfo(state);
    Assert.true(info.canAffordClick, '15金币够买点击升级（5）');
    Assert.false(info.canAffordAuto, '15金币不够买自动升级（20）');
});

test('IdleSystem - 处理无idle状态', () => {
    const state = createIdleState(100);
    // 不设置 state.idle

    Assert.equal(IdleSystem.getAutoGoldPerSecond(state), 1, '无idle状态应为1（基础自动收益）');
    Assert.equal(IdleSystem.getClickUpgradeCost(state), 5, '无idle状态升级价格应为初始值5');
    Assert.equal(IdleSystem.getAutoUpgradeCost(state), 20, '无idle状态自动升级价格应为初始值20');

    const earned = IdleSystem.click(state);
    Assert.equal(earned, 2, '无idle状态点击应为2');
});

});
