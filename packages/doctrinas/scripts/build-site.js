#!/usr/bin/env node

/**
 * Doctrinas Site Builder
 *
 * Generates the complete doctrinas.eluno.org site with audiobook integration.
 *
 * Usage:
 *   node scripts/build-site.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });

const DOMAIN = process.env.DOMAIN || 'doctrinas.eluno.org';
const STATIC_DOMAIN = process.env.STATIC_SUBDOMAIN || 'static.eluno.org';
const BORRADORES_DIR = path.join(PROJECT_ROOT, 'borradores');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'audiobook', 'manifest.json');

/**
 * Simple Markdown to HTML converter
 */
function markdownToHtml(markdown) {
  let html = markdown;

  // Escape HTML entities
  html = html.replace(/&/g, '&amp;');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="divider">');
  html = html.replace(/^\*\*\*+$/gm, '<hr class="divider">');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Bold and italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs
  const lines = html.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      processedLines.push('');
      continue;
    }

    if (line.startsWith('<h') ||
        line.startsWith('<blockquote') ||
        line.startsWith('<ul') ||
        line.startsWith('<li') ||
        line.startsWith('<hr') ||
        line.startsWith('</')) {
      processedLines.push(line);
      continue;
    }

    processedLines.push(`<p>${line}</p>`);
  }

  html = processedLines.join('\n');
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

/**
 * Generate HTML page
 */
function generateHtml(chapters) {
  const version = Date.now();

  let chaptersHtml = '';

  chapters.forEach((chapter) => {
    const audioUrl = `https://${STATIC_DOMAIN}/doctrinas/audiobook/audio/es/${chapter.audioFile}`;

    chaptersHtml += `
    <section class="chapter" id="${chapter.slug}">
      <div class="chapter-header">
        <h2 class="chapter-title">${chapter.title}</h2>
        <div class="audio-player">
          <audio controls preload="metadata">
            <source src="${audioUrl}" type="audio/mpeg">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      </div>
      <div class="chapter-content">
        ${chapter.content}
      </div>
    </section>
    ${chapter.isEpilogue ? '' : '<hr class="chapter-divider">'}`;
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doctrinas - Audiolibro Beta | ${DOMAIN}</title>
  <meta name="description" content="Audiolibro beta de Doctrinas - Una exploración de las doctrinas fundamentales de la fe cristiana.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/fonts.css">
  <link rel="stylesheet" href="/css/main.css?v=${version}">
  <style>
    body {
      font-family: Georgia, serif;
      font-size: 1.1rem;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #fff;
      color: #222;
    }

    .site-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #ddd;
    }

    .site-title {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .site-subtitle {
      font-size: 1.1rem;
      color: #666;
      font-weight: normal;
    }

    .chapter {
      margin-bottom: 4rem;
    }

    .chapter-header {
      margin-bottom: 2rem;
    }

    .chapter-title {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }

    .audio-player {
      margin: 1.5rem 0;
    }

    .audio-player audio {
      width: 100%;
      max-width: 600px;
    }

    .chapter-content h2 {
      font-size: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .chapter-content h3 {
      font-size: 1.3rem;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #444;
    }

    .chapter-content p {
      margin: 1rem 0;
      text-align: justify;
    }

    .chapter-content blockquote {
      margin: 1.5rem 0;
      padding-left: 1.5rem;
      border-left: 3px solid #ccc;
      font-style: italic;
      color: #555;
    }

    .chapter-content ul {
      margin: 1rem 0;
      padding-left: 2rem;
    }

    .chapter-content li {
      margin: 0.5rem 0;
    }

    .divider {
      border: none;
      text-align: center;
      margin: 2rem 0;
      color: #999;
    }

    .divider::before {
      content: "· · ·";
      letter-spacing: 0.5em;
    }

    .chapter-divider {
      border: none;
      border-top: 2px dashed #ddd;
      margin: 4rem 0;
    }

    .footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 2px solid #ddd;
      color: #666;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      body {
        font-size: 1rem;
        padding: 1rem;
      }

      .site-title {
        font-size: 2rem;
      }

      .chapter-title {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <h1 class="site-title">Doctrinas</h1>
    <p class="site-subtitle">Audiolibro Beta - Versión de Revisión</p>
  </header>

  <main>
    ${chaptersHtml}
  </main>

  <footer class="footer">
    <p>© 2025 eluno.org | Versión Beta - Solo para Revisión</p>
  </footer>
</body>
</html>`;
}

/**
 * Main build function
 */
function build() {
  console.log('\n📖 Building Doctrinas Site with Audiobook...\n');

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Load manifest
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Error: manifest.json not found');
    console.error('   Run: node scripts/build-audiobook.js first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`📋 Loaded manifest: ${manifest.chapters.length} chapters\n`);

  // Process each chapter
  const chapters = manifest.chapters.map(chapter => {
    const filename = `${String(chapter.num).padStart(2, '0')}-${chapter.slug}.md`;
    const filepath = path.join(BORRADORES_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.error(`❌ Error: ${filename} not found`);
      return null;
    }

    const markdown = fs.readFileSync(filepath, 'utf8');

    // Remove the title from content (it's in the header)
    const contentMarkdown = markdown.replace(/^#\s+.+$/m, '').trim();
    const content = markdownToHtml(contentMarkdown);

    console.log(`   ✅ ${filename}`);

    return {
      ...chapter,
      content
    };
  }).filter(Boolean);

  // Generate HTML
  const html = generateHtml(chapters);
  const outputPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`\n📄 Generated: ${outputPath}`);

  // Copy fonts and CSS
  const CORE_ROOT = path.join(__dirname, '..', '..', 'core');

  const fontsSrc = path.join(CORE_ROOT, 'fonts');
  const fontsDest = path.join(DIST_DIR, 'fonts');
  if (fs.existsSync(fontsSrc)) {
    if (!fs.existsSync(fontsDest)) {
      fs.mkdirSync(fontsDest, { recursive: true });
    }
    const fontFiles = fs.readdirSync(fontsSrc).filter(f => f.endsWith('.woff2') || f.endsWith('.css'));
    fontFiles.forEach(file => {
      fs.copyFileSync(path.join(fontsSrc, file), path.join(fontsDest, file));
    });
    console.log(`🔤 Copied ${fontFiles.length} font files`);
  }

  // Copy CSS
  const cssSrc = path.join(DIST_DIR, 'css', 'main.css');
  if (fs.existsSync(cssSrc)) {
    console.log(`📋 CSS already exists: ${cssSrc}`);
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

  console.log(`\n✨ Site build complete!`);
  console.log(`🌐 Ready to deploy to: https://${DOMAIN}\n`);
}

// Run
build();
