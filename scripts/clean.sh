#!/bin/bash

# 清理項目（刪除 node_modules, dist, logs 等）
# Usage: ./scripts/clean.sh

set -e

echo "🧹 Cleaning project..."
echo ""

read -p "This will delete node_modules, dist, logs, and uploads. Continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Cleaning cancelled"
    exit 1
fi

# 刪除構建產物
echo "🗑️  Removing build artifacts..."
rm -rf dist
echo "   ✅ Removed dist/"

# 刪除日誌
echo "🗑️  Removing logs..."
rm -rf logs
mkdir -p logs
echo "   ✅ Cleaned logs/"

# 刪除上傳文件
echo "🗑️  Removing uploads..."
rm -rf uploads
mkdir -p uploads
echo "   ✅ Cleaned uploads/"

# 詢問是否刪除 node_modules
read -p "Delete node_modules? (yes/no): " -r
echo ""
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
    echo "   ✅ Removed node_modules/"
    echo ""
    echo "💡 Run 'npm install' to reinstall dependencies"
fi

echo ""
echo "✅ Cleaning completed!"
