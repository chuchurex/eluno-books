# PROMPT BASE: Instrucciones Estables para Escritura de Capítulos

> Este archivo contiene las instrucciones que NO cambian entre capítulos.
> Se incluye por referencia en cada PROMPT_CHXX.md.
> Versión: 1.0 — Marzo 2026

---

## CONTEXTO DEL PROYECTO

**"Sanación" (sanacion.eluno.org)** — Exploración de los principios de sanación desde la perspectiva del Material Ra (Ley del Uno, 1981-1984). No es medicina alternativa ni promesas de curación, sino comprensión de cómo funciona la sanación a nivel de conciencia. 11 capítulos, idioma base EN, traducción a ES. Autorizado por L/L Research, 10 Enero 2026.

---

## DOCUMENTOS DE REFERENCIA

Estos archivos contienen las reglas detalladas. **Léelos ANTES de escribir.**

| Archivo | Qué contiene | Secciones críticas |
|---------|-------------|-------------------|
| `book-identity.md` | Identidad del libro, voz, tono, estructura, terminología | Todo |
| `qa-protocol.md` | QA de lectura post-escritura | Categorías de QA |
| `source-hierarchy.md` | Jerarquía de fuentes y reglas de uso | Todo |
| `references.json` | Categorías y claves de referencias cruzadas | Categorías válidas |

**Regla:** Si hay conflicto entre este prompt y los documentos de referencia, los documentos de referencia prevalecen.

---

## FUENTES Y CÓMO USARLAS

### Archivos de fuentes primarias

Los textos de Ra y Q'uo están disponibles como archivos `.md` en el proyecto. Son archivos de texto plano, buscables directamente.

| Archivo | Contenido | Uso |
|---------|-----------|-----|
| `the_ra_contact_volume_1.md` | Ra sesiones 1-56 | **FUENTE PRIMARIA.** Única autoridad para el texto. |
| `the_ra_contact_volume_2.md` | Ra sesiones 57-106 | **FUENTE PRIMARIA.** Única autoridad para el texto. |
| `ll_research_archive_volume_09.md` | Q'uo Vol 9 | Contexto y tono. NUNCA en texto final. |
| `ll_research_archive_volume_10.md` | Q'uo Vol 10 | Contexto y tono. NUNCA en texto final. |
| `ll_research_archive_volume_11.md` | Q'uo Vol 11 | Contexto y tono. NUNCA en texto final. |

### Cómo buscar en los .md

Los archivos siguen el formato:
```
**XX.YY** QUESTIONER [pregunta]
R A I am Ra. [respuesta]
```

Donde XX = sesión, YY = pregunta. Busca por número de sesión (ej: "**13.5**") para localizar pasajes específicos.

### Reglas de uso (detalle completo en `source-hierarchy.md`)

- **Ra:** Parafrasear con integridad. NUNCA citar textualmente. Se permite ecoar frases memorables sin atribución.
- **Q'uo:** Leer para entender matices y tono. NUNCA aparece en el texto final.
- **Ciencia/filosofía:** Integrar donde sea natural. NUNCA contradecir a Ra. NUNCA forzar conexiones.
- **Ninguna fuente se menciona jamás en el texto final.**

---

## OMISIÓN DE PROCEDENCIA EXTRATERRESTRE

### El contexto

Este libro escribe las enseñanzas de Ra desde su voz. Eso se hace explícito cuando el mensaje mira a la Tierra desde fuera o comunica algo que excede el alcance humano ordinario. Pero NO es necesario hacerlo explícito en cada tema que se presenta.

El propósito del libro, además de presentar la información, es ayudar a que las personas puedan *recibirla*. No es fácil recibir información sobre la sanación proveniente de fuentes extraterrestres. En la Tierra, la protección más efectiva contra el tema UFO fue etiquetarlo de ridículo en la opinión pública. Esto genera intrínsecamente un rechazo —incluso inconsciente— en cualquier ser humano hacia cualquier mensaje con esa procedencia.

### La regla

No modificamos el mensaje. Somos fieles a la palabra de Ra. Pero cuando la procedencia extraterrestre de la voz narradora puede omitirse SIN alterar la validez, pureza y verdad del mensaje, se omite.

- ✗ "lo que vuestros científicos han descubierto..." (marca otredad innecesaria)
- ✓ "lo que los científicos han descubierto..." (mismo mensaje, sin barrera)

Este libro será leído en la Tierra. Decir "los científicos" en lugar de "vuestros científicos" no altera en nada la enseñanza. Pero elimina una barrera que podría impedir que el lector la reciba.

### Cuándo SÍ hacer explícita la perspectiva externa

- Cuando el mensaje REQUIERE mirar la Tierra desde fuera
- Cuando se comunica información que excede el alcance humano ordinario
- Cuando la perspectiva "nosotros/ustedes" ES el mensaje (por ejemplo, al hablar de la Confederación observando la cosecha de la Tierra)

---

## SISTEMA DE PROVENIENCIA {src:}

### Mapeo
`{src:13.5}` → `https://www.lawofone.info/s/13#5`

### Reglas durante la escritura
1. Coloca `{src:XX.YY}` al final de cada párrafo.
2. Si el siguiente párrafo usa la MISMA fuente, no repitas.
3. Cuando cambie la fuente, coloca la nueva marca.
4. Fuentes múltiples: `{src:13.5,15.21,27.6}`
5. Rangos consecutivos: `{src:13.5-13.9}`
6. Síntesis general: `{src:synthesis}`
7. Ciencia/filosofía: `{src:external}` o `{src:external+13.5}`

Las marcas `{src:}` son metadata de trabajo. Se eliminan del JSON final publicable.

---

## MARCAS DE TRACKING

| Marca | Uso | ¿Va en JSON final? |
|-------|-----|---------------------|
| `{term:keyword}` | Primera mención significativa de término del glosario | ✓ Sí |
| `{ref:category:id}` | Conexión natural con ciencia/filosofía/tradiciones | ✓ Sí |
| `{src:XX.YY}` | Proveniencia → lawofone.info | ✗ Solo metadata |

---

## NOTAS DE TRADUCCIÓN (EN → ES)

### Terminología específica de sanación

En este libro, la terminología de sanación tiene equivalencias estrictas que deben mantenerse en la traducción al español.

| Inglés | Español correcto | Español incorrecto | Nota |
|--------|-----------------|-------------------|------|
| healing | sanación | curación | "Curación" implica resultado garantizado. "Sanación" implica proceso y restauración de la plenitud. |
| energy center | centro de energía | chakra | "Chakra" solo en primera explicación como referencia conocida. |
| blockage | bloqueo | problema, tema | Mantener el término técnico Ra. |
| catalyst | catalizador | desafío, problema | Mantener el término Ra. |
| balancing | equilibrio | arreglar, corregir | "Equilibrio" captura la idea de restauración, no de reparación. |
| mind/body/spirit complex | complejo mente/cuerpo/espíritu | persona (en contexto técnico) | Usar el término completo de Ra en contexto técnico. |
| distortion | distorsión | alteración, cambio | El término tiene significado técnico específico. |
| density | densidad | dimensión | Nunca "dimensión". |
| harvest | cosecha | juicio, rapto | Evitar connotaciones religiosas. |
| wanderer | errante | starseed | "Starseed" solo en nota explicativa. |

### "Logoi" → español: usar "los Logos"

En inglés, "Logoi" es aceptable como plural de Logos — Don Elkins lo usó y la comunidad anglófona lo reconoce. Pero en español, la palabra "Logos" apenas es comprendida en su significado espiritual. El plural latino "Logoi" agrega una barrera completamente innecesaria. Usar "Logoi" en español sería priorizar la fidelidad filológica sobre la comprensión del lector, lo cual contradice el propósito del libro.

**Regla:** En español (y portugués), el plural de Logos es **"Logos"** invariable: "los Logos", "cada uno de los Logos". NUNCA "Logoi".

### Otras equivalencias generales

| Inglés | Español correcto | Español incorrecto | Nota |
|--------|-----------------|-------------------|------|
| invested (itself) | se volcó en, se vertió hacia, se entregó a | se invirtió | "Invertir" en español es ambiguo: ¿dinero o dar vuelta? El sentido es que el Infinito vertió todo su ser hacia la exploración. |
| ray | rayo | chakra | "Chakra" solo en primera explicación. |

---

## MODO DE EJECUCIÓN

El prompt de cada capítulo (PROMPT_CHXX.md) define el contenido específico. Este prompt base define CÓMO trabajar. La secuencia es:

### Fase 1 — Investigación (silenciosa)
- Lee los documentos de referencia
- Busca en los .md de Ra TODAS las sesiones relevantes indicadas en el prompt del capítulo
- Busca sesiones adicionales que sean relevantes
- Lee Q'uo para contexto y tono
- Identifica qué dice Ra que la v1 no cubre

### Fase 2 — Escritura EN
- Escribe el capítulo completo en inglés
- Incluye todas las marcas ({term:}, {ref:}, {src:})
- Sigue estrictamente `book-identity.md` para voz y tono

### Fase 3 — Entregables JSON
Genera los 3 archivos finales:

#### A) `chXX_EN.json` — Capítulo en inglés
```json
{
  "id": "chX",
  "number": X,
  "numberText": "Chapter ...",
  "title": "...",
  "sections": [
    {
      "id": "chX-section-id",
      "title": "...",
      "content": [
        {"type": "paragraph", "text": "..."}
      ]
    }
  ]
}
```
- SIN marcas {src:}
- CON marcas {term:} y {ref:}
- Estructura idéntica a `ch01_EN.json`

#### B) `chXX_glossary.json` — Glosario del capítulo
```json
[
  {
    "keyword": "infinite",
    "title": "The Infinite",
    "definition": "..."
  }
]
```
Cada definición debe leerse independientemente del capítulo.

#### C) `chXX_provenance.json` — Mapa de proveniencia
```json
{
  "chapter": "chX",
  "title": "...",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [
    {
      "section_id": "chX-section-id",
      "section_title": "...",
      "segments": [
        {
          "paragraphs": [1, 2, 3],
          "sources": ["13.5", "13.6"],
          "urls": [
            "https://www.lawofone.info/s/13#5",
            "https://www.lawofone.info/s/13#6"
          ],
          "note": "Descripción breve del concepto"
        }
      ]
    }
  ]
}
```

**Nota:** La traducción a ES se ejecuta con Sonnet en Claude Code.

---

## TARGET DE CALIDAD (calibrar por capítulo)

- Cada afirmación rastreable a una sesión específica de Ra
- Ciencia/filosofía integrada donde sea natural, no forzada
- La prosa debe ser bella sin ser pretenciosa
- Oraciones preferiblemente <20 palabras
- Párrafos de 3-4 oraciones
- Variar entre párrafos cortos (énfasis) y largos (explicación)
- Transiciones naturales ("Therefore...", "Yet...", no "In conclusion...")
- Advertencia sobre medicina convencional integrada de forma natural donde sea relevante (NO como disclaimer genérico)

---

## PUBLICACIÓN DE FUENTES

Este sistema de prompts se publicará junto al libro como parte de la documentación del proyecto. Las fuentes originales y sus enlaces:

| Fuente | Origen | URL |
|--------|--------|-----|
| Ra Contact Vol 1 | L/L Research | https://assets.llresearch.org/books/the_ra_contact_volume_1.pdf |
| Ra Contact Vol 2 | L/L Research | https://assets.llresearch.org/books/the_ra_contact_volume_2.pdf |
| Q'uo Vol 9 | L/L Research | https://assets.llresearch.org/books/ll_research_archive_volume_09.pdf |
| Q'uo Vol 10 | L/L Research | https://assets.llresearch.org/books/ll_research_archive_volume_10.pdf |
| Q'uo Vol 11 | L/L Research | https://assets.llresearch.org/books/ll_research_archive_volume_11.pdf |
| lawofone.info | Tobey Wheelock | https://www.lawofone.info |

---

*PROMPT_BASE v1.0 — Marzo 2026*
