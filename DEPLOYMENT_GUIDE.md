# Mo7ami Deployment Guide

Complete guide to deploying Mo7ami to production.

## Prerequisites

Before deploying, ensure you have:

- ✅ Supabase account and project created
- ✅ Google Cloud Console account (for OAuth)
- ✅ OpenAI API key with credits
- ✅ GitHub repository (for deployment)
- ✅ Domain name (optional, for custom domain)

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Fill in:
   - **Name**: `mo7ami-production`
   - **Database Password**: Strong password (save it!)
   - **Region**: `eu-central-1` (close to Morocco/Europe)
   - **Plan**: Free tier to start

### 1.2 Enable pgvector Extension

1. Go to **Database** → **Extensions**
2. Search for `vector`
3. Click **Enable** on the `vector` extension

### 1.3 Get Connection Details

1. Go to **Settings** → **Database**
2. Copy these values:

```bash
# Connection pooling (for Prisma)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# API credentials
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 1.4 Run Database Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Verify in Supabase dashboard: Database → Tables
```

### 1.5 Execute SQL Migrations

1. Go to **SQL Editor** in Supabase
2. Create new query for each file:
   - `supabase/migrations/001_enable_vector.sql`
   - `supabase/migrations/002_vector_search_functions.sql`
   - `supabase/migrations/003_vector_indexes.sql`
3. Run each migration in order

## Step 2: Set Up Google OAuth

### 2.1 Create OAuth Credentials

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: "Mo7ami Production"
3. Enable APIs:
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**
4. Create OAuth consent screen:
   - **User Type**: External
   - **App Name**: Mo7ami
   - **Support Email**: Your email
   - **Developer Contact**: Your email
5. Create credentials:
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - **Application type**: Web application
   - **Name**: Mo7ami Production
   - **Authorized redirect URIs**:
     - Production: `https://yourdomain.com/api/auth/callback/google`
     - Staging: `https://yourstaging.vercel.app/api/auth/callback/google`
     - Local: `http://localhost:3000/api/auth/callback/google`
6. Copy **Client ID** and **Client Secret**

### 2.2 Generate NextAuth Secret

```bash
# Generate a secure random secret
openssl rand -base64 32

# Save this as NEXTAUTH_SECRET
```

## Step 3: Ingest Legal Documents

### 3.1 Configure Environment

Create `.env.local` with all credentials:

```bash
# Database
DATABASE_URL="..."
DIRECT_URL="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Authentication
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

### 3.2 Run Document Ingestion

```bash
# Install TypeScript execution
npm install --save-dev ts-node

# Run ingestion script
npx ts-node scripts/ingest-documents.ts
```

**Expected output:**
```
🚀 Starting Legal Document Ingestion

📄 Ingesting: القانون الجنائي المغربي - السرقة
✅ Document created: clx...
  🔄 Processing ar content...
  📊 Created 6 chunks
  🧮 Generating embeddings for chunks 1-6...
  ✅ Saved 6 chunks with embeddings
  ...
✅ All documents ingested successfully!
```

**Cost estimate:** ~$0.02 for sample documents (3 docs, ~30 chunks)

### 3.3 Verify Data

1. Go to Supabase **Table Editor**
2. Check tables:
   - `legal_documents`: Should have 3 rows
   - `document_chunks`: Should have ~30 rows
3. Test vector search in SQL Editor:

```sql
SELECT * FROM search_similar_legal_chunks(
  (SELECT embedding FROM document_chunks LIMIT 1), -- Sample embedding
  0.7, -- Threshold
  5    -- Limit
);
```

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
# Create GitHub repository
gh repo create mo7ami --public --source=. --remote=origin

# Push code
git push -u origin main
```

### 4.2 Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Import Project**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add **Environment Variables** (all from `.env.local`):
   - DATABASE_URL
   - DIRECT_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (https://your-domain.vercel.app)
   - NEXT_PUBLIC_APP_URL
   - NEXT_PUBLIC_API_URL
6. Click **Deploy**

### 4.3 Update Google OAuth

After deployment:
1. Go back to Google Cloud Console
2. Add Vercel URL to authorized redirect URIs:
   - `https://your-project.vercel.app/api/auth/callback/google`

## Step 5: Configure Custom Domain (Optional)

### 5.1 In Vercel

1. Go to your project **Settings** → **Domains**
2. Add your domain (e.g., `mo7ami.ma`)
3. Follow DNS configuration instructions

### 5.2 Update Environment

1. Update `NEXTAUTH_URL` to your custom domain
2. Update Google OAuth redirect URI
3. Redeploy

## Step 6: Testing & Monitoring

### 6.1 Test Core Features

- [ ] **Home Page**: Loads correctly, all languages work
- [ ] **Authentication**: Google sign-in works
- [ ] **Chat Interface**: Loads without errors
- [ ] **RAG Pipeline**: Asks "شنو كايقول القانون على السرقة؟"
  - Should return answer with citations
  - Check Supabase logs for vector search
- [ ] **Voice Features**: Record and playback work (if implemented)
- [ ] **Mobile**: Test on phone

### 6.2 Monitor Performance

**Supabase Dashboard:**
- Database → **Logs**: Check for errors
- Database → **Performance**: Monitor query speed

**Vercel Dashboard:**
- **Analytics**: Page views, response times
- **Logs**: Runtime errors
- **Usage**: Bandwidth, function executions

**OpenAI Dashboard:**
- **Usage**: API costs, token usage
- **Limits**: Rate limit monitoring

## Step 7: Ongoing Maintenance

### 7.1 Add More Legal Documents

```bash
# Edit scripts/ingest-documents.ts
# Add new documents to sampleDocuments array

# Run ingestion
npx ts-node scripts/ingest-documents.ts

# Cost: ~$0.0001 per chunk
```

### 7.2 Monitor Costs

**Monthly estimates (Free tier limits):**

| Service | Free Tier | Estimated Cost After |
|---------|-----------|---------------------|
| Supabase | 500MB DB, 2GB bandwidth | $25/month for Pro |
| Vercel | 100GB bandwidth | $20/month for Pro |
| OpenAI | Pay-as-you-go | ~$5-20/month (depends on usage) |

**Cost optimization:**
- Cache common queries
- Use GPT-4o-mini (not GPT-4)
- Batch embeddings generation
- Monitor analytics, optimize prompts

### 7.3 Backups

**Supabase:**
- Free tier: Daily backups (7 days retention)
- Pro tier: Point-in-time recovery

**Manual backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Export legal documents (JSON)
npx prisma studio
# Export tables as JSON
```

### 7.4 Scaling

**When to scale:**
- > 500MB database → Upgrade Supabase to Pro ($25/mo)
- > 100 concurrent users → Upgrade Vercel to Pro ($20/mo)
- > 1M tokens/month → Monitor OpenAI costs

**Optimization:**
- Enable edge caching for static content
- Use Redis for session storage
- Implement rate limiting
- Add CDN for media files

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

- Check DATABASE_URL is correct
- Verify Supabase project is active
- Test connection: `npx prisma db pull`

### OAuth Errors

- Verify redirect URIs match exactly
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL is HTTPS in production

### Vector Search Not Working

- Verify pgvector extension is enabled
- Check SQL migrations were executed
- Test with: `SELECT * FROM document_chunks LIMIT 1;`

## Security Checklist

Before going live:

- [ ] All secrets in environment variables (not code)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Google OAuth restricted to production domains
- [ ] Supabase Row Level Security (RLS) enabled (optional)
- [ ] Rate limiting implemented (optional)
- [ ] HTTPS enforced
- [ ] Legal disclaimers visible
- [ ] Privacy policy & terms of service pages

## Support

- **Documentation**: See README.md, SUPABASE_SETUP.md
- **Issues**: https://github.com/yourusername/mo7ami/issues
- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **NextAuth**: https://next-auth.js.org

---

**Congratulations! 🎉 Mo7ami is now live!**

Monitor your deployment and gather user feedback to improve the legal knowledge base.
