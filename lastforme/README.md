# Izinkan Aku Mundur
### A Cinematic Emotional Storytelling Website

> A midnight confession. A final love letter. A quiet goodbye.

---

## 🗂 Folder Structure

```
/
├── index.html          ← single page, all chapters
├── style.css           ← all styles (grain, VHS, typography, layout)
├── script.js           ← GSAP, Lenis, animations, audio logic
└── assets/
    ├── images/         ← add your photos here
    │   ├── opening.jpg
    │   ├── ch1.jpg
    │   ├── mem1.jpg  mem2.jpg  mem3.jpg
    │   ├── ch4.jpg
    │   ├── ch5.jpg
    │   └── ending.jpg
    └── audio/          ← add your audio files here
        ├── rain.mp3
        ├── piano.mp3
        ├── heartbeat.mp3
        └── typing.mp3
```

---

## 🖼 Adding Your Images

Replace the placeholder files in `assets/images/` with your own photos:

| File | Where it appears | Recommended style |
|------|-----------------|-------------------|
| `opening.jpg` | Landing screen (blurred) | Dark, intimate, warm tones |
| `ch1.jpg` | Chapter 1 background | Warm candid, golden hour |
| `mem1–3.jpg` | Floating memories (ch1) | Small candid moments |
| `ch4.jpg` | Empty room (ch4) | Dark room, monitor glow |
| `ch5.jpg` | Photo on table (ch5) | Photo lying on dark surface |
| `ending.jpg` | Final screen | Happiest photo together |

> **Tip:** Keep images under 1 MB each. Use [Squoosh](https://squoosh.app) to compress.

---

## 🔊 Adding Your Audio

Place audio files in `assets/audio/`:

| File | Purpose | Source suggestion |
|------|---------|-------------------|
| `rain.mp3` | Ambient rain loop | freesound.org |
| `piano.mp3` | Emotional piano loop | pixabay.com/music |
| `heartbeat.mp3` | Subtle heartbeat | freesound.org |
| `typing.mp3` | Keyboard click | freesound.org |

> All audio starts **only after** the user clicks "enter" — browser-safe.

---

## 🚀 Deployment

### GitHub Pages
1. Push the entire folder to a GitHub repository
2. Go to **Settings → Pages → Deploy from branch → main → / (root)**
3. Your site goes live at `https://yourusername.github.io/repo-name`

### Netlify
1. Drag and drop the entire folder to [netlify.com/drop](https://netlify.com/drop)
2. Live in seconds. No config needed.

### InfinityFree
1. Log in → File Manager → `htdocs/`
2. Upload all files maintaining the folder structure
3. Access via your InfinityFree subdomain

---

## ✏️ Customizing Text

All text is inside `index.html`. Search for the Indonesian text and replace:

```html
<!-- Example: change opening quote -->
<span class="oq-line" style="--d:0s">Your first line here…</span>
<span class="oq-line" style="--d:1.2s">Your second line here.</span>
```

---

## ⚙️ Tech Stack

- **HTML5** — semantic, accessible
- **CSS3** — custom properties, animations, grain, VHS scanlines
- **Vanilla JS** — modular, commented
- **GSAP 3.12** — ScrollTrigger, cinematic scroll animations
- **Lenis 1.0** — ultra-smooth scroll
- All libraries via **CDN** — zero npm, zero build tools

---

*The ending feels unfinished on purpose.*  
*Like a relationship that quietly stopped existing.*
