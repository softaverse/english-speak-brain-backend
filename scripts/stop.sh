#!/bin/bash

# 停止所有服務
# Usage: ./scripts/stop.sh

set -e

echo "🛑 Stopping EnglishBrain Backend..."
echo ""

# 停止 Docker 容器
echo "📦 Stopping Docker containers..."
docker-compose -f docker-compose.dev.yml down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To restart, run: ./scripts/start.sh"
