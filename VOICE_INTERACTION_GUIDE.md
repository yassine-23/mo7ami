# 🎤 Voice Interaction User Guide

## Mo7ami Voice Features

Mo7ami supports **professional voice interaction** with WhatsApp-style recording for a familiar, intuitive experience.

---

## 🚀 Quick Start

### Using Voice Input

1. **Navigate to Chat**: Go to `/chat` page
2. **Hold Mic Button**: Press and hold the microphone icon (🎤)
3. **Speak Your Question**: Ask your legal question in Arabic or French
4. **Release to Send**: Let go to transcribe and send
5. **Or Swipe to Cancel**: Slide up 100px to cancel recording

---

## 📱 Features

### WhatsApp-Style Recording

#### Hold-to-Record
- **Touch devices**: Press and hold the mic button
- **Desktop**: Click and hold with mouse
- Recording starts immediately
- Full-screen overlay appears

#### Swipe-to-Cancel
- **While recording**: Swipe upward on the mic button
- **Threshold**: 100px upward movement
- Visual indicator shows when cancel threshold is reached
- Recording discarded if cancelled

#### Visual Feedback
- **Pulsing mic icon**: Indicates active recording
- **Volume bars**: 20 animated bars react to your voice
- **Timer**: Shows recording duration (MM:SS)
- **Scale animation**: Mic grows/shrinks with voice volume

---

## 🎙️ How It Works

### Recording Flow

```
1. User presses mic button
   ↓
2. Request microphone permission (first time)
   ↓
3. Full-screen recording overlay appears
   ↓
4. Real-time audio visualization starts
   ↓
5. User speaks their legal question
   ↓
6. User releases button OR swipes up
   ↓
7. Audio sent to Whisper API for transcription
   ↓
8. Transcript appears in chat input
   ↓
9. User can edit or send immediately
```

### Audio Processing

**Capture Settings:**
- **Sample Rate**: 24kHz (optimized for Whisper)
- **Channels**: Mono
- **Format**: WebM/Opus (Safari: MP4 fallback)
- **Enhancements**:
  - Echo cancellation ✅
  - Noise suppression ✅
  - Auto gain control ✅

**Browser Compatibility:**
- Chrome/Edge: WebM/Opus
- Firefox: WebM/Opus
- Safari: MP4 (automatic fallback)
- All mobile browsers: Supported ✅

---

## 🎨 Visual Elements

### Recording Overlay

When recording, you'll see:

1. **Swipe Indicator** (top)
   - "اسحب لأعلى للإلغاء" (Arabic)
   - "Glissez pour annuler" (French)
   - Bouncing up arrow icon
   - Turns red when cancel threshold reached

2. **Mic Button** (center)
   - Red pulsing circle
   - Animated ping effect
   - Scales with voice volume
   - Moves up when swiping

3. **Timer** (below mic)
   - Large monospace font
   - Format: M:SS (e.g., 0:05, 1:23)
   - Updates every second

4. **Volume Bars** (bottom)
   - 20 vertical bars
   - Teal color (#14B8A6)
   - Height reacts to voice volume
   - Smooth transitions

5. **Instructions** (very bottom)
   - "ارفع إصبعك لإرسال التسجيل" (Arabic)
   - "Relâchez pour envoyer" (French)

---

## 🔧 Technical Details

### Permissions

**Microphone Access:**
- Required for voice recording
- Requested on first use
- Browser shows permission dialog
- Can be revoked in browser settings

**Permission States:**
- ✅ **Granted**: Recording works normally
- ⚠️ **Prompt**: Dialog shown on first use
- ❌ **Denied**: Error message with instructions

### Error Handling

**Common Errors & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| "تم رفض إذن الميكروفون" | Permission denied | Enable mic in browser settings |
| "لم يتم العثور على ميكروفون" | No mic detected | Connect microphone device |
| "الميكروفون قيد الاستخدام" | Mic used by another app | Close other apps using mic |
| "لم يتم التعرف على الصوت" | No speech detected | Speak louder or check mic |
| "فشل التعرف على الصوت" | Network/API error | Check connection, retry |

**Error Display:**
- Red toast notification
- Clear error message in Arabic/French
- Dismiss button (X icon)
- Auto-cleanup after dismiss

---

## 🌐 Language Support

### Automatic Detection

Mo7ami automatically detects the language you're speaking:

**Arabic (AR)**
- Modern Standard Arabic (MSA)
- Moroccan Darija dialect
- Whisper API optimized for Arabic

**French (FR)**
- Standard French
- Moroccan French accent supported

**Language Switching:**
- No manual switching needed
- Detection happens during transcription
- Response will match your language

---

## 💡 Tips for Best Results

### Recording Quality

**Do's:**
- ✅ Speak clearly and at normal pace
- ✅ Hold device/mic close to mouth (15-30cm)
- ✅ Record in quiet environment
- ✅ Use headphones to reduce echo
- ✅ Keep recordings under 60 seconds

**Don'ts:**
- ❌ Don't whisper or shout
- ❌ Avoid noisy backgrounds
- ❌ Don't cover microphone
- ❌ Don't record while moving

### Legal Questions

**Effective Voice Queries:**
```
✅ Good: "شنو كايقول القانون الجنائي على السرقة؟"
✅ Good: "Quels sont mes droits en tant que salarié?"

❌ Too vague: "القانون" (just "the law")
❌ Too long: 2+ minute monologues
```

### Editing Transcripts

After transcription:
1. Transcript appears in input field
2. Review for accuracy
3. Edit if needed (voice recognition isn't perfect)
4. Click send when ready

---

## 🔒 Privacy & Security

### Data Handling

**Audio Privacy:**
- Audio recorded in browser only
- Sent directly to OpenAI Whisper API
- Not stored on Mo7ami servers
- Deleted after transcription
- End-to-end encrypted (HTTPS)

**Microphone Access:**
- Only active during recording
- Automatically released after sending
- Permission controlled by browser
- Can be revoked anytime

**Compliance:**
- Morocco Law 09-08 compliant
- No audio retention policy
- Real-time processing only
- GDPR-friendly

---

## 🎯 Use Cases

### Perfect for Voice:

1. **Quick Questions**
   - "واش عندي الحق نطلب الطلاق؟"
   - "Comment créer une entreprise?"

2. **Complex Legal Terms**
   - Easier to speak than type
   - Especially in Darija

3. **Mobile Users**
   - Faster than typing on phone
   - One-handed operation

4. **Accessibility**
   - Users with typing difficulties
   - Visually impaired users (with screen reader)

### Better with Text:

1. **Precise Legal Terms**
   - Specific article numbers
   - Complex legal references

2. **Multiple Questions**
   - List of related questions
   - Detailed follow-ups

3. **Noisy Environments**
   - Office, café, street
   - Better accuracy with typing

---

## 🛠️ Troubleshooting

### Recording Issues

**Problem: Recording doesn't start**
```
Checks:
1. Microphone permission granted?
2. Mic connected and working?
3. Browser supports MediaRecorder? (all modern browsers do)
4. JavaScript enabled?
```

**Problem: Poor transcription accuracy**
```
Solutions:
1. Speak more clearly
2. Reduce background noise
3. Move closer to microphone
4. Check mic volume in system settings
5. Try recording in French if Arabic isn't working well
```

**Problem: Swipe to cancel doesn't work**
```
Solutions:
1. On touch devices: Swipe at least 100px upward
2. On desktop: Use mouse to drag upward
3. Alternative: Wait for auto-timeout (if implemented)
```

### Browser-Specific Issues

**Safari Issues:**
```
- First recording may require mic permission twice
- WebM not supported, automatically uses MP4
- Clear cache if issues persist
```

**Mobile Chrome:**
```
- Ensure browser has mic permission in iOS/Android settings
- Test in Chrome Incognito to rule out extension issues
```

**Firefox:**
```
- Check about:preferences#privacy for mic settings
- May require HTTPS (already enforced)
```

---

## 📊 Performance

### Expected Latency

| Step | Duration |
|------|----------|
| Start recording | <100ms |
| Volume visualization | Real-time |
| Stop recording | <50ms |
| Upload to API | 0.5-2s |
| Whisper transcription | 1-3s |
| Display transcript | <100ms |
| **Total** | **~2-5 seconds** |

**Factors Affecting Speed:**
- Recording length (longer = slower)
- Internet connection speed
- Server load (OpenAI API)
- Audio file size

### Optimization Tips

**Faster Transcription:**
- Keep recordings short (5-15 seconds ideal)
- Strong WiFi/4G connection
- Avoid peak hours

---

## 🔮 Future Enhancements

Coming soon:
- [ ] **Voice-to-Voice Mode**: Get audio responses (TTS)
- [ ] **Real-time Transcription**: See words as you speak
- [ ] **Voice Activity Detection (VAD)**: Auto-stop when silent
- [ ] **Multi-turn Voice Conversations**: Full voice dialogue
- [ ] **Amazigh/Tamazight Support**: Additional language
- [ ] **Offline Mode**: Local transcription (Whisper.cpp)

---

## 📞 Support

### Getting Help

**Voice Issues:**
- Check this guide first
- Test microphone in browser settings
- Try different browser if issues persist
- Report persistent bugs via GitHub

**Legal Questions:**
- Voice and text have same capabilities
- Use whichever is more convenient
- Can always switch mid-conversation

---

## 📝 Quick Reference

### Gestures Cheat Sheet

| Action | Desktop | Touch |
|--------|---------|-------|
| Start Recording | Click & Hold mic | Press & Hold mic |
| Cancel | Drag up 100px | Swipe up 100px |
| Send | Release mouse | Lift finger |
| Retry | Click mic again | Tap mic again |

### Keyboard Shortcuts

Currently none (voice is gesture-based), but text input has:
- `Enter`: Send message
- `Shift + Enter`: New line

---

**Enjoy hands-free legal assistance with Mo7ami!** 🎤⚖️

For technical documentation, see: [VOICE_TECHNICAL.md](./VOICE_TECHNICAL.md)
