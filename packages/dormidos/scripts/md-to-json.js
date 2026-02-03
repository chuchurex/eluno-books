#!/usr/bin/env node
/**
 * Convert Markdown chapters to JSON format
 * Usage: node scripts/md-to-json.js
 */

const fs = require('fs');
const path = require('path');

const CHAPTERS_DIR = path.join(__dirname, '../i18n/es/chapters');

// Number words in Spanish
const numberWords = {
  1: 'Uno', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco',
  6: 'Seis', 7: 'Siete', 8: 'Ocho', 9: 'Nueve', 10: 'Diez',
  11: 'Once', 12: 'Doce', 13: 'Trece', 14: 'Catorce', 15: 'Quince',
  16: 'Dieciséis', 17: 'Diecisiete', 18: 'Dieciocho', 19: 'Diecinueve', 20: 'Veinte',
  21: 'Veintiuno', 22: 'Veintidós', 23: 'Veintitrés', 24: 'Veinticuatro'
};

function parseMarkdown(content, num) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let title = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Main title (# 1. Title)
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s*\d+\.\s*/, '').trim();
      continue;
    }

    // Section header (## Section)
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const sectionTitle = line.replace('## ', '').trim();
      currentSection = {
        id: `ch${num}-${sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`,
        title: sectionTitle,
        content: []
      };
      continue;
    }

    // Skip empty lines at start of section
    if (!currentSection) continue;

    // Horizontal rule or quote at end
    if (line.startsWith('---')) {
      continue;
    }

    // Quote block (starts with *)
    if (line.startsWith('*"') || line.startsWith('*«')) {
      // This is a closing quote, add as blockquote
      let quoteText = line;
      // Check if next line is attribution
      if (i + 1 < lines.length && lines[i + 1].startsWith('—')) {
        quoteText += '\n' + lines[i + 1];
        i++;
      }
      currentSection.content.push({
        type: 'blockquote',
        text: quoteText.replace(/^\*/, '').replace(/\*$/, '').trim()
      });
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Regular paragraph
    currentSection.content.push({
      type: 'paragraph',
      text: line.trim()
    });
  }

  // Push last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    id: `ch${num}`,
    number: num,
    numberText: `Capítulo ${numberWords[num] || num}`,
    title: title,
    sections: sections
  };
}

function main() {
  const files = fs.readdirSync(CHAPTERS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} markdown files\n`);

  for (const file of files) {
    const num = parseInt(file.replace('.md', ''), 10);
    const mdPath = path.join(CHAPTERS_DIR, file);
    const jsonPath = path.join(CHAPTERS_DIR, file.replace('.md', '.json'));

    const content = fs.readFileSync(mdPath, 'utf8');
    const json = parseMarkdown(content, num);

    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
    console.log(`✓ ${file} → ${num.toString().padStart(2, '0')}.json (${json.sections.length} sections)`);
  }

  console.log('\nDone!');
}

main();
