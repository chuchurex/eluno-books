/**
 * Build Preview Script for Doctrinas
 *
 * Generates a single HTML page with all markdown drafts
 * for review purposes before converting to final JSON format.
 *
 * Usage: node scripts/build-preview.js
 *
 * Input: borradores/*.md
 * Output: dist/index.html (single page with all chapters)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const CORE_ROOT = path.join(__dirname, '..', '..', 'core');

require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });

const DOMAIN = process.env.DOMAIN || 'doctrinas.eluno.org';
const BORRADORES_DIR = path.join(PROJECT_ROOT, 'borradores');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

/**
 * Simple Markdown to HTML converter
 * Supports: headings, paragraphs, bold, italic, blockquotes, lists, hr
 */
function markdownToHtml(markdown) {
  let html = markdown;

  // Escape HTML entities first (but not our markdown)
  html = html.replace(/&/g, '&amp;');

  // Headings (must be at start of line)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="section-divider">');
  html = html.replace(/^\*\*\*+$/gm, '<hr class="section-divider">');

  // Blockquotes (lines starting with >)
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Bold and italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs: wrap non-empty lines that aren't already wrapped
  const lines = html.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      processedLines.push('');
      continue;
    }

    // Skip lines that are already HTML elements
    if (line.startsWith('<h') ||
        line.startsWith('<blockquote') ||
        line.startsWith('<ul') ||
        line.startsWith('<li') ||
        line.startsWith('<hr') ||
        line.startsWith('</')) {
      processedLines.push(line);
      continue;
    }

    // Wrap in paragraph
    processedLines.push(`<p>${line}</p>`);
  }

  html = processedLines.join('\n');

  // Clean up extra newlines
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

/**
 * Extract title from markdown (first # heading or filename)
 */
function extractTitle(markdown, filename) {
  const match = markdown.match(/^# (.+)$/m);
  if (match) {
    return match[1];
  }
  // Fallback to filename without extension
  return filename.replace(/\.md$/, '').replace(/^\d+-/, '');
}

/**
 * Extract chapter number from filename (e.g., "01-titulo.md" -> 1)
 */
function extractChapterNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate the preview HTML page
 * Optimized for screen readers: minimal markup, linear reading flow
 */
function generatePreviewHtml(chapters) {
  let contentHtml = '';

  chapters.forEach((chapter, index) => {
    // Extract clean title (remove "Capítulo X:" prefix if present in title)
    let cleanTitle = chapter.title;
    const titleMatch = cleanTitle.match(/^Capítulo\s+\d+:\s*(.+)$/i);
    if (titleMatch) {
      cleanTitle = titleMatch[1];
    }

    // Chapter content - just heading and text
    contentHtml += `
      <section>
        <h2>Capítulo ${chapter.number || index + 1}: ${cleanTitle}</h2>
        ${chapter.content}
      </section>`;
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doctrinas</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    body {
      font-family: Georgia, serif;
      font-size: 1.1rem;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #fff;
      color: #222;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    h2 {
      font-size: 1.5rem;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
    }
    p {
      margin: 1rem 0;
      text-align: justify;
    }
    blockquote {
      margin: 1.5rem 0;
      padding-left: 1.5rem;
      border-left: 3px solid #ccc;
      font-style: italic;
    }
    hr {
      border: none;
      margin: 2rem 0;
    }
  </style>
</head>
<body>
  <main>
    <h1>Doctrinas</h1>
    ${contentHtml}
  </main>
</body>
</html>`;
}

/**
 * Main build function
 */
function build() {
  console.log(`\n📝 Building preview for ${DOMAIN}...\n`);

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Ensure borradores directory exists
  if (!fs.existsSync(BORRADORES_DIR)) {
    fs.mkdirSync(BORRADORES_DIR, { recursive: true });
    console.log(`📁 Created borradores/ directory`);
  }

  // Read all markdown files
  const files = fs.readdirSync(BORRADORES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`📄 Found ${files.length} markdown files`);

  // Process each file
  const chapters = files.map(filename => {
    const filepath = path.join(BORRADORES_DIR, filename);
    const markdown = fs.readFileSync(filepath, 'utf8');
    const title = extractTitle(markdown, filename);
    const number = extractChapterNumber(filename);
    const content = markdownToHtml(markdown);

    console.log(`   ✅ ${filename} → "${title}"`);

    return {
      filename,
      title,
      number,
      content
    };
  });

  // Sort by chapter number
  chapters.sort((a, b) => a.number - b.number);

  // Generate HTML
  const html = generatePreviewHtml(chapters);
  const outputPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`\n📄 Generated ${outputPath}`);

  // Copy CSS directory
  const cssDir = path.join(DIST_DIR, 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  // Copy fonts
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

  // Copy _headers
  const headersTemplate = path.join(CORE_ROOT, '_headers.template');
  const headersDest = path.join(DIST_DIR, '_headers');
  if (fs.existsSync(headersTemplate)) {
    let headersContent = fs.readFileSync(headersTemplate, 'utf8');
    headersContent = headersContent.replace(/\{\{DOMAIN\}\}/g, DOMAIN);
    fs.writeFileSync(headersDest, headersContent);
    console.log(`📋 Generated _headers`);
  }

  console.log(`\n✨ Preview build complete!`);
  console.log(`\n🚀 Run "npm run dev" to preview at http://localhost:3007\n`);
}

// Run
build();
