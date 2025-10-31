#!/bin/bash

# 測試 API 端點
# Usage: ./scripts/test.sh

set -e

API_URL="http://localhost:3001"

echo "🧪 Testing EnglishBrain Backend API..."
echo ""

# 測試健康檢查
echo "1️⃣  Testing Health Check..."
if curl -s -f "$API_URL/health" > /dev/null; then
    echo "   ✅ Health check passed"
    curl -s "$API_URL/health" | python3 -m json.tool
else
    echo "   ❌ Health check failed"
    exit 1
fi

echo ""

# 測試 API 版本
echo "2️⃣  Testing API Version..."
if curl -s -f "$API_URL/api/version" > /dev/null; then
    echo "   ✅ API version check passed"
    curl -s "$API_URL/api/version" | python3 -m json.tool
else
    echo "   ❌ API version check failed"
    exit 1
fi

echo ""

# 測試 404 錯誤處理
echo "3️⃣  Testing 404 Error Handling..."
RESPONSE=$(curl -s "$API_URL/api/nonexistent")
if echo "$RESPONSE" | grep -q "NOT_FOUND"; then
    echo "   ✅ 404 error handling works"
    echo "$RESPONSE" | python3 -m json.tool
else
    echo "   ❌ 404 error handling failed"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
