#!/bin/bash

# 啟動完整的開發環境（Docker + Dev Server）
# Usage: ./scripts/dev.sh

set -e

echo "🚀 Starting complete development environment..."
echo ""

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop first"
    exit 1
fi

# 啟動 Docker 容器
echo "📦 Starting Docker containers..."
docker-compose -f docker-compose.dev.yml up -d

# 等待容器健康檢查通過
echo "⏳ Waiting for containers to be healthy..."
sleep 5

# 檢查容器狀態
STATUS=$(docker-compose -f docker-compose.dev.yml ps | grep -c "healthy" || echo "0")
if [ "$STATUS" -lt 2 ]; then
    echo "⚠️  Warning: Containers may not be fully healthy yet"
fi

echo ""
echo "✅ Docker services started!"
echo ""
echo "🔧 Starting development server..."
echo ""
echo "💡 Server will be available at: http://localhost:3001"
echo "💡 Press Ctrl+C to stop the development server"
echo ""

# 啟動開發服務器
npm run dev
