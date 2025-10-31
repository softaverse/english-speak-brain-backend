#!/bin/bash

# 查看 Docker 容器日誌
# Usage: ./scripts/logs.sh [service]
# Example: ./scripts/logs.sh postgres

SERVICE=${1:-}

if [ -z "$SERVICE" ]; then
    echo "📋 Showing logs for all services..."
    echo "Press Ctrl+C to stop"
    echo ""
    docker-compose -f docker-compose.dev.yml logs -f
else
    echo "📋 Showing logs for $SERVICE..."
    echo "Press Ctrl+C to stop"
    echo ""
    docker-compose -f docker-compose.dev.yml logs -f "$SERVICE"
fi
