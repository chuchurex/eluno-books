#!/usr/bin/env node
/**
 * translate-chapter.js — Phase 7 automation (Sanación)
 *
 * Translates EN chapter to ES using the Anthropic API.
 * Also translates new glossary terms and validates alignment.
 *
 * Usage:
 *   node scripts/translate-chapter.js 02              # Translate to ES
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
// Terminology tables (healing-specific)
// ─────────────────────────────────────────────────────────────

const TERMINOLOGY = {
  es: {
    table: `| English | Spanish | Note |
|---------|---------|------|
| healing | sanación | NEVER "curación" — implies guaranteed result |
| energy center | centro de energía | NEVER "chakra" except first explanation |
| blockage | bloqueo | Not "problema" or "tema" |
| catalyst | catalizador | Not "desafío" or "problema" |
| balancing | equilibrio | Not "arreglar" or "corregir" |
| distortion | distorsión | Not "alteración" or "cambio" |
| mind/body/spirit complex | complejo mente/cuerpo/espíritu | Full Ra term in technical context |
| density | densidad | NEVER "dimensión" |
| harvest | cosecha | Not "juicio" or "rapto" |
| wanderer | errante | Not "starseed" |
| ray | rayo | Not "chakra" |
| Logos | Logos | Invariable |
| Logos (plural) | los Logos | NEVER "Logoi" |
| free will | libre albedrío | |
| intelligent infinity | Infinito Inteligente | Capitalized |
| intelligent energy | Energía Inteligente | Capitalized |
| social memory complex | complejo de memoria social | |
| the Choice | la Elección | Capitalized |
| polarization / polarity | polarización / polaridad | |
| the veil | el velo | |
| sub-Logos | sub-Logos | Invariable |
| co-Creator | co-Creador | |
| the One | el Uno | |
| the Infinite | el Infinito | |
| the Creator | el Creador | |
| Higher Self | Yo Superior | |
| octave | octava | |
| service to others | servicio a otros | |
| service to self | servicio a sí mismo | |
| the Law of One | la Ley del Uno | |
| healer | sanador | Not "curador" |
| the healed | el sanado | Not "el curado" |
| pyramid | pirámide | |
| meditation | meditación | |
| forgiveness | perdón | |
| wholeness | plenitud | Not "totalidad" — spiritual completeness |`,
    traps: `| English | Wrong | Correct | Why |
|---------|-------|---------|-----|
| invested (itself) in | se invirtió en | se volcó en, se vertió hacia | "Invertir" = financial |
| consciousness | consciencia | conciencia | Project preference |
| Logoi | Logoi | los Logos | Latin plural incomprehensible |
| beingness | ser-idad | el ser, la condición de ser | Don't invent nouns |
| many-ness | muchidad | la multiplicidad, lo múltiple | Don't copy English suffixes |
| the pressing toward | la presión hacia | el impulso hacia, la tendencia hacia | Not mechanical pressure |
| clad in mystery | vestido de misterio | envuelto en misterio | More natural |
| third-density experience | experiencia tercera-densidad | experiencia de tercera densidad | Use "de + adj + noun" |
| curing | curación | sanación | "Curing" implies fixing; "healing" implies wholeness |`,
    forbidden: ['consciencia', 'Logoi', 'curación']
  }
};

const NUMBER_TEXT = {
  es: {
    1: 'Capítulo Uno',
    2: 'Capítulo Dos',
    3: 'Capítulo Tres',
    4: 'Capítulo Cuatro',
    5: 'Capítulo Cinco',
    6: 'Capítulo Seis',
    7: 'Capítulo Siete',
    8: 'Capítulo Ocho',
    9: 'Capítulo Nueve',
    10: 'Capítulo Diez',
    11: 'Capítulo Once'
  }
};

const TITLES = {
  es: {
    1: 'La Naturaleza de la Sanación',
    2: 'El Complejo Mente/Cuerpo/Espíritu',
    3: 'Los Centros de Energía',
    4: 'Bloqueos y Distorsiones',
    5: 'El Papel del Sanador',
    6: 'El Catalizador del Cuerpo',
    7: 'La Aceptación como Sanación',
    8: 'Las Pirámides y la Sanación',
    9: 'Sanación a Través de la Meditación',
    10: 'El Perdón y la Liberación',
    11: 'La Plenitud'
  }
};

const LANG_NAMES = { es: 'Spanish' };

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
      console.error('❌ ANTHROPIC_API_KEY not found in .env');
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
          console.log(`   ⚠️  Truncated response, retrying with more tokens...`);
          maxTokens = Math.min(maxTokens * 2, 32000);
          continue;
        }
        const errorDir = path.join(ROOT, 'workspace', 'errors');
        fs.mkdirSync(errorDir, { recursive: true });
        const errorPath = path.join(errorDir, `translate_error_${Date.now()}.txt`);
        fs.writeFileSync(errorPath, text, 'utf8');
        console.error(
          `   ❌ Failed to parse JSON. Raw response saved to ${path.relative(ROOT, errorPath)}`
        );
        return null;
      }
    } catch (err) {
      if (err.status === 400 && err.message && err.message.includes('credit balance')) {
        console.error(
          '   ❌ Anthropic API: no credits. Add credits at https://console.anthropic.com/settings/billing'
        );
        return null;
      }
      if (err.status === 429 && attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`   ⚠️  Rate limited, waiting ${delay / 1000}s...`);
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

function buildChapterPrompt(enChapter, lang) {
  const langName = LANG_NAMES[lang];
  const term = TERMINOLOGY[lang];

  return {
    system: `You are a professional translator for "Sanación", a philosophical book about healing from the perspective of consciousness. Translate the JSON chapter from English to ${langName}.

RULES:
1. Natural prose in ${langName} — NOT literal translation. Each sentence should sound like it was originally written in ${langName}.
2. Maintain the same voice: first person plural, sapiential perspective.
3. Keep ALL {term:keyword} and {ref:category:id} marks EXACTLY as they are — do NOT translate the keywords.
4. Do NOT add or remove any {term:} marks. The exact same set of {term:} marks must appear in the translation.
5. Keep the exact same JSON structure: same section IDs, same number of content blocks, same types.
6. Remove any {src:} marks if found.
7. This is NOT a medical text. It is spiritual philosophy about healing. "Healing" = "sanación" (not "curación").

MANDATORY TERMINOLOGY:
${term.table}

TRANSLATION TRAPS — AVOID THESE:
${term.traps}

FORBIDDEN STRINGS: ${term.forbidden.map(f => `"${f}"`).join(', ')}

OUTPUT: Return ONLY the complete JSON object. No explanations, no markdown fences.`,

    user: `Translate this chapter to ${langName}. Set numberText to "${NUMBER_TEXT[lang][enChapter.number]}" and title to "${TITLES[lang][enChapter.number]}". Translate all section titles and paragraph text.

${JSON.stringify(enChapter, null, 2)}`
  };
}

function buildGlossaryPrompt(terms, lang) {
  const langName = LANG_NAMES[lang];
  const term = TERMINOLOGY[lang];

  return {
    system: `You are translating glossary entries for "Sanación" from English to ${langName}. Each entry has a keyword (do NOT translate), a title (translate), and content array (translate).

TERMINOLOGY:
${term.table}

OUTPUT: Return ONLY a JSON object with the translated entries. Same format as input. No markdown fences.`,

    user: `Translate these glossary entries to ${langName}:

${JSON.stringify(terms, null, 2)}`
  };
}

function postProcess(translated, en, lang) {
  const issues = [];

  // Fix numberText
  const expectedNt = NUMBER_TEXT[lang][en.number];
  if (translated.numberText !== expectedNt) {
    issues.push(`Fixed numberText: "${translated.numberText}" → "${expectedNt}"`);
    translated.numberText = expectedNt;
  }

  // Fix title
  const expectedTitle = TITLES[lang][en.number];
  if (translated.title !== expectedTitle) {
    issues.push(`Fixed title: "${translated.title}" → "${expectedTitle}"`);
    translated.title = expectedTitle;
  }

  // Fix id
  if (translated.id !== en.id) {
    translated.id = en.id;
  }
  if (translated.number !== en.number) {
    translated.number = en.number;
  }

  // Fix section IDs
  for (let i = 0; i < en.sections.length && i < translated.sections.length; i++) {
    if (translated.sections[i].id !== en.sections[i].id) {
      translated.sections[i].id = en.sections[i].id;
    }
  }

  // Fix phantom {term:} marks
  const enTerms = extractTerms(en);
  let phantomsRemoved = 0;

  for (const section of translated.sections) {
    for (const block of section.content) {
      if (!block.text) continue;
      const blockTerms = block.text.match(/\{term:[^}]+\}/g) || [];
      for (const mark of blockTerms) {
        if (!enTerms.has(mark)) {
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
      issues.push(`⚠️  Forbidden string found: "${f}" — manual review needed`);
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
  const enPath = path.join(ROOT, 'i18n', 'en', 'chapters', `${nn}.json`);
  const destPath = path.join(ROOT, 'i18n', lang, 'chapters', `${nn}.json`);

  console.log(`\n   🌐 Translating to ${label}...`);

  const en = loadJSON(enPath);

  if (dryRun) {
    const sections = en.sections.length;
    const paragraphs = en.sections.reduce((s, sec) => s + sec.content.length, 0);
    console.log(`      Would translate: ${sections} sections, ${paragraphs} paragraphs`);
    console.log(`      Output: ${path.relative(ROOT, destPath)}`);
    return true;
  }

  const prompt = buildChapterPrompt(en, lang);
  const result = await callAPI(prompt.system, prompt.user);

  if (!result) {
    console.error(`   ❌ ${label} translation failed`);
    return false;
  }

  const { translated, issues } = postProcess(result, en, lang);

  if (translated.sections.length !== en.sections.length) {
    console.error(
      `   ❌ ${label} section count mismatch: ${translated.sections.length} vs ${en.sections.length}`
    );
    return false;
  }

  writeJSON(destPath, translated);
  console.log(`      ✅ ${path.relative(ROOT, destPath)}`);

  if (issues.length > 0) {
    for (const issue of issues) {
      console.log(`      • ${issue}`);
    }
  }

  return true;
}

async function translateGlossary(chapterNum, lang, dryRun) {
  const nn = pad(chapterNum);
  const label = LANG_NAMES[lang].toUpperCase();

  const enChapterPath = path.join(ROOT, 'i18n', 'en', 'chapters', `${nn}.json`);
  const enGlossaryPath = path.join(ROOT, 'i18n', 'en', 'glossary.json');
  const destGlossaryPath = path.join(ROOT, 'i18n', lang, 'glossary.json');

  const enChapter = loadJSON(enChapterPath);
  const enGlossary = loadJSON(enGlossaryPath);
  const destGlossary = loadJSON(destGlossaryPath);

  const chapterText = JSON.stringify(enChapter);
  const termKeywords = [
    ...new Set((chapterText.match(/\{term:([^}]+)\}/g) || []).map(m => m.replace(/\{term:|}/g, '')))
  ];

  const toTranslate = {};
  for (const keyword of termKeywords) {
    if (enGlossary[keyword] && !destGlossary[keyword]) {
      toTranslate[keyword] = enGlossary[keyword];
    }
  }

  if (Object.keys(toTranslate).length === 0) {
    console.log(`      📚 ${label} glossary: no new terms to translate`);
    return true;
  }

  if (dryRun) {
    console.log(
      `      📚 ${label} glossary: would translate ${Object.keys(toTranslate).length} terms`
    );
    return true;
  }

  console.log(
    `      📚 Translating ${Object.keys(toTranslate).length} glossary terms for ${label}...`
  );

  const prompt = buildGlossaryPrompt(toTranslate, lang);
  const result = await callAPI(prompt.system, prompt.user, 4000);

  if (!result) {
    console.error(`      ❌ ${label} glossary translation failed`);
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

  console.log(`      ✅ ${label} glossary: ${added} terms added`);
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
  console.log('Usage: node scripts/translate-chapter.js <chapter> [--lang es] [--dry-run]');
  console.log('  node scripts/translate-chapter.js 02');
  console.log('  node scripts/translate-chapter.js 02 --dry-run');
  process.exit(0);
}

const chapterNum = parseInt(positional[0], 10);
const nn = pad(chapterNum);
const targetLangs = flags.lang || ['es'];
const dryRun = flags.dryRun || false;

const enPath = path.join(ROOT, 'i18n', 'en', 'chapters', `${nn}.json`);
if (!fs.existsSync(enPath)) {
  console.error(`❌ EN chapter not found: ${path.relative(ROOT, enPath)}`);
  console.error('Run: node scripts/integrate-chapter.js ' + nn);
  process.exit(2);
}

console.log('═══════════════════════════════════════════');
console.log(` Translating Chapter ${chapterNum}${dryRun ? ' (DRY RUN)' : ''}`);
console.log(` Languages: ${targetLangs.join(', ').toUpperCase()}`);
console.log('═══════════════════════════════════════════');

let allSuccess = true;

for (const lang of targetLangs) {
  const chapterOk = await translateChapter(chapterNum, lang, dryRun);
  if (chapterOk && !dryRun) {
    await translateGlossary(chapterNum, lang, dryRun);
  }
  if (!chapterOk) allSuccess = false;
}

console.log('\n═══════════════════════════════════════════');
if (dryRun) {
  console.log('🔍 Dry run complete. No files were modified.');
} else if (allSuccess) {
  console.log('✅ Translation complete!');
} else {
  console.log('⚠️  Translation completed with errors. Review output above.');
  process.exit(1);
}
