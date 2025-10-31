#!/bin/bash

# 初始化數據庫（遷移 + 種子數據）
# Usage: ./scripts/db-setup.sh

set -e

echo "🗄️  Setting up database..."
echo ""

# 檢查 Docker 容器是否運行
if ! docker ps | grep -q "englishbrain-postgres"; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "Please run './scripts/start.sh' first"
    exit 1
fi

# 生成 Prisma Client
echo "📝 Generating Prisma Client..."
npm run db:generate

# 運行數據庫遷移
echo ""
echo "🔄 Running database migrations..."
npm run db:migrate

# 運行種子數據
echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "💡 You can now start the development server with: npm run dev"
