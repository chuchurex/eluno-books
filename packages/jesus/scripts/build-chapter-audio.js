#!/usr/bin/env node

/**
 * Chapter Audio Generator
 *
 * Generates MP3 files for each chapter using Fish Audio TTS API
 * Splits chapters into optimal chunks to prevent voice distortion
 *
 * Usage:
 *   node scripts/build-chapter-audio.js                    # All chapters
 *   node scripts/build-chapter-audio.js --chapter 5        # Only chapter 5
 *   node scripts/build-chapter-audio.js --dry-run          # Preview without API calls
 *   node scripts/build-chapter-audio.js --lang es          # Specify language (default: es)
 *
 * Environment (via .env):
 *   FISH_API_KEY   - Fish Audio API key (required)
 *   FISH_VOICE_ID  - Voice reference ID (required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const MAX_CHUNK_CHARS = 3500; // Fish Audio works best with chunks under 4000 chars
const PAUSE_BETWEEN_CHUNKS_MS = 1500;
const PAUSE_BETWEEN_CHAPTERS_MS = 3000;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    chapter: null,
    dryRun: false,
    lang: 'es'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--chapter':
      case '-c':
        options.chapter = parseInt(args[++i]);
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--lang':
      case '-l':
        options.lang = args[++i];
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🎙️  Chapter Audio Generator

Uso:
  node scripts/build-chapter-audio.js [opciones]

Opciones:
  --chapter, -c <n>   Solo generar capítulo n
  --dry-run, -d       Vista previa sin llamar a la API
  --lang, -l <code>   Idioma (default: es)
  --help, -h          Mostrar esta ayuda

Ejemplos:
  node scripts/build-chapter-audio.js                  # Todos los capítulos
  node scripts/build-chapter-audio.js --chapter 3     # Solo capítulo 3
  node scripts/build-chapter-audio.js --dry-run       # Vista previa
`);
}

// Load chapter JSON and convert to plain text for TTS
function chapterToText(chapterJson) {
  const chapter = JSON.parse(fs.readFileSync(chapterJson, 'utf8'));

  let text = '';

  // Chapter title
  text += `${chapter.numberText}.\n\n`;
  text += `${chapter.title}.\n\n`;

  // Process each section
  chapter.sections.forEach((section, sectionIndex) => {
    // Section title (if different from chapter title)
    if (section.title !== chapter.title) {
      text += `${section.title}.\n\n`;
    }

    // Process content blocks
    section.content.forEach((block, blockIndex) => {
      if (block.type === 'paragraph' || block.type === 'quote') {
        // Clean the text for TTS
        let cleanText = block.text
          // Remove term markers {term:id} or {term:id|text}
          .replace(/\{term:[^}|]+\|([^}]+)\}/g, '$1')
          .replace(/\{term:[^}]+\}/g, '')
          // Remove reference markers {ref:id}
          .replace(/\{ref:[^}]+\}/g, '')
          // Remove markdown emphasis but keep the text
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          // Clean up extra spaces
          .replace(/\s+/g, ' ')
          .trim();

        text += cleanText + '\n\n';
      }
    });
  });

  return {
    number: chapter.number,
    numberText: chapter.numberText,
    title: chapter.title,
    text: text.trim()
  };
}

// Split text into chunks that won't cause voice distortion
function splitIntoChunks(text, maxChars = MAX_CHUNK_CHARS) {
  // Split by paragraphs (double newline)
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // If adding this paragraph would exceed max, save current chunk and start new one
    if (currentChunk && (currentChunk.length + trimmed.length + 2) > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Call Fish Audio TTS API
async function textToSpeech(text, apiKey, voiceId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      reference_id: voiceId,
      format: 'mp3',
      mp3_bitrate: 128,
      normalize: false, // Required for (break) and (long-break) tags
      latency: 'normal'
    });

    const options = {
      hostname: 'api.fish.audio',
      port: 443,
      path: '/v1/tts',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => chunks.push(chunk));

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          const errorBody = Buffer.concat(chunks).toString();
          reject(new Error(`API error ${res.statusCode}: ${errorBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Generate audio for a single chapter
async function generateChapterAudio(chapterData, outputPath, apiKey, voiceId, dryRun) {
  const chunks = splitIntoChunks(chapterData.text);

  console.log(`   📄 ${chapterData.text.length.toLocaleString()} caracteres`);
  console.log(`   🔪 ${chunks.length} chunks (máx ${MAX_CHUNK_CHARS} chars c/u)`);

  if (dryRun) {
    console.log(`   🔍 [DRY RUN] Se generarían ${chunks.length} chunks de audio`);
    chunks.forEach((chunk, i) => {
      console.log(`      Chunk ${i + 1}: ${chunk.length} chars`);
    });
    return { success: true, dryRun: true };
  }

  const audioBuffers = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`   🔊 Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`);

    try {
      const audioBuffer = await textToSpeech(chunk, apiKey, voiceId);
      audioBuffers.push(audioBuffer);
      console.log(` ✅ ${(audioBuffer.length / 1024).toFixed(0)} KB`);

      // Rate limiting between chunks
      if (i < chunks.length - 1) {
        await sleep(PAUSE_BETWEEN_CHUNKS_MS);
      }
    } catch (error) {
      console.log(` ❌`);
      throw error;
    }
  }

  // Combine all audio buffers
  const combinedBuffer = Buffer.concat(audioBuffers);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, combinedBuffer);

  const sizeMB = (combinedBuffer.length / 1024 / 1024).toFixed(2);
  console.log(`   💾 Guardado: ${outputPath} (${sizeMB} MB)`);

  return { success: true, size: combinedBuffer.length };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  const options = parseArgs();

  console.log('\n🎙️  CHAPTER AUDIO GENERATOR\n');

  // Validate environment
  const apiKey = process.env.FISH_API_KEY;
  const voiceId = process.env.FISH_VOICE_ID;

  if (!apiKey && !options.dryRun) {
    console.error('❌ Error: FISH_API_KEY no configurado en .env');
    console.log('\nAgrega a tu .env:');
    console.log('FISH_API_KEY=tu_api_key_aqui');
    console.log('FISH_VOICE_ID=tu_voice_id_aqui\n');
    process.exit(1);
  }

  if (!voiceId && !options.dryRun) {
    console.error('❌ Error: FISH_VOICE_ID no configurado en .env');
    process.exit(1);
  }

  // Paths
  const chaptersDir = path.join(__dirname, '..', 'i18n', options.lang, 'chapters');
  const outputDir = path.join(__dirname, '..', 'audiobook', 'audio', options.lang);

  if (!fs.existsSync(chaptersDir)) {
    console.error(`❌ Error: Directorio de capítulos no encontrado: ${chaptersDir}`);
    process.exit(1);
  }

  // Get chapter files
  let chapterFiles = fs.readdirSync(chaptersDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  // Filter by specific chapter if requested
  if (options.chapter) {
    const targetFile = `${String(options.chapter).padStart(2, '0')}.json`;
    chapterFiles = chapterFiles.filter(f => f === targetFile);

    if (chapterFiles.length === 0) {
      console.error(`❌ Capítulo ${options.chapter} no encontrado`);
      process.exit(1);
    }
  }

  console.log(`📂 Entrada: ${chaptersDir}`);
  console.log(`📂 Salida: ${outputDir}`);
  console.log(`🎤 Voz: ${voiceId || '[dry-run]'}`);
  console.log(`📚 Capítulos a procesar: ${chapterFiles.length}`);

  if (options.dryRun) {
    console.log('\n⚠️  MODO DRY RUN - No se generará audio\n');
  }

  // Process each chapter
  let successCount = 0;
  let totalSize = 0;
  const startTime = Date.now();

  for (let i = 0; i < chapterFiles.length; i++) {
    const file = chapterFiles[i];
    const chapterPath = path.join(chaptersDir, file);

    console.log(`\n${'─'.repeat(60)}`);

    try {
      const chapterData = chapterToText(chapterPath);
      const outputFile = path.join(outputDir, `ch${String(chapterData.number).padStart(2, '0')}-${slugify(chapterData.title)}.mp3`);

      console.log(`📖 Capítulo ${chapterData.number}: ${chapterData.title}`);

      const result = await generateChapterAudio(
        chapterData,
        outputFile,
        apiKey,
        voiceId,
        options.dryRun
      );

      successCount++;
      if (result.size) {
        totalSize += result.size;
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log('   ⚠️  Continuando con el siguiente capítulo...');
    }

    // Pause between chapters
    if (i < chapterFiles.length - 1 && !options.dryRun) {
      console.log(`   ⏳ Esperando ${PAUSE_BETWEEN_CHAPTERS_MS / 1000}s antes del siguiente capítulo...`);
      await sleep(PAUSE_BETWEEN_CHAPTERS_MS);
    }
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log(`\n${'═'.repeat(60)}`);
  console.log('✨ COMPLETADO\n');
  console.log('📊 Resumen:');
  console.log(`   Capítulos procesados: ${successCount}/${chapterFiles.length}`);

  if (!options.dryRun && totalSize > 0) {
    console.log(`   Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tiempo: ${elapsed} minutos`);
    console.log(`\n📁 Audios guardados en: ${outputDir}\n`);
  }
}

// Helper to create URL-friendly slug
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
