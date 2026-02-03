#!/usr/bin/env node

/**
 * Doctrinas Audiobook Builder
 *
 * Prepares markdown files for TTS and generates MP3 audio files.
 *
 * Usage:
 *   node scripts/build-audiobook.js          # Prepare TTS files only
 *   node scripts/build-audiobook.js --tts    # Generate MP3s using Fish Audio API
 *
 * Environment:
 *   FISH_API_KEY  - Required for --tts mode
 *   FISH_VOICE_ID - Optional voice ID
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = process.cwd();
const MONOREPO_ROOT = path.join(__dirname, '..', '..', '..');

// Load from local .env first, then fall back to monorepo root .env
require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });
require('dotenv').config({ path: path.join(MONOREPO_ROOT, '.env') });
const BORRADORES_DIR = path.join(PROJECT_ROOT, 'borradores');
const TTS_DIR = path.join(PROJECT_ROOT, 'audiobook', 'content', 'es');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audiobook', 'audio', 'es');

const API_URL = 'https://api.fish.audio/v1/tts';
const DEFAULT_VOICE = process.env.FISH_VOICE_ID || '60f3d0bf60cd4f5e88d1116e22eb19a7';

/**
 * Convert markdown to clean text for TTS
 */
function markdownToTTS(markdown, chapterTitle) {
  let text = markdown;

  // Remove the title line (# Capítulo X: ...)
  text = text.replace(/^#\s+.+$/m, '');

  // Add chapter announcement at the beginning
  text = `${chapterTitle}\n\n(long-break)\n\n` + text.trim();

  // Convert horizontal rules to long pauses
  text = text.replace(/^---+$/gm, '\n(long-break)\n');
  text = text.replace(/^\*\*\*+$/gm, '\n(long-break)\n');

  // Remove bold/italic markers but keep the text
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/___([^_]+)___/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Remove blockquote markers
  text = text.replace(/^>\s*/gm, '');

  // Remove list markers
  text = text.replace(/^[-*]\s+/gm, '');

  // Add pauses after paragraphs (double newlines)
  text = text.replace(/\n\n+/g, '\n\n(break)\n\n');

  // Clean up multiple breaks
  text = text.replace(/\(break\)\s*\(long-break\)/g, '(long-break)');
  text = text.replace(/\(long-break\)\s*\(break\)/g, '(long-break)');
  text = text.replace(/\(break\)\s*\(break\)/g, '(break)');
  text = text.replace(/\(long-break\)\s*\(long-break\)/g, '(long-break)');

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  // Add ending pause
  text += '\n\n(long-break)';

  return text;
}

/**
 * Extract chapter info from filename
 */
function getChapterInfo(filename) {
  const match = filename.match(/^(\d+)-(.+)\.md$/);
  if (!match) return null;

  const num = parseInt(match[1], 10);
  const slug = match[2];

  // Special case for epilogue
  if (slug === 'epilogo') {
    return { num, slug, title: 'Epílogo', isEpilogue: true };
  }

  return { num, slug, title: `Capítulo ${num}`, isEpilogue: false };
}

/**
 * Generate MP3 using Fish Audio API
 */
async function generateAudio(text, outputPath) {
  const { encode } = require('@msgpack/msgpack');

  const apiKey = process.env.FISH_API_KEY;
  if (!apiKey) {
    throw new Error('FISH_API_KEY environment variable is required');
  }

  const voiceId = process.env.FISH_VOICE_ID || DEFAULT_VOICE;

  const requestData = {
    text: text,
    reference_id: voiceId,
    format: 'mp3',
    mp3_bitrate: 128,
    chunk_length: 200,
    latency: 'normal',
    normalize: false
  };

  const body = Buffer.from(encode(requestData));

  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/msgpack',
        'model': 's1',
        'Content-Length': body.length
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          reject(new Error(`API Error ${res.statusCode}: ${errorData}`));
        });
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const audioBuffer = Buffer.concat(chunks);
        fs.writeFileSync(outputPath, audioBuffer);
        resolve(audioBuffer.length);
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
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
async function build(generateMp3 = false) {
  console.log('\n🎙️  Doctrinas Audiobook Builder\n');

  ensureDir(TTS_DIR);
  ensureDir(AUDIO_DIR);

  // Get all markdown files
  const files = fs.readdirSync(BORRADORES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`📂 Borradores: ${files.length} archivos`);
  console.log(`📂 TTS output: ${TTS_DIR}`);
  console.log(`📂 Audio output: ${AUDIO_DIR}\n`);

  const chapters = [];

  for (const file of files) {
    const info = getChapterInfo(file);
    if (!info) {
      console.log(`   ⚠️  Skipping: ${file} (invalid format)`);
      continue;
    }

    const markdown = fs.readFileSync(path.join(BORRADORES_DIR, file), 'utf8');

    // Extract actual title from markdown
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const fullTitle = titleMatch ? titleMatch[1] : info.title;

    const ttsText = markdownToTTS(markdown, fullTitle);
    const ttsFilename = `${String(info.num).padStart(2, '0')}-${info.slug}.txt`;
    const ttsPath = path.join(TTS_DIR, ttsFilename);

    fs.writeFileSync(ttsPath, ttsText);

    chapters.push({
      ...info,
      fullTitle,
      ttsPath,
      ttsFilename,
      audioFilename: `${String(info.num).padStart(2, '0')}-${info.slug}.mp3`,
      charCount: ttsText.length
    });

    console.log(`   ✅ ${file} → ${ttsFilename} (${ttsText.length.toLocaleString()} chars)`);
  }

  console.log(`\n✨ TTS files prepared: ${chapters.length} chapters\n`);

  // Generate MP3s if requested
  if (generateMp3) {
    console.log('🎤 Generating MP3 files with Fish Audio API...\n');

    const apiKey = process.env.FISH_API_KEY;
    if (!apiKey) {
      console.error('❌ Error: FISH_API_KEY environment variable is required');
      console.error('   Set it in your .env file or export it in your shell');
      process.exit(1);
    }

    for (const chapter of chapters) {
      const ttsText = fs.readFileSync(chapter.ttsPath, 'utf8');
      const audioPath = path.join(AUDIO_DIR, chapter.audioFilename);

      console.log(`   🎙️  Generating: ${chapter.audioFilename}...`);

      try {
        const size = await generateAudio(ttsText, audioPath);
        console.log(`   ✅ ${chapter.audioFilename} (${(size / 1024 / 1024).toFixed(2)} MB)`);
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }

      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✨ Audio generation complete!\n`);
  }

  // Generate chapter manifest
  const manifest = {
    title: 'Doctrinas',
    language: 'es',
    chapters: chapters.map(ch => ({
      num: ch.num,
      title: ch.fullTitle,
      slug: ch.slug,
      audioFile: ch.audioFilename,
      isEpilogue: ch.isEpilogue || false
    }))
  };

  const manifestPath = path.join(PROJECT_ROOT, 'audiobook', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifest saved: ${manifestPath}\n`);

  return chapters;
}

// Run
const args = process.argv.slice(2);
const generateMp3 = args.includes('--tts');

build(generateMp3).catch(console.error);
