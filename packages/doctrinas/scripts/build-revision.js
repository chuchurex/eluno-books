#!/usr/bin/env node

/**
 * Build Script for Doctrinas Revision (Accessibility Optimized)
 *
 * Generates a single-page HTML file containing all chapters.
 * Optimized for VoiceOver/Accessibility:
 * - Semantic HTML
 * - High contrast
 * - Simplified layout
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const BORRADORES_DIR = path.join(PROJECT_ROOT, 'borradores');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const REVISION_OUTPUT = path.join(DIST_DIR, 'revision.html');

// Book metadata
const BOOK = {
  title: 'Nuestras Doctrinas - Revisión Accesible',
  author: 'Carlos Martínez',
  lang: 'es'
};

/**
 * Clean Markdown for simple HTML
 */
function markdownToHtml(markdown) {
  let html = markdown;

  // Escape HTML entities
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');
  html = html.replace(/^\*\*\*+$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

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
    if (!line) { processedLines.push(''); continue; }
    if (line.startsWith('<h') || line.startsWith('<blockquote') ||
      line.startsWith('<ul') || line.startsWith('<li') ||
      line.startsWith('<hr') || line.startsWith('</')) {
      processedLines.push(line);
      continue;
    }
    processedLines.push(`<p>${line}</p>`);
  }

  html = processedLines.join('\n');
  return html;
}

/**
 * Generate clean HTML page
 */
function generatePage(chapters) {
  return `<!DOCTYPE html>
<html lang="${BOOK.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BOOK.title}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #1a1a1a;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #000000;
        --text: #e0e0e0;
      }
    }
    body {
      font-family: Georgia, "Times New Roman", serif;
      line-height: 1.8;
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      background: var(--bg);
      color: var(--text);
      font-size: 1.15rem;
    }
    h1 { font-size: 1.6rem; margin-top: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.3rem; margin-top: 2.5rem; }
    h3 { font-size: 1.1rem; margin-top: 2rem; }
    p { margin-bottom: 1.2em; }
    blockquote { margin: 1.5em 0; padding-left: 1.2em; border-left: 3px solid var(--text); opacity: 0.85; font-style: italic; }
    hr { margin: 3rem 0; border: none; text-align: center; }
    hr::after { content: "· · ·"; letter-spacing: 0.5em; opacity: 0.5; }
  </style>
</head>
<body>

  <main>
    ${chapters.map(ch => ch.content).join('\n<hr>\n')}
  </main>

</body>
</html>`;
}

function build() {
  console.log('Building accessible revision page...');

  // Ensure dist exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Read files
  const files = fs.readdirSync(BORRADORES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const chapters = files.map(file => {
    const match = file.match(/^(\d+)-(.+)\.md$/);
    if (!match) return null;

    const [_, numStr, slug] = match;
    const contentRaw = fs.readFileSync(path.join(BORRADORES_DIR, file), 'utf8');

    // Extract title
    const titleMatch = contentRaw.match(/^#\s+(?:Capítulo\s+\d+:\s*)?(.+)$/m);
    const title = titleMatch ? titleMatch[1] : slug;

    // Convert content
    const content = markdownToHtml(contentRaw);

    return {
      num: parseInt(numStr, 10),
      slug,
      title,
      content
    };
  }).filter(Boolean);

  // Generate HTML
  const html = generatePage(chapters);
  fs.writeFileSync(REVISION_OUTPUT, html);

  console.log(`✅ Default: ${REVISION_OUTPUT}`);
  console.log(`Paper size: ${(fs.statSync(REVISION_OUTPUT).size / 1024).toFixed(2)} KB`);
}

build();
