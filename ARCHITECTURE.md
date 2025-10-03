# Mo7ami System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (Port 3000)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │  Chat UI   │  │  Voice UI  │  │  Auth (NextAuth) │  │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘  │  │
│  │       │               │                    │            │  │
│  └───────┼───────────────┼────────────────────┼────────────┘  │
└──────────┼───────────────┼────────────────────┼───────────────┘
           │               │                    │
           │ HTTP/REST     │ WebRTC/HTTP        │ OAuth 2.0
           │               │                    │
           ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          FastAPI Backend (Port 8000)                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │   Chat     │  │   Voice    │  │    Documents     │  │  │
│  │  │  Endpoint  │  │  Endpoint  │  │     Endpoint     │  │  │
│  │  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘  │  │
│  │        │               │                   │            │  │
│  │  ┌─────▼───────────────▼───────────────────▼─────────┐  │  │
│  │  │           Services Layer                           │  │  │
│  │  │  ┌──────────┐  ┌───────────┐  ┌────────────────┐ │  │  │
│  │  │  │Retrieval │  │Generation │  │ Voice Processing│ │  │  │
│  │  │  │ Service  │  │  Service  │  │    (STT/TTS)   │ │  │  │
│  │  │  └──────────┘  └───────────┘  └────────────────┘ │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │               │                    │
           ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL │  │   OpenAI   │  │   Google Cloud Speech    │  │
│  │ + pgvector │  │  GPT-4 API │  │    (STT/TTS APIs)        │  │
│  │  (Vectors) │  │ Embeddings │  │                          │  │
│  └────────────┘  └────────────┘  └──────────────────────────┘  │
│  ┌────────────┐  ┌────────────┐                                 │
│  │   Redis    │  │   Google   │                                 │
│  │  (Cache)   │  │   OAuth    │                                 │
│  └────────────┘  └────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Chat Flow (Text Query)

```
User → Frontend → Backend → RAG Pipeline → OpenAI → Backend → Frontend → User
```

**Detailed Steps:**

1. **User Input**
   - User types question in Arabic or French
   - Frontend detects language automatically
   - Message sent via REST API

2. **Backend Processing**
   - FastAPI receives message
   - Extracts query text and language

3. **Document Retrieval (RAG)**
   - Query → Embedding (OpenAI API)
   - Embedding → Vector Search (pgvector)
   - Retrieve top-k relevant legal documents

4. **Answer Generation**
   - Build context from retrieved documents
   - Create prompt with legal sources
   - Send to OpenAI GPT-4
   - Parse response and extract citations

5. **Response Delivery**
   - Return answer + citations to frontend
   - Display in chat UI
   - Save to conversation history

### Voice Flow (Speech Query)

```
User (Speech) → Frontend → Google STT → Backend → RAG → OpenAI → Backend → Google TTS → Frontend → User (Audio)
```

**Detailed Steps:**

1. **Voice Input**
   - User clicks mic button
   - Browser requests microphone permission
   - MediaRecorder captures audio
   - Audio blob created (WebM format)

2. **Speech-to-Text**
   - Audio sent to backend
   - Backend forwards to Google Cloud STT
   - Transcript returned with confidence score
   - Displayed in chat as user message

3. **Processing** (same as text flow)
   - RAG retrieval
   - Answer generation

4. **Text-to-Speech**
   - Backend sends answer to Google Cloud TTS
   - Audio generated (MP3 format)
   - Audio streamed to frontend

5. **Audio Playback**
   - Frontend creates Audio object
   - User hears response
   - Can replay or stop at any time

## 🗄️ Database Schema Overview

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    users     │───┐   │  conversations   │───┐   │    messages     │
├──────────────┤   │   ├──────────────────┤   │   ├─────────────────┤
│ id           │   └──▶│ id               │   └──▶│ id              │
│ email        │       │ user_id          │       │ conversation_id │
│ name         │       │ title            │       │ role            │
│ image        │       │ language         │       │ content         │
└──────────────┘       │ created_at       │       │ language        │
       │               └──────────────────┘       │ citations (JSON)│
       │                                          └─────────────────┘
       │
       ▼
┌────────────────┐     ┌──────────────────┐      ┌──────────────────┐
│user_preferences│     │ legal_documents  │──┬──▶│ document_chunks  │
├────────────────┤     ├──────────────────┤  │   ├──────────────────┤
│ user_id        │     │ id               │  │   │ id               │
│ language       │     │ title            │  │   │ document_id      │
│ voice_enabled  │     │ domain           │  │   │ content          │
│ auto_play      │     │ official_ref     │  │   │ embedding (vec)  │
│ voice_gender   │     │ content          │  │   │ language         │
└────────────────┘     └──────────────────┘  │   └──────────────────┘
                                              │
                                              └──▶ Used for RAG retrieval
```

## 🔐 Authentication Flow

```
┌──────────┐                  ┌──────────┐                ┌────────┐
│  User    │                  │ NextAuth │                │ Google │
└────┬─────┘                  └────┬─────┘                └───┬────┘
     │                             │                          │
     │  1. Click "Sign In"         │                          │
     ├────────────────────────────▶│                          │
     │                             │                          │
     │  2. Redirect to Google      │                          │
     │                             ├─────────────────────────▶│
     │                             │    OAuth Request         │
     │                             │                          │
     │  3. User Authorizes         │                          │
     │◀────────────────────────────┼──────────────────────────┤
     │                             │                          │
     │  4. Callback with code      │                          │
     ├────────────────────────────▶│                          │
     │                             │  5. Exchange for token   │
     │                             ├─────────────────────────▶│
     │                             │◀─────────────────────────┤
     │                             │      Access Token        │
     │  6. Create session          │                          │
     │◀────────────────────────────┤                          │
     │     (JWT Cookie)            │                          │
     │                             │                          │
```

## 🎯 RAG Pipeline Detail

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query                               │
│                "شنو كايقول القانون على السرقة؟"              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Language Detection    │
            │    (Arabic detected)   │
            └────────┬───────────────┘
                     │
                     ▼
      ┌──────────────────────────────────┐
      │   Generate Query Embedding       │
      │   (OpenAI text-embedding-3)      │
      │   Output: 1536-dim vector        │
      └──────────┬───────────────────────┘
                 │
                 ▼
   ┌─────────────────────────────────────────┐
   │    Vector Similarity Search              │
   │    (pgvector cosine similarity)          │
   │    SELECT * FROM document_chunks         │
   │    ORDER BY embedding <=> query_vec      │
   │    LIMIT 5                               │
   └──────────┬──────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│         Retrieved Documents                  │
│  1. Penal Code Art. 505 (0.92 similarity)   │
│  2. Penal Code Art. 506 (0.87 similarity)   │
│  3. Penal Code Art. 510 (0.81 similarity)   │
│  4. Criminal Proc. Art. 1 (0.78 similarity) │
│  5. Penal Code Art. 504 (0.76 similarity)   │
└──────────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Build Context       │
    │  (Combine docs)      │
    └──────┬───────────────┘
           │
           ▼
    ┌─────────────────────────────────┐
    │   Generate Prompt                │
    │   System: "You are Mo7ami..."    │
    │   Context: [Legal docs...]       │
    │   Question: [User query]         │
    └──────┬──────────────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │   OpenAI GPT-4      │
    │   (Answer + Cite)   │
    └──────┬──────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│             Final Answer                     │
│  "القانون الجنائي المغربي كيعاقب على        │
│   السرقة بالحبس من سنة إلى خمس سنوات...     │
│   (المادة 505 من القانون الجنائي)"          │
│                                              │
│  Citations:                                  │
│  - Code Pénal, Article 505                  │
│  - Dahir 1-59-413 (1962)                    │
└──────────────────────────────────────────────┘
```

## 🌐 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 | React framework with App Router |
| | TypeScript | Type safety |
| | Tailwind CSS | Styling with RTL support |
| | React Query | Server state management |
| | NextAuth.js | Authentication |
| | Axios | HTTP client |
| **Backend** | FastAPI | Python async web framework |
| | Pydantic | Data validation |
| | SQLAlchemy | Database ORM |
| | Loguru | Logging |
| **Database** | PostgreSQL 14+ | Relational database |
| | pgvector | Vector similarity search |
| | Prisma | Schema & migrations (frontend) |
| **AI/ML** | OpenAI GPT-4 | Language model |
| | OpenAI Embeddings | Vector embeddings |
| | Google Cloud STT | Speech-to-Text |
| | Google Cloud TTS | Text-to-Speech |
| **Infrastructure** | Docker | Containerization |
| | Docker Compose | Multi-container orchestration |
| | Redis (planned) | Caching & rate limiting |
| **Auth** | Google OAuth 2.0 | User authentication |
| **Deployment** | Vercel (frontend) | Serverless hosting |
| | AWS/GCP (backend) | Cloud hosting |

## 📊 Performance Considerations

### Latency Budget (Target)

- User query → Response visible: < 3 seconds
- Voice recording → Transcription: < 2 seconds  
- Answer generation: < 2 seconds
- TTS generation: < 1 second
- Total end-to-end: < 5 seconds

### Optimization Strategies

1. **Caching**
   - Redis for frequently asked questions
   - CDN for static assets
   - Browser caching for fonts/images

2. **Database**
   - Index on frequently queried fields
   - Vector index (IVFFlat) for fast similarity search
   - Connection pooling

3. **API**
   - Response streaming
   - Batch requests where possible
   - Rate limiting per user

4. **Frontend**
   - Code splitting
   - Lazy loading of components
   - Image optimization
   - Service worker for offline capability

---

**Last Updated**: January 2025
**Version**: 1.0 (MVP Architecture)
