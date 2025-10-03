# Arabic Fonts Setup for Mo7ami

The Mo7ami platform uses the **Tajawal** font family for Arabic text, which provides excellent readability for both Modern Standard Arabic and Moroccan Darija.

## Option 1: Download from Google Fonts (Recommended)

1. **Visit Google Fonts:**
   - Go to: https://fonts.google.com/specimen/Tajawal

2. **Download the font:**
   - Click "Download family" button
   - Extract the ZIP file

3. **Copy fonts to project:**
   ```bash
   mkdir -p public/fonts
   cp path/to/extracted/Tajawal-Regular.ttf public/fonts/
   cp path/to/extracted/Tajawal-Bold.ttf public/fonts/
   ```

## Option 2: Use CDN (Alternative)

If you prefer not to host fonts locally, update `app/layout.tsx`:

```typescript
import { Inter } from "next/font/google";
// Remove local font import, use Google Fonts instead

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

// Add Tajawal from Google Fonts
const tajawal = {
  // Will be loaded via CDN
};
```

Then add to `app/layout.tsx` head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
```

## Option 3: Use System Fonts (Fallback)

Update `tailwind.config.ts` to use system Arabic fonts:

```typescript
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  arabic: ['Tahoma', 'Arial', 'sans-serif'], // System fallback
},
```

## Verify Setup

After adding fonts, test in the browser:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Check if Arabic text displays correctly with proper font

4. Inspect element to verify font is loaded:
   ```
   Computed → font-family: "Tajawal", system-ui, sans-serif
   ```

## Font Files Needed

- `Tajawal-Regular.ttf` (400 weight) - for normal text
- `Tajawal-Bold.ttf` (700 weight) - for headings and emphasis

## Current Configuration

The project is configured to load fonts from:
```
public/fonts/Tajawal-Regular.ttf
public/fonts/Tajawal-Bold.ttf
```

## Alternative Fonts

If Tajawal doesn't suit your needs, consider:

- **Cairo** - Modern, geometric Arabic font
- **Amiri** - Traditional, elegant font
- **Noto Sans Arabic** - Google's pan-language font
- **IBM Plex Sans Arabic** - Professional, clean font

Update in `app/layout.tsx` if you switch fonts.

## Troubleshooting

### Fonts not loading?

1. Check browser console for 404 errors
2. Verify font files are in `public/fonts/`
3. Clear Next.js cache: `rm -rf .next`
4. Restart dev server

### Arabic text not rendering correctly?

1. Ensure `dir="rtl"` is set on elements
2. Check if `font-arabic` class is applied
3. Verify CSS is compiled correctly

### Font looks pixelated?

1. Use `.ttf` or `.woff2` format (not `.ttc`)
2. Enable font smoothing in CSS
3. Try higher weight font file

---

**Quick Start**: Download Tajawal from Google Fonts and place in `public/fonts/`
