#!/bin/bash

# 重置數據庫（危險操作！會刪除所有數據）
# Usage: ./scripts/db-reset.sh

set -e

echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Database reset cancelled"
    exit 1
fi

echo "🗑️  Resetting database..."
echo ""

# 停止容器並刪除數據卷
echo "📦 Stopping containers and removing volumes..."
docker-compose -f docker-compose.dev.yml down -v

# 重新啟動容器
echo ""
echo "📦 Starting fresh containers..."
docker-compose -f docker-compose.dev.yml up -d

# 等待容器啟動
echo "⏳ Waiting for containers to be ready..."
sleep 5

# 運行數據庫設置
echo ""
./scripts/db-setup.sh

echo ""
echo "✅ Database reset completed!"
