# 错误模式库

> AI 协作者常见错误：症状、检测方法、修复模板。

---

## 模式 1：硬编码数值

**症状**：在 `js/systems/*.js` 中直接写数字。

```javascript
// ❌ 错误：硬编码
if (rarity === 'SSR') power += 80;

// ❌ 错误：硬编码概率
const rates = { N: 0.6, R: 0.25, SR: 0.1, SSR: 0.05 };
```

**检测方法**：
```bash
# 在 js/systems/ 中搜索裸数字（排除注释、行号、已知常量）
grep -n "[0-9]\+" js/systems/*.js | grep -v "//" | grep -v "level\|count\|index\|Date.now"
```

**修复模板**：
```javascript
// ✅ 正确：从配置读取
const config = CARD_CONFIG.pool.find(c => c.id === id);
power += config.basePower * count * multiplier;

// ✅ 正确：从配置读取
const rates = CARD_CONFIG.rates;
```

---

## 模式 2：遗漏 index.html 引入

**症状**：新增 `js/systems/newsystem.js` 或 `tests/test-newsystem.js` 后，忘记在 `index.html` 或 `tests/index.html` 中添加 `<script>` 标签。

**检测方法**：
```bash
# 检查 js/systems/ 下的文件是否都在 index.html 中引用
for f in js/systems/*.js; do
  name=$(basename "$f")
  grep -q "$name" index.html || echo "缺失: $name"
done

# 同理检查 tests/
for f in tests/test-*.js; do
  name=$(basename "$f")
  grep -q "$name" tests/index.html || echo "缺失: $name"
done
```

**修复模板**：在 `index.html` 和 `tests/index.html` 的对应位置添加：
```html
<script src="js/systems/newsystem.js"></script>
<script src="tests/test-newsystem.js"></script>
```

---

## 模式 3：遗漏 gameState 默认值

**症状**：新增 `gameState` 字段后，没有在 `main.js` 的 `reset()` 中提供默认值，导致新存档或重置后字段为 `undefined`。

**检测方法**：
```bash
# 对比 save.js 中序列化的字段 和 main.js reset() 中初始化的字段
grep -o "[a-zA-Z_]\+:" js/systems/save.js | sort -u
grep -o "[a-zA-Z_]\+:" js/main.js | sort -u
```

**修复模板**：在 `main.js` 的 `reset()` 中添加：
```javascript
function reset() {
    return {
        // ... 现有字段
        newField: defaultValue,  // ← 新增
    };
}
```

---

## 模式 4：遗漏 codemap.md 更新

**症状**：新增模块/函数后，`docs/codemap.md` 中没有对应条目。

**检测方法**：
```bash
# 检查 js/systems/ 中的系统名是否在 codemap.md 中出现
for f in js/systems/*.js; do
  name=$(basename "$f" .js)
  grep -iq "$name" docs/codemap.md || echo "codemap 缺失: $name"
done
```

**修复模板**：在 `docs/codemap.md` 的对应章节添加模块/函数条目。

---

## 模式 5：破坏命名约定

**症状**：
- 配置常量没有用 `SCREAMING_SNAKE_CASE`
- 系统对象没有用 `PascalCase + System`
- 私有方法没有用 `_camelCase` 前缀

**检测方法**：
```bash
# 检查配置常量命名
grep "^const [a-z]" js/config/*.js

# 检查系统对象命名
grep "^const [a-z].*System" js/systems/*.js

# 检查私有方法（应有 _ 前缀）
grep "    [a-z].*: function" js/systems/*.js | grep -v "^_"
```

**修复模板**：
```javascript
// ❌ 错误
const myConfig = { ... };
const mySystem = { ... };

// ✅ 正确
const MY_CONFIG = { ... };
const MySystem = { ... };
```

---

## 模式 6：注释风格不一致

**症状**：公共方法没有 `// 公共方法：` 前缀，私有方法没有 `// 内部：` 前缀。

**检测方法**：
```bash
# 检查公共方法注释
grep -n "^[[:space:]]*[a-zA-Z].*: function" js/systems/*.js | grep -v "公共方法\|内部"
```

**修复模板**：
```javascript
// 公共方法：简短描述
publicMethod: function(gameState) { }

// 内部：详细描述
_privateMethod: function() { }
```

---

## 模式 7：修改公式后未同步测试期望值

**症状**：修改了 `js/systems/*.js` 中的数值公式，但 `tests/test-*.js` 中的断言期望值仍是旧值，导致测试失败。

**检测方法**：运行测试 → 查看失败信息 → 检查期望值是否与公式输出一致。

**修复模板**：
1. 手动计算新公式在测试数据下的预期输出
2. 更新测试中的 `Assert.equal(actual, expected)` 的 `expected`
3. 重新运行测试确认

---

## 模式 8：新增成就未添加检测逻辑

**症状**：在 `js/config/achievements.js` 中定义了新成就，但 `js/systems/achievement.js` 的 `_checkCondition` 中没有对应的检测分支。

**检测方法**：
```bash
# 获取所有成就条件类型
 grep -o "condition: { type: '[^']*'" js/config/achievements.js | sed "s/.*type: '//;s/'//" | sort -u

# 获取 _checkCondition 中处理的条件类型
grep "case '" js/systems/achievement.js | sed "s/.*case '//;s/':.*//" | sort -u

# 对比两者差异
```

**修复模板**：在 `achievement.js` 的 `_checkCondition` 中添加：
```javascript
case 'new_condition_type':
    return gameState.stats.someField >= value;
```

---

## 自检速查表

修改完成后，逐项检查：

- [ ] 没有硬编码数值（使用 `*_CONFIG`）
- [ ] 新增文件已在 `index.html` 引入
- [ ] 新增测试已在 `tests/index.html` 引入
- [ ] 新增 `gameState` 字段有默认值（`reset()`）
- [ ] `docs/codemap.md` 已更新
- [ ] 命名符合约定（配置 `SCREAMING_SNAKE_CASE`、系统 `PascalCase`、私有 `_camelCase`）
- [ ] 公共/私有方法注释风格正确
- [ ] 测试期望值已同步（如修改公式）
- [ ] 新增成就有检测逻辑（如修改成就）
- [ ] `npm test` 全部通过
