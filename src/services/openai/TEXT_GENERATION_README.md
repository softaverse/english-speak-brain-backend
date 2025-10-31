# OpenAI Text Generation Service

This service provides comprehensive text generation capabilities using OpenAI's GPT models for English language learning applications.

## Features

- Chat-based text generation with conversation history
- Simple completions with system prompts
- English text analysis and feedback
- Grammar correction with explanations
- Practice exercise generation
- Conversational AI for practice
- Grammar concept explanations

## Service Functions

### 1. `generateText(messages, options)`

Generate text from a conversation with full message history.

```typescript
import { generateText } from '@services/openai';

const messages = [
  { role: 'system', content: 'You are a helpful English teacher.' },
  { role: 'user', content: 'Explain the past perfect tense.' },
  { role: 'assistant', content: 'The past perfect tense...' },
  { role: 'user', content: 'Can you give me an example?' }
];

const result = await generateText(messages, {
  temperature: 0.7,
  maxTokens: 500
});

console.log(result.text);
console.log(result.usage); // Token usage information
```

### 2. `generateCompletion(prompt, systemPrompt, options)`

Generate a simple completion from a single prompt.

```typescript
import { generateCompletion } from '@services/openai';

const result = await generateCompletion(
  'What is the difference between "affect" and "effect"?',
  'You are an English grammar expert.',
  { temperature: 0.5 }
);

console.log(result.text);
```

### 3. `analyzeEnglishText(text, options)`

Analyze English text for errors and provide detailed feedback.

```typescript
import { analyzeEnglishText } from '@services/openai';

const text = 'I goed to the store yesterday and buyed some milk.';
const analysis = await analyzeEnglishText(text);

console.log(analysis.text); // Detailed analysis and feedback
```

### 4. `correctGrammar(text, options)`

Correct grammar errors and provide explanations.

```typescript
import { correctGrammar } from '@services/openai';

const text = 'She dont like ice cream.';
const correction = await correctGrammar(text);

console.log(correction.text); // JSON with corrected text and explanations
```

### 5. `generateExercises(errorType, difficulty, count, options)`

Generate practice exercises for specific grammar topics.

```typescript
import { generateExercises } from '@services/openai';

const exercises = await generateExercises(
  'past tense',        // Error type/topic
  'intermediate',      // Difficulty: 'beginner', 'intermediate', 'advanced'
  5                    // Number of exercises
);

console.log(exercises.text); // Generated exercises with answers
```

### 6. `generateConversationResponse(message, history, options)`

Generate conversational responses for practice.

```typescript
import { generateConversationResponse } from '@services/openai';

const history = [
  { role: 'assistant', content: 'Hello! How are you today?' },
  { role: 'user', content: 'I am good, thank you!' }
];

const response = await generateConversationResponse(
  'What did you do yesterday?',
  history
);

console.log(response.text);
```

### 7. `explainGrammarConcept(concept, level, options)`

Explain grammar concepts in detail.

```typescript
import { explainGrammarConcept } from '@services/openai';

const explanation = await explainGrammarConcept(
  'present perfect tense',
  'detailed'  // Level: 'simple', 'detailed', 'advanced'
);

console.log(explanation.text);
```

## API Endpoints

All endpoints are prefixed with `/api/practice/generate`

### POST `/text`

Generate text from chat messages.

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Hello! How can I help you today?",
    "model": "gpt-4-turbo-preview",
    "usage": {
      "promptTokens": 20,
      "completionTokens": 10,
      "totalTokens": 30
    },
    "finishReason": "stop",
    "id": "chatcmpl-...",
    "created": 1234567890
  }
}
```

### POST `/completion`

Generate simple completion.

**Request:**
```json
{
  "prompt": "Explain past tense",
  "systemPrompt": "You are an English teacher",
  "options": {
    "temperature": 0.5
  }
}
```

### POST `/analyze`

Analyze English text.

**Request:**
```json
{
  "text": "I goed to the store yesterday.",
  "options": {}
}
```

### POST `/correct`

Correct grammar errors.

**Request:**
```json
{
  "text": "She dont like ice cream.",
  "options": {}
}
```

### POST `/exercises`

Generate practice exercises.

**Request:**
```json
{
  "errorType": "articles",
  "difficulty": "intermediate",
  "count": 5,
  "options": {}
}
```

**Parameters:**
- `errorType`: String describing the grammar topic
- `difficulty`: `"beginner"`, `"intermediate"`, or `"advanced"`
- `count`: Number between 1 and 20

### POST `/conversation`

Generate conversation response.

**Request:**
```json
{
  "message": "What did you do yesterday?",
  "history": [
    { "role": "assistant", "content": "Hello!" },
    { "role": "user", "content": "Hi there!" }
  ],
  "options": {}
}
```

### POST `/explain`

Explain grammar concept.

**Request:**
```json
{
  "concept": "present perfect tense",
  "level": "detailed",
  "options": {}
}
```

**Parameters:**
- `concept`: String describing the grammar concept
- `level`: `"simple"`, `"detailed"`, or `"advanced"`

## Options

All generation functions accept optional parameters:

```typescript
interface TextGenerationOptions {
  model?: string;              // Default: 'gpt-4-turbo-preview'
  temperature?: number;        // 0-2, default varies by function
  maxTokens?: number;         // Default: varies by function
  topP?: number;              // 0-1, default: 1
  frequencyPenalty?: number;  // -2 to 2, default: 0
  presencePenalty?: number;   // -2 to 2, default: 0
  stop?: string | string[];   // Stop sequences
  user?: string;              // User identifier
}
```

## Client-Side Usage Examples

### JavaScript/TypeScript

```typescript
async function analyzeMyText(text: string) {
  const response = await fetch('/api/practice/generate/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  return data.data.text;
}

// Usage
const feedback = await analyzeMyText('I goed to school yesterday.');
console.log(feedback);
```

### React Example

```tsx
import { useState } from 'react';

function GrammarCorrector() {
  const [text, setText] = useState('');
  const [correction, setCorrection] = useState('');
  const [loading, setLoading] = useState(false);

  const correctText = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/practice/generate/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setCorrection(data.data.text);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to correct..."
      />
      <button onClick={correctText} disabled={loading}>
        {loading ? 'Correcting...' : 'Correct Grammar'}
      </button>
      {correction && <div>{correction}</div>}
    </div>
  );
}
```

### Conversational Practice

```typescript
import { useState } from 'react';

function ConversationPractice() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // Get AI response
    const response = await fetch('/api/practice/generate/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        history: messages,
      }),
    });

    const data = await response.json();
    const assistantMessage = {
      role: 'assistant',
      content: data.data.text
    };

    setMessages([...newMessages, assistantMessage]);
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Text is required and must be a string"
  },
  "timestamp": "2025-10-31T..."
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input
- `OPENAI_API_ERROR`: OpenAI API error
- `INTERNAL_SERVER_ERROR`: Server error

## Best Practices

1. **Temperature Settings:**
   - Use lower temperature (0.2-0.4) for factual/analytical tasks
   - Use higher temperature (0.7-0.9) for creative/conversational tasks

2. **Token Limits:**
   - Set appropriate `maxTokens` based on expected response length
   - Monitor usage to manage costs

3. **Error Handling:**
   - Always handle API errors gracefully
   - Provide user-friendly error messages

4. **Conversation History:**
   - Limit history length to avoid token limits
   - Keep only recent messages for context

5. **Validation:**
   - Validate input text length before sending
   - Sanitize user input to prevent prompt injection

## Technical Details

### Models
- Default: `gpt-4-turbo-preview`
- Configurable via options

### Rate Limiting
- Follows global API rate limits
- Consider implementing user-specific rate limiting

### Token Usage
- All responses include token usage information
- Monitor usage for cost management

## References

- [OpenAI Chat Completions API](https://platform.openai.com/docs/guides/text-generation)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)
- [GPT Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
