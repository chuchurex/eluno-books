import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Terms that should STAY capitalized (proper nouns)
const keepCapitalized = new Set([
  'infinite-creator',
  'higher-self',
  'Christ-consciousness',
  'buddha-body',
]);

function lowercaseTitle(title) {
  return title.toLowerCase();
}

for (const lang of ['en', 'es']) {
  const glossaryPath = path.join(root, 'i18n', lang, 'glossary.json');
  const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

  let changed = 0;
  for (const [key, entry] of Object.entries(glossary)) {
    if (keepCapitalized.has(key)) {
      console.log(`  [${lang}] KEEP: ${key} → "${entry.title}"`);
      continue;
    }

    const oldTitle = entry.title;
    const newTitle = lowercaseTitle(oldTitle);

    if (oldTitle !== newTitle) {
      entry.title = newTitle;
      changed++;
      console.log(`  [${lang}] ${key}: "${oldTitle}" → "${newTitle}"`);
    }
  }

  fs.writeFileSync(glossaryPath, JSON.stringify(glossary, null, 2) + '\n', 'utf8');
  console.log(`\n  ${lang}: ${changed} titles lowercased\n`);
}
