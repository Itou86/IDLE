# 代码生成模板

> 常见开发任务的标准代码结构。AI 按模板填充即可，确保一致性。

---

## 模板 1：新增系统模块

适用：添加 `js/systems/newsystem.js`

```javascript
/* ===== 新系统名称 ===== */
const NewSystem = {
    // 常量
    CONST_NAME: value,

    // 公共方法：简短描述
    publicMethod: function(gameState) {
        // 参数校验
        if (!gameState) {
            return { success: false, reason: '状态无效' };
        }

        // 业务逻辑
        // ...

        return { success: true, data: result };
    },

    // 内部：详细描述
    _privateMethod: function(param) {
        // 实现...
    }
};
```

**配套步骤**：
1. 创建 `js/systems/newsystem.js`
2. 在 `index.html` 中引入（在依赖它的系统之前）
3. 在 `tests/index.html` 中引入
4. 创建 `tests/test-newsystem.js`
5. 在 `main.js` 中集成调用
6. 更新 `docs/codemap.md`

---

## 模板 2：新增配置模块

适用：添加 `js/config/newconfig.js`

```javascript
/* ===== 配置名称 ===== */
const NEW_CONFIG = {
    // 核心数据
    key: value,

    // 公共方法：获取xxx
    getSomething: function(param) {
        // 实现...
    }
};
```

**配套步骤**：
1. 创建 `js/config/newconfig.js`
2. 在 `index.html` 中引入（在所有系统之前）
3. 在 `tests/index.html` 中引入
4. 在 `tests/test-config.js` 中验证字段完整性
5. 更新 `docs/codemap.md`

---

## 模板 3：新增卡牌

适用：在 `js/config/cards.js` 的 `pool` 中添加卡牌

```javascript
{ id: '{rarity}_###', name: '卡牌名称', rarity: '{N|R|SR|SSR}', basePower: N, effect: '{power|defense|gold|heal|speed|dropRate|utility}', desc: '效果描述' }
```

**ID 规则**：
- N 卡：`n_001` ~ `n_999`
- R 卡：`r_001` ~ `r_999`
- SR 卡：`sr_001` ~ `sr_999`
- SSR 卡：`ssr_001` ~ `ssr_999`

**配套步骤**：
1. 在 `js/config/cards.js` 的 `pool` 中添加
2. 如果卡牌属于当前世界，在 `worlds[0].cardIds` 中添加 ID
3. 在 `tests/test-config.js` 中验证字段
4. 更新 `docs/codemap.md`

---

## 模板 4：新增成就

适用：在 `js/config/achievements.js` 的 `list` 中添加成就

```javascript
{
    id: '{prefix}_###',
    name: '成就名称',
    description: '解锁条件描述',
    condition: { type: '{condition_type}', value: N },
    reward: { powerBonus: N },
    hidden: false  // 隐藏成就设为 true
}
```

**ID 前缀规则**：
- 数值成就：`num_###`
- 系统成就：`sys_###`
- 组合成就：`combo_###`
- 隐藏成就：`hid_###`

**条件类型**（参见 `achievement.js` 的 `_checkCondition`）：
- `gold_total`: `stats.goldTotal >= value`
- `gacha_count`: `stats.gachaCount >= value`
- `battle_win`: `stats.battleWin >= value`
- `card_count`: `Object.keys(cards).length >= value`
- `card_level`: 任意卡牌 level >= value
- `rarity_obtain`: `stats.rarityObtained[value] === true`
- `set_active`: 套装激活数量 >= value
- `has_cards`: 同时拥有指定 IDs
- `gacha_streak_no_rare`: `stats.streakNoRare >= value`
- `gacha_streak_no_ssr`: `stats.streakNoSSR >= value`
- `lose_streak`: `stats.loseStreak >= value`
- `hoarder`: `gold >= value && gachaCount === 0`
- `gamble`: `gold === 0 && gachaCount > 0`
- `midnight_login`: `new Date().getHours() === 0`
- `click_spam`: 1 分钟内点击 >= value 次

**配套步骤**：
1. 在 `js/config/achievements.js` 的 `list` 中添加
2. 在 `js/systems/achievement.js` 的 `_checkCondition` 中添加检测逻辑（如使用新条件类型）
3. 在 `tests/test-achievement.js` 中添加测试用例
4. 更新 `docs/codemap.md`

---

## 模板 5：新增测试文件

适用：创建 `tests/test-newsystem.js`

```javascript
/* ===== 新系统测试 ===== */
TestRunner.suite('🏷️ 新系统 - NewSystem', (test) => {

    function createState() {
        return {
            gold: 100, tickets: 10, world: 1, subStage: 1, worldProgress: {},
            cards: {}, achievements: {},
            stats: {
                goldTotal: 0, gachaCount: 0, battleWin: 0, battleLose: 0,
                loseStreak: 0, streakNoRare: 0, streakNoSSR: 0,
                rarityObtained: {}, lastSaveTime: Date.now(), createTime: Date.now()
            }
        };
    }

    test('功能1: 正常情况', () => {
        const state = createState();
        const result = NewSystem.method(state);
        Assert.true(result.success, '应成功');
    });

    test('功能1: 边界情况', () => {
        const state = createState();
        // 测试边界...
    });

    test('功能1: 错误情况', () => {
        const state = createState();
        const result = NewSystem.method(state);
        Assert.false(result.success, '应失败');
    });
});
```

**配套步骤**：
1. 创建 `tests/test-newsystem.js`
2. 在 `tests/index.html` 中引入
3. 在 `tests/run-node.js` 中引入（Node.js 方式）
4. 运行测试确认通过

---

## 模板 6：修改数值公式

适用：修改 `js/systems/*.js` 中的计算逻辑

**步骤**：
1. 修改公式前，在 `tests/test-xxx.js` 中记录当前期望值（作为基线）
2. 修改 `js/systems/*.js` 中的公式
3. 根据新公式，手动计算测试数据下的预期输出
4. 更新 `tests/test-xxx.js` 中的期望值
5. 运行测试：`npm test`
6. 更新 `docs/design.md` 中的设计说明（如设计意图有变化）

**注意**：如果公式影响多个系统（如战力公式影响战斗），需要更新多个测试文件。

---

## 模板 7：修改存档结构

适用：新增/删除 `gameState` 字段

**步骤**：
1. 在 `js/main.js` 的 `reset()` 中添加/删除字段，提供默认值
2. 在 `js/systems/save.js` 中检查是否需要迁移逻辑（旧存档 → 新结构）
3. 在 `tests/test-save.js` 中测试新结构的序列化/反序列化
4. 在 `tests/test-integration.js` 中测试完整循环
5. 更新 `CLAUDE.md` 中的状态结构说明

**迁移逻辑模板**：
```javascript
// SaveSystem.load() 中添加
load: function() {
    const data = JSON.parse(localStorage.getItem(this.KEY));
    if (!data) return null;

    // 迁移：旧存档没有 newField，提供默认值
    if (data.newField === undefined) {
        data.newField = defaultValue;
    }

    return data;
}
```
