/* ===== 轻量级测试框架 ===== */
const TestRunner = {
    suites: [],
    results: { total: 0, passed: 0, failed: 0, warnings: 0 },

    // 定义测试套件
    suite: function(name, fn) {
        const suite = { name, tests: [] };
        this.suites.push(suite);
        fn((desc, testFn) => this._test(suite, desc, testFn));
    },

    // 内部：添加单个测试
    _test: function(suite, desc, fn) {
        suite.tests.push({ desc, fn });
    },

    // 运行所有测试
    runAll: function() {
        const container = document.getElementById('results');
        container.innerHTML = '';

        for (const suite of this.suites) {
            this._runSuite(suite, container);
        }

        this._updateSummary();
    },

    // 运行单个套件
    _runSuite: function(suite, container) {
        const suiteEl = document.createElement('div');
        suiteEl.className = 'suite';

        let suitePassed = 0, suiteFailed = 0, suiteWarn = 0;
        const testsHtml = [];

        for (const test of suite.tests) {
            this.results.total++;
            const result = this._runTest(test);

            if (result.status === 'pass') { this.results.passed++; suitePassed++; }
            else if (result.status === 'fail') { this.results.failed++; suiteFailed++; }
            else { this.results.warnings++; suiteWarn++; }

            testsHtml.push(this._renderTest(result));
        }

        const statusClass = suiteFailed > 0 ? 'fail' : suiteWarn > 0 ? 'warn' : 'pass';
        const statusIcon = suiteFailed > 0 ? '✗' : suiteWarn > 0 ? '⚠' : '✓';

        suiteEl.innerHTML = `
            <div class="suite-header">
                <span>${statusIcon} ${suite.name}</span>
                <span>${suitePassed}/${suite.tests.length}</span>
            </div>
            <div class="suite-body">
                ${testsHtml.join('')}
            </div>
        `;

        // 如果有失败，默认展开
        if (suiteFailed > 0) suiteEl.classList.add('open');

        container.appendChild(suiteEl);
    },

    // 运行单个测试
    _runTest: function(test) {
        try {
            test.fn();
            return { desc: test.desc, status: 'pass', msg: '通过' };
        } catch (e) {
            if (e.name === 'AssertionWarning') {
                return { desc: test.desc, status: 'warn', msg: e.message };
            }
            return { desc: test.desc, status: 'fail', msg: '失败', error: e.message };
        }
    },

    // 渲染单个测试结果
    _renderTest: function(result) {
        const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
        return `
            <div class="test">
                <div class="status ${result.status}">${icon}</div>
                <div class="test-content">
                    <div class="test-name">${result.desc}</div>
                    <div class="test-msg">${result.msg}</div>
                    ${result.error ? `<div class="test-error">${result.error}</div>` : ''}
                </div>
            </div>
        `;
    },

    // 更新汇总
    _updateSummary: function() {
        document.getElementById('total').textContent = this.results.total;
        document.getElementById('passed').textContent = this.results.passed;
        document.getElementById('failed').textContent = this.results.failed;
        document.getElementById('warnings').textContent = this.results.warnings;
    }
};

// ===== 断言工具 =====
const Assert = {
    // 相等
    equal: function(actual, expected, msg) {
        if (actual !== expected) {
            throw new Error(`${msg || '断言失败'}: 期望 ${expected}, 实际 ${actual}`);
        }
    },

    // 不相等
    notEqual: function(actual, expected, msg) {
        if (actual === expected) {
            throw new Error(`${msg || '断言失败'}: 不应等于 ${expected}`);
        }
    },

    // 真值
    true: function(value, msg) {
        if (!value) {
            throw new Error(msg || '期望为真值');
        }
    },

    // 假值
    false: function(value, msg) {
        if (value) {
            throw new Error(msg || '期望为假值');
        }
    },

    // 包含
    includes: function(haystack, needle, msg) {
        if (!haystack.includes(needle)) {
            throw new Error(`${msg || '断言失败'}: ${haystack} 不包含 ${needle}`);
        }
    },

    // 大于
    greaterThan: function(actual, expected, msg) {
        if (!(actual > expected)) {
            throw new Error(`${msg || '断言失败'}: ${actual} 不大于 ${expected}`);
        }
    },

    // 大于等于
    greaterThanOrEqual: function(actual, expected, msg) {
        if (!(actual >= expected)) {
            throw new Error(`${msg || '断言失败'}: ${actual} 小于 ${expected}`);
        }
    },

    // 小于
    lessThan: function(actual, expected, msg) {
        if (!(actual < expected)) {
            throw new Error(`${msg || '断言失败'}: ${actual} 不小于 ${expected}`);
        }
    },

    // 数组/对象长度
    length: function(obj, expected, msg) {
        const len = obj.length !== undefined ? obj.length : Object.keys(obj).length;
        if (len !== expected) {
            throw new Error(`${msg || '断言失败'}: 期望长度 ${expected}, 实际 ${len}`);
        }
    },

    // 存在（非 null/undefined）
    exists: function(value, msg) {
        if (value === null || value === undefined) {
            throw new Error(msg || '期望存在值');
        }
    },

    // 类型检查
    type: function(value, expectedType, msg) {
        const actual = typeof value;
        if (actual !== expectedType) {
            throw new Error(`${msg || '断言失败'}: 期望类型 ${expectedType}, 实际 ${actual}`);
        }
    },

    // 近似相等（浮点数）
    approx: function(actual, expected, epsilon, msg) {
        epsilon = epsilon || 0.0001;
        if (Math.abs(actual - expected) > epsilon) {
            throw new Error(`${msg || '断言失败'}: ${actual} 不近似等于 ${expected}`);
        }
    },

    // 警告（不终止测试套件，但标记为警告）
    warn: function(condition, msg) {
        if (!condition) {
            const e = new Error(msg || '警告');
            e.name = 'AssertionWarning';
            throw e;
        }
    },

    // 抛出异常
    throws: function(fn, msg) {
        let threw = false;
        try { fn(); } catch (e) { threw = true; }
        if (!threw) {
            throw new Error(msg || '期望抛出异常');
        }
    },

    // 不抛出异常
    doesNotThrow: function(fn, msg) {
        try { fn(); } catch (e) {
            throw new Error((msg || '不应抛出异常') + ': ' + e.message);
        }
    }
};
