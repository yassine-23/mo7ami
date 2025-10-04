# Mo7ami Scripts

This directory contains utility scripts for managing the Mo7ami legal chatbot.

## Available Scripts

### 1. Setup Supabase (`setup-supabase.sh`)

Helper script to guide you through Supabase configuration.

```bash
./scripts/setup-supabase.sh
```

**What it does:**
- Checks for .env file
- Provides step-by-step setup instructions
- Links to SUPABASE_SETUP.md for detailed guide

### 2. Ingest Legal Documents (`ingest-documents.ts`)

Processes legal documents and generates vector embeddings for RAG.

```bash
# Install dependencies first
npm install

# Generate Prisma client
npx prisma generate

# Run ingestion script
npx ts-node scripts/ingest-documents.ts
```

**What it does:**
- Loads legal documents into database
- Splits documents into chunks (~500 characters each)
- Generates embeddings using OpenAI text-embedding-3-large
- Saves chunks with embeddings to Supabase
- Extracts article numbers automatically

**Sample Documents Included:**
1. **Penal Code (القانون الجنائي)** - Theft articles (505-507)
2. **Family Code (مدونة الأسرة)** - Marriage articles (4, 5, 19)
3. **Labor Code (مدونة الشغل)** - Employment contract articles (6, 16, 34, 35)

### Adding More Documents

To add your own legal documents, edit `ingest-documents.ts` and add to the `sampleDocuments` array:

```typescript
{
  title: 'Document Title',
  titleAr: 'العنوان بالعربية',
  titleFr: 'Titre en français',
  domain: 'penal', // penal, civil, family, labor, commercial, etc.
  documentType: 'code', // code, law, decree, etc.
  officialRef: 'ظهير رقم...',
  publicationDate: new Date('YYYY-MM-DD'),
  language: 'both', // ar, fr, or both
  contentAr: `Arabic text here...`,
  contentFr: `French text here...`,
  metadata: {
    bulletinOfficiel: 'BO number',
    lastUpdated: 'Year',
  },
}
```

## Prerequisites

Before running scripts:

1. **Supabase Setup:**
   ```bash
   # Follow SUPABASE_SETUP.md guide
   ./scripts/setup-supabase.sh
   ```

2. **Environment Variables:**
   Ensure `.env` has:
   - `DATABASE_URL` - Supabase connection string
   - `DIRECT_URL` - Supabase direct connection
   - `OPENAI_API_KEY` - OpenAI API key for embeddings

3. **Database Schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Supabase Migrations:**
   Execute in Supabase SQL Editor:
   - `supabase/migrations/001_enable_vector.sql`
   - `supabase/migrations/002_vector_search_functions.sql`
   - `supabase/migrations/003_vector_indexes.sql`

## Troubleshooting

### Error: "Missing OPENAI_API_KEY"
```bash
# Add to .env file
OPENAI_API_KEY=sk-proj-your-key-here
```

### Error: "Cannot find module '@prisma/client'"
```bash
npm install
npx prisma generate
```

### Error: "Connection refused"
- Check DATABASE_URL in .env
- Verify Supabase project is active
- Check internet connection

### Embeddings taking too long
- Reduce batch size in script (default: 20)
- Use smaller chunks (default: 500 characters)
- Consider upgrading OpenAI plan for higher rate limits

## Performance Tips

**For Large Documents:**
1. Increase batch size for faster processing (but watch rate limits)
2. Use parallel processing for multiple documents
3. Monitor OpenAI usage to avoid rate limits

**Embedding Costs:**
- text-embedding-3-large: ~$0.13 per 1M tokens
- Average chunk: ~100 tokens
- 1000 chunks ≈ $0.01 USD

## Next Steps

After ingesting documents:

1. **Test RAG Pipeline:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/chat
   # Ask: "شنو كايقول القانون على السرقة؟"
   ```

2. **Monitor Performance:**
   - Check Supabase logs for query performance
   - Monitor vector index usage
   - Review analytics in database

3. **Add More Content:**
   - Gather official legal texts from sgg.gov.ma
   - Process PDFs with scripts/pdf-processor.ts (create this)
   - Expand to all 12 legal domains

---

For more information, see:
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [README.md](../README.md)
