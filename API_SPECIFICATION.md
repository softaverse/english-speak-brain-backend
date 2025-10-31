# EnglishBrain Backend - API 規格快速參考

## 基本信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json` (除了文件上傳使用 `multipart/form-data`)
- **Authentication**: 暫時無需認證（Phase 4 實現）

## 統一響應格式

### 成功響應
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2024-10-31T00:00:00.000Z"
}
```

### 錯誤響應
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": "2024-10-31T00:00:00.000Z"
}
```

### HTTP 狀態碼
- `200` - 成功
- `201` - 創建成功
- `400` - 請求參數錯誤
- `404` - 資源不存在
- `429` - 請求過於頻繁
- `500` - 服務器錯誤

---

## 1. Practice Module

### 1.1 分析語音錄音
```http
POST /api/practice/analyze
Content-Type: multipart/form-data
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audio | File | Yes | 音頻文件（支持 mp3, wav, webm, m4a） |
| originalText | string | No | 用戶想說的原文 |
| sessionId | string | No | 會話 ID |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "practiceId": "uuid",
    "transcribedText": "The transcribed text from audio",
    "scores": {
      "grammar": 85,
      "pronunciation": 78,
      "fluency": 82,
      "overall": 82
    },
    "analysis": {
      "grammarErrors": [
        {
          "type": "article",
          "message": "Missing article before noun",
          "original": "I go to school",
          "corrected": "I go to the school",
          "position": { "start": 7, "end": 13 },
          "explanation": "The definite article 'the' is needed...",
          "examples": [
            "I go to the school every day",
            "She went to the park"
          ]
        }
      ],
      "pronunciationIssues": [
        {
          "word": "schedule",
          "issue": "Incorrect stress pattern",
          "suggestion": "Stress should be on the first syllable",
          "ipa": "/ˈʃed.juːl/"
        }
      ],
      "correctedText": "The corrected version of the sentence",
      "suggestions": [
        "Try to practice articles with concrete nouns",
        "Focus on word stress in multi-syllable words"
      ]
    }
  }
}
```

**Error Codes**:
- `AUDIO_FILE_MISSING` - 未提供音頻文件
- `AUDIO_FILE_TOO_LARGE` - 文件超過大小限制（10MB）
- `INVALID_AUDIO_FORMAT` - 不支持的音頻格式
- `TRANSCRIPTION_FAILED` - 語音轉文字失敗
- `ANALYSIS_FAILED` - AI 分析失敗

---

### 1.2 獲取練習歷史
```http
GET /api/practice/history
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | 頁碼 |
| limit | number | 20 | 每頁數量（最大 100） |
| sessionId | string | - | 按會話篩選 |
| startDate | string | - | 開始日期（ISO 8601） |
| endDate | string | - | 結束日期（ISO 8601） |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "practices": [
      {
        "id": "uuid",
        "transcribedText": "Sample text",
        "scores": {
          "grammar": 85,
          "pronunciation": 78,
          "fluency": 82,
          "overall": 82
        },
        "createdAt": "2024-10-31T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20
    }
  }
}
```

---

### 1.3 開始練習會話
```http
POST /api/practice/session/start
```

**Request Body**: Empty

**Response** (201):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "startTime": "2024-10-31T00:00:00.000Z"
  }
}
```

---

### 1.4 結束練習會話
```http
POST /api/practice/session/end
```

**Request Body**:
```json
{
  "sessionId": "uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "summary": {
      "duration": 25,
      "practiceCount": 8,
      "averageScore": 83.5,
      "improvement": 5.2
    }
  }
}
```

**Error Codes**:
- `SESSION_NOT_FOUND` - 會話不存在
- `SESSION_ALREADY_ENDED` - 會話已結束

---

## 2. Review Module

### 2.1 獲取今日複習
```http
GET /api/review/today
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "date": "2024-10-31",
    "exercises": [
      {
        "id": "ex-1",
        "type": "FILL_BLANK",
        "question": "I ____ to school every day.",
        "targetGrammar": "present simple",
        "hint": "verb: go"
      },
      {
        "id": "ex-2",
        "type": "MULTIPLE_CHOICE",
        "question": "She _____ a book yesterday.",
        "options": ["read", "reads", "reading", "will read"],
        "targetGrammar": "past simple"
      },
      {
        "id": "ex-3",
        "type": "REWRITE",
        "question": "Rewrite in passive voice: 'The cat chased the mouse.'",
        "targetGrammar": "passive voice"
      },
      {
        "id": "ex-4",
        "type": "SPEAKING",
        "question": "Record yourself saying: 'The weather is beautiful today.'",
        "targetGrammar": "pronunciation practice"
      }
    ],
    "progress": {
      "total": 10,
      "completed": 3,
      "correct": 2
    },
    "streak": 7
  }
}
```

**Response** (404) - 如果今日沒有複習:
```json
{
  "success": false,
  "error": {
    "code": "NO_REVIEW_AVAILABLE",
    "message": "No review available for today. Complete more practices first."
  }
}
```

---

### 2.2 提交練習答案
```http
POST /api/review/submit
```

**Request Body** (文本題型):
```json
{
  "reviewId": "uuid",
  "exerciseId": "ex-1",
  "answer": "go"
}
```

**Request Body** (口說題型):
```http
POST /api/review/submit
Content-Type: multipart/form-data

reviewId: uuid
exerciseId: ex-4
audio: [File]
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "correctAnswer": "go",
    "explanation": "Present simple tense uses the base form...",
    "feedback": "Great job! Your answer is correct.",
    "score": 95
  }
}
```

**Error Codes**:
- `REVIEW_NOT_FOUND` - 複習不存在
- `EXERCISE_NOT_FOUND` - 練習不存在
- `ALREADY_SUBMITTED` - 已提交過此練習

---

### 2.3 完成今日複習
```http
POST /api/review/complete
```

**Request Body**:
```json
{
  "reviewId": "uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "completedAt": "2024-10-31T00:30:00.000Z",
    "summary": {
      "totalExercises": 10,
      "correctCount": 8,
      "accuracy": 80,
      "timeSpent": 15
    },
    "streak": 8,
    "nextReviewDate": "2024-11-01"
  }
}
```

---

## 3. Analytics Module

### 3.1 獲取統計數據
```http
GET /api/analytics/stats
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPractices": 127,
      "totalReviews": 45,
      "currentStreak": 12,
      "longestStreak": 28
    },
    "averageScores": {
      "grammar": 82.5,
      "pronunciation": 78.3,
      "fluency": 85.7,
      "overall": 82.2
    },
    "recentActivity": {
      "lastPracticeDate": "2024-10-31T00:00:00.000Z",
      "lastReviewDate": "2024-10-31T00:00:00.000Z",
      "practicesThisWeek": 15,
      "practicesThisMonth": 58
    }
  }
}
```

---

### 3.2 獲取錯誤趨勢
```http
GET /api/analytics/error-trends?days=30
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | number | 30 | 分析天數（7, 30, 90） |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "errorDistribution": [
      {
        "category": "articles",
        "count": 45,
        "percentage": 32.1
      },
      {
        "category": "tense",
        "count": 38,
        "percentage": 27.1
      }
    ],
    "topErrors": [
      {
        "type": "article_missing",
        "description": "Missing definite/indefinite articles",
        "frequency": 23,
        "examples": [
          "I go to school → I go to the school",
          "She is teacher → She is a teacher"
        ],
        "improvement": 15.5
      }
    ],
    "timeline": [
      {
        "date": "2024-10-01",
        "errorCount": 12,
        "errorTypes": {
          "articles": 5,
          "tense": 4,
          "preposition": 3
        }
      }
    ]
  }
}
```

---

### 3.3 獲取流暢度指標
```http
GET /api/analytics/fluency
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "currentLevel": "Intermediate",
    "fluencyScore": 78.5,
    "metrics": {
      "speakingSpeed": 145,
      "pauseFrequency": 3.2,
      "hesitations": 5
    },
    "trend": [
      {
        "date": "2024-10-01",
        "score": 72.3
      },
      {
        "date": "2024-10-15",
        "score": 75.8
      },
      {
        "date": "2024-10-31",
        "score": 78.5
      }
    ],
    "milestone": {
      "current": "Intermediate (70-80)",
      "next": "Upper Intermediate (80-90)",
      "progress": 57
    }
  }
}
```

---

### 3.4 獲取學習洞察
```http
GET /api/analytics/insights
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "strengths": [
      "Excellent fluency with minimal hesitations",
      "Strong vocabulary range",
      "Good pronunciation of common words"
    ],
    "weaknesses": [
      "Inconsistent use of articles (a/an/the)",
      "Tense consistency in narratives",
      "Word stress in multi-syllable words"
    ],
    "recommendations": [
      {
        "type": "grammar",
        "title": "Focus on Article Usage",
        "description": "Practice using definite and indefinite articles in context. Review rules for countable vs uncountable nouns.",
        "priority": "HIGH"
      },
      {
        "type": "pronunciation",
        "title": "Work on Word Stress",
        "description": "Pay attention to stress patterns in words like 'schedule', 'comfortable', and 'photography'.",
        "priority": "MEDIUM"
      }
    ],
    "learningPattern": {
      "bestTimeOfDay": "morning",
      "averageSessionLength": 18,
      "consistency": 85
    },
    "predictedImprovement": {
      "estimatedDays": 45,
      "targetScore": 85,
      "confidence": 82
    }
  }
}
```

---

### 3.5 獲取進度數據
```http
GET /api/analytics/progress?period=month
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | month | 時間範圍（week, month, year） |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "scoreProgression": [
      {
        "date": "2024-10-01",
        "grammar": 75,
        "pronunciation": 72,
        "fluency": 78,
        "overall": 75
      },
      {
        "date": "2024-10-15",
        "grammar": 80,
        "pronunciation": 76,
        "fluency": 82,
        "overall": 79
      },
      {
        "date": "2024-10-31",
        "grammar": 82,
        "pronunciation": 78,
        "fluency": 86,
        "overall": 82
      }
    ],
    "milestones": [
      {
        "id": "m-1",
        "title": "First Practice",
        "achievedAt": "2024-09-01T00:00:00.000Z",
        "icon": "star"
      },
      {
        "id": "m-2",
        "title": "7 Day Streak",
        "achievedAt": "2024-10-15T00:00:00.000Z",
        "icon": "fire"
      }
    ],
    "goals": {
      "daily": {
        "target": 3,
        "achieved": 2,
        "progress": 66.7
      },
      "weekly": {
        "target": 15,
        "achieved": 12,
        "progress": 80
      }
    }
  }
}
```

---

## 錯誤代碼參考

### 通用錯誤
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | 請求參數驗證失敗 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `INTERNAL_SERVER_ERROR` | 500 | 服務器內部錯誤 |
| `RATE_LIMIT_EXCEEDED` | 429 | 超過速率限制 |

### Practice 模塊
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUDIO_FILE_MISSING` | 400 | 未提供音頻文件 |
| `AUDIO_FILE_TOO_LARGE` | 400 | 文件超過大小限制 |
| `INVALID_AUDIO_FORMAT` | 400 | 不支持的音頻格式 |
| `TRANSCRIPTION_FAILED` | 500 | 語音轉文字失敗 |
| `ANALYSIS_FAILED` | 500 | AI 分析失敗 |
| `SESSION_NOT_FOUND` | 404 | 會話不存在 |
| `SESSION_ALREADY_ENDED` | 400 | 會話已結束 |

### Review 模塊
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_REVIEW_AVAILABLE` | 404 | 今日無可用複習 |
| `REVIEW_NOT_FOUND` | 404 | 複習不存在 |
| `EXERCISE_NOT_FOUND` | 404 | 練習不存在 |
| `ALREADY_SUBMITTED` | 400 | 已提交過此練習 |
| `REVIEW_ALREADY_COMPLETED` | 400 | 複習已完成 |

### Analytics 模塊
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INSUFFICIENT_DATA` | 404 | 數據不足以生成分析 |
| `INVALID_DATE_RANGE` | 400 | 無效的日期範圍 |

---

## 速率限制

- **全局限制**: 每 IP 每 15 分鐘最多 100 次請求
- **文件上傳**: 每用戶每分鐘最多 10 次
- **AI 分析**: 每用戶每分鐘最多 5 次

**限制響應頭**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698710400
```

---

## Webhook（未來功能）

### 每日複習生成完成
```json
{
  "event": "review.generated",
  "timestamp": "2024-10-31T00:00:00.000Z",
  "data": {
    "userId": "uuid",
    "reviewId": "uuid",
    "date": "2024-10-31"
  }
}
```

### 里程碑達成
```json
{
  "event": "milestone.achieved",
  "timestamp": "2024-10-31T00:00:00.000Z",
  "data": {
    "userId": "uuid",
    "milestoneId": "m-2",
    "title": "7 Day Streak"
  }
}
```

---

## 測試端點

### Health Check
```http
GET /api/health
```

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2024-10-31T00:00:00.000Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "openai": "ok"
  }
}
```

### API 版本
```http
GET /api/version
```

**Response** (200):
```json
{
  "version": "1.0.0",
  "apiVersion": "v1",
  "environment": "development"
}
```
