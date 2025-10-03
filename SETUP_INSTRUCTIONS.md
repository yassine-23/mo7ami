# Mo7ami Setup Instructions

## 🔑 Required: OpenAI API Key

Before running the project, you **must** set up your OpenAI API key:

### 1. Get Your API Key
- Visit: https://platform.openai.com/api-keys
- Create a new API key
- Copy the key (starts with `sk-proj-...`)

### 2. Set Environment Variable

**Option A: Using .env file (Recommended)**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your key
OPENAI_API_KEY=sk-proj-your-actual-key-here
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Option B: Export in terminal**
```bash
# For current session
export OPENAI_API_KEY='sk-proj-your-actual-key-here'

# Add to ~/.zshrc or ~/.bashrc for permanent
echo 'export OPENAI_API_KEY="sk-proj-your-actual-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
pip3 install requests
```

### 4. Run the Application

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
python3 openai_server.py
```

### 5. Open in Browser
Visit: http://localhost:3000/chat

## 📝 Notes

- The `.env` file is gitignored for security
- Never commit your actual API key to Git
- The backend will warn you if the key is not set
- You can test without voice features, but chat requires the API key

## 🆘 Troubleshooting

**Error: "OPENAI_API_KEY not set"**
- Make sure you've exported the variable or created .env file
- Restart the backend server after setting the key

**Error: "Unauthorized" from OpenAI**
- Check that your API key is valid
- Verify you have credits in your OpenAI account

**Frontend can't reach backend**
- Make sure backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in .env is set to http://localhost:8000

## 💰 Cost Estimate

Using GPT-4o-mini and TTS-1:
- Chat: ~$0.0001 per message
- TTS: ~$0.015 per 1000 characters
- Very affordable for development and testing!

---

For full documentation, see [README.md](README.md)
