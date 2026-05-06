/* ===== ShopSystem 测试 ===== */

TestRunner.suite('ShopSystem', (test) => {

function createShopState(gold = 1000) {
    return {
        gold: gold,
        tickets: 0,
        stage: 1,
        cards: {},
        achievements: {},
        shop: {
            lastRefresh: 0,
            cardStock: {}
        },
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

test('ShopSystem - 获取商品列表', () => {
    const state = createShopState(1000);
    const items = ShopSystem.getItems(state);

    // 至少应有券
    const ticket = items.find(i => i.id === 'ticket');
    Assert.exists(ticket, '应有券商品');
    Assert.equal(ticket.cost, 500, '券价格应为500');
    Assert.equal(ticket.type, 'ticket', '类型应为ticket');
});

test('ShopSystem - 商店自动刷新', () => {
    const state = createShopState(1000);
    state.shop.lastRefresh = 0;  // 很久以前

    const items = ShopSystem.getItems(state);
    const cards = items.filter(i => i.type === 'card');
    Assert.true(cards.length >= 2, '应有至少2种卡牌');
    Assert.true(cards.length <= 5, '应最多5种卡牌');

    // 检查都是N卡
    for (const card of cards) {
        Assert.equal(card.rarity, 'N', '商店只应出售N卡');
    }
});

test('ShopSystem - 购买券', () => {
    const state = createShopState(1000);
    const result = ShopSystem.buy(state, 'ticket');

    Assert.true(result.success, '购买券应成功');
    Assert.equal(state.gold, 500, '应扣除500金币');
    Assert.equal(state.tickets, 1, '应获得1张券');
});

test('ShopSystem - 金币不足购买券', () => {
    const state = createShopState(300);
    const result = ShopSystem.buy(state, 'ticket');

    Assert.false(result.success, '金币不足应失败');
    Assert.equal(state.tickets, 0, '不应获得券');
});

test('ShopSystem - 购买卡牌', () => {
    const state = createShopState(1000);
    // 先刷新确保有库存
    ShopSystem.refresh(state);

    // 获取第一个卡牌商品
    const items = ShopSystem.getItems(state);
    const cardItem = items.find(i => i.type === 'card');
    Assert.exists(cardItem, '应有卡牌商品');

    const cardId = cardItem.id;
    const beforeStock = state.shop.cardStock[cardId];

    const result = ShopSystem.buy(state, cardId);
    Assert.true(result.success, '购买卡牌应成功');
    Assert.equal(state.gold, 1000 - 300, '应扣除300金币');
    Assert.equal(state.shop.cardStock[cardId], beforeStock - 1, '库存应减少');
    Assert.equal(state.cards[cardId].count, 1, '应获得1张卡牌');
});

test('ShopSystem - 购买不存在商品', () => {
    const state = createShopState(1000);
    const result = ShopSystem.buy(state, 'nonexistent');

    Assert.false(result.success, '购买不存在商品应失败');
});

test('ShopSystem - 库存不足', () => {
    const state = createShopState(1000);
    ShopSystem.refresh(state);

    const items = ShopSystem.getItems(state);
    const cardItem = items.find(i => i.type === 'card');
    if (!cardItem) return;  // 无卡牌则跳过

    const cardId = cardItem.id;
    // 买光库存
    const stock = state.shop.cardStock[cardId];
    for (let i = 0; i < stock; i++) {
        const r = ShopSystem.buy(state, cardId);
        Assert.true(r.success, `第${i+1}次购买应成功`);
    }

    // 再买一次应失败
    const result = ShopSystem.buy(state, cardId);
    Assert.false(result.success, '库存不足应失败');
    Assert.equal(result.reason, '库存不足', '应返回库存不足');
});

test('ShopSystem - 手动刷新', () => {
    const state = createShopState(1000);
    const oldRefresh = state.shop.lastRefresh;

    // 等待一小段时间确保时间变化
    const result = ShopSystem.refresh(state);
    Assert.true(result.success, '手动刷新应成功');
    Assert.true(state.shop.lastRefresh > oldRefresh, '刷新时间应更新');
});

test('ShopSystem - 获取下次刷新时间', () => {
    const state = createShopState(1000);
    ShopSystem.refresh(state);

    const remaining = ShopSystem.getNextRefreshTime(state);
    Assert.true(remaining > 0, '应有剩余时间');
    Assert.true(remaining <= 20 * 60 * 1000, '应不超过20分钟');
});

test('ShopSystem - 卡牌库存范围', () => {
    const state = createShopState(1000);
    ShopSystem.refresh(state);

    const stockValues = Object.values(state.shop.cardStock);
    Assert.true(stockValues.length >= 2, '应有至少2种卡牌库存');
    Assert.true(stockValues.length <= 5, '应最多5种卡牌库存');

    for (const stock of stockValues) {
        Assert.true(stock >= 1, '每种库存至少1张');
        Assert.true(stock <= 3, '每种库存最多3张');
    }
});

test('ShopSystem - 购买卡牌记录稀有度', () => {
    const state = createShopState(1000);
    ShopSystem.refresh(state);

    const items = ShopSystem.getItems(state);
    const cardItem = items.find(i => i.type === 'card');
    if (!cardItem) return;

    ShopSystem.buy(state, cardItem.id);
    Assert.true(state.stats.rarityObtained['N'], '应记录获得N卡');
});

});