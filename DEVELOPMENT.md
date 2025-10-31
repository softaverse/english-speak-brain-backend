# 開發指南

## Phase 1 MVP - 已完成進度

### ✅ 已完成項目

1. **項目初始化**
   - ✅ Node.js + TypeScript 配置
   - ✅ package.json 和依賴安裝
   - ✅ tsconfig.json 配置（嚴格模式）
   - ✅ .gitignore 和環境變量設置

2. **開發工具配置**
   - ✅ ESLint 配置（TypeScript 支持）
   - ✅ Prettier 代碼格式化
   - ✅ Jest 測試框架配置
   - ✅ Git hooks（預留）

3. **Docker 和數據庫**
   - ✅ Docker Compose 配置（PostgreSQL + Redis）
   - ✅ Prisma ORM 設置
   - ✅ 完整的數據庫 schema 定義（7個模型）
   - ✅ 數據庫種子文件
   - ✅ Prisma Client 生成

4. **Express 應用架構**
   - ✅ 應用配置（app.ts）
   - ✅ 服務器入口（server.ts）
   - ✅ 環境配置管理（Zod 驗證）
   - ✅ 數據庫和 Redis 配置

5. **中間件和工具**
   - ✅ 全局錯誤處理
   - ✅ 請求日誌記錄
   - ✅ CORS 配置
   - ✅ 速率限制（全局、文件上傳、AI 分析）
   - ✅ 請求驗證（Zod）
   - ✅ 統一響應格式
   - ✅ 自定義錯誤類
   - ✅ Winston 日誌工具

6. **項目結構**
   - ✅ 完整的目錄結構
   - ✅ 模塊化設計（practice、review、analytics）
   - ✅ 共享資源（types、utils、constants）
   - ✅ 服務層結構（OpenAI、Storage、Cache）

---

## 🚀 快速開始

### 1. 啟動數據庫和 Redis

```bash
# 啟動 Docker 容器
docker-compose -f docker-compose.dev.yml up -d

# 檢查容器狀態
docker ps
```

### 2. 配置環境變量

編輯 `.env` 文件，確保以下配置正確：

```env
# 必須配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/englishbrain
OPENAI_API_KEY=your_actual_openai_api_key_here

# 其他配置已有默認值
```

### 3. 初始化數據庫

```bash
# 運行數據庫遷移
npm run db:migrate

# 生成 Prisma Client
npm run db:generate

# （可選）運行種子數據
npm run db:seed
```

### 4. 啟動開發服務器

```bash
# 啟動開發服務器（熱重載）
npm run dev
```

服務器將在 `http://localhost:3001` 啟動

### 5. 測試 API

```bash
# 健康檢查
curl http://localhost:3001/health

# API 版本
curl http://localhost:3001/api/version
```

---

## 📁 項目結構

```
src/
├── config/                    # 配置文件
│   ├── environment.ts        # 環境變量配置（Zod 驗證）
│   ├── database.ts           # 數據庫配置
│   ├── redis.ts              # Redis 配置
│   └── openai.ts             # OpenAI 配置
│
├── database/                  # 數據庫相關
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma schema
│   │   └── seed.ts           # 種子數據
│   └── client.ts             # Prisma client
│
├── shared/                    # 共享資源
│   ├── middleware/           # Express 中間件
│   │   ├── errorHandler.ts  # 全局錯誤處理
│   │   ├── logger.ts        # 請求日誌
│   │   ├── rateLimiter.ts   # 速率限制
│   │   └── validator.ts     # 請求驗證
│   ├── utils/                # 工具函數
│   │   ├── errors.ts        # 自定義錯誤類
│   │   ├── logger.ts        # Winston 日誌
│   │   └── response.ts      # 統一響應格式
│   ├── types/                # 類型定義
│   │   └── api.types.ts     # API 類型
│   └── constants/            # 常量
│       ├── errorCodes.ts    # 錯誤碼
│       ├── messages.ts      # 消息模板
│       └── enums.ts         # 枚舉
│
├── modules/                   # 功能模塊
│   ├── practice/             # 練習模塊（待實現）
│   ├── review/               # 複習模塊（待實現）
│   └── analytics/            # 分析模塊（待實現）
│
├── services/                  # 外部服務
│   ├── openai/               # OpenAI 服務（待實現）
│   ├── storage/              # 文件存儲（待實現）
│   └── cache/                # 緩存服務（待實現）
│
├── app.ts                     # Express 應用配置
└── server.ts                  # 服務器入口
```

---

## 📝 下一步開發任務

### 🎯 當前階段：實現核心功能

#### 1. OpenAI 服務集成
- [ ] 實現 Whisper 語音轉文字服務
- [ ] 實現 GPT-4 分析服務
- [ ] 錯誤處理和重試邏輯

#### 2. 文件上傳處理
- [ ] Multer 配置
- [ ] 音頻文件驗證
- [ ] 臨時文件管理
- [ ] 文件清理任務

#### 3. Practice 模塊實現
- [ ] DTO 和驗證器
- [ ] Repository 層（數據訪問）
- [ ] Service 層（業務邏輯）
- [ ] Controller 層（HTTP 處理）
- [ ] 路由配置

---

## 🔧 開發命令

```bash
# 開發
npm run dev              # 啟動開發服務器（熱重載）
npm run build            # 構建生產版本
npm run start            # 啟動生產服務器

# 代碼質量
npm run lint             # 運行 ESLint
npm run lint:fix         # 自動修復 ESLint 問題
npm run format           # 格式化代碼
npm run format:check     # 檢查代碼格式
npm run type-check       # TypeScript 類型檢查

# 數據庫
npm run db:generate      # 生成 Prisma Client
npm run db:migrate       # 運行數據庫遷移
npm run db:migrate:prod  # 生產環境遷移
npm run db:seed          # 運行種子數據
npm run db:studio        # 打開 Prisma Studio

# 測試
npm run test             # 運行測試
npm run test:watch       # 監視模式運行測試
npm run test:coverage    # 生成測試覆蓋率報告
```

---

## 🐳 Docker 命令

```bash
# 啟動服務
docker-compose -f docker-compose.dev.yml up -d

# 停止服務
docker-compose -f docker-compose.dev.yml down

# 查看日誌
docker-compose -f docker-compose.dev.yml logs -f

# 重啟服務
docker-compose -f docker-compose.dev.yml restart

# 清理數據（危險操作）
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🔍 調試和故障排除

### 數據庫連接失敗
1. 確認 Docker 容器正在運行：`docker ps`
2. 檢查 DATABASE_URL 配置是否正確
3. 查看數據庫日誌：`docker logs englishbrain-postgres`

### Redis 連接失敗
- Redis 連接失敗不會阻止應用啟動
- 應用會在日誌中顯示警告但繼續運行
- 檢查 Redis 容器：`docker logs englishbrain-redis`

### TypeScript 編譯錯誤
```bash
# 清理構建緩存
rm -rf dist
npm run build

# 檢查類型
npm run type-check
```

### ESLint 錯誤
```bash
# 自動修復可修復的問題
npm run lint:fix

# 查看所有問題
npm run lint
```

---

## 📚 相關文檔

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 完整架構設計
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - API 規格
- [ROADMAP.md](./ROADMAP.md) - 開發路線圖
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com/)

---

## ✅ 準備好繼續開發了！

基礎架構已經完成，現在可以開始實現核心業務邏輯：
1. OpenAI 服務集成
2. 文件上傳處理
3. Practice API 實現

讓我們繼續構建吧！🚀
