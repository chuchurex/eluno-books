#!/usr/bin/env node
/**
 * translate-chapter.js — Phase 7 automation (Jesús)
 *
 * Translates ES chapter to EN and PT using the Anthropic API.
 * Also translates new glossary terms and validates alignment.
 *
 * Usage:
 *   node scripts/translate-chapter.js 02              # Translate to EN + PT
 *   node scripts/translate-chapter.js 02 --lang en    # Translate to EN only
 *   node scripts/translate-chapter.js 02 --dry-run    # Preview only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Look for .env in package dir first, then monorepo root
const localEnv = path.join(ROOT, '.env');
const monoEnv = path.join(ROOT, '..', '..', '.env');
dotenv.config({ path: fs.existsSync(localEnv) ? localEnv : monoEnv });

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 16000;
const TEMPERATURE = 0.3;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [5000, 15000, 45000];

// ─────────────────────────────────────────────────────────────
// Terminology tables (jesus-specific, ES → EN/PT)
// ─────────────────────────────────────────────────────────────

const TERMINOLOGY = {
  en: {
    table: `| Spanish | English | Note |
|---------|---------|------|
| errante | Wanderer | Capitalized — Ra term |
| el Verbo | the Word | Capitalized |
| centro de energía | energy center | NEVER "chakra" except first explanation |
| densidad | density | NEVER "dimension" |
| cosecha | harvest | Not "judgment" or "rapture" |
| catalizador | catalyst | Not "challenge" or "problem" |
| distorsión | distortion | Not "alteration" or "change" |
| complejo mente/cuerpo/espíritu | mind/body/spirit complex | Full Ra term |
| el Creador | the Creator | |
| el Uno | the One | |
| Infinito Inteligente | Intelligent Infinity | Capitalized |
| Energía Inteligente | Intelligent Energy | Capitalized |
| la Elección | the Choice | Capitalized |
| libre albedrío | free will | |
| el velo | the veil | |
| Yo Superior | Higher Self | |
| servicio a otros | service to others | |
| servicio a sí mismo | service to self | |
| la Ley del Uno | the Law of One | |
| los Logos | Logoi | Acceptable in English |
| sub-Logos | sub-Logos | Invariable |
| co-Creador | co-Creator | |
| el Infinito | the Infinite | |
| octava | octave | |
| polarización / polaridad | polarization / polarity | |
| encarnación | incarnation | Not generic "embodiment" |
| complejo de memoria social | social memory complex | |
| amor incondicional | unconditional love | |
| rendición | surrender | Not "resignation" |
| gracia | grace | |
| parábola | parable | |`,
    traps: `| Spanish | Wrong | Correct | Why |
|---------|-------|---------|-----|
| se volcó en | invested in | invested itself in | Ra's original language |
| conciencia | consciousness | consciousness | OK in English |
| los Logos | the Logos | Logoi or the Logos | Both acceptable in EN |
| la condición de ser | the being condition | beingness | OK in English |
| lo múltiple | the multiple | many-ness or multiplicity | Both acceptable |
| el impulso hacia | the pressing toward | the pressing toward | OK — Ra's language |
| envuelto en misterio | wrapped in mystery | clad in mystery | OK — poetic |
| experiencia de tercera densidad | third density experience | third-density experience | Hyphenated as modifier |`,
    forbidden: ['dimensión', 'curación']
  },
  pt: {
    table: `| Spanish | Portuguese | Note |
|---------|-----------|------|
| errante | errante | Same word |
| el Verbo | o Verbo | |
| centro de energía | centro de energia | No accent in PT |
| densidad | densidade | NEVER "dimensão" |
| cosecha | colheita | Not "julgamento" |
| catalizador | catalisador | |
| distorsión | distorção | |
| complejo mente/cuerpo/espíritu | complexo mente/corpo/espírito | |
| el Creador | o Criador | |
| el Uno | o Uno | |
| Infinito Inteligente | Infinito Inteligente | |
| Energía Inteligente | Energia Inteligente | No accent in PT |
| la Elección | a Escolha | Capitalized |
| libre albedrío | livre-arbítrio | |
| el velo | o véu | |
| Yo Superior | Eu Superior | |
| servicio a otros | serviço aos outros | |
| servicio a sí mismo | serviço a si mesmo | |
| la Ley del Uno | a Lei do Uno | |
| los Logos | os Logos | NEVER "Logoi" |
| encarnación | encarnação | |
| amor incondicional | amor incondicional | Same in PT |
| rendición | rendição | Not "resignação" |
| gracia | graça | |
| parábola | parábola | Same in PT |`,
    traps: `| Spanish | Wrong PT | Correct PT | Why |
|---------|----------|-----------|-----|
| conciencia | consciência | consciência | OK in PT — different from ES rule |
| los Logos | Logoi | os Logos | Latin plural incomprehensible in PT |
| la condición de ser | a condição de ser | a condição de ser | OK |
| se volcó en | investiu-se em | verteu-se em | "Investir" = financial |`,
    forbidden: ['dimensão', 'cura']
  }
};

const NUMBER_TEXT = {
  en: {
    1: 'Chapter One',
    2: 'Chapter Two',
    3: 'Chapter Three',
    4: 'Chapter Four',
    5: 'Chapter Five',
    6: 'Chapter Six',
    7: 'Chapter Seven',
    8: 'Chapter Eight',
    9: 'Chapter Nine',
    10: 'Chapter Ten',
    11: 'Chapter Eleven'
  },
  pt: {
    1: 'Capítulo Um',
    2: 'Capítulo Dois',
    3: 'Capítulo Três',
    4: 'Capítulo Quatro',
    5: 'Capítulo Cinco',
    6: 'Capítulo Seis',
    7: 'Capítulo Sete',
    8: 'Capítulo Oito',
    9: 'Capítulo Nove',
    10: 'Capítulo Dez',
    11: 'Capítulo Onze'
  }
};

const TITLES = {
  en: {
    1: 'In the Beginning Was the Word',
    2: 'The Way Jesus Taught',
    3: 'Life as School of the Soul',
    4: 'The Choice of the Heart',
    5: 'The Spirit That Dwells in Us',
    6: 'The New Creature',
    7: 'The Neighbor as Mirror',
    8: 'The Hope That Does Not Disappoint',
    9: 'Prayer and Stillness',
    10: 'Faith and Works',
    11: 'Mystery and Humility'
  },
  pt: {
    1: 'No Princípio era o Verbo',
    2: 'O Caminho que Jesus Ensinou',
    3: 'A Vida como Escola da Alma',
    4: 'A Escolha do Coração',
    5: 'O Espírito que Habita em Nós',
    6: 'A Nova Criatura',
    7: 'O Próximo como Espelho',
    8: 'A Esperança que Não Decepciona',
    9: 'A Oração e a Quietude',
    10: 'Fé e Obras',
    11: 'O Mistério e a Humildade'
  }
};

const LANG_NAMES = { en: 'English', pt: 'Portuguese' };

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function sortObjectKeys(obj) {
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function extractTerms(chapter) {
  const text = JSON.stringify(chapter);
  return new Set((text.match(/\{term:([^}]+)\}/g) || []).map(m => m));
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

let client;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in .env');
      process.exit(3);
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

async function callAPI(systemPrompt, userPrompt, maxTokens = MAX_TOKENS) {
  const anthropic = getClient();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: TEMPERATURE,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const text = response.content[0].text;

      const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;

      try {
        return JSON.parse(jsonStr.trim());
      } catch {
        if (attempt < MAX_RETRIES - 1 && !jsonStr.trim().endsWith('}')) {
          console.log(`   Truncated response, retrying with more tokens...`);
          maxTokens = Math.min(maxTokens * 2, 32000);
          continue;
        }
        const errorDir = path.join(ROOT, 'workspace', 'errors');
        fs.mkdirSync(errorDir, { recursive: true });
        const errorPath = path.join(errorDir, `translate_error_${Date.now()}.txt`);
        fs.writeFileSync(errorPath, text, 'utf8');
        console.error(
          `   Failed to parse JSON. Raw response saved to ${path.relative(ROOT, errorPath)}`
        );
        return null;
      }
    } catch (err) {
      if (err.status === 400 && err.message && err.message.includes('credit balance')) {
        console.error(
          '   Anthropic API: no credits. Add credits at https://console.anthropic.com/settings/billing'
        );
        return null;
      }
      if (err.status === 429 && attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`   Rate limited, waiting ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Translation
// ─────────────────────────────────────────────────────────────

function buildChapterPrompt(esChapter, lang) {
  const langName = LANG_NAMES[lang];
  const term = TERMINOLOGY[lang];

  return {
    system: `You are a professional translator for "Jesus — El Camino del Amor", a philosophical book about Jesus from the perspective of consciousness. Translate the JSON chapter from Spanish to ${langName}.

RULES:
1. Natural prose in ${langName} — NOT literal translation. Each sentence should sound like it was originally written in ${langName}.
2. Maintain the same voice: first person plural, sapiential perspective.
3. Keep ALL {term:keyword} and {ref:category:id} marks EXACTLY as they are — do NOT translate the keywords.
4. Do NOT add or remove any {term:} marks. The exact same set of {term:} marks must appear in the translation.
5. Keep the exact same JSON structure: same section IDs, same number of content blocks, same types.
6. Remove any {src:} marks if found.
7. This book presents Jesus with love and reverence as a consciousness teacher. It complements Christian faith, never contradicts it.

MANDATORY TERMINOLOGY:
${term.table}

TRANSLATION TRAPS — AVOID THESE:
${term.traps}

FORBIDDEN STRINGS: ${term.forbidden.map(f => `"${f}"`).join(', ')}

OUTPUT: Return ONLY the complete JSON object. No explanations, no markdown fences.`,

    user: `Translate this chapter to ${langName}. Set numberText to "${NUMBER_TEXT[lang][esChapter.number]}" and title to "${TITLES[lang][esChapter.number]}". Translate all section titles and paragraph text.

${JSON.stringify(esChapter, null, 2)}`
  };
}

function buildGlossaryPrompt(terms, lang) {
  const langName = LANG_NAMES[lang];
  const term = TERMINOLOGY[lang];

  return {
    system: `You are translating glossary entries for "Jesus — El Camino del Amor" from Spanish to ${langName}. Each entry has a keyword (do NOT translate), a title (translate), and content array (translate).

TERMINOLOGY:
${term.table}

OUTPUT: Return ONLY a JSON object with the translated entries. Same format as input. No markdown fences.`,

    user: `Translate these glossary entries to ${langName}:

${JSON.stringify(terms, null, 2)}`
  };
}

function postProcess(translated, es, lang) {
  const issues = [];

  // Fix numberText
  const expectedNt = NUMBER_TEXT[lang][es.number];
  if (translated.numberText !== expectedNt) {
    issues.push(`Fixed numberText: "${translated.numberText}" -> "${expectedNt}"`);
    translated.numberText = expectedNt;
  }

  // Fix title
  const expectedTitle = TITLES[lang][es.number];
  if (translated.title !== expectedTitle) {
    issues.push(`Fixed title: "${translated.title}" -> "${expectedTitle}"`);
    translated.title = expectedTitle;
  }

  // Fix id
  if (translated.id !== es.id) {
    translated.id = es.id;
  }
  if (translated.number !== es.number) {
    translated.number = es.number;
  }

  // Fix section IDs
  for (let i = 0; i < es.sections.length && i < translated.sections.length; i++) {
    if (translated.sections[i].id !== es.sections[i].id) {
      translated.sections[i].id = es.sections[i].id;
    }
  }

  // Fix phantom {term:} marks
  const esTerms = extractTerms(es);
  let phantomsRemoved = 0;

  for (const section of translated.sections) {
    for (const block of section.content) {
      if (!block.text) continue;
      const blockTerms = block.text.match(/\{term:[^}]+\}/g) || [];
      for (const mark of blockTerms) {
        if (!esTerms.has(mark)) {
          block.text = block.text.replace(mark, '');
          phantomsRemoved++;
        }
      }
      block.text = block.text.replace(/  +/g, ' ').trim();
    }
  }

  if (phantomsRemoved > 0) {
    issues.push(`Removed ${phantomsRemoved} phantom {term:} mark(s)`);
  }

  // Remove {src:} residuals
  for (const section of translated.sections) {
    for (const block of section.content) {
      if (block.text && block.text.includes('{src:')) {
        block.text = block.text.replace(/\s*\{src:[^}]+\}/g, '');
        issues.push('Removed {src:} residuals');
      }
    }
  }

  // Check forbidden strings
  const text = JSON.stringify(translated);
  for (const f of TERMINOLOGY[lang].forbidden) {
    if (text.toLowerCase().includes(f.toLowerCase())) {
      issues.push(`WARNING: Forbidden string found: "${f}" -- manual review needed`);
    }
  }

  return { translated, issues };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function translateChapter(chapterNum, lang, dryRun) {
  const nn = pad(chapterNum);
  const label = LANG_NAMES[lang].toUpperCase();
  const esPath = path.join(ROOT, 'i18n', 'es', 'chapters', `${nn}.json`);
  const destPath = path.join(ROOT, 'i18n', lang, 'chapters', `${nn}.json`);

  console.log(`\n   Translating to ${label}...`);

  const es = loadJSON(esPath);

  if (dryRun) {
    const sections = es.sections.length;
    const paragraphs = es.sections.reduce((s, sec) => s + sec.content.length, 0);
    console.log(`      Would translate: ${sections} sections, ${paragraphs} paragraphs`);
    console.log(`      Output: ${path.relative(ROOT, destPath)}`);
    return true;
  }

  const prompt = buildChapterPrompt(es, lang);
  const result = await callAPI(prompt.system, prompt.user);

  if (!result) {
    console.error(`   ${label} translation failed`);
    return false;
  }

  const { translated, issues } = postProcess(result, es, lang);

  if (translated.sections.length !== es.sections.length) {
    console.error(
      `   ${label} section count mismatch: ${translated.sections.length} vs ${es.sections.length}`
    );
    return false;
  }

  writeJSON(destPath, translated);
  console.log(`      ${path.relative(ROOT, destPath)} -- done`);

  if (issues.length > 0) {
    for (const issue of issues) {
      console.log(`      - ${issue}`);
    }
  }

  return true;
}

async function translateGlossary(chapterNum, lang, dryRun) {
  const nn = pad(chapterNum);
  const label = LANG_NAMES[lang].toUpperCase();

  const esChapterPath = path.join(ROOT, 'i18n', 'es', 'chapters', `${nn}.json`);
  const esGlossaryPath = path.join(ROOT, 'i18n', 'es', 'glossary.json');
  const destGlossaryPath = path.join(ROOT, 'i18n', lang, 'glossary.json');

  const esChapter = loadJSON(esChapterPath);
  const esGlossary = loadJSON(esGlossaryPath);
  const destGlossary = loadJSON(destGlossaryPath);

  const chapterText = JSON.stringify(esChapter);
  const termKeywords = [
    ...new Set((chapterText.match(/\{term:([^}]+)\}/g) || []).map(m => m.replace(/\{term:|}/g, '')))
  ];

  const toTranslate = {};
  for (const keyword of termKeywords) {
    if (esGlossary[keyword] && !destGlossary[keyword]) {
      toTranslate[keyword] = esGlossary[keyword];
    }
  }

  if (Object.keys(toTranslate).length === 0) {
    console.log(`      ${label} glossary: no new terms to translate`);
    return true;
  }

  if (dryRun) {
    console.log(
      `      ${label} glossary: would translate ${Object.keys(toTranslate).length} terms`
    );
    return true;
  }

  console.log(
    `      Translating ${Object.keys(toTranslate).length} glossary terms for ${label}...`
  );

  const prompt = buildGlossaryPrompt(toTranslate, lang);
  const result = await callAPI(prompt.system, prompt.user, 4000);

  if (!result) {
    console.error(`      ${label} glossary translation failed`);
    return false;
  }

  let added = 0;
  for (const [keyword, entry] of Object.entries(result)) {
    if (!destGlossary[keyword]) {
      destGlossary[keyword] = entry;
      added++;
    }
  }

  writeJSON(destGlossaryPath, sortObjectKeys(destGlossary));

  console.log(`      ${label} glossary: ${added} terms added`);
  return true;
}

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--lang' && args[i + 1]) {
    flags.lang = args[++i].split(',');
  } else if (args[i] === '--dry-run') {
    flags.dryRun = true;
  } else if (!args[i].startsWith('--')) {
    positional.push(args[i]);
  }
}

if (positional.length === 0) {
  console.log('Usage: node scripts/translate-chapter.js <chapter> [--lang en,pt] [--dry-run]');
  console.log('  node scripts/translate-chapter.js 02');
  console.log('  node scripts/translate-chapter.js 02 --lang en');
  console.log('  node scripts/translate-chapter.js 02 --dry-run');
  process.exit(0);
}

const chapterNum = parseInt(positional[0], 10);
const nn = pad(chapterNum);
const targetLangs = flags.lang || ['en', 'pt'];
const dryRun = flags.dryRun || false;

const esPath = path.join(ROOT, 'i18n', 'es', 'chapters', `${nn}.json`);
if (!fs.existsSync(esPath)) {
  console.error(`ES chapter not found: ${path.relative(ROOT, esPath)}`);
  console.error('Run: node scripts/integrate-chapter.js ' + nn);
  process.exit(2);
}

console.log('===================================');
console.log(` Translating Chapter ${chapterNum}${dryRun ? ' (DRY RUN)' : ''}`);
console.log(` Languages: ${targetLangs.join(', ').toUpperCase()}`);
console.log('===================================');

let allSuccess = true;

for (const lang of targetLangs) {
  const chapterOk = await translateChapter(chapterNum, lang, dryRun);
  if (chapterOk && !dryRun) {
    await translateGlossary(chapterNum, lang, dryRun);
  }
  if (!chapterOk) allSuccess = false;
}

console.log('\n===================================');
if (dryRun) {
  console.log('Dry run complete. No files were modified.');
} else if (allSuccess) {
  console.log('Translation complete!');
} else {
  console.log('Translation completed with errors. Review output above.');
  process.exit(1);
}
