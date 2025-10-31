#!/bin/bash

# 查看所有服務狀態
# Usage: ./scripts/status.sh

echo "📊 EnglishBrain Backend - Service Status"
echo "========================================"
echo ""

# Docker 容器狀態
echo "📦 Docker Containers:"
echo "--------------------"
if docker ps | grep -q "englishbrain"; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|englishbrain"
else
    echo "No EnglishBrain containers running"
fi

echo ""
echo "🔌 Port Status:"
echo "---------------"
echo -n "PostgreSQL (5433): "
if lsof -i :5433 > /dev/null 2>&1; then
    echo "✅ In use"
else
    echo "❌ Available"
fi

echo -n "Redis (6379): "
if lsof -i :6379 > /dev/null 2>&1; then
    echo "✅ In use"
else
    echo "❌ Available"
fi

echo -n "API Server (3001): "
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ In use"
else
    echo "❌ Available"
fi

echo ""
echo "💾 Docker Volumes:"
echo "------------------"
docker volume ls | grep -E "NAME|english-speak-brain-backend" || echo "No volumes found"

echo ""
echo "💡 Quick Commands:"
echo "------------------"
echo "  Start services:   ./scripts/start.sh"
echo "  Stop services:    ./scripts/stop.sh"
echo "  Start dev mode:   ./scripts/dev.sh"
echo "  Check logs:       ./scripts/logs.sh"
