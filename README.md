# Mo7ami (محامي) - Multilingual Legal Chatbot

![Mo7ami Logo](public/images/logo.png)

An AI-powered educational legal chatbot for Moroccan law, supporting Arabic (Darija), Modern Standard Arabic, and French with voice interaction capabilities.

## 🌟 Features

- **🎤 Voice-First Interaction**: Real-time speech-to-text and text-to-speech in Arabic and French
- **🌍 Multilingual Support**: Seamless interaction in Darija, MSA, and French
- **📚 RAG-Powered Answers**: Retrieval-Augmented Generation with citations from official sources
- **🔒 Secure Authentication**: Google OAuth for user accounts
- **💾 Conversation History**: Save and review past interactions
- **📖 12+ Legal Domains**: Comprehensive coverage of Moroccan law
- **🎯 Citation System**: Every answer includes references to official legal texts (Bulletin Officiel)

## 📋 Legal Domains Covered

1. **Penal Law & Criminal Procedure** (القانون الجنائي)
2. **Civil Law** (القانون المدني)
3. **Family Law - Moudawana** (مدونة الأسرة)
4. **Labor Law** (قانون الشغل)
5. **Commercial & Corporate Law** (القانون التجاري)
6. **Real Estate & Property** (القانون العقاري)
7. **Administrative Law** (القانون الإداري)
8. **Public Procurement** (الصفقات العمومية)
9. **Tax Law** (القانون الضريبي)
10. **Consumer Protection** (حماية المستهلك)
11. **Data Protection** (حماية المعطيات)
12. **Traffic Law** (قانون السير)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: NextAuth.js with Google OAuth
- **UI Components**: Custom components with Lucide icons

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma (Frontend) / SQLAlchemy (Backend)
- **AI/ML**: OpenAI GPT-4 for generation, OpenAI embeddings for vector search
- **Voice Services**: Google Cloud Speech-to-Text & Text-to-Speech
- **Vector Store**: pgvector for semantic search

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+ with pgvector extension
- Google Cloud account (for Speech services)
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mo7ami
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Set up PostgreSQL with pgvector**
```bash
# Install pgvector extension
psql -U postgres
CREATE EXTENSION vector;

# Create database
CREATE DATABASE mo7ami;
```

5. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

6. **Run database migrations**
```bash
npx prisma migrate dev
npx prisma generate
```

7. **Start development servers**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
python -m uvicorn main:app --reload
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:8000`.

## 📝 Environment Variables

### Frontend (.env)
- `NEXT_PUBLIC_APP_URL`: Application URL
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `NEXTAUTH_SECRET`: NextAuth secret key
- `DATABASE_URL`: PostgreSQL connection string

### Backend (backend/.env)
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `GOOGLE_CLOUD_PROJECT_ID`: GCP project ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCP credentials JSON

## 🔧 Development

### Project Structure

```
mo7ami/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── chat/                # Chat interface
│   └── profile/             # User profile
├── components/              # React components
│   ├── chat/               # Chat UI components
│   ├── voice/              # Voice components
│   └── ui/                 # Shared UI components
├── lib/                     # Utilities and helpers
│   ├── auth/               # Authentication utilities
│   ├── db/                 # Database utilities
│   └── utils/              # General utilities
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── services/       # Business logic
│   │   │   ├── retrieval.py   # Document retrieval
│   │   │   ├── generation.py  # Answer generation
│   │   │   └── voice.py        # Voice services
│   │   ├── models/         # Data models
│   │   └── core/           # Core configuration
│   └── data/               # Legal document corpus
└── prisma/                  # Database schema
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest

# E2E tests
npm run test:e2e
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

### Main Endpoints

- **POST /api/v1/chat**: Send a chat message
- **POST /api/v1/voice/transcribe**: Transcribe audio to text
- **POST /api/v1/voice/synthesize**: Convert text to speech
- **GET /api/v1/documents**: List legal documents
- **GET /api/v1/documents/domains**: List available legal domains

## 🎨 UI/UX Features

- **RTL/LTR Support**: Automatic direction switching for Arabic and French
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Voice Visualizations**: Recording animations and voice activity indicators
- **Dark Mode**: (Coming soon)
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security & Privacy

- All user data is encrypted at rest and in transit
- Complies with Morocco's Law 09-08 on data protection
- Optional anonymous mode (no login required)
- No storage of voice recordings beyond processing
- Clear disclaimers about educational vs. professional legal advice

## 📖 Usage Examples

### Text Chat (Arabic)
```
User: شنو كايقول القانون على السرقة؟
Mo7ami: القانون الجنائي المغربي كيعاقب على السرقة بالحبس من سنة إلى خمس سنوات... [المادة 505 من القانون الجنائي]
```

### Voice Chat (French)
```
User: [Voice] "Quel est l'âge légal du mariage au Maroc?"
Mo7ami: [Voice Response] "L'âge légal du mariage au Maroc est fixé à 18 ans pour les deux sexes, selon l'article 19 du Code de la famille (Moudawana)..."
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Legal Disclaimer

**Mo7ami provides legal information for educational purposes only. It is NOT a substitute for professional legal advice. For specific legal issues, please consult a qualified lawyer.**

المنصة توفر معلومات قانونية للأغراض التعليمية فقط، وليست بديلاً عن الاستشارة القانونية المهنية.

## 📞 Support

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/mo7ami/issues)
- Email: support@mo7ami.ma
- Documentation: [docs.mo7ami.ma](https://docs.mo7ami.ma)

## 🙏 Acknowledgments

- Moroccan legal texts from the Official Bulletin (Bulletin Officiel)
- OpenAI for GPT-4 and embeddings
- Google Cloud for Speech services
- The open-source community

---

**Made with ❤️ for better access to legal information in Morocco**

محامي - مساعدك القانوني الذكي 🇲🇦
