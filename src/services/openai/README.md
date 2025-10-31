# OpenAI Speech-to-Text Service

This service provides a complete implementation of OpenAI's Whisper API for converting audio to text.

## Features

- Audio transcription using OpenAI Whisper model
- Support for multiple audio formats (mp3, mp4, mpeg, mpga, m4a, wav, webm)
- Configurable language, temperature, and response format
- Detailed transcription with word-level timestamps
- Comprehensive error handling
- File format and size validation

## Configuration

The service uses configuration from `src/config/openai.ts`:

```typescript
whisper: {
  model: 'whisper-1',
  language: 'en',
  responseFormat: 'json',
  temperature: 0.2,
}
```

## Usage

### Basic Transcription

```typescript
import { transcribeAudio } from '@services/openai';

// With file path
const result = await transcribeAudio('/path/to/audio.mp3');
console.log(result.text);

// With file buffer (e.g., from multer upload)
const result = await transcribeAudio(fileBuffer, {
  language: 'en',
  temperature: 0.2,
});
console.log(result.text);
```

### Transcription with Timestamps

```typescript
import { transcribeAudioWithTimestamps } from '@services/openai';

const result = await transcribeAudioWithTimestamps(fileBuffer);

console.log(result.text);
console.log(result.words); // Word-level timestamps
console.log(result.segments); // Segment-level information
```

### Custom Options

```typescript
const result = await transcribeAudio(audioFile, {
  language: 'en',           // Language code (optional)
  prompt: 'Context text',   // Prompt to guide the model (optional)
  temperature: 0.5,         // 0-1, lower is more deterministic (optional)
  responseFormat: 'verbose_json', // json, text, srt, verbose_json, vtt
});
```

## API Integration

### Express Route Setup

The implementation includes a ready-to-use Express route with Multer for file uploads:

```typescript
// In your app.ts or main router
import practiceRoutes from '@modules/practice/practice.routes';

app.use('/api/practice', practiceRoutes);
```

### Available Endpoints

#### POST `/api/practice/transcribe`

Transcribe audio file to text.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `audio` (File, required): Audio file to transcribe
  - `language` (string, optional): Language code (e.g., 'en', 'es')
  - `prompt` (string, optional): Context text to guide transcription
  - `temperature` (number, optional): 0-1, controls randomness

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Transcribed text content..."
  },
  "message": "Audio transcribed successfully"
}
```

#### POST `/api/practice/transcribe/detailed`

Transcribe audio with word-level timestamps and segments.

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Transcribed text content...",
    "words": [
      {
        "word": "Hello",
        "start": 0.0,
        "end": 0.5
      }
    ],
    "segments": [...]
  }
}
```

#### GET `/api/practice/transcribe/formats`

Get supported audio formats and file size limits.

**Response:**
```json
{
  "success": true,
  "data": {
    "formats": ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"],
    "maxFileSize": 26214400,
    "maxFileSizeMB": 25
  }
}
```

## Client-Side Example

### JavaScript/TypeScript

```typescript
async function transcribeAudio(audioFile: File) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', 'en');

  const response = await fetch('/api/practice/transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.data.text;
}

// Usage
const audioFile = document.querySelector('input[type="file"]').files[0];
const transcription = await transcribeAudio(audioFile);
console.log(transcription);
```

### React Example

```tsx
import { useState } from 'react';

function AudioTranscriber() {
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/practice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTranscription(data.data.text);
    } catch (error) {
      console.error('Transcription failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {loading && <p>Transcribing...</p>}
      {transcription && <p>Transcription: {transcription}</p>}
    </div>
  );
}
```

## Validation

The service includes built-in validation:

### File Format Validation

```typescript
import { isSupportedAudioFormat } from '@services/openai';

if (!isSupportedAudioFormat(filename)) {
  throw new Error('Unsupported audio format');
}
```

### File Size Validation

```typescript
import { MAX_AUDIO_FILE_SIZE } from '@services/openai';

if (fileSize > MAX_AUDIO_FILE_SIZE) {
  throw new Error(`File exceeds ${MAX_AUDIO_FILE_SIZE / (1024 * 1024)}MB limit`);
}
```

## Error Handling

The service handles various error scenarios:

- **Missing audio file**: Returns `AUDIO_FILE_MISSING` error
- **Invalid format**: Returns `INVALID_AUDIO_FORMAT` error
- **File too large**: Returns `AUDIO_FILE_TOO_LARGE` error
- **OpenAI API errors**: Returns `OPENAI_API_ERROR` with details
- **Other errors**: Returns `INTERNAL_SERVER_ERROR`

## Technical Details

### Supported Audio Formats
- MP3 (audio/mpeg)
- MP4 (audio/mp4, video/mp4)
- MPEG (audio/mpeg)
- MPGA (audio/mpga)
- M4A (audio/m4a, audio/x-m4a)
- WAV (audio/wav)
- WEBM (audio/webm)

### File Size Limit
Maximum file size: 25 MB (OpenAI API limitation)

### Model
Default model: `whisper-1`

### Response Formats
- `json`: Basic transcription text (default)
- `text`: Plain text response
- `srt`: SubRip subtitle format
- `verbose_json`: Includes word-level timestamps and segments
- `vtt`: WebVTT subtitle format

## References

- [OpenAI Speech-to-Text Documentation](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/audio/createTranscription)
- [Whisper Model Information](https://openai.com/research/whisper)
