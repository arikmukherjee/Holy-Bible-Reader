/**
 * ════════════════════════════════════════════════════════════════
 *  HOLY BIBLE READER — script.js
 *  Modular vanilla JS: no frameworks, clean state management
 * ════════════════════════════════════════════════════════════════
 */

/* ─── BIBLE CANON — all 66 books with metadata ────────────────── */
const BIBLE_BOOKS = {
  old: [
    { name: "Genesis",         chapters: 50 },
    { name: "Exodus",          chapters: 40 },
    { name: "Leviticus",       chapters: 27 },
    { name: "Numbers",         chapters: 36 },
    { name: "Deuteronomy",     chapters: 34 },
    { name: "Joshua",          chapters: 24 },
    { name: "Judges",          chapters: 21 },
    { name: "Ruth",            chapters: 4  },
    { name: "1 Samuel",        chapters: 31 },
    { name: "2 Samuel",        chapters: 24 },
    { name: "1 Kings",         chapters: 22 },
    { name: "2 Kings",         chapters: 25 },
    { name: "1 Chronicles",    chapters: 29 },
    { name: "2 Chronicles",    chapters: 36 },
    { name: "Ezra",            chapters: 10 },
    { name: "Nehemiah",        chapters: 13 },
    { name: "Esther",          chapters: 10 },
    { name: "Job",             chapters: 42 },
    { name: "Psalms",          chapters: 150 },
    { name: "Proverbs",        chapters: 31 },
    { name: "Ecclesiastes",    chapters: 12 },
    { name: "Song of Solomon", chapters: 8  },
    { name: "Isaiah",          chapters: 66 },
    { name: "Jeremiah",        chapters: 52 },
    { name: "Lamentations",    chapters: 5  },
    { name: "Ezekiel",         chapters: 48 },
    { name: "Daniel",          chapters: 12 },
    { name: "Hosea",           chapters: 14 },
    { name: "Joel",            chapters: 3  },
    { name: "Amos",            chapters: 9  },
    { name: "Obadiah",         chapters: 1  },
    { name: "Jonah",           chapters: 4  },
    { name: "Micah",           chapters: 7  },
    { name: "Nahum",           chapters: 3  },
    { name: "Habakkuk",        chapters: 3  },
    { name: "Zephaniah",       chapters: 3  },
    { name: "Haggai",          chapters: 2  },
    { name: "Zechariah",       chapters: 14 },
    { name: "Malachi",         chapters: 4  }
  ],
  new: [
    { name: "Matthew",         chapters: 28 },
    { name: "Mark",            chapters: 16 },
    { name: "Luke",            chapters: 24 },
    { name: "John",            chapters: 21 },
    { name: "Acts",            chapters: 28 },
    { name: "Romans",          chapters: 16 },
    { name: "1 Corinthians",   chapters: 16 },
    { name: "2 Corinthians",   chapters: 13 },
    { name: "Galatians",       chapters: 6  },
    { name: "Ephesians",       chapters: 6  },
    { name: "Philippians",     chapters: 4  },
    { name: "Colossians",      chapters: 4  },
    { name: "1 Thessalonians", chapters: 5  },
    { name: "2 Thessalonians", chapters: 3  },
    { name: "1 Timothy",       chapters: 6  },
    { name: "2 Timothy",       chapters: 4  },
    { name: "Titus",           chapters: 3  },
    { name: "Philemon",        chapters: 1  },
    { name: "Hebrews",         chapters: 13 },
    { name: "James",           chapters: 5  },
    { name: "1 Peter",         chapters: 5  },
    { name: "2 Peter",         chapters: 3  },
    { name: "1 John",          chapters: 5  },
    { name: "2 John",          chapters: 1  },
    { name: "3 John",          chapters: 1  },
    { name: "Jude",            chapters: 1  },
    { name: "Revelation",      chapters: 22 }
  ]
};

/* ─── APP STATE ───────────────────────────────────────────────── */
const state = {
  bibleData: null,          // Loaded JSON
  currentBook: null,        // Selected book name
  currentChapter: null,     // Selected chapter number (string key)
  testament: 'old',         // Active testament tab
  bookmarks: [],            // Array of { ref, text }
  readChapters: {},         // { "Genesis-1": true, ... }
  fontSizeStep: 0,          // -2 to +4
  darkMode: false,
  searchQuery: '',
};

/* ─── DOM REFS ────────────────────────────────────────────────── */
const dom = {
  booksNav:          document.getElementById('booksNav'),
  readingArea:       document.getElementById('readingArea'),
  breadcrumb:        document.getElementById('breadcrumb'),
  homeCrumb:         document.getElementById('homeCrumb'),
  searchInput:       document.getElementById('searchInput'),
  searchClear:       document.getElementById('searchClear'),
  themeToggle:       document.getElementById('themeToggle'),
  fontIncrease:      document.getElementById('fontIncrease'),
  fontDecrease:      document.getElementById('fontDecrease'),
  bookmarkToggleBtn: document.getElementById('bookmarkToggleBtn'),
  bookmarkCount:     document.getElementById('bookmarkCount'),
  bookmarksPanel:    document.getElementById('bookmarksPanel'),
  closeBookmarksBtn: document.getElementById('closeBookmarksBtn'),
  bookmarksList:     document.getElementById('bookmarksList'),
  hamburgerBtn:      document.getElementById('hamburgerBtn'),
  sidebar:           document.getElementById('sidebar'),
  sidebarOverlay:    document.getElementById('sidebarOverlay'),
  welcomeStats:      document.getElementById('welcomeStats'),
  toast:             document.getElementById('toast'),
};

/* ─── LOCAL STORAGE HELPERS ───────────────────────────────────── */
const storage = {
  load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

/* ─── INIT ────────────────────────────────────────────────────── */
async function init() {
  // Load persisted preferences
  state.bookmarks   = storage.load('bible_bookmarks', []);
  state.readChapters = storage.load('bible_read', {});
  state.darkMode    = storage.load('bible_dark', false);
  state.fontSizeStep = storage.load('bible_fontsize', 0);

  // Apply persisted theme + font size
  applyTheme();
  applyFontSize();

  // Load Bible data
  try {
    const res = await fetch('data/bible.json');
    state.bibleData = await res.json();
  } catch (e) {
    console.warn('bible.json not found or failed to parse:', e);
    state.bibleData = {};
  }

  // Build UI
  renderBooksList();
  renderWelcomeStats();
  updateBookmarkCount();

  // Event listeners
  attachEvents();
}

/* ─── THEME ───────────────────────────────────────────────────── */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  dom.themeToggle.querySelector('.theme-icon').textContent = state.darkMode ? '☀️' : '🌙';
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  storage.save('bible_dark', state.darkMode);
  applyTheme();
}

/* ─── FONT SIZE ───────────────────────────────────────────────── */
function applyFontSize() {
  // Base 19px ± 2px per step
  const size = 19 + state.fontSizeStep * 2;
  document.documentElement.style.setProperty('--font-size-base', `${size}px`);
}

function changeFontSize(delta) {
  const newStep = state.fontSizeStep + delta;
  if (newStep < -3 || newStep > 4) return;
  state.fontSizeStep = newStep;
  storage.save('bible_fontsize', state.fontSizeStep);
  applyFontSize();
}

/* ─── SIDEBAR BOOKS ───────────────────────────────────────────── */
function renderBooksList() {
  const books = BIBLE_BOOKS[state.testament];
  const globalIndex = state.testament === 'new' ? 39 : 0;

  dom.booksNav.innerHTML = books.map((book, i) => {
    const hasData = state.bibleData && state.bibleData[book.name];
    const isActive = book.name === state.currentBook;
    return `
      <div
        class="book-item ${isActive ? 'active' : ''} ${hasData ? 'has-data' : ''}"
        data-book="${escHtml(book.name)}"
        title="${escHtml(book.name)} (${book.chapters} chapter${book.chapters !== 1 ? 's' : ''})"
      >
        <span class="book-num">${globalIndex + i + 1}</span>
        <span class="book-name">${escHtml(book.name)}</span>
      </div>
    `;
  }).join('');
}

/* ─── WELCOME STATS ───────────────────────────────────────────── */
function renderWelcomeStats() {
  const totalBooks = 66;
  const booksLoaded = Object.keys(state.bibleData || {}).length;
  const readCount = Object.keys(state.readChapters).filter(k => state.readChapters[k]).length;

  dom.welcomeStats.innerHTML = `
    <div class="stat-card">
      <span class="stat-num">${totalBooks}</span>
      <span class="stat-label">Books</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">${booksLoaded}</span>
      <span class="stat-label">Available</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">${readCount}</span>
      <span class="stat-label">Chapters Read</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">${state.bookmarks.length}</span>
      <span class="stat-label">Bookmarks</span>
    </div>
  `;
}

/* ─── BREADCRUMB ──────────────────────────────────────────────── */
function renderBreadcrumb() {
  dom.breadcrumb.innerHTML = '';

  // Home crumb (always)
  const homeEl = document.createElement('span');
  homeEl.className = 'breadcrumb-item home-crumb';
  homeEl.textContent = '☰ Books';
  homeEl.addEventListener('click', () => {
    state.currentBook = null;
    state.currentChapter = null;
    renderBooksList();
    showWelcome();
    updateBreadcrumb();
  });
  dom.breadcrumb.appendChild(homeEl);

  if (state.currentBook) {
    dom.breadcrumb.insertAdjacentHTML('beforeend', '<span class="breadcrumb-sep">›</span>');
    const bookEl = document.createElement('span');
    bookEl.className = `breadcrumb-item ${state.currentChapter ? '' : 'current'}`;
    bookEl.textContent = state.currentBook;
    if (state.currentChapter) {
      bookEl.addEventListener('click', () => {
        state.currentChapter = null;
        showChapters(state.currentBook);
        renderBreadcrumb();
      });
    }
    dom.breadcrumb.appendChild(bookEl);
  }

  if (state.currentChapter) {
    dom.breadcrumb.insertAdjacentHTML('beforeend', '<span class="breadcrumb-sep">›</span>');
    const chEl = document.createElement('span');
    chEl.className = 'breadcrumb-item current';
    chEl.textContent = `Chapter ${state.currentChapter}`;
    dom.breadcrumb.appendChild(chEl);
  }
}

function updateBreadcrumb() { renderBreadcrumb(); }

/* ─── VIEWS ───────────────────────────────────────────────────── */

/** Show the welcome / home screen */
function showWelcome() {
  renderWelcomeStats();
  dom.readingArea.innerHTML = `
    <div class="welcome-screen" id="welcomeScreen">
      <div class="welcome-icon">✦</div>
      <h1 class="welcome-title">Welcome to Holy Bible Reader</h1>
      <p class="welcome-sub">Choose a book from the sidebar to begin reading.<br>The Word of God, beautifully presented.</p>
      <div class="welcome-stats" id="welcomeStats"></div>
    </div>
  `;
  // Re-bind after DOM replace
  document.getElementById('welcomeStats').innerHTML = dom.welcomeStats.innerHTML;
  state.currentBook = null;
  state.currentChapter = null;
  renderBooksList();
  renderBreadcrumb();
}

/** Show chapter grid for a selected book */
function showChapters(bookName) {
  state.currentBook = bookName;
  state.currentChapter = null;

  renderBooksList();  // Re-render to update active highlight
  renderBreadcrumb();

  // Find total chapters from canon
  const allBooks = [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new];
  const bookMeta = allBooks.find(b => b.name === bookName);
  const totalChapters = bookMeta ? bookMeta.chapters : 1;

  const chapterBtns = Array.from({ length: totalChapters }, (_, i) => {
    const chNum = i + 1;
    const key = `${bookName}-${chNum}`;
    const isRead = state.readChapters[key];
    const hasData = state.bibleData?.[bookName]?.[String(chNum)];
    return `
      <button
        class="chapter-btn ${isRead ? 'read' : ''}"
        data-chapter="${chNum}"
        ${!hasData ? 'title="Content not yet loaded"' : ''}
        ${!hasData ? 'style="opacity:0.45"' : ''}
      >${chNum}</button>
    `;
  }).join('');

  dom.readingArea.innerHTML = `
    <div class="chapters-view">
      <div class="view-header">
        <h2 class="view-title">${escHtml(bookName)}</h2>
        <p class="view-subtitle">${totalChapters} Chapter${totalChapters !== 1 ? 's' : ''}</p>
      </div>
      <div class="chapters-grid">${chapterBtns}</div>
    </div>
  `;

  // Chapter button click handlers
  dom.readingArea.querySelectorAll('.chapter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ch = btn.dataset.chapter;
      showVerses(state.currentBook, ch);
    });
  });
}

/** Show verses for a book + chapter */
function showVerses(bookName, chapterNum) {
  state.currentBook = bookName;
  state.currentChapter = String(chapterNum);

  renderBooksList();
  renderBreadcrumb();

  const verses = state.bibleData?.[bookName]?.[String(chapterNum)];

  if (!verses) {
    dom.readingArea.innerHTML = `
      <div class="verses-view">
        <div class="chapter-header">
          <div class="chapter-nav-row">
            ${prevNextButtons(bookName, chapterNum)}
          </div>
          <h2 class="chapter-title">${escHtml(bookName)} — Chapter ${chapterNum}</h2>
        </div>
        <div class="no-results" style="margin-top:40px;">
          <p style="font-size:2rem;margin-bottom:12px;">📜</p>
          <p>This chapter hasn't been added to <code>bible.json</code> yet.</p>
          <p style="margin-top:8px;font-size:0.85rem;color:var(--text-muted);">See the README section on how to expand the Bible data.</p>
        </div>
      </div>
    `;
    attachChapterNavEvents();
    return;
  }

  // Determine progress
  const allBooks = [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new];
  const bookMeta = allBooks.find(b => b.name === bookName);
  const totalChapters = bookMeta ? bookMeta.chapters : 1;
  const readCount = Object.keys(state.readChapters)
    .filter(k => k.startsWith(bookName + '-') && state.readChapters[k]).length;
  const progressPct = Math.round((readCount / totalChapters) * 100);

  const isRead = state.readChapters[`${bookName}-${chapterNum}`];

  // Build verse HTML
  const versesHtml = verses.map((text, i) => {
    const verseRef = `${bookName} ${chapterNum}:${i + 1}`;
    const isBookmarked = state.bookmarks.some(b => b.ref === verseRef);
    const displayText = state.searchQuery
      ? highlightText(escHtml(text), state.searchQuery)
      : escHtml(text);

    return `
      <div class="verse-item" data-verse="${i + 1}">
        <span class="verse-num">${i + 1}</span>
        <span class="verse-text">${displayText}</span>
        <div class="verse-actions">
          <button class="verse-action-btn ${isBookmarked ? 'bookmarked' : ''}"
            data-action="bookmark" data-ref="${escHtml(verseRef)}" data-text="${escHtml(text)}"
            title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
            ${isBookmarked ? '🔖' : '🏷'}
          </button>
          <button class="verse-action-btn"
            data-action="copy" data-ref="${escHtml(verseRef)}" data-text="${escHtml(text)}"
            title="Copy verse">
            📋
          </button>
        </div>
      </div>
    `;
  }).join('');

  dom.readingArea.innerHTML = `
    <div class="verses-view">
      <div class="chapter-header">
        <div class="chapter-nav-row">
          ${prevNextButtons(bookName, chapterNum)}
        </div>
        <h2 class="chapter-title">${escHtml(bookName)} — Chapter ${chapterNum}</h2>
        <div class="progress-bar-wrap" title="${progressPct}% of ${bookName} read">
          <div class="progress-bar-fill" style="width:${progressPct}%"></div>
        </div>
      </div>

      <div class="verses-list">${versesHtml}</div>

      <button class="mark-read-btn ${isRead ? 'is-read' : ''}" id="markReadBtn">
        ${isRead ? '✅ Marked as Read' : '☐ Mark Chapter as Read'}
      </button>
    </div>
  `;

  // Verse action events
  dom.readingArea.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const { action, ref, text } = btn.dataset;
      if (action === 'bookmark') toggleBookmark(ref, text, btn);
      if (action === 'copy')     copyVerse(ref, text);
    });
  });

  // Mark as read
  document.getElementById('markReadBtn').addEventListener('click', () => {
    toggleReadChapter(bookName, chapterNum);
  });

  attachChapterNavEvents();

  // Smooth scroll to top of reading area
  dom.readingArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Prev / Next navigation buttons */
function prevNextButtons(bookName, chapterNum) {
  const allBooks = [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new];
  const bookMeta = allBooks.find(b => b.name === bookName);
  const totalChapters = bookMeta ? bookMeta.chapters : 1;
  const ch = parseInt(chapterNum);

  const prevDisabled = ch <= 1 ? 'disabled' : '';
  const nextDisabled = ch >= totalChapters ? 'disabled' : '';

  return `
    <button class="nav-chapter-btn" id="prevChapterBtn" data-dir="-1" ${prevDisabled}>
      ← Chapter ${ch - 1}
    </button>
    <button class="nav-chapter-btn" id="nextChapterBtn" data-dir="1" ${nextDisabled}>
      Chapter ${ch + 1} →
    </button>
  `;
}

function attachChapterNavEvents() {
  document.getElementById('prevChapterBtn')?.addEventListener('click', () => {
    const ch = parseInt(state.currentChapter) - 1;
    if (ch >= 1) showVerses(state.currentBook, ch);
  });
  document.getElementById('nextChapterBtn')?.addEventListener('click', () => {
    const allBooks = [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new];
    const bookMeta = allBooks.find(b => b.name === state.currentBook);
    const ch = parseInt(state.currentChapter) + 1;
    if (ch <= (bookMeta?.chapters || 1)) showVerses(state.currentBook, ch);
  });
}

/* ─── MARK CHAPTER READ ───────────────────────────────────────── */
function toggleReadChapter(bookName, chapterNum) {
  const key = `${bookName}-${chapterNum}`;
  state.readChapters[key] = !state.readChapters[key];
  storage.save('bible_read', state.readChapters);

  const btn = document.getElementById('markReadBtn');
  if (btn) {
    btn.classList.toggle('is-read', state.readChapters[key]);
    btn.textContent = state.readChapters[key] ? '✅ Marked as Read' : '☐ Mark Chapter as Read';
  }

  showToast(state.readChapters[key] ? 'Chapter marked as read ✓' : 'Chapter unmarked');
}

/* ─── BOOKMARKS ───────────────────────────────────────────────── */
function toggleBookmark(ref, text, btn) {
  const idx = state.bookmarks.findIndex(b => b.ref === ref);
  if (idx > -1) {
    state.bookmarks.splice(idx, 1);
    if (btn) { btn.textContent = '🏷'; btn.classList.remove('bookmarked'); }
    showToast('Bookmark removed');
  } else {
    state.bookmarks.push({ ref, text });
    if (btn) { btn.textContent = '🔖'; btn.classList.add('bookmarked'); }
    showToast('Bookmark saved!');
  }
  storage.save('bible_bookmarks', state.bookmarks);
  updateBookmarkCount();
  renderBookmarksList();
}

function updateBookmarkCount() {
  dom.bookmarkCount.textContent = state.bookmarks.length;
}

function renderBookmarksList() {
  if (!state.bookmarks.length) {
    dom.bookmarksList.innerHTML = `
      <div class="no-bookmarks">
        No bookmarks yet.<br>
        Hover a verse and click 🏷 to save it here.
      </div>
    `;
    return;
  }

  dom.bookmarksList.innerHTML = state.bookmarks.map((bm, i) => `
    <div class="bookmark-entry" data-idx="${i}" title="Jump to ${escHtml(bm.ref)}">
      <div class="bookmark-ref">${escHtml(bm.ref)}</div>
      <div class="bookmark-text">${escHtml(bm.text)}</div>
      <button class="bookmark-delete" data-idx="${i}" title="Remove">✕</button>
    </div>
  `).join('');

  // Navigate to bookmark on click
  dom.bookmarksList.querySelectorAll('.bookmark-entry').forEach(entry => {
    entry.addEventListener('click', e => {
      if (e.target.classList.contains('bookmark-delete')) return;
      const bm = state.bookmarks[entry.dataset.idx];
      if (!bm) return;
      // Parse "Genesis 1:3" → book, chapter
      const parts = bm.ref.match(/^(.+?) (\d+):(\d+)$/);
      if (!parts) return;
      const [, book, ch] = parts;

      // Ensure correct testament tab is active
      const isOT = BIBLE_BOOKS.old.some(b => b.name === book);
      state.testament = isOT ? 'old' : 'new';
      dom.sidebar.querySelectorAll('.tab-btn').forEach(tb => {
        tb.classList.toggle('active', tb.dataset.testament === state.testament);
      });
      renderBooksList();

      showVerses(book, ch);
      closeBookmarksPanel();
      closeSidebar();
    });
  });

  // Delete bookmark
  dom.bookmarksList.querySelectorAll('.bookmark-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      state.bookmarks.splice(idx, 1);
      storage.save('bible_bookmarks', state.bookmarks);
      updateBookmarkCount();
      renderBookmarksList();
      showToast('Bookmark removed');
    });
  });
}

/* ─── COPY VERSE ─────────────────────────────────────────────── */
function copyVerse(ref, text) {
  const copyText = `"${text}" — ${ref}`;
  navigator.clipboard.writeText(copyText).then(() => {
    showToast('Verse copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = copyText;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Verse copied!');
  });
}

/* ─── SEARCH ──────────────────────────────────────────────────── */
let searchDebounceTimer = null;

function handleSearch(query) {
  state.searchQuery = query.trim();
  dom.searchClear.classList.toggle('visible', state.searchQuery.length > 0);

  if (!state.searchQuery) {
    // If we were showing search results, go back to welcome or current chapter
    if (state.currentBook && state.currentChapter) {
      showVerses(state.currentBook, state.currentChapter);
    } else if (state.currentBook) {
      showChapters(state.currentBook);
    } else {
      showWelcome();
    }
    return;
  }

  if (state.searchQuery.length < 2) return;

  // Debounce
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => performSearch(state.searchQuery), 280);
}

function performSearch(query) {
  if (!state.bibleData) return;

  const results = [];
  const lq = query.toLowerCase();

  // Search all loaded verses
  for (const [book, chapters] of Object.entries(state.bibleData)) {
    for (const [chNum, verses] of Object.entries(chapters)) {
      for (let i = 0; i < verses.length; i++) {
        if (verses[i].toLowerCase().includes(lq)) {
          results.push({
            book, chapter: chNum, verse: i + 1,
            text: verses[i],
            ref: `${book} ${chNum}:${i + 1}`
          });
        }
      }
    }
  }

  renderSearchResults(query, results);
}

function renderSearchResults(query, results) {
  state.currentBook = null;
  state.currentChapter = null;
  renderBooksList();

  // Update breadcrumb manually
  dom.breadcrumb.innerHTML = `
    <span class="breadcrumb-item home-crumb" id="homeCrumb">☰ Books</span>
    <span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-item current">Search: "${escHtml(query)}"</span>
  `;
  document.getElementById('homeCrumb').addEventListener('click', () => showWelcome());

  const resultsHtml = results.length
    ? results.map(r => `
        <div class="search-result-item"
          data-book="${escHtml(r.book)}"
          data-chapter="${r.chapter}"
          title="Open ${escHtml(r.ref)}">
          <div class="result-ref">${escHtml(r.ref)}</div>
          <div class="result-text">${highlightText(escHtml(r.text), query)}</div>
        </div>
      `).join('')
    : `<div class="no-results">
        <p style="font-size:2rem;margin-bottom:12px;">🔍</p>
        <p>No verses found for "<strong>${escHtml(query)}</strong>".</p>
        <p style="margin-top:6px;font-size:0.85rem;color:var(--text-muted);">Only loaded chapters are searched.</p>
       </div>`;

  dom.readingArea.innerHTML = `
    <div class="search-results-view">
      <div class="search-results-header">
        <h2>Search Results</h2>
        <p class="results-count">${results.length} verse${results.length !== 1 ? 's' : ''} found for "${escHtml(query)}"</p>
      </div>
      ${resultsHtml}
    </div>
  `;

  // Navigate on result click
  dom.readingArea.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      showVerses(item.dataset.book, item.dataset.chapter);
    });
  });
}

function highlightText(html, query) {
  if (!query) return html;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(${escaped})`, 'gi'),
    '<mark class="highlight">$1</mark>');
}

/* ─── SIDEBAR MOBILE ──────────────────────────────────────────── */
function openSidebar() {
  dom.sidebar.classList.add('open');
  dom.sidebarOverlay.classList.add('open');
}

function closeSidebar() {
  dom.sidebar.classList.remove('open');
  dom.sidebarOverlay.classList.remove('open');
}

/* ─── BOOKMARKS PANEL ─────────────────────────────────────────── */
function openBookmarksPanel() {
  renderBookmarksList();
  dom.bookmarksPanel.classList.add('open');
}

function closeBookmarksPanel() {
  dom.bookmarksPanel.classList.remove('open');
}

/* ─── TOAST ───────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2400);
}

/* ─── UTILITY ─────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ─── EVENT BINDINGS ──────────────────────────────────────────── */
function attachEvents() {
  // Testament tabs
  dom.sidebar.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      dom.sidebar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.testament = btn.dataset.testament;
      renderBooksList();
    });
  });

  // Book item click (delegate on booksNav)
  dom.booksNav.addEventListener('click', e => {
    const item = e.target.closest('.book-item');
    if (!item) return;
    showChapters(item.dataset.book);
    closeSidebar();
  });

  // Search
  dom.searchInput.addEventListener('input', e => handleSearch(e.target.value));
  dom.searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dom.searchInput.value = '';
      handleSearch('');
      dom.searchInput.blur();
    }
  });
  dom.searchClear.addEventListener('click', () => {
    dom.searchInput.value = '';
    handleSearch('');
    dom.searchInput.focus();
  });

  // Theme toggle
  dom.themeToggle.addEventListener('click', toggleTheme);

  // Font size
  dom.fontIncrease.addEventListener('click', () => changeFontSize(1));
  dom.fontDecrease.addEventListener('click', () => changeFontSize(-1));

  // Bookmarks panel
  dom.bookmarkToggleBtn.addEventListener('click', () => {
    if (dom.bookmarksPanel.classList.contains('open')) {
      closeBookmarksPanel();
    } else {
      openBookmarksPanel();
    }
  });
  dom.closeBookmarksBtn.addEventListener('click', closeBookmarksPanel);

  // Hamburger (mobile sidebar)
  dom.hamburgerBtn.addEventListener('click', () => {
    if (dom.sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Sidebar overlay closes sidebar
  dom.sidebarOverlay.addEventListener('click', closeSidebar);

  // Home crumb
  dom.homeCrumb.addEventListener('click', showWelcome);
}

/* ─── BOOT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
