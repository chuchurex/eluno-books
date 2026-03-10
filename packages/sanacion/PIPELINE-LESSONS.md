# Pipeline Lessons — Sanación (v4.6 rewrite)

Documento de lecciones aprendidas durante la escritura completa del libro Sanación con Opus 4.6. El pipeline base (`/write:prepare` → `/write:step1` → `/write:step2` → `/write:qa`) funcionó para generar los capítulos, pero la fase de **post-producción** (glosario, integración, traducción, build, audio) requirió múltiples correcciones manuales y scripts ad-hoc.

Este documento está pensado para informar mejoras al pipeline en `@eluno/core`.

---

## 1. Glosario: el eslabón más débil

### 1.1 El paso `/write:glossary` se omitió

Se escribieron los 11 capítulos sin generar el glosario, lo que causó un efecto cascada:
- Los capítulos contenían marcadores `{term:X}` que referenciaban términos inexistentes en `glossary.json`
- El build generó ~40 warnings de "Term not found in glossary"
- Los términos no resueltos aparecían como texto crudo en inglés en el HTML español
- Los archivos de texto para TTS también mostraban los términos en inglés

**Recomendación**: El glosario debería generarse como primer paso después de la escritura, o mejor aún, acumularse incrementalmente durante la escritura de cada capítulo. El build debería fallar (no solo warn) si hay términos sin entrada en el glosario.

### 1.2 Formato de claves de términos inconsistente

Los capítulos generados usaban claves con espacios y mayúsculas:
```
{term:free will}    {term:Infinite Creator}    {term:energy centers}
{term:mind/body/spirit complex}    {term:Higher Self}
```

Pero el build solo acepta `[a-z0-9-]+`:
```
{term:free-will}    {term:infinite-creator}    {term:energy-centers}
```

Términos con espacios o `/` simplemente pasaban como texto plano sin procesarse.

**Fix aplicado**: Script `scripts/fix-terms.js` — normalizó 106 marcadores en ambos idiomas (espacios → guiones, lowercase).

**Recomendación**: Las instrucciones del writing pipeline deben especificar explícitamente el formato `{term:kebab-case}`. Los prompts de step1/step2 deberían incluir ejemplos. Idealmente, el paso QA debería validar que todos los `{term:}` usan formato válido.

### 1.3 Glosario incompleto: 20 de 68 términos

El glosario existente tenía solo 20 entradas, pero los capítulos referenciaban 68 términos únicos. Faltaban 48 términos.

**Fix aplicado**: Script `scripts/fix-terms.js` — extrajo todos los `{term:}` únicos, generó definiciones EN/ES, y los agregó a ambos glosarios.

**Recomendación**: El pipeline debería incluir un paso de validación que compare todos los `{term:}` usados en los capítulos contra las entradas del glosario y reporte los faltantes antes del build.

### 1.4 Mayúsculas en títulos del glosario

Los títulos del glosario estaban en Title Case ("Sanación", "Plenitud", "Cristalizado"). El build inserta `term.title` textualmente en el HTML. Resultado: términos con mayúscula inicial apareciendo en medio de oraciones.

```
"...buscando Sanación —ya sea..."  ← incorrecto
"...buscando sanación —ya sea..."  ← correcto
```

**Fix aplicado**: Script `scripts/fix-term-case.js` — pasó todos los títulos a minúscula excepto nombres propios (Creador Infinito, Yo Superior, Conciencia Crística, Cuerpo Búdico).

**Recomendación**: Los títulos del glosario deberían ser lowercase por defecto. El pipeline de generación de glosario debería aplicar esta regla, con una lista explícita de excepciones (nombres propios) por libro.

---

## 2. Integración y nombres de archivo

### 2.1 Convención de nombres duplicada

Existían archivos con dos convenciones:
- Antiguos: `ch1.json`, `ch2.json`, ... `ch11.json`
- Nuevos: `01.json`, `02.json`, ... `11.json`

El build acepta ambos (`/^(?:ch)?\d+\.json$/`), así que detectó 22 capítulos en vez de 11.

**Fix aplicado**: Eliminación manual de los archivos `chN.json` antiguos.

**Recomendación**: El script `integrate-chapter.js` debería limpiar archivos con nomenclatura antigua al integrar. O el build debería detectar duplicados y alertar.

### 2.2 `integrate-chapter.js` requiere glossary.json

El script de integración falla si no existe `glossary.json`. Como el glosario se omitió, la integración tuvo que hacerse con copia manual.

**Recomendación**: `integrate-chapter.js` debería funcionar sin glosario (creando uno vacío si no existe) o al menos dar un error claro indicando que falta.

---

## 3. Traducción

### 3.1 Rate limit con traducciones paralelas

Lanzar las 11 traducciones en paralelo excedió el rate limit de Anthropic (8,000 output tokens/min). Capítulos 01-07 pasaron, 08-11 fallaron con error 429.

**Fix aplicado**: Esperar 60 segundos y re-ejecutar 08-11 secuencialmente.

**Recomendación**: `translate-chapter.js` debería tener un modo batch con throttling configurable (ej: máximo 3 paralelos, con delay entre grupos). O un wrapper script `translate-all.js` que maneje el rate limiting.

---

## 4. Audio (TTS)

### 4.1 Términos en inglés en texto TTS

Antes de corregir el glosario, la extracción de texto para TTS (`eluno-audio extract`) producía texto con términos en inglés porque `cleanForTTS()` busca en el glosario y si no encuentra, deja la clave cruda:

```
"...un canal crystallized a través del cual la intelligent energy puede fluir..."
```

Después del fix del glosario:
```
"...un canal cristalizado a través del cual la energía inteligente puede fluir..."
```

**Recomendación**: Este problema se resuelve automáticamente si el glosario está completo (ver sección 1). No requiere cambios en el pipeline de audio en sí.

### 4.2 Pronunciación incorrecta de cognados

Edge TTS (`es-MX-JorgeNeural`) pronuncia algunas palabras cognadas con acentuación inglesa:
- "portal" → pronunciado PÓR-tal (inglés) en vez de por-TÁL (español)

El motor TTS no acepta SSML directo porque `node-edge-tts` escapa el XML con `escapeXml()`.

**Fix aplicado**: Script `scripts/fix-tts-pronunciation.js` — post-procesa los `.txt` añadiendo tildes explícitas como hints de pronunciación:
```
portal → portál
```

Pipeline actualizado:
```
eluno-audio extract → fix-tts-pronunciation.js → eluno-audio generate
```

**Recomendación**: Integrar un paso de correcciones de pronunciación en `eluno-audio extract` o como hook configurable en `eluno.config.mjs`:
```js
audiobook: {
  pronunciationFixes: {
    es: { 'portal': 'portál' }
  }
}
```

### 4.3 Limite de 25 MB en Cloudflare Pages

El audiobook completo (187 MB) excede el límite de 25 MB por archivo de Cloudflare Pages. Los capítulos individuales (15-19 MB) sí caben.

**Fix aplicado**: Deployment híbrido:
- Cloudflare Pages: capítulos individuales + HTML
- static.eluno.org (Hostinger vía SCP): audiobook completo

`media.json` usa URL absoluta para el libro completo:
```json
"all": {
  "audio": "https://static.eluno.org/sanacion/audiobook/es/complete-book.mp3"
}
```

**Recomendación**: El pipeline de audio debería documentar esta limitación y automatizar el deployment a static.eluno.org cuando el archivo supere 25 MB. Idealmente `eluno-audio publish` se encargaría de ambos destinos.

### 4.4 media.json se actualizó manualmente

Cada vez que se agregaba un audio, había que editar `media.json` manualmente para vincular el MP3 desde el HTML.

**Recomendación**: `eluno-audio generate` (o un paso `eluno-audio link`) debería actualizar `media.json` automáticamente al generar cada capítulo.

---

## 5. Build y deploy

### 5.1 Toggle manual de siteUrl para preview

Para desplegar a `sanacion2.eluno.org` (preview), se cambió `siteUrl` en `eluno.config.mjs` antes de cada build y se revirtió después. Esto se repitió ~8 veces.

**Recomendación**: Soporte para `--site-url` como flag del build, o una variable de entorno `SITE_URL` que sobreescriba el config. Ejemplo:
```bash
SITE_URL=https://sanacion2.eluno.org npm run build
```

### 5.2 MP3s no incluidos en dist/ automáticamente

Los MP3 generados en `audiobook/audio/` no se copian al `dist/` durante el build. Había que copiarlos manualmente antes de cada deploy.

**Recomendación**: El build (o un flag `--include-audio`) debería copiar los MP3 referenciados en `media.json` al `dist/` correspondiente, respetando el límite de 25 MB de Cloudflare Pages.

---

## 6. Scripts ad-hoc creados

| Script | Propósito | Debería estar en core? |
|--------|-----------|----------------------|
| `scripts/fix-terms.js` | Normalizar claves `{term:}` (espacios→guiones) + agregar términos faltantes al glosario | Sí — como validación en QA o pre-build |
| `scripts/fix-term-case.js` | Convertir títulos del glosario a minúscula | Sí — como regla del generador de glosario |
| `scripts/fix-tts-pronunciation.js` | Corregir pronunciación TTS con tildes | Sí — como hook configurable en extract/generate |

---

## 7. Pipeline ideal (propuesto)

```
/write:prepare        → Prepara prompt, research, fuentes
/write:step1          → Primera mitad del capítulo
/write:step2          → Segunda mitad del capítulo
/write:qa             → QA, ensamblaje JSON, validación de {term:} format
/write:glossary       → Genera/actualiza glosario (EN + ES, lowercase)
─── validación ───
validate:terms        → Verifica {term:} ⊆ glossary, formato kebab-case
validate:glossary     → Verifica títulos lowercase, definiciones completas
─── integración ───
integrate             → Copia a i18n/, limpia archivos antiguos
translate --throttle  → Traduce con rate limiting automático
─── build ───
build [--site-url X]  → Build HTML con glosario validado
─── audio ───
audio:extract         → Extrae texto TTS con glosario
audio:fix-pronunciation → Aplica correcciones de pronunciación (configurable)
audio:generate        → Genera MP3s
audio:concat          → Concatena libro completo
audio:tag             → Tags ID3
audio:link            → Actualiza media.json automáticamente
─── deploy ───
deploy:pages          → CF Pages (HTML + MP3 < 25MB)
deploy:static         → static.eluno.org (MP3 > 25MB)
```
