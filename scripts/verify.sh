#!/bin/bash
# 一键验证脚本：测试 + 硬编码检查 + 文档同步检查
# 用法: bash scripts/verify.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IDLE 项目验证脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 运行测试
echo "🧪 1. 运行测试..."
cd tests
node run-node.js 2>&1 | tee /tmp/test_output.txt
cd ..

# 检查是否有失败
if grep -q "❌ 失败" /tmp/test_output.txt; then
    echo ""
    echo "❌ 测试有失败，请修复后再提交"
    exit 1
fi

echo ""
echo "✅ 测试全部通过"
echo ""

# 2. 硬编码检查（仅检查 systems/，允许 config/ 有数值）
echo "🔍 2. 检查硬编码数值..."
# 简单检查：js/systems/ 中是否有独立的数字赋值（排除 level/count/index 等常见变量）
HARDCODE=$(grep -n "= [0-9]\+" js/systems/*.js | grep -v "//" | grep -v "level\|count\|index\|Date.now\|Math\|floor\|min\|max" | grep -v "COST\|BASE\|value\|bonus" || true)
if [ -n "$HARDCODE" ]; then
    echo "⚠️  发现可能的硬编码数值（请人工确认）："
    echo "$HARDCODE"
    echo ""
else
    echo "✅ 未发现明显硬编码"
    echo ""
fi

# 3. 检查 index.html 引用完整性
echo "📎 3. 检查 index.html 引用..."
MISSING_JS=""
for f in js/systems/*.js js/config/*.js js/utils/*.js; do
    name=$(basename "$f")
    if ! grep -q "$name" index.html; then
        MISSING_JS="$MISSING_JS $name"
    fi
done

if [ -n "$MISSING_JS" ]; then
    echo "⚠️  index.html 可能缺失以下文件引用:"
    echo "$MISSING_JS"
    echo ""
else
    echo "✅ index.html 引用完整"
    echo ""
fi

# 4. 检查 tests/index.html 引用完整性
echo "📎 4. 检查 tests/index.html 引用..."
MISSING_TEST=""
for f in tests/test-*.js; do
    name=$(basename "$f")
    if ! grep -q "$name" tests/index.html; then
        MISSING_TEST="$MISSING_TEST $name"
    fi
done

if [ -n "$MISSING_TEST" ]; then
    echo "⚠️  tests/index.html 可能缺失以下测试引用:"
    echo "$MISSING_TEST"
    echo ""
else
    echo "✅ tests/index.html 引用完整"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  验证完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
