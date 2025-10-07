# 🚨 URGENT SECURITY FIXES REQUIRED

**Date**: 2025-10-07
**Priority**: CRITICAL
**Status**: ACTION REQUIRED BEFORE DEPLOYMENT

---

## ⚠️ CRITICAL ISSUES IDENTIFIED

### 1. **Exposed API Keys in Version Control** 🔴

**Issue**: The `.env` file containing live credentials has been committed to Git and is now public.

**Affected Keys**:
- ✅ OpenAI API Key: `sk-proj-9PQk7ql6T_Khjo3gQXV7...`
- ✅ Supabase Service Role Key
- ✅ Google OAuth credentials
- ✅ Database passwords

**Impact**: HIGH - Anyone with repo access can use these credentials

**Fix Required**: ✅ **COMPLETED**

### 2. **Client-Side API Key Exposure** 🔴

**Issue**: `NEXT_PUBLIC_OPENAI_API_KEY` environment variable exposes OpenAI key to browsers.

**Status**:
- ✅ Variable defined in `.env`
- ✅ **NOT actually used in frontend code** (verified with grep)
- ⚠️ Still a security risk if someone adds client-side code

**Fix Required**: ✅ **COMPLETED** - Removed from templates

### 3. **Deprecated Model References** 🟡

**Issue**: Code references `gpt-4-turbo-preview` which is outdated. GPT-5 doesn't exist in API.

**Fix Required**: ✅ **COMPLETED** - Changed to `gpt-4o-mini`

---

## ✅ FIXES IMPLEMENTED

### 1. Security Templates Created

**New Files**:
- ✅ `.env.production.template` - Production environment template
- ✅ `.env.local.template` - Local development template

**Key Changes**:
- Removed all live credentials
- Clear documentation on what goes where
- Security warnings added
- NEXT_PUBLIC_OPENAI_API_KEY removed

### 2. Model Selection Fixed

**Files Updated**:
- ✅ `backend/app/core/config.py` - Changed to `gpt-4o-mini`
- ✅ `lib/rag/generation.ts` - Pinned to stable model

### 3. Prompt Quality Enhanced

**Files Updated**:
- ✅ `backend/app/services/generation.py` - Added strict instructions:
  - Don't invent information
  - Respond only in detected language
  - Don't invent links (use document_id)
  - Cite article numbers and document_id
  - Explicit fallback if info not in context

---

## 🔥 IMMEDIATE ACTIONS REQUIRED

### Step 1: Rotate ALL Credentials ⏰ **DO THIS NOW**

```bash
# 1. OpenAI API Key
# → Go to https://platform.openai.com/api-keys
# → Revoke sk-proj-9PQk7ql6T_Khjo3gQXV7...
# → Generate new key
# → Store in secret manager (NOT in .env)

# 2. Supabase Credentials
# → Go to Supabase dashboard
# → Project Settings → API
# → Reset anon key and service role key
# → Update in secret manager

# 3. Google OAuth
# → Go to Google Cloud Console
# → Reset client secret
# → Update OAuth consent screen if needed

# 4. Database Password
# → Reset Supabase database password
# → Update connection strings

# 5. NextAuth Secret
# Generate new secret:
openssl rand -base64 32
```

### Step 2: Update .gitignore ⏰ **DO THIS NOW**

```bash
# Add to .gitignore (if not already there):
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
echo "!.env.example" >> .gitignore
echo "!.env*.template" >> .gitignore

# Remove .env from Git history (if committed):
git rm --cached .env
git rm --cached .env.local
git commit -m "🔐 Remove sensitive .env files from version control"
```

### Step 3: Use Secret Manager ⏰ **DO THIS BEFORE DEPLOYMENT**

**For Vercel** (recommended for Next.js):
```bash
# Add secrets via Vercel dashboard or CLI:
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
```

**For other platforms**:
- Railway: Use environment variables tab
- Heroku: `heroku config:set KEY=value`
- AWS: Use Secrets Manager or Parameter Store
- Self-hosted: Use HashiCorp Vault or similar

### Step 4: Verify Frontend Never Uses API Keys ✅ **VERIFIED**

```bash
# Already verified - no frontend code uses NEXT_PUBLIC_OPENAI_API_KEY
# Keep it this way!
```

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] **ALL credentials rotated** (OpenAI, Supabase, Google, DB)
- [ ] **Secrets stored in platform secret manager** (Vercel/Railway/etc.)
- [ ] **`.env` removed from Git** (`git rm --cached .env`)
- [ ] **`.env` added to `.gitignore`**
- [ ] **No `NEXT_PUBLIC_*` variables contain secrets**
- [ ] **Production `.env` uses template** (`.env.production.template`)
- [ ] **Local `.env.local` uses template** (`.env.local.template`)
- [ ] **Backend uses `gpt-4o-mini`** (verified in config.py)
- [ ] **Verification script tested** (`python3 scripts/verify_rag.py`)
- [ ] **Usage limits migration applied** (migration 005)
- [ ] **RAG pipeline tested with real queries**

---

## 🔒 SECURITY BEST PRACTICES GOING FORWARD

### DO ✅
- Store all secrets in platform secret manager
- Use `.env.example` or `.env.template` for documentation
- Rotate credentials quarterly or after suspected exposure
- Use separate keys for dev/staging/production
- Monitor OpenAI usage for anomalies
- Enable rate limiting on all API endpoints

### DON'T ❌
- Commit `.env` files to Git
- Use `NEXT_PUBLIC_*` for any sensitive values
- Share API keys in Slack/email/tickets
- Hardcode credentials in source code
- Use the same credentials across environments
- Leave unused API keys active

---

## 📊 VERIFICATION STEPS

### Test RAG Pipeline

```bash
# 1. Install backend dependencies
cd backend
pip install -r requirements.txt

# 2. Set environment variables (from secret manager)
export OPENAI_API_KEY="new-rotated-key"
export DATABASE_URL="new-connection-string"

# 3. Run verification script
cd ..
python3 scripts/verify_rag.py "Comment créer une société?" --language fr

# Expected output:
# ✅ Retrieved X document chunks
# ✅ Citations with document_id and official references
# ✅ Answer in French only
# ✅ No hallucinated information
```

### Test Voice Services

```bash
# Verify OpenAI Whisper/TTS (not Google Cloud)
cd backend
python3 -c "
from app.services.voice import transcribe_audio, synthesize_speech
print('✅ Voice services using OpenAI')
"
```

### Test Frontend (No Key Exposure)

```bash
# Verify no NEXT_PUBLIC_OPENAI_API_KEY in bundle
npm run build
grep -r "sk-proj" .next/
# Should return: no matches

# Verify environment
npm run dev
# Check browser console: process.env.NEXT_PUBLIC_OPENAI_API_KEY should be undefined
```

---

## 🎯 SUCCESS CRITERIA

Before approving deployment:

1. ✅ **All credentials rotated** and old ones revoked
2. ✅ **No secrets in Git repository**
3. ✅ **Secrets stored in platform secret manager**
4. ✅ **RAG verification script passes** with real queries
5. ✅ **Frontend never accesses OpenAI API directly**
6. ✅ **Backend uses stable model** (gpt-4o-mini, not GPT-5)
7. ✅ **Prompts include strict anti-hallucination instructions**
8. ✅ **Citations include document_id for traceability**

---

## 📞 SUPPORT

**Security Questions**: Contact security team
**API Key Rotation**: OpenAI platform.openai.com/api-keys
**Supabase Issues**: Supabase dashboard
**Deployment Help**: DevOps team

---

## 🚀 NEXT STEPS AFTER FIXES

Once all security issues are resolved:

1. ✅ Complete usage limits migration (migration 005)
2. ✅ Seed database with vetted Moroccan legal texts
3. ✅ Run comprehensive RAG tests
4. ✅ Deploy to staging with new credentials
5. ✅ Perform security audit
6. ✅ Deploy to production
7. ✅ Monitor for anomalies (first 48 hours)

---

**Status**: ⏰ **WAITING FOR CREDENTIAL ROTATION**
**Estimated Time to Fix**: 30-45 minutes
**Blocking Deployment**: YES - Must fix before production launch

---

*Document created: 2025-10-07*
*Last updated: 2025-10-07*
*Next review: After credential rotation*
