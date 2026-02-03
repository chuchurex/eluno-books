/**
 * Build revision.html from chapter files
 * Creates a single-page HTML with all chapters for review
 *
 * Usage: node scripts/build-revision.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const LANG = 'es'; // Default to Spanish

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`Warning: Could not load ${filePath}`);
    return null;
  }
}

function processText(text) {
  // Replace **text** with <strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Replace *text* with <em>
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

function buildRevisionHTML() {
  console.log('📄 Building revision.html...');

  const chaptersDir = path.join(I18N_DIR, LANG, 'chapters');
  const chapterFiles = fs.readdirSync(chaptersDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  let html = `<!DOCTYPE html>
<html lang="${LANG}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dormidos - Revisión Completa</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem;
      background: #fefefe;
      color: #2a2a2a;
    }
    h1 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 0.5rem;
      font-weight: normal;
      letter-spacing: 0.1em;
    }
    .subtitle {
      text-align: center;
      font-style: italic;
      color: #666;
      margin-bottom: 3rem;
    }
    .toc {
      margin: 2rem 0 4rem;
      padding: 1.5rem 2rem;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .toc h2 {
      font-size: 1.1rem;
      margin: 0 0 1rem;
      border: none;
      padding: 0;
    }
    .toc ol {
      margin: 0;
      padding-left: 1.5rem;
    }
    .toc li {
      margin: 0.5rem 0;
    }
    .toc a {
      color: #444;
      text-decoration: none;
    }
    .toc a:hover {
      color: #000;
      text-decoration: underline;
    }
    h2.chapter-title {
      font-size: 1.6rem;
      margin-top: 5rem;
      margin-bottom: 0.5rem;
      font-weight: normal;
      border-bottom: 2px solid #ddd;
      padding-bottom: 0.5rem;
      page-break-before: always;
    }
    h2.chapter-title:first-of-type {
      page-break-before: avoid;
    }
    .chapter-num {
      font-size: 0.85rem;
      color: #888;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.25rem;
    }
    h3.section-title {
      font-size: 1.15rem;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #444;
    }
    p {
      margin-bottom: 1.25rem;
      text-align: justify;
    }
    blockquote {
      margin: 2rem 0;
      padding: 1rem 1.5rem;
      border-left: 3px solid #ccc;
      background: #f9f9f9;
      font-style: italic;
      color: #555;
    }
    blockquote p {
      margin-bottom: 0.5rem;
    }
    blockquote p:last-child {
      margin-bottom: 0;
    }
    strong {
      font-weight: 600;
    }
    .version-info {
      text-align: center;
      color: #999;
      font-size: 0.9rem;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }
    @media print {
      body { padding: 0; max-width: none; }
      .toc { page-break-after: always; }
      h2.chapter-title { page-break-before: always; }
    }
  </style>
</head>
<body>
  <h1>Dormidos</h1>
  <div class="subtitle">Documento de revisión</div>
`;

  // Build Table of Contents (hidden from screen readers for VoiceOver)
  html += `  <nav class="toc" aria-hidden="true">
    <h2>Índice</h2>
    <ol>
`;

  const chapters = [];
  chapterFiles.forEach(file => {
    const chapter = loadJSON(path.join(chaptersDir, file));
    if (chapter) {
      chapters.push(chapter);
      html += `      <li><a href="#ch${chapter.number}">${chapter.title}</a></li>\n`;
    }
  });

  html += `    </ol>
  </nav>
`;

  // Process each chapter
  chapters.forEach(chapter => {
    html += `\n  <h2 class="chapter-title" id="ch${chapter.number}">
    <span class="chapter-num">${chapter.numberText}</span>
    ${chapter.title}
  </h2>\n`;

    // Process sections
    if (chapter.sections) {
      chapter.sections.forEach(section => {
        // Add section title
        if (section.title) {
          html += `\n  <h3 class="section-title">${section.title}</h3>\n`;
        }

        if (section.content) {
          section.content.forEach(block => {
            if (block.type === 'paragraph') {
              html += `  <p>${processText(block.text)}</p>\n`;
            } else if (block.type === 'blockquote') {
              const lines = block.text.split('\n');
              html += `  <blockquote>\n`;
              lines.forEach(line => {
                if (line.trim()) {
                  html += `    <p>${processText(line.trim())}</p>\n`;
                }
              });
              html += `  </blockquote>\n`;
            }
          });
        }
      });
    }
  });

  html += `
  <div class="version-info">
    Documento de revisión — Generado el ${new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} — ${chapters.length} capítulos
  </div>
</body>
</html>`;

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const outputPath = path.join(DIST_DIR, 'revision.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`✅ Created ${outputPath}`);
  console.log(`   ${chapters.length} chapters included`);
}

// Execute
buildRevisionHTML();
