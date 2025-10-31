# EnglishBrain Backend API

AI-Powered English Speaking Practice App 的後端 API 服務

## 📚 文檔索引

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 完整的系統架構設計
  - 技術棧選型
  - 項目結構詳解
  - 數據模型設計
  - AI 服務集成方案
  - 性能優化策略
  - 安全考慮

- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)** - API 端點詳細規格
  - 所有 API 端點定義
  - 請求/響應格式
  - 錯誤代碼參考
  - 速率限制說明

- **[ROADMAP.md](./ROADMAP.md)** - 開發路線圖和實施計劃
  - 分階段開發計劃
  - 時間表和里程碑
  - 技術決策記錄
  - 風險管理

## 🚀 快速開始

### 前置要求

- Node.js 18+
- Docker Desktop（用於 PostgreSQL 和 Redis）
- OpenAI API Key

### 🎯 使用便捷腳本（推薦）⭐

我們提供了一系列 Bash 腳本來簡化開發流程：

```bash
# 1. 安裝依賴
npm install

# 2. 配置環境變量
cp .env.example .env
# 編輯 .env 文件，添加您的 OpenAI API Key

# 3. 一鍵啟動完整開發環境
./scripts/dev.sh
```

**就這麼簡單！** 🎉 腳本會自動啟動 Docker 服務和開發服務器。

### 📝 更多腳本命令

```bash
# 啟動 Docker 服務（PostgreSQL + Redis）
./scripts/start.sh

# 停止所有服務
./scripts/stop.sh

# 初始化數據庫
./scripts/db-setup.sh

# 查看服務狀態
./scripts/status.sh

# 測試 API
./scripts/test.sh

# 查看日誌
./scripts/logs.sh
```

**完整腳本文檔**: [scripts/README.md](./scripts/README.md)

### 🔧 傳統方式

如果您不想使用腳本：

```bash
# 1. 安裝依賴
npm install

# 2. 配置環境變量
cp .env.example .env
# 編輯 .env 文件，填入必要的配置

# 3. 啟動 Docker 服務
docker-compose -f docker-compose.dev.yml up -d

# 4. 數據庫初始化
npm run db:migrate
npm run db:seed

# 5. 啟動開發服務器
npm run dev
```

## 🏗️ 技術棧

### 核心技術
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis

### AI 服務
- **Speech-to-Text**: OpenAI Whisper API
- **Grammar Analysis**: OpenAI GPT-4 API

### 開發工具
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Documentation**: Swagger/OpenAPI

## 📊 項目架構

```
分層架構 (Layered Architecture)

Controller Layer    ← HTTP 請求/響應處理
     ↓
Service Layer       ← 核心業務邏輯
     ↓
Repository Layer    ← 數據訪問抽象
     ↓
Database           ← PostgreSQL 數據持久化
```

## 🎯 API 模塊

### 1. Practice API
語音錄音分析和練習管理
- 語音轉文字（Whisper）
- AI 語法分析（GPT-4）
- 發音評估
- 練習歷史管理

### 2. Review API
每日複習和練習生成
- 基於錯誤的智能練習生成
- 多種題型支持
- 進度追蹤
- Streak 管理

### 3. Analytics API
學習分析和進度追蹤
- 統計數據匯總
- 錯誤趨勢分析
- 流暢度指標
- 個性化學習洞察

## 📈 開發階段

### ✅ Phase 0: 規劃完成
- [x] 架構設計
- [x] API 規格定義
- [x] 開發路線圖

### 🚧 Phase 1: 基礎架構 (Week 1-2)
- [ ] 項目初始化
- [ ] 數據庫設置
- [ ] Practice API 實現
- [ ] OpenAI 集成

### 📅 Phase 2: Review & Analytics (Week 3-4)
- [ ] Review 模塊
- [ ] Analytics 模塊
- [ ] 後台任務調度

### 🎨 Phase 3: 優化完善 (Week 5-6)
- [ ] 性能優化
- [ ] 測試和文檔
- [ ] Redis 緩存

### 🚀 Phase 4: 生產準備 (Week 7-8)
- [ ] 用戶認證
- [ ] 監控日誌
- [ ] 部署準備

## 🔑 主要 API 端點

```
POST   /api/practice/analyze        - 分析語音錄音
GET    /api/practice/history        - 獲取練習歷史
POST   /api/practice/session/start  - 開始練習會話
POST   /api/practice/session/end    - 結束練習會話

GET    /api/review/today            - 獲取今日複習
POST   /api/review/submit           - 提交練習答案
POST   /api/review/complete         - 完成今日複習

GET    /api/analytics/stats         - 獲取統計數據
GET    /api/analytics/error-trends  - 獲取錯誤趨勢
GET    /api/analytics/fluency       - 獲取流暢度指標
GET    /api/analytics/insights      - 獲取學習洞察
GET    /api/analytics/progress      - 獲取進度數據
```

詳細 API 規格請參考 [API_SPECIFICATION.md](./API_SPECIFICATION.md)

## 🗄️ 數據模型

主要實體：
- **User** - 用戶信息
- **Practice** - 練習記錄
- **PracticeSession** - 練習會話
- **Review** - 每日複習
- **ExerciseSubmission** - 練習提交
- **UserAnalytics** - 用戶分析數據
- **ErrorPattern** - 錯誤模式

詳細數據模型設計請參考 [ARCHITECTURE.md](./ARCHITECTURE.md#數據模型設計)

## 🧪 測試（待實施）

```bash
# 運行所有測試
npm test

# 運行單元測試
npm run test:unit

# 運行集成測試
npm run test:integration

# 測試覆蓋率
npm run test:coverage
```

## 📝 開發規範

### Git Commit 規範
```
feat: 新功能
fix: Bug 修復
docs: 文檔更新
style: 代碼格式調整
refactor: 代碼重構
test: 測試相關
chore: 構建/工具相關
```

### 分支策略
```
main      - 生產環境
develop   - 開發主分支
feature/* - 功能分支
fix/*     - Bug 修復分支
```

## 🔒 安全考慮

- 輸入驗證（Zod）
- SQL 注入防護（Prisma）
- XSS 防護
- CORS 配置
- 速率限制
- 數據加密
- HTTPS 強制

## 📦 部署

### 使用 Docker（推薦）
```bash
# 構建鏡像
docker-compose build

# 啟動服務
docker-compose up -d
```

### 傳統部署
```bash
# 構建
npm run build

# 使用 PM2 運行
pm2 start dist/server.js
```

詳細部署指南請參考 [ROADMAP.md](./ROADMAP.md#week-8-監控日誌和部署)

## 💰 成本估算

### 開發階段
- OpenAI API: ~$100-300/月
- 本地開發: Docker (免費)

### 生產環境
- 服務器: $50-100/月
- PostgreSQL: $20-50/月
- Redis: $10-20/月
- OpenAI API: $200-1000/月（根據使用量）
- **總計**: ~$300-1200/月

## 📞 支援

遇到問題？
1. 查看 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解架構細節
2. 參考 [API_SPECIFICATION.md](./API_SPECIFICATION.md) 查看 API 文檔
3. 查看 [ROADMAP.md](./ROADMAP.md) 了解開發計劃

## 📄 License

ISC

---

## 下一步

準備開始開發了嗎？按照以下順序進行：

1. **查看架構設計** → [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **了解 API 規格** → [API_SPECIFICATION.md](./API_SPECIFICATION.md)
3. **規劃開發進度** → [ROADMAP.md](./ROADMAP.md)
4. **開始 Phase 1** → 項目初始化和基礎設置

讓我們開始構建吧！🚀
