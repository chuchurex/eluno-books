import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const textDir = path.join(root, 'audiobook', 'text', 'es');

// Pronunciation corrections for Edge TTS (es-MX-JorgeNeural)
// These words are cognates that the TTS may pronounce with English stress.
// We add explicit accent marks to force correct Spanish pronunciation.
// Only affects .txt files for TTS — never touches JSON or HTML.
const corrections = {
  'portal': 'portál',
  // Add more words here as they are discovered
};

// Build regex: match whole words, case-insensitive
const patterns = Object.entries(corrections).map(([from, to]) => ({
  regex: new RegExp(`\\b${from}\\b`, 'gi'),
  to,
}));

const files = fs.readdirSync(textDir).filter(f => f.endsWith('.txt'));
let totalFixes = 0;

for (const file of files) {
  const filePath = path.join(textDir, file);
  let text = fs.readFileSync(filePath, 'utf8');
  let fixes = 0;

  for (const { regex, to } of patterns) {
    text = text.replace(regex, (match) => {
      fixes++;
      // Preserve original capitalization of first letter
      if (match[0] === match[0].toUpperCase()) {
        return to[0].toUpperCase() + to.slice(1);
      }
      return to;
    });
  }

  if (fixes > 0) {
    fs.writeFileSync(filePath, text, 'utf8');
    totalFixes += fixes;
    console.log(`  ${file}: ${fixes} corrections`);
  }
}

console.log(`\n  Total: ${totalFixes} corrections in ${files.length} files`);
