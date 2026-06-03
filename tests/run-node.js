/**
 * Node.js 测试运行器 - 模拟浏览器环境运行 IDLE 游戏测试
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ===== 创建共享上下文 =====
const context = vm.createContext({
    // 基础全局对象
    console,
    Math,
    Date,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Infinity,
    NaN,
    undefined,
    // Buffer for btoa/atob
    Buffer,
});

// ===== 模拟浏览器环境 =====
const localStorageData = {};
context.localStorage = {
    getItem: (key) => localStorageData[key] || null,
    setItem: (key, value) => { localStorageData[key] = value; },
    removeItem: (key) => { delete localStorageData[key]; }
};

context.document = {
    getElementById: () => ({ textContent: '' }),
    createElement: () => ({
        className: '',
        innerHTML: '',
        appendChild: () => {},
        classList: { add: () => {}, toggle: () => {} }
    }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

context.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
context.atob = (str) => Buffer.from(str, 'base64').toString('binary');

// ===== 辅助函数 =====
function loadJS(filePath) {
    const fullPath = path.join(__dirname, filePath);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, context, { filename: filePath });
    
    // Node.js vm.runInContext 中 const 不会暴露到 context
    // 需要手动将常用系统暴露到全局
    const varName = path.basename(filePath, '.js');
    if (context[varName]) {
        // 已经暴露（文件末尾有 window.X = X）
        return;
    }
    // 尝试从脚本内部获取变量名
    // 简单启发式：const X = { ... } 或 const X = (function() {...})()
    const match = code.match(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=/);
    if (match) {
        const name = match[1];
        // 在上下文中评估获取变量
        try {
            const value = vm.runInContext(name, context);
            if (value) {
                context[name] = value;
            }
        } catch (e) {
            // 变量不存在，忽略
        }
    }
}

// ===== 加载游戏代码 =====
loadJS('../js/config/cards.js');
loadJS('../js/config/achievements.js');
loadJS('../js/config/stages.js');
loadJS('../js/config/stats.js');
loadJS('../js/utils/formatter.js');
loadJS('../js/utils/game-utils.js');
loadJS('../js/systems/save.js');
loadJS('../js/systems/effect-registry.js');
loadJS('../js/systems/gacha.js');
loadJS('../js/systems/battle.js');
loadJS('../js/systems/achievement.js');
loadJS('../js/systems/idle.js');
loadJS('../js/systems/shop.js');
loadJS('../js/systems/stats.js');

// 初始化效果注册表（必须在测试运行前）
vm.runInContext('if (typeof EffectRegistry !== "undefined" && EffectRegistry.init) EffectRegistry.init();', context);

// ===== 加载测试框架 =====
loadJS('test-framework.js');

// ===== 覆盖 TestRunner 为 Node 版本 =====
const runnerCode = `
TestRunner.suites = [];
TestRunner.results = { total: 0, passed: 0, failed: 0, warnings: 0 };

TestRunner.suite = function(name, fn) {
    const suite = { name: name, tests: [] };
    this.suites.push(suite);
    fn((desc, testFn) => this._test(suite, desc, testFn));
};

TestRunner._test = function(suite, desc, fn) {
    suite.tests.push({ desc: desc, fn: fn });
};

TestRunner.runAll = function() {
    for (const suite of this.suites) {
        this._runSuite(suite);
    }
    this._printSummary();
};

TestRunner._runSuite = function(suite) {
    let suitePassed = 0, suiteFailed = 0, suiteWarn = 0;
    const results = [];

    for (const test of suite.tests) {
        this.results.total++;
        const result = this._runTest(test);

        if (result.status === 'pass') { this.results.passed++; suitePassed++; }
        else if (result.status === 'fail') { this.results.failed++; suiteFailed++; }
        else { this.results.warnings++; suiteWarn++; }

        results.push(result);
    }

    const statusIcon = suiteFailed > 0 ? '✗' : suiteWarn > 0 ? '⚠' : '✓';
    console.log('\\n' + statusIcon + ' ' + suite.name + '  (' + suitePassed + '/' + suite.tests.length + ')');

    for (const r of results) {
        const icon = r.status === 'pass' ? '  ✓' : r.status === 'warn' ? '  ⚠' : '  ✗';
        console.log(icon + ' ' + r.desc);
        if (r.error) console.log('     ' + r.error);
    }
};

TestRunner._runTest = function(test) {
    try {
        test.fn();
        return { desc: test.desc, status: 'pass' };
    } catch (e) {
        if (e.name === 'AssertionWarning') {
            return { desc: test.desc, status: 'warn', error: e.message };
        }
        return { desc: test.desc, status: 'fail', error: e.message };
    }
};

TestRunner._printSummary = function() {
    console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  总测试: ' + this.results.total);
    console.log('  ✅ 通过: ' + this.results.passed);
    console.log('  ❌ 失败: ' + this.results.failed);
    console.log('  ⚠️  警告: ' + this.results.warnings);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};
`;

vm.runInContext(runnerCode, context);

// ===== 加载测试用例 =====
loadJS('test-formatter.js');
loadJS('test-config.js');
loadJS('test-gacha.js');
loadJS('test-battle.js');
loadJS('test-achievement.js');
loadJS('test-save.js');
loadJS('test-integration.js');
loadJS('test-idle.js');
loadJS('test-shop.js');

// ===== 运行测试 =====
vm.runInContext('TestRunner.runAll();', context);

// ===== 获取结果并退出 =====
const results = vm.runInContext('TestRunner.results', context);
console.log('\n');
if (results.failed > 0) {
    console.log('❌ 有测试失败，请修复上述问题。');
    process.exit(1);
} else {
    console.log('✅ 所有测试通过！');
    process.exit(0);
}
