# EnglishBrain Backend - 架構設計文檔

## 技術棧

### 核心框架
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Web Framework**: Express.js
- **API Documentation**: Swagger/OpenAPI 3.0

### 數據層
- **Database**: PostgreSQL (主要數據存儲)
- **ORM**: Prisma (類型安全的數據庫訪問)
- **Cache**: Redis (會話管理、頻繁查詢緩存)

### AI 服務集成
- **Speech-to-Text**: OpenAI Whisper API
- **Grammar Analysis**: OpenAI GPT-4 API
- **Text Processing**: 自然語言處理庫

### 開發工具
- **Validation**: Zod (運行時類型驗證)
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Process Manager**: PM2 (生產環境)

---

## 項目結構

```
english-speak-brain-backend/
├── src/
│   ├── config/                    # 配置文件
│   │   ├── database.ts           # 數據庫配置
│   │   ├── redis.ts              # Redis 配置
│   │   ├── openai.ts             # OpenAI API 配置
│   │   └── environment.ts        # 環境變量管理
│   │
│   ├── modules/                   # 功能模塊（按領域劃分）
│   │   ├── practice/             # 練習模塊
│   │   │   ├── controllers/      # 控制器層
│   │   │   ├── services/         # 業務邏輯層
│   │   │   ├── repositories/     # 數據訪問層
│   │   │   ├── dto/              # 數據傳輸對象
│   │   │   ├── validators/       # 請求驗證
│   │   │   └── routes.ts         # 路由定義
│   │   │
│   │   ├── review/               # 複習模塊
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dto/
│   │   │   ├── validators/
│   │   │   └── routes.ts
│   │   │
│   │   ├── analytics/            # 分析模塊
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dto/
│   │   │   ├── validators/
│   │   │   └── routes.ts
│   │   │
│   │   └── user/                 # 用戶模塊（未來擴展）
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── dto/
│   │       ├── validators/
│   │       └── routes.ts
│   │
│   ├── shared/                    # 共享資源
│   │   ├── middleware/           # Express 中間件
│   │   │   ├── errorHandler.ts  # 全局錯誤處理
│   │   │   ├── validator.ts     # 請求驗證中間件
│   │   │   ├── logger.ts        # 日誌中間件
│   │   │   ├── rateLimiter.ts   # 速率限制
│   │   │   └── fileUpload.ts    # 文件上傳處理
│   │   │
│   │   ├── types/                # 共享類型定義
│   │   │   ├── api.types.ts     # API 相關類型
│   │   │   ├── domain.types.ts  # 領域模型類型
│   │   │   └── common.types.ts  # 通用類型
│   │   │
│   │   ├── utils/                # 工具函數
│   │   │   ├── logger.ts        # 日誌工具
│   │   │   ├── errors.ts        # 自定義錯誤類
│   │   │   ├── response.ts      # 統一響應格式
│   │   │   ├── validators.ts    # 通用驗證函數
│   │   │   └── helpers.ts       # 輔助函數
│   │   │
│   │   └── constants/            # 常量定義
│   │       ├── errorCodes.ts    # 錯誤碼
│   │       ├── messages.ts      # 消息模板
│   │       └── enums.ts         # 枚舉類型
│   │
│   ├── services/                  # 外部服務集成
│   │   ├── openai/               # OpenAI 服務
│   │   │   ├── whisper.service.ts    # 語音轉文字
│   │   │   ├── gpt.service.ts        # GPT 分析
│   │   │   └── types.ts              # OpenAI 類型定義
│   │   │
│   │   ├── storage/              # 文件存儲服務
│   │   │   ├── local.storage.ts      # 本地存儲
│   │   │   ├── s3.storage.ts         # AWS S3（可選）
│   │   │   └── storage.interface.ts  # 存儲接口
│   │   │
│   │   └── cache/                # 緩存服務
│   │       ├── redis.service.ts      # Redis 緩存
│   │       └── cache.interface.ts    # 緩存接口
│   │
│   ├── database/                  # 數據庫相關
│   │   ├── prisma/               # Prisma ORM
│   │   │   ├── schema.prisma     # 數據庫架構定義
│   │   │   ├── migrations/       # 數據庫遷移文件
│   │   │   └── seed.ts           # 種子數據
│   │   │
│   │   └── client.ts             # 數據庫客戶端實例
│   │
│   ├── jobs/                      # 後台任務
│   │   ├── generateDailyReview.ts    # 生成每日複習
│   │   ├── cleanupOldRecordings.ts   # 清理舊錄音
│   │   └── scheduler.ts              # 任務調度器
│   │
│   ├── app.ts                     # Express 應用配置
│   └── server.ts                  # 服務器入口
│
├── tests/                         # 測試文件
│   ├── unit/                     # 單元測試
│   ├── integration/              # 集成測試
│   └── e2e/                      # 端到端測試
│
├── uploads/                       # 臨時上傳文件目錄
├── logs/                          # 日誌文件目錄
├── .env.example                   # 環境變量示例
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── prettier.config.js
├── eslint.config.js
└── README.md
```

---

## 架構設計原則

### 1. 分層架構 (Layered Architecture)

```
Controller Layer (控制器層)
    ↓
Service Layer (業務邏輯層)
    ↓
Repository Layer (數據訪問層)
    ↓
Database (數據庫)
```

**各層職責：**

- **Controller Layer**: 處理 HTTP 請求/響應，參數驗證，調用 Service
- **Service Layer**: 核心業務邏輯，事務管理，調用多個 Repository
- **Repository Layer**: 數據庫操作的抽象層，與 Prisma 交互
- **Database**: PostgreSQL 數據持久化

### 2. 模塊化設計

每個功能模塊（practice、review、analytics）都是自包含的，包括：
- 獨立的路由
- 獨立的業務邏輯
- 獨立的數據訪問層
- 清晰的模塊邊界

### 3. 依賴注入

使用依賴注入模式提高可測試性和可維護性：
```typescript
// 示例
class PracticeService {
  constructor(
    private practiceRepository: PracticeRepository,
    private whisperService: WhisperService,
    private gptService: GPTService
  ) {}
}
```

### 4. 錯誤處理策略

- 使用自定義錯誤類
- 全局錯誤處理中間件
- 統一的錯誤響應格式
- 詳細的錯誤日誌

---

## 數據模型設計

### User (用戶)
```prisma
model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 關聯
  practices     Practice[]
  reviews       Review[]
  analytics     UserAnalytics?
}
```

### Practice (練習記錄)
```prisma
model Practice {
  id                String    @id @default(uuid())
  userId            String
  sessionId         String?

  // 音頻信息
  audioUrl          String
  audioDuration     Float     // 秒
  audioSize         Int       // bytes

  // 轉錄文本
  transcribedText   String
  originalText      String?   // 用戶想說的原文（如果提供）

  // AI 分析結果
  grammarScore      Float     // 0-100
  pronunciationScore Float    // 0-100
  fluencyScore      Float     // 0-100
  overallScore      Float     // 0-100

  // 詳細反饋
  grammarErrors     Json      // GrammarError[]
  pronunciationIssues Json    // PronunciationIssue[]
  correctedText     String
  suggestions       Json      // string[]

  createdAt         DateTime  @default(now())

  // 關聯
  user              User      @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  @@index([sessionId])
}
```

### PracticeSession (練習會話)
```prisma
model PracticeSession {
  id              String    @id @default(uuid())
  userId          String
  startTime       DateTime
  endTime         DateTime?
  practiceCount   Int       @default(0)
  avgScore        Float?
  status          SessionStatus @default(ACTIVE)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum SessionStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}
```

### Review (每日複習)
```prisma
model Review {
  id              String    @id @default(uuid())
  userId          String
  date            DateTime  @default(now())

  // 複習內容
  exercises       Json      // Exercise[]
  totalExercises  Int
  completedCount  Int       @default(0)
  correctCount    Int       @default(0)

  // 狀態
  status          ReviewStatus @default(PENDING)
  completedAt     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id])

  @@unique([userId, date])
  @@index([userId, date])
}

enum ReviewStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

### ExerciseSubmission (練習提交記錄)
```prisma
model ExerciseSubmission {
  id              String    @id @default(uuid())
  reviewId        String
  exerciseId      String
  exerciseType    ExerciseType

  userAnswer      String
  correctAnswer   String
  isCorrect       Boolean

  submittedAt     DateTime  @default(now())

  @@index([reviewId])
}

enum ExerciseType {
  FILL_BLANK
  MULTIPLE_CHOICE
  REWRITE
  SPEAKING
}
```

### UserAnalytics (用戶分析數據)
```prisma
model UserAnalytics {
  id                    String    @id @default(uuid())
  userId                String    @unique

  // 統計數據
  totalPractices        Int       @default(0)
  totalReviews          Int       @default(0)
  currentStreak         Int       @default(0)
  longestStreak         Int       @default(0)

  // 平均分數
  avgGrammarScore       Float?
  avgPronunciationScore Float?
  avgFluencyScore       Float?
  avgOverallScore       Float?

  // 進度追蹤
  lastPracticeDate      DateTime?
  lastReviewDate        DateTime?

  // 錯誤統計
  commonErrors          Json      // Map<ErrorType, Count>

  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id])
}
```

### ErrorPattern (錯誤模式)
```prisma
model ErrorPattern {
  id              String    @id @default(uuid())
  userId          String
  errorType       String    // grammar, pronunciation, etc.
  errorCategory   String    // tense, article, word_stress, etc.
  description     String
  example         String
  frequency       Int       @default(1)
  lastOccurred    DateTime  @default(now())

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, errorType])
  @@index([userId, frequency])
}
```

---

## API 端點設計

### Base URL
```
http://localhost:3001/api
```

### 1. Practice API

#### POST /api/practice/analyze
**描述**: 分析用戶的語音錄音

**Request**:
```typescript
Content-Type: multipart/form-data

{
  audio: File,              // 音頻文件
  originalText?: string,    // 用戶想說的原文（可選）
  sessionId?: string        // 會話 ID（可選）
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    practiceId: string,
    transcribedText: string,
    scores: {
      grammar: number,        // 0-100
      pronunciation: number,  // 0-100
      fluency: number,        // 0-100
      overall: number         // 0-100
    },
    analysis: {
      grammarErrors: Array<{
        type: string,
        message: string,
        original: string,
        corrected: string,
        position: { start: number, end: number },
        explanation: string,
        examples: string[]
      }>,
      pronunciationIssues: Array<{
        word: string,
        issue: string,
        suggestion: string,
        ipa: string
      }>,
      correctedText: string,
      suggestions: string[]
    }
  }
}
```

#### GET /api/practice/history
**描述**: 獲取練習歷史記錄

**Query Parameters**:
```typescript
{
  page?: number,      // 頁碼，默認 1
  limit?: number,     // 每頁數量，默認 20
  sessionId?: string, // 按會話篩選
  startDate?: string, // 開始日期 ISO 8601
  endDate?: string    // 結束日期 ISO 8601
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    practices: Array<{
      id: string,
      transcribedText: string,
      scores: {
        grammar: number,
        pronunciation: number,
        fluency: number,
        overall: number
      },
      createdAt: string
    }>,
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number
    }
  }
}
```

#### POST /api/practice/session/start
**描述**: 開始新的練習會話

**Response**:
```typescript
{
  success: true,
  data: {
    sessionId: string,
    startTime: string
  }
}
```

#### POST /api/practice/session/end
**描述**: 結束練習會話

**Request**:
```typescript
{
  sessionId: string
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    sessionId: string,
    summary: {
      duration: number,        // 分鐘
      practiceCount: number,
      averageScore: number,
      improvement: number      // 與之前會話的對比
    }
  }
}
```

### 2. Review API

#### GET /api/review/today
**描述**: 獲取今天的複習內容

**Response**:
```typescript
{
  success: true,
  data: {
    reviewId: string,
    date: string,
    exercises: Array<{
      id: string,
      type: 'FILL_BLANK' | 'MULTIPLE_CHOICE' | 'REWRITE' | 'SPEAKING',
      question: string,
      options?: string[],      // 僅 MULTIPLE_CHOICE
      targetGrammar: string,
      hint?: string
    }>,
    progress: {
      total: number,
      completed: number,
      correct: number
    },
    streak: number
  }
}
```

#### POST /api/review/submit
**描述**: 提交練習答案

**Request**:
```typescript
{
  reviewId: string,
  exerciseId: string,
  answer: string | string[],  // 根據題型不同
  audio?: File                // 如果是 SPEAKING 類型
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    isCorrect: boolean,
    correctAnswer: string,
    explanation: string,
    feedback: string,
    score?: number            // 僅 SPEAKING 類型
  }
}
```

#### POST /api/review/complete
**描述**: 完成今日複習

**Request**:
```typescript
{
  reviewId: string
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    completedAt: string,
    summary: {
      totalExercises: number,
      correctCount: number,
      accuracy: number,
      timeSpent: number        // 分鐘
    },
    streak: number,
    nextReviewDate: string
  }
}
```

### 3. Analytics API

#### GET /api/analytics/stats
**描述**: 獲取用戶統計數據

**Response**:
```typescript
{
  success: true,
  data: {
    overview: {
      totalPractices: number,
      totalReviews: number,
      currentStreak: number,
      longestStreak: number
    },
    averageScores: {
      grammar: number,
      pronunciation: number,
      fluency: number,
      overall: number
    },
    recentActivity: {
      lastPracticeDate: string,
      lastReviewDate: string,
      practicesThisWeek: number,
      practicesThisMonth: number
    }
  }
}
```

#### GET /api/analytics/error-trends
**描述**: 獲取錯誤趨勢分析

**Query Parameters**:
```typescript
{
  days?: number  // 分析天數，默認 30
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    errorDistribution: Array<{
      category: string,
      count: number,
      percentage: number
    }>,
    topErrors: Array<{
      type: string,
      description: string,
      frequency: number,
      examples: string[],
      improvement: number  // 改善百分比
    }>,
    timeline: Array<{
      date: string,
      errorCount: number,
      errorTypes: Record<string, number>
    }>
  }
}
```

#### GET /api/analytics/fluency
**描述**: 獲取流暢度指標

**Response**:
```typescript
{
  success: true,
  data: {
    currentLevel: string,      // Beginner, Intermediate, Advanced
    fluencyScore: number,
    metrics: {
      speakingSpeed: number,   // 字/分鐘
      pauseFrequency: number,
      hesitations: number
    },
    trend: Array<{
      date: string,
      score: number
    }>,
    milestone: {
      current: string,
      next: string,
      progress: number         // 0-100
    }
  }
}
```

#### GET /api/analytics/insights
**描述**: 獲取學習洞察和建議

**Response**:
```typescript
{
  success: true,
  data: {
    strengths: string[],
    weaknesses: string[],
    recommendations: Array<{
      type: string,
      title: string,
      description: string,
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
    }>,
    learningPattern: {
      bestTimeOfDay: string,
      averageSessionLength: number,
      consistency: number      // 0-100
    },
    predictedImprovement: {
      estimatedDays: number,
      targetScore: number,
      confidence: number       // 0-100
    }
  }
}
```

#### GET /api/analytics/progress
**描述**: 獲取進度數據

**Query Parameters**:
```typescript
{
  period?: 'week' | 'month' | 'year',  // 默認 'month'
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    scoreProgression: Array<{
      date: string,
      grammar: number,
      pronunciation: number,
      fluency: number,
      overall: number
    }>,
    milestones: Array<{
      id: string,
      title: string,
      achievedAt: string,
      icon: string
    }>,
    goals: {
      daily: {
        target: number,
        achieved: number,
        progress: number
      },
      weekly: {
        target: number,
        achieved: number,
        progress: number
      }
    }
  }
}
```

---

## AI 服務集成方案

### 1. OpenAI Whisper (語音轉文字)

**API**: OpenAI API v1 - Audio Transcriptions

**流程**:
```
用戶音頻 → 格式驗證 → Whisper API → 轉錄文本 → 存儲
```

**配置**:
```typescript
{
  model: "whisper-1",
  language: "en",
  response_format: "json",
  temperature: 0.2
}
```

### 2. OpenAI GPT-4 (語法和發音分析)

**Prompt 設計**:

```typescript
const ANALYSIS_PROMPT = `
You are an expert English teacher analyzing a student's spoken English.

Transcribed text: "${transcribedText}"

Please provide a detailed analysis in JSON format with the following structure:
{
  "grammarErrors": [{
    "type": "string",           // e.g., "tense", "article", "subject-verb agreement"
    "message": "string",
    "original": "string",
    "corrected": "string",
    "position": {"start": 0, "end": 0},
    "explanation": "string",
    "examples": ["string"]
  }],
  "pronunciationIssues": [{
    "word": "string",
    "issue": "string",
    "suggestion": "string",
    "ipa": "string"
  }],
  "fluencyMetrics": {
    "fillerWords": ["string"],
    "unnecessaryPauses": number,
    "speakingSpeed": number
  },
  "correctedText": "string",
  "suggestions": ["string"],
  "scores": {
    "grammar": 0-100,
    "pronunciation": 0-100,
    "fluency": 0-100
  }
}
`;
```

**API 配置**:
```typescript
{
  model: "gpt-4-turbo-preview",
  temperature: 0.3,
  max_tokens: 2000,
  response_format: { type: "json_object" }
}
```

### 3. 每日複習生成

**生成邏輯**:
1. 查詢用戶過去 7 天的常見錯誤
2. 根據錯誤頻率和類型生成針對性練習
3. 使用 GPT-4 生成多樣化的題目

**Prompt 示例**:
```typescript
const REVIEW_GENERATION_PROMPT = `
Generate 10 practice exercises based on the student's common errors:

Error patterns:
${JSON.stringify(errorPatterns)}

Create a mix of:
- 3 Fill-in-the-blank questions
- 3 Multiple choice questions
- 2 Sentence rewriting tasks
- 2 Speaking practice prompts

Format: JSON array of exercises with type, question, options (if applicable), correct answer, and explanation.
`;
```

---

## 性能優化策略

### 1. 緩存策略

**Redis 緩存場景**:
- 用戶統計數據（TTL: 5分鐘）
- 分析報告（TTL: 1小時）
- API 響應緩存（重複查詢）

### 2. 數據庫優化

- 添加必要的索引
- 使用連接池
- 定期清理過期數據
- 分頁查詢限制

### 3. 文件處理

- 音頻文件壓縮
- 異步處理上傳
- 定期清理臨時文件
- 可選：移至 S3/Cloud Storage

### 4. API 限流

```typescript
// 速率限制配置
{
  windowMs: 15 * 60 * 1000,    // 15 分鐘
  max: 100,                     // 最多 100 次請求
  standardHeaders: true,
  legacyHeaders: false,
}
```

---

## 安全考慮

### 1. 輸入驗證
- 使用 Zod 驗證所有輸入
- 文件類型和大小限制
- SQL 注入防護（Prisma 自動處理）

### 2. 認證授權（未來擴展）
- JWT Token 認證
- Refresh Token 機制
- Role-based access control

### 3. 數據保護
- 敏感數據加密
- HTTPS 強制使用
- CORS 配置

### 4. 錯誤處理
- 不暴露內部錯誤詳情
- 統一錯誤響應格式
- 詳細的服務端日誌

---

## 部署架構

### 開發環境
```
本地開發 → PostgreSQL (Docker) → Redis (Docker) → OpenAI API
```

### 生產環境
```
Load Balancer
    ↓
PM2 Cluster (Multiple Node.js instances)
    ↓
PostgreSQL (Managed Service)
Redis (Managed Service)
AWS S3 (File Storage)
OpenAI API
```

---

## 監控和日誌

### 1. 日誌級別
- **ERROR**: 錯誤和異常
- **WARN**: 警告信息
- **INFO**: 重要業務事件
- **DEBUG**: 詳細調試信息

### 2. 監控指標
- API 響應時間
- 錯誤率
- 數據庫查詢性能
- OpenAI API 使用量和成本
- 內存和 CPU 使用率

### 3. 告警機制
- 錯誤率超過閾值
- API 響應時間過長
- 數據庫連接失敗
- 外部服務不可用

---

## 開發優先級

### Phase 1: 核心功能（MVP）
1. ✅ 基礎項目架構搭建
2. ✅ 數據庫設計和 Prisma 設置
3. ✅ Practice API（語音分析）
4. ✅ 基礎錯誤處理和日誌
5. ✅ OpenAI 集成

### Phase 2: 複習和分析
1. Review API
2. Analytics API（基礎統計）
3. 每日複習生成任務
4. 錯誤模式分析

### Phase 3: 優化和擴展
1. Redis 緩存
2. 性能優化
3. 單元測試和集成測試
4. API 文檔（Swagger）

### Phase 4: 生產就緒
1. 用戶認證系統
2. 完整的安全措施
3. 監控和告警
4. 部署自動化

---

## 環境變量配置

```env
# Server
NODE_ENV=development
PORT=3001
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/englishbrain

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_org_id

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/webm,audio/mp4

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Session
SESSION_SECRET=your_session_secret
SESSION_TIMEOUT=86400000  # 24 hours
```

---

## 下一步行動

1. **初始化項目**: 設置 package.json、TypeScript、ESLint
2. **數據庫設置**: 配置 Prisma、創建初始 schema
3. **基礎架構**: 搭建 Express app、中間件、錯誤處理
4. **OpenAI 集成**: 實現 Whisper 和 GPT-4 服務
5. **Practice API**: 實現語音分析核心功能
6. **測試**: 編寫單元測試和集成測試

準備好開始實施了嗎？
