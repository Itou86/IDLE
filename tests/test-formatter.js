/* ===== Formatter 工具函数测试 ===== */
TestRunner.suite('🛠️ 工具函数 - Formatter', (test) => {

    // --- number() 大数字格式化 ---
    test('number: 小于1000不转换', () => {
        Assert.equal(Formatter.number(0), '0');
        Assert.equal(Formatter.number(1), '1');
        Assert.equal(Formatter.number(999), '999');
    });

    test('number: 1000-999,999 显示为 K', () => {
        Assert.equal(Formatter.number(1000), '1.0K');
        Assert.equal(Formatter.number(1500), '1.5K');
        Assert.equal(Formatter.number(999999), '1000.0K');
    });

    test('number: 百万级显示为 M', () => {
        Assert.equal(Formatter.number(1000000), '1.0M');
        Assert.equal(Formatter.number(2500000), '2.5M');
        Assert.equal(Formatter.number(100000000), '100.0M');
    });

    test('number: 十亿级显示为 B', () => {
        Assert.equal(Formatter.number(1000000000), '1.0B');
        Assert.equal(Formatter.number(5000000000), '5.0B');
    });

    test('number: 万亿级显示为 T', () => {
        Assert.equal(Formatter.number(1000000000000), '1.0T');
    });

    test('number: 小数精度正确', () => {
        // 小于10保留2位小数
        const r1 = Formatter.number(1234);
        Assert.true(r1.includes('.'), '应包含小数点');
        // 大于等于10保留1位小数
        const r2 = Formatter.number(15000);
        Assert.equal(r2, '15.0K');
    });

    test('number: 负数处理', () => {
        Assert.equal(Formatter.number(-100), '-100');
        Assert.equal(Formatter.number(-1500), '-1.5K');
    });

    test('number: 非数字输入应返回合理结果', () => {
        // 测试 undefined/null 不会崩溃
        const r1 = Formatter.number(undefined);
        Assert.type(r1, 'string');
    });

    // --- time() 时间格式化 ---
    test('time: 秒级显示', () => {
        Assert.equal(Formatter.time(0), '0秒');
        Assert.equal(Formatter.time(30), '30秒');
        Assert.equal(Formatter.time(59), '59秒');
    });

    test('time: 分级显示', () => {
        Assert.equal(Formatter.time(60), '1分');
        Assert.equal(Formatter.time(120), '2分');
        Assert.equal(Formatter.time(3599), '59分');
    });

    test('time: 小时级显示', () => {
        Assert.equal(Formatter.time(3600), '1小时');
        Assert.equal(Formatter.time(7200), '2小时');
        Assert.equal(Formatter.time(86399), '23小时');
    });

    test('time: 天级显示', () => {
        Assert.equal(Formatter.time(86400), '1天');
        Assert.equal(Formatter.time(172800), '2天');
    });

    test('time: 小数秒取整', () => {
        Assert.equal(Formatter.time(59.9), '59秒');
        Assert.equal(Formatter.time(61.5), '1分');
    });

    // --- uid() 唯一ID ---
    test('uid: 生成非空字符串', () => {
        const id = Formatter.uid();
        Assert.type(id, 'string');
        Assert.greaterThan(id.length, 0, 'ID长度应大于0');
    });

    test('uid: 多次生成不重复', () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++) {
            ids.add(Formatter.uid());
        }
        Assert.equal(ids.size, 100, '100次生成应无重复');
    });

    test('uid: 包含时间戳特征', () => {
        const id = Formatter.uid();
        // 应包含字母和数字（36进制）
        Assert.true(/^[a-z0-9]+$/.test(id), '应只包含小写字母和数字');
    });

    // --- clone() 深拷贝 ---
    test('clone: 基本对象深拷贝', () => {
        const obj = { a: 1, b: { c: 2 } };
        const copy = Formatter.clone(obj);
        Assert.equal(copy.a, 1);
        Assert.equal(copy.b.c, 2);
        // 修改副本不应影响原对象
        copy.b.c = 999;
        Assert.equal(obj.b.c, 2, '深拷贝应独立');
    });

    test('clone: 数组深拷贝', () => {
        const arr = [1, [2, 3], { a: 4 }];
        const copy = Formatter.clone(arr);
        Assert.equal(copy.length, 3);
        Assert.equal(copy[1][0], 2);
        // 修改副本
        copy[1][0] = 999;
        Assert.equal(arr[1][0], 2, '数组深拷贝应独立');
    });

    test('clone: 空对象/数组', () => {
        Assert.equal(JSON.stringify(Formatter.clone({})), '{}');
        Assert.equal(JSON.stringify(Formatter.clone([])), '[]');
    });

    test('clone: 嵌套复杂对象', () => {
        const complex = {
            cards: [
                { id: 'n_001', stats: { power: 5, set: ['a', 'b'] } },
                { id: 'r_001', stats: { power: 12, set: ['c'] } }
            ],
            meta: { version: 1, created: Date.now() }
        };
        const copy = Formatter.clone(complex);
        Assert.equal(copy.cards.length, 2);
        Assert.equal(copy.cards[0].stats.set.length, 2);
        // 修改
        copy.cards[0].stats.set.push('x');
        Assert.equal(complex.cards[0].stats.set.length, 2, '嵌套对象应完全独立');
    });
});
