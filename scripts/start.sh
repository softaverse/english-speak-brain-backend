#!/bin/bash

# 啟動所有服務
# Usage: ./scripts/start.sh

set -e

echo "🚀 Starting EnglishBrain Backend..."
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
echo ""
echo "⏳ Waiting for containers to be healthy..."
sleep 5

# 檢查容器狀態
echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Docker services started successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Or run './scripts/dev.sh' to start everything"
echo ""
echo "💡 Useful URLs:"
echo "  - API: http://localhost:3001"
echo "  - Health: http://localhost:3001/health"
echo "  - PostgreSQL: localhost:5433"
echo "  - Redis: localhost:6379"
