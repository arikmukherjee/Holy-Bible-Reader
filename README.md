# 📖 Holy Bible Reader

A clean, responsive Bible reading web app — no frameworks, no dependencies beyond Google Fonts.

## 🗂 Folder Structure

```
Holy-Bible-Reader/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── data/
    └── bible.json      ← Bible text lives here
```

## 🚀 Running the App

**Option 1 — VS Code Live Server**
Right-click `index.html` → Open with Live Server.

**Option 2 — Python HTTP server**
```bash
cd bible-app
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 3 — Node.js**
```bash
npx serve bible-app
```

> ⚠️ Must be served over HTTP (not opened as a `file://` URL) because the app
> fetches `bible.json` via `fetch()`.

---

## 📊 Expanding bible.json — Full Bible

The included `bible.json` has: **Genesis 1–3, Psalms 23, John 1, John 3, Revelation 1**.

### Data format

```json
{
  "Genesis": {
    "1": [
      "In the beginning God created the heaven and the earth.",
      "And the earth was without form..."
    ],
    "2": [ "verse 1", "verse 2", "..." ]
  },
  "Matthew": {
    "1": [ "The book of the generation of Jesus Christ...", "..." ]
  }
}
```

- **Top-level key** = Book name (must match `BIBLE_BOOKS` array in `script.js`)
- **Second-level key** = Chapter number as a **string** (`"1"`, `"2"`, …)
- **Value** = Array of verse strings (0-indexed, verse 1 = index 0)

### Free KJV sources

| Source | Notes |
|--------|-------|
| [Getbible.net API](https://getbible.net/api) | JSON API, KJV available |
| [Bible-api.com](https://bible-api.com) | Simple REST API |
| [eBible.org](https://ebible.org/find/show.php?id=kjv) | Downloadable text |
| [openbible.info](https://www.openbible.info/labs/kjv-text/) | Plain text |

### Bulk import script (Node.js example)

```js
// fetch-bible.mjs — run once to build bible.json
const BASE = 'https://bible-api.com';
const books = ['Genesis','Exodus','Matthew','Mark']; // extend as needed
const out = {};

for (const book of books) {
  out[book] = {};
  // Fetch chapter count from your metadata source
  for (let ch = 1; ch <= 3; ch++) {
    const r = await fetch(`${BASE}/${book}+${ch}`);
    const d = await r.json();
    out[book][String(ch)] = d.verses.map(v => v.text.trim());
  }
}

import { writeFileSync } from 'fs';
writeFileSync('data/bible.json', JSON.stringify(out));
```

---

## ✨ Features

| Feature | How it works |
|---------|-------------|
| 📚 66 Books | All listed in sidebar; grayed out if not yet in JSON |
| 🔍 Search | Searches all loaded chapters; highlights matches |
| 🌙 Dark Mode | Persisted in localStorage |
| 🔖 Bookmarks | Per-verse, stored in localStorage |
| 📊 Progress | Mark chapters read; progress bar per book |
| 📋 Copy | Copies verse + reference to clipboard |
| 🔤 Font size | ±2px per click, persisted |
| 📱 Responsive | Collapsible sidebar, mobile-friendly |

---

## 🎨 Customisation

**Change fonts** — edit CSS variables in `styles.css`:
```css
--font-reading: 'EB Garamond', Georgia, serif;
--font-display: 'Cinzel', serif;
```

**Change accent colour:**
```css
--accent: #8b5e2f;   /* warm brown — change to any hex */
```

**Change base font size:**
```css
--font-size-base: 19px;
```
