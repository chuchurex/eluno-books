#!/usr/bin/env node

/**
 * Build Script for Doctrinas
 *
 * Generates a navigable book site from markdown files.
 * Similar structure to eluno.org with individual chapter pages.
 *
 * Output structure:
 *   dist/
 *   ├── index.html          (TOC/Home)
 *   ├── ch1/index.html      (Chapter 1)
 *   ├── ch2/index.html      (Chapter 2)
 *   ├── ...
 *   ├── epilogo/index.html  (Epilogue)
 *   ├── css/main.css
 *   └── fonts/
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const CORE_ROOT = path.join(__dirname, '..', '..', 'core');
const MONOREPO_ROOT = path.join(__dirname, '..', '..', '..');

require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });
require('dotenv').config({ path: path.join(MONOREPO_ROOT, '.env') });

// Configuration
const DOMAIN = process.env.DOMAIN || 'doctrinas.eluno.org';
const STATIC_DOMAIN = process.env.STATIC_SUBDOMAIN || 'static.eluno.org';
const SITE_URL = `https://${DOMAIN}`;
const STATIC_BASE_URL = `https://${STATIC_DOMAIN}/doctrinas`;

const I18N_DIR = path.join(PROJECT_ROOT, 'i18n', 'es');
const CHAPTERS_DIR = path.join(I18N_DIR, 'chapters');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Book metadata
const BOOK = {
  title: 'Nuestras Doctrinas',
  subtitle: 'Una exploración de las doctrinas fundamentales de la fe cristiana',
  author: 'Carlos Martínez',
  description: 'Una exploración de las tensiones y misterios en las doctrinas fundamentales de la fe cristiana.',
  lang: 'es'
};

// Chapter number words in Spanish
const NUMBER_WORDS = {
  1: 'Uno', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco',
  6: 'Seis', 7: 'Siete', 8: 'Ocho', 9: 'Nueve', 10: 'Diez',
  11: 'Once', 12: 'Doce', 13: 'Trece', 14: 'Catorce', 15: 'Quince', 16: 'Dieciséis'
};

/**
 * Convert i18n chapter JSON sections to HTML
 */
function chapterToHtml(chapter) {
  const parts = [];

  for (let i = 0; i < chapter.sections.length; i++) {
    const section = chapter.sections[i];

    if (i > 0) {
      parts.push('<div class="divider">· · ·</div>');
    }

    for (const block of section.content) {
      const text = formatInlineMarkdown(block.text);

      switch (block.type) {
        case 'quote':
          parts.push(`<blockquote>${text}</blockquote>`);
          break;
        case 'heading':
          parts.push(`<h2>${text}</h2>`);
          break;
        case 'paragraph':
        default:
          parts.push(`<p>${text}</p>`);
          break;
      }
    }
  }

  return parts.join('\n');
}

/**
 * Process inline markdown (bold, italic) in text
 */
function formatInlineMarkdown(text) {
  let html = text;
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

/**
 * Generate chapter page HTML
 */
function generateChapterPage(chapter, allChapters, version) {
  const audioUrl = chapter.audioFile ? `${STATIC_BASE_URL}${chapter.audioFile}` : '';
  const chapterNum = chapter.isEpilogue ? 'Epílogo' : `Capítulo ${NUMBER_WORDS[chapter.num] || chapter.num}`;
  const chapterTitle = chapter.cleanTitle;

  // Navigation
  const currentIndex = allChapters.findIndex(c => c.slug === chapter.slug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const prevLink = prevChapter
    ? `<a href="/${prevChapter.slug}/" class="chapter-nav-link prev">
        <span class="chapter-nav-label">← Anterior</span>
        <span class="chapter-nav-title">${prevChapter.cleanTitle}</span>
       </a>`
    : `<a href="/" class="chapter-nav-link prev">
        <span class="chapter-nav-label">← Índice</span>
        <span class="chapter-nav-title">Tabla de Contenidos</span>
       </a>`;

  const nextLink = nextChapter
    ? `<a href="/${nextChapter.slug}/" class="chapter-nav-link next">
        <span class="chapter-nav-label">Siguiente →</span>
        <span class="chapter-nav-title">${nextChapter.cleanTitle}</span>
       </a>`
    : `<a href="/" class="chapter-nav-link next">
        <span class="chapter-nav-label">Índice →</span>
        <span class="chapter-nav-title">Tabla de Contenidos</span>
       </a>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${chapterNum}: ${chapterTitle} | ${BOOK.title}</title>
  <meta name="description" content="${BOOK.description}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${SITE_URL}/${chapter.slug}/">
  <meta property="og:type" content="book">
  <meta property="og:url" content="${SITE_URL}/${chapter.slug}/">
  <meta property="og:title" content="${chapterNum}: ${chapterTitle}">
  <meta property="og:description" content="${BOOK.description}">
  <meta property="og:locale" content="es_ES">
  <meta name="theme-color" content="#0d0d0f">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✝</text></svg>">
  <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/fonts.css">
  <link rel="stylesheet" href="/css/main.css?v=${version}">
  <style>
    /* Sidebar styles */
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: var(--bg2, #121212);
      border-right: 1px solid var(--border, #2a2520);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1000;
      overflow-y: auto;
      padding: 1rem;
    }
    .sidebar.open { transform: translateX(0); }
    .sidebar-header { padding: 1rem 0 1.5rem; border-bottom: 1px solid var(--border, #2a2520); margin-bottom: 1rem; }
    .sidebar-title { color: var(--gold, #d4af37); font-size: 1.2rem; text-decoration: none; font-weight: 600; }
    .sidebar-chapters { display: flex; flex-direction: column; gap: 0.25rem; }
    .sidebar-chapter { display: flex; gap: 0.75rem; padding: 0.6rem 0.5rem; text-decoration: none; color: var(--text2, #B0B0B0); border-radius: 4px; transition: background 0.2s; }
    .sidebar-chapter:hover { background: var(--bg3, #1E1E1E); color: var(--text, #E0E0E0); }
    .sidebar-chapter.active { background: var(--bg3, #1E1E1E); color: var(--gold, #d4af37); }
    .sidebar-chapter-num { min-width: 1.5rem; color: var(--gold-dim, #8b7355); font-weight: 600; }
    .sidebar-chapter-title { flex: 1; }
    .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); opacity: 0; visibility: hidden; transition: opacity 0.3s; z-index: 999; }
    .overlay.open { opacity: 1; visibility: visible; }
    .layout { min-height: 100vh; }
    .main { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
    @media (min-width: 1024px) {
      .sidebar { transform: translateX(0); }
      .nav-toggle { display: none; }
      .overlay { display: none; }
      .main { margin-left: 280px; max-width: 900px; }
    }
  </style>
</head>
<body>
  <button class="toggle nav-toggle" onclick="toggleNav()">☰ Índice</button>
  <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="Cambiar tema">☀</button>
  <div class="overlay" id="overlay" onclick="closeAll()"></div>

  <div class="layout">
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <a href="/" class="sidebar-title">${BOOK.title}</a>
      </div>
      <div class="sidebar-chapters">
        ${allChapters.map(ch => `
        <a href="/${ch.slug}/" class="sidebar-chapter ${ch.slug === chapter.slug ? 'active' : ''}">
          <span class="sidebar-chapter-num">${ch.isEpilogue ? '' : ch.num}</span>
          <span class="sidebar-chapter-title">${ch.cleanTitle}</span>
        </a>`).join('')}
      </div>
    </nav>

    <main class="main">
      <article class="chapter" id="${chapter.slug}">
        <header class="ch-head">
          <div class="ch-head-top">
            <div class="ch-num">${chapterNum}</div>
            ${audioUrl ? `<div class="ch-media-bar">
              <div class="ch-media-audio-panel" id="audio-panel-1">
                <audio src="${audioUrl}" controls preload="none"></audio>
              </div>
              <button class="ch-media-icon" onclick="toggleAudio('1')" title="Escuchar audiolibro" data-audio-btn="1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                <span class="ch-media-label">MP3</span>
              </button>
            </div>` : ''}
          </div>
          <h1 class="ch-title">${chapterTitle}</h1>
        </header>

        <div class="chapter-content">
          ${chapter.content}
        </div>
      </article>

      <nav class="chapter-nav" aria-label="Navegación de capítulos">
        ${prevLink}
        ${nextLink}
      </nav>
    </main>
  </div>

  <script>
    function toggleNav() {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('overlay').classList.toggle('open');
    }
    function closeAll() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('open');
    }
    function toggleTheme() {
      document.body.classList.toggle('light-theme');
      const btn = document.querySelector('.theme-toggle');
      btn.textContent = document.body.classList.contains('light-theme') ? '☾' : '☀';
      localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    }
    function toggleAudio(id) {
      const panel = document.getElementById('audio-panel-' + id);
      panel.classList.toggle('open');
    }
    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-theme');
      document.querySelector('.theme-toggle').textContent = '☾';
    }
  </script>
</body>
</html>`;
}

/**
 * Generate TOC/Home page HTML
 */
function generateHomePage(chapters, version) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BOOK.title} | ${DOMAIN}</title>
  <meta name="description" content="${BOOK.description}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${SITE_URL}/">
  <meta property="og:type" content="book">
  <meta property="og:url" content="${SITE_URL}/">
  <meta property="og:title" content="${BOOK.title}">
  <meta property="og:description" content="${BOOK.description}">
  <meta property="og:locale" content="es_ES">
  <meta name="theme-color" content="#0d0d0f">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✝</text></svg>">
  <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/fonts.css">
  <link rel="stylesheet" href="/css/main.css?v=${version}">
</head>
<body>
  <button class="toggle nav-toggle" onclick="toggleNav()">☰ Índice</button>
  <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="Cambiar tema">☀</button>
  <div class="overlay" id="overlay" onclick="closeAll()"></div>

  <div class="layout">
    <main class="main">
      <header class="toc-header">
        <h1 class="toc-title">${BOOK.title}</h1>
        <p class="toc-subtitle">${BOOK.subtitle}</p>
      </header>

      <section class="introduction">
        <p class="intro-text">${BOOK.description}</p>
      </section>

      <section class="toc-section">
        <div class="toc-chapters">
          ${chapters.map(ch => `
          <a href="/${ch.slug}/" class="toc-chapter">
            <span class="toc-chapter-num">${ch.isEpilogue ? '' : `Capítulo ${NUMBER_WORDS[ch.num] || ch.num}`}</span>
            <span class="toc-chapter-title">${ch.cleanTitle}</span>
            <span class="toc-chapter-arrow">→</span>
          </a>`).join('')}
        </div>
      </section>

      <footer class="site-footer">
        <p>© 2025 eluno.org | Versión Beta</p>
      </footer>
    </main>
  </div>

  <script>
    function toggleNav() {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('overlay').classList.toggle('open');
    }
    function closeAll() {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('overlay').classList.remove('open');
    }
    function toggleTheme() {
      document.body.classList.toggle('light-theme');
      const btn = document.querySelector('.theme-toggle');
      btn.textContent = document.body.classList.contains('light-theme') ? '☾' : '☀';
      localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    }
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-theme');
      document.querySelector('.theme-toggle').textContent = '☾';
    }
  </script>
</body>
</html>`;
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Main build function
 */
function build() {
  console.log(`\n📖 Building ${BOOK.title}...\n`);

  const version = Date.now();

  // Ensure dist directory
  ensureDir(DIST_DIR);

  // Load media.json for audio links
  const mediaPath = path.join(I18N_DIR, 'media.json');
  const media = fs.existsSync(mediaPath) ? JSON.parse(fs.readFileSync(mediaPath, 'utf8')) : {};

  // Load chapter JSONs
  const chapterFiles = fs.readdirSync(CHAPTERS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  console.log(`📋 Found ${chapterFiles.length} chapter files\n`);

  // Process chapters
  const chapters = chapterFiles.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(CHAPTERS_DIR, file), 'utf8'));
    const num = data.number;
    const isEpilogue = num === 15;

    const slug = data.slug;

    // Get audio file from media.json
    const chapterMedia = media[String(num)] || {};
    const audioFile = chapterMedia.audio || '';

    // Convert content
    const content = chapterToHtml(data);

    return {
      num,
      slug,
      title: data.title,
      cleanTitle: data.title,
      isEpilogue,
      audioFile,
      content
    };
  });

  // Generate chapter pages
  console.log('📄 Generating chapter pages...');
  chapters.forEach(chapter => {
    const chapterDir = path.join(DIST_DIR, chapter.slug);
    ensureDir(chapterDir);

    const html = generateChapterPage(chapter, chapters, version);
    fs.writeFileSync(path.join(chapterDir, 'index.html'), html);
    console.log(`   ✅ /${chapter.slug}/`);
  });

  // Generate home page
  console.log('\n📄 Generating home page...');
  const homeHtml = generateHomePage(chapters, version);
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml);
  console.log('   ✅ /');

  // Copy fonts
  const fontsSrc = path.join(CORE_ROOT, 'fonts');
  const fontsDest = path.join(DIST_DIR, 'fonts');
  if (fs.existsSync(fontsSrc)) {
    ensureDir(fontsDest);
    const fontFiles = fs.readdirSync(fontsSrc).filter(f => f.endsWith('.woff2') || f.endsWith('.css'));
    fontFiles.forEach(file => {
      fs.copyFileSync(path.join(fontsSrc, file), path.join(fontsDest, file));
    });
    console.log(`\n🔤 Copied ${fontFiles.length} font files`);
  }

  // Copy _headers
  const headersTemplate = path.join(CORE_ROOT, '_headers.template');
  const headersDest = path.join(DIST_DIR, '_headers');
  if (fs.existsSync(headersTemplate)) {
    let headersContent = fs.readFileSync(headersTemplate, 'utf8');
    headersContent = headersContent.replace(/\{\{DOMAIN\}\}/g, DOMAIN);
    fs.writeFileSync(headersDest, headersContent);
    console.log(`📋 Generated _headers`);
  }

  console.log(`\n✨ Build complete!`);
  console.log(`📂 Output: ${DIST_DIR}`);
  console.log(`🌐 Ready to deploy to: ${SITE_URL}\n`);
}

// Run
build();
