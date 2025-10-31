#!/bin/bash

# 重啟所有服務
# Usage: ./scripts/restart.sh

set -e

echo "🔄 Restarting EnglishBrain Backend..."
echo ""

# 停止服務
./scripts/stop.sh

echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

# 啟動服務
./scripts/start.sh
