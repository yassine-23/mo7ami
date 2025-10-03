# Mo7ami (محامي) - Your Intelligent Legal Assistant for Moroccan Law

<div align="center">

![Mo7ami Banner](https://img.shields.io/badge/Mo7ami-محامي-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**Empowering Moroccans with accessible, accurate legal information in their own language**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [📚 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 🌍 The Problem We're Solving

Access to legal information in Morocco faces several challenges:

- **Language Barriers**: Legal texts are often in formal Arabic or French, inaccessible to many Moroccans who speak primarily Darija
- **Complex Terminology**: Legal jargon makes it difficult for ordinary citizens to understand their rights
- **Limited Resources**: Not everyone can afford or access professional legal consultation
- **Information Scattered**: Legal information is spread across multiple government websites and documents
- **Low Legal Literacy**: Many Moroccans are unaware of their legal rights and obligations

## 💡 Our Mission

**Mo7ami (محامي)** bridges this gap by providing:

✅ **Free Access** to accurate legal information
✅ **Darija Support** - Understanding law in your daily language
✅ **Instant Answers** - No waiting, no appointments needed
✅ **Official Sources** - All answers cite actual Moroccan laws
✅ **Voice Interaction** - Ask questions naturally, by speaking
✅ **Educational Focus** - Learn about your rights and responsibilities

> **"Knowledge of the law is every citizen's right. We're making it accessible to everyone."**

---

## 👨‍⚖️ What is Mo7ami?

Mo7ami is an **AI-powered legal education platform** that helps Moroccans understand their legal rights and responsibilities. Think of it as having a knowledgeable legal assistant available 24/7, speaking your language, ready to explain Moroccan laws in simple terms.

### 🎯 Who is it for?

- **Citizens** seeking to understand their legal rights
- **Students** learning about Moroccan law
- **Small Business Owners** navigating legal requirements
- **NGOs** providing legal literacy programs
- **Anyone** curious about how Moroccan law affects their daily life

### ⚠️ What Mo7ami is NOT

Mo7ami provides **educational legal information**, not legal advice. It cannot:
- ❌ Represent you in court
- ❌ Provide case-specific legal counsel
- ❌ Replace a qualified lawyer for serious legal matters
- ❌ Make legal decisions on your behalf

**For specific legal problems, always consult a licensed lawyer.**

---

## ✨ Features

### 🗣️ Natural Language Interaction

- **Speak in Darija**: "شنو كايقول القانون على السرقة؟"
- **Ask in French**: "Quels sont mes droits en tant que salarié?"
- **Modern Standard Arabic**: Full support for formal Arabic
- **Voice Input/Output**: Ask questions by speaking, hear answers

### 📚 Comprehensive Legal Coverage

Mo7ami covers **12+ domains of Moroccan law**:

| Domain | Arabic | Coverage |
|--------|--------|----------|
| **Penal Law** | القانون الجنائي | Criminal offenses, penalties, procedures |
| **Civil Law** | القانون المدني | Obligations, contracts, property rights |
| **Family Law** | مدونة الأسرة | Marriage, divorce, custody, inheritance |
| **Labor Law** | قانون الشغل | Employment rights, contracts, workplace safety |
| **Commercial Law** | القانون التجاري | Business operations, companies, bankruptcy |
| **Real Estate** | القانون العقاري | Property ownership, land registration |
| **Administrative Law** | القانون الإداري | Government procedures, public services |
| **Tax Law** | القانون الضريبي | Taxation rules, declarations, penalties |
| **Consumer Protection** | حماية المستهلك | Consumer rights, warranties, complaints |
| **Data Protection** | حماية المعطيات | Privacy rights, data security (Law 09-08) |
| **Traffic Law** | قانون السير | Driving rules, violations, licenses |
| **Public Procurement** | الصفقات العمومية | Government contracts and tenders |

### 🎓 Educational Approach

Every answer includes:

1. **Clear Explanation** in simple language
2. **Official Legal References** (Article numbers, law names)
3. **Practical Examples** from real-life situations
4. **Step-by-Step Procedures** when applicable
5. **Government Website Links** for official sources
6. **Follow-up Questions** to deepen understanding

### 🔊 Smart Voice Features

- **Automatic Language Detection**: Speak naturally, we'll understand
- **Natural Pronunciation**: Numbers spoken as words ("خمسمائة" not "500")
- **High-Quality TTS**: Clear, professional voice output
- **Recording Transcription**: Your questions saved in text

### 💬 Conversation History

- **Review Past Chats**: Go back to any previous question
- **Continue Conversations**: Build on previous questions
- **Export Conversations**: Save important legal information
- **Search History**: Find specific topics discussed before

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/yassine-23/mo7ami.git
cd mo7ami

# 2. Install dependencies
npm install
pip3 install requests

# 3. Configure your API key
cp .env.example .env
# Edit .env and add your OpenAI API key

# 4. Start the application
npm run dev                           # Terminal 1 (Frontend)
cd backend && python3 openai_server.py  # Terminal 2 (Backend)

# 5. Open your browser
# Visit: http://localhost:3000/chat
```

**That's it! 🎉** You can now start asking legal questions in Arabic or French.

### Detailed Setup Guide

For complete setup instructions including database configuration, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

---

## 🏗️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Responsive, modern UI
- **React Query**: Efficient state management
- **NextAuth.js**: Authentication (Google OAuth ready)

### Backend
- **Python**: Simple HTTP server
- **OpenAI API**: GPT-4o-mini for intelligent responses
- **OpenAI TTS**: Text-to-speech in multiple languages

### AI & Legal Knowledge
- **GPT-4o-mini**: Advanced language understanding
- **Custom Prompts**: Specialized for Moroccan law
- **Citation System**: Automatic reference to legal sources
- **RAG Architecture** *(coming soon)*: Vector embeddings for document retrieval

---

## 📖 Usage Examples

### Example 1: Understanding Criminal Law (Arabic)

**You ask:**
> "شنو كايقول القانون الجنائي على السرقة؟"
> *(What does criminal law say about theft?)*

**Mo7ami explains:**
- Definition of theft under Moroccan law
- Penalties (prison terms, fines)
- Different types (simple theft, aggravated theft)
- Legal procedures to follow
- **Sources**: Articles from Code Pénal (Dahir 1-59-413)

### Example 2: Employee Rights (French)

**You ask:**
> "Quels sont mes droits si mon employeur veut me licencier?"
> *(What are my rights if my employer wants to fire me?)*

**Mo7ami explains:**
- Valid reasons for dismissal
- Notice period requirements
- Severance pay calculations
- Complaint procedures
- **Sources**: Labor Code articles (Law 65-99)

### Example 3: Family Law Questions (Darija)

**You ask:**
> "واش كاين شي شروط باش نطلق؟"
> *(Are there conditions for getting divorced?)*

**Mo7ami explains:**
- Divorce procedures in Moudawana
- Rights of both spouses
- Child custody considerations
- Financial obligations
- **Sources**: Family Code (Law 70-03)

---

## 🎓 Educational Impact

### Legal Literacy Goals

Mo7ami aims to increase legal literacy in Morocco by:

1. **Democratizing Legal Knowledge**
   - Making laws accessible to all social classes
   - Breaking down language barriers
   - Removing cost barriers to legal information

2. **Preventing Legal Problems**
   - Helping citizens understand their rights before issues arise
   - Providing information about legal requirements for businesses
   - Educating about legal procedures and deadlines

3. **Empowering Citizens**
   - Knowledge to recognize when rights are violated
   - Understanding of available legal remedies
   - Confidence to seek professional help when needed

4. **Supporting Legal Professionals**
   - Reducing basic information inquiries
   - Educated clients who understand legal processes
   - Reference tool for quick legal lookups

### Measuring Success

We track our impact through:
- **Questions Answered**: Number of legal queries resolved
- **Topics Covered**: Range of legal domains accessed
- **User Feedback**: Satisfaction and usefulness ratings
- **Knowledge Retention**: Follow-up questions showing deeper understanding

---

## 🔒 Privacy & Security

### Your Data is Protected

- ✅ **No Personal Data Required**: Use anonymously without login
- ✅ **Encrypted Communications**: All data in transit is encrypted
- ✅ **No Voice Recording Storage**: Audio deleted after transcription
- ✅ **Compliant with Law 09-08**: Morocco's data protection law
- ✅ **Transparent Usage**: Clear privacy policy

### What We Don't Do

- ❌ We don't sell your data
- ❌ We don't share conversations with third parties
- ❌ We don't track you across websites
- ❌ We don't require personal identification

---

## 📚 Documentation

### For Users
- [**Quick Start Guide**](QUICKSTART.md) - Get started in 5 minutes
- [**Setup Instructions**](SETUP_INSTRUCTIONS.md) - Detailed installation guide
- [**FAQ**](docs/FAQ.md) - Frequently asked questions *(coming soon)*

### For Developers
- [**Architecture Overview**](ARCHITECTURE.md) - System design and components
- [**Development Guide**](DEVELOPMENT_CHECKLIST.md) - Development checklist
- [**API Documentation**](docs/API.md) - Backend API reference *(coming soon)*
- [**Contributing Guide**](CONTRIBUTING.md) - How to contribute *(coming soon)*

### Legal & Compliance
- [**Legal Disclaimer**](#-legal-disclaimer) - Important information about using Mo7ami
- [**Data Sources**](docs/SOURCES.md) - Where our legal information comes from *(coming soon)*
- [**Privacy Policy**](docs/PRIVACY.md) - How we handle your data *(coming soon)*

---

## 🗺️ Roadmap

### Current Version (v0.1.0) ✅
- ✅ Basic chat interface in Arabic and French
- ✅ OpenAI GPT-4o-mini integration
- ✅ Voice input/output with OpenAI TTS
- ✅ Conversation history sidebar
- ✅ 12+ legal domains coverage
- ✅ Detailed responses with citations

### Coming Soon (v0.2.0) 🚧
- 🔄 RAG (Retrieval-Augmented Generation) for accurate citations
- 🔄 PostgreSQL with pgvector for document search
- 🔄 User authentication with Google OAuth
- 🔄 Save conversation history to database
- 🔄 Mobile responsive improvements

### Future Plans (v1.0.0) 🔮
- 📱 Native mobile apps (iOS & Android)
- 🌐 English language support
- 📊 Legal statistics and visualizations
- 👥 Legal professional directory
- 📚 Legal education courses
- 🤝 Integration with Ministry of Justice portal

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're a:

- **Developer**: Improve code, add features, fix bugs
- **Legal Expert**: Review accuracy, suggest content improvements
- **Designer**: Enhance UI/UX, create graphics
- **Translator**: Improve language quality, add dialects
- **Educator**: Create tutorials, write documentation

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines *(coming soon)*.

---

## ⚖️ Legal Disclaimer

**IMPORTANT - PLEASE READ CAREFULLY**

### Educational Purpose Only

Mo7ami provides **general legal information for educational purposes**. It is:

✅ **Good for:**
- Learning about Moroccan laws
- Understanding your general legal rights
- Getting references to official legal texts
- Preparing questions for your lawyer

❌ **NOT good for:**
- Legal advice for specific cases
- Representation in court
- Replacing professional legal counsel
- Making important legal decisions

### When to Consult a Lawyer

You should consult a qualified lawyer when:

- You have a specific legal problem requiring action
- You are involved in or facing legal proceedings
- You need to draft or review legal documents
- Your rights, freedom, or significant assets are at stake
- You need representation in court or negotiations

### No Attorney-Client Relationship

Using Mo7ami does **not** create an attorney-client relationship. Any information provided:

- Is not confidential or privileged
- Cannot be relied upon as legal advice
- May not be complete or current
- Should be verified with official sources

### Accuracy Disclaimer

While we strive for accuracy:

- Laws change and Mo7ami may not reflect the latest updates
- AI responses may contain errors or omissions
- Always verify important information with official sources
- Citations are for reference; read full legal texts for complete context

### Limitation of Liability

Mo7ami and its creators are not liable for:

- Decisions made based on information provided
- Losses or damages resulting from use of the platform
- Errors or inaccuracies in legal information
- Consequences of not seeking professional legal advice

---

**في العربية:**

**محامي يوفر معلومات قانونية عامة للأغراض التعليمية فقط. ليس بديلاً عن الاستشارة القانونية المهنية. للمشاكل القانونية الخاصة، يُرجى استشارة محامٍ مؤهل.**

**En Français:**

**Mo7ami fournit des informations juridiques générales à des fins éducatives uniquement. Il ne remplace pas les conseils juridiques professionnels. Pour des problèmes juridiques spécifiques, veuillez consulter un avocat qualifié.**

---

## 🙏 Acknowledgments

### Data Sources
- **Bulletin Officiel du Royaume du Maroc** - Official legal texts
- **[Secrétariat Général du Gouvernement](https://www.sgg.gov.ma)** - Government legal portal
- **[Ministère de la Justice](https://www.justice.gov.ma)** - Justice ministry resources

### Technology Partners
- **OpenAI** - GPT-4o-mini and TTS services
- **Next.js Team** - Excellent React framework
- **Vercel** - Hosting and deployment platform *(coming soon)*

### Open Source Community
- Contributors to all the open-source libraries we use
- Legal tech community for inspiration and best practices
- Moroccan developers building for social impact

---

## 📞 Contact & Support

### Get Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yassine-23/mo7ami/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yassine-23/mo7ami/discussions)
- 📧 **Email**: mo7ami.contact@gmail.com *(coming soon)*
- 📚 **Documentation**: This README and linked guides

### Community
- 🌍 **Website**: https://mo7ami.ma *(coming soon)*
- 🐦 **Twitter**: @mo7ami_app *(coming soon)*
- 💼 **LinkedIn**: Mo7ami Project *(coming soon)*

### Legal Inquiries
For legal questions about the platform itself:
- **Terms of Service**: See [TERMS.md](docs/TERMS.md) *(coming soon)*
- **Privacy Policy**: See [PRIVACY.md](docs/PRIVACY.md) *(coming soon)*

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yassine-23/mo7ami?style=social)
![GitHub forks](https://img.shields.io/github/forks/yassine-23/mo7ami?style=social)
![GitHub issues](https://img.shields.io/github/issues/yassine-23/mo7ami)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yassine-23/mo7ami)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

This means you can:
- ✅ Use Mo7ami for personal or commercial purposes
- ✅ Modify and adapt the code
- ✅ Distribute your modifications
- ✅ Use it in your own projects

With the condition that:
- ⚠️ You include the original license and copyright notice
- ⚠️ You understand it comes with no warranty

---

<div align="center">

## 💚 Made with Love for Morocco

**Mo7ami (محامي)** - Because legal knowledge should be accessible to everyone

**محامي - مساعدك القانوني الذكي 🇲🇦**

*Empowering citizens through legal literacy*

---

**[⭐ Star us on GitHub](https://github.com/yassine-23/mo7ami)** if you believe in accessible legal information!

[![Made in Morocco](https://img.shields.io/badge/Made%20in-Morocco%20🇲🇦-red?style=for-the-badge)](https://github.com/yassine-23/mo7ami)
[![Support Legal Literacy](https://img.shields.io/badge/Support-Legal%20Literacy-green?style=for-the-badge)](https://github.com/yassine-23/mo7ami)

</div>
