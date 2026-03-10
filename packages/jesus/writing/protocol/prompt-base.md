# PROMPT BASE: Instrucciones Estables para Escritura de Capítulos

> Este archivo contiene las instrucciones que NO cambian entre capítulos.
> Se incluye por referencia en cada PROMPT_CHXX.md.
> Versión: 1.0 — Marzo 2026

---

## CONTEXTO DEL PROYECTO

**"Jesús — El Camino del Amor" (jesus.eluno.org)** — Exploración de la figura de Jesús desde la perspectiva del Material Ra (Ley del Uno, 1981-1984), en diálogo con los Evangelios. No es teología ni doctrina religiosa, sino filosofía de la conciencia: quién fue Jesús como entidad de cuarta densidad, qué enseñó, y cómo su camino ilumina la evolución espiritual humana. 11 capítulos, idioma base ES, traducción a EN y PT.

---

## DOCUMENTOS DE REFERENCIA

Estos archivos contienen las reglas detalladas. **Léelos ANTES de escribir.**

| Archivo | Qué contiene | Secciones críticas |
|---------|-------------|-------------------|
| `writing/protocol/book-identity.md` | Identidad del libro, voz, tono, estructura, terminología | Todo |
| `writing/protocol/writing-protocol.md` | Protocolo de escritura, fases, entregables | Todo |
| `writing/protocol/qa-protocol.md` | QA de lectura post-escritura | Categorías de QA |
| `writing/protocol/source-hierarchy.md` | Jerarquía de fuentes y reglas de uso | Todo |
| `writing/protocol/references.json` | Categorías y claves de referencias cruzadas | Categorías válidas |

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

### Los Evangelios (fuente de nivel 3)

Los Evangelios canónicos (Mateo, Marcos, Lucas, Juan) se usan como fuente complementaria. NO se cargan como archivos — se accede a ellos desde el conocimiento del escritor.

**Reglas de uso de los Evangelios:**
- Ecoar las enseñanzas de Jesús de forma natural, como quien las conoce profundamente.
- NUNCA citar capítulo:versículo. No hay citas formales ("Mateo 5:44", "Juan 14:6").
- Las palabras de Jesús pueden resonar en la prosa, pero integradas en la voz del libro, no como citas textuales.
- Los paralelos evangélicos deben sentirse orgánicos, como si el autor y el lector compartieran una cultura donde esas enseñanzas son aire que se respira.
- Cuando Ra y los Evangelios convergen, dejar que la convergencia hable por sí misma. No forzar conexiones.

### Cómo buscar en los .md

Los archivos siguen el formato:
```
**XX.YY** QUESTIONER [pregunta]
R A I am Ra. [respuesta]
```

Donde XX = sesión, YY = pregunta. Busca por número de sesión (ej: "**17.11**") para localizar pasajes específicos.

### Reglas de uso (detalle completo en `source-hierarchy.md`)

- **Ra:** Parafrasear con integridad. NUNCA citar textualmente. Se permite ecoar frases memorables sin atribución.
- **Q'uo:** Leer para entender matices y tono. NUNCA aparece en el texto final.
- **Evangelios:** Ecoar naturalmente. NUNCA citar capítulo:versículo. NUNCA como cita textual entrecomillada.
- **Ciencia/filosofía:** Integrar donde sea natural. NUNCA contradecir a Ra. NUNCA forzar conexiones.
- **Ninguna fuente se menciona jamás en el texto final.**

---

## OMISIÓN DE PROCEDENCIA EXTRATERRESTRE

### El contexto

Este libro escribe las enseñanzas de Ra desde su voz. Eso se hace explícito cuando el mensaje mira a la Tierra desde fuera o comunica algo que excede el alcance humano ordinario. Pero NO es necesario hacerlo explícito en cada tema que se presenta.

El propósito del libro, además de presentar la información, es ayudar a que las personas puedan *recibirla*. No es fácil recibir una reinterpretación de Jesús proveniente de fuentes extraterrestres. En la Tierra, la protección más efectiva contra el tema UFO fue etiquetarlo de ridículo en la opinión pública. Esto genera intrínsecamente un rechazo —incluso inconsciente— en cualquier ser humano hacia cualquier mensaje con esa procedencia.

### La regla

No modificamos el mensaje. Somos fieles a la palabra de Ra. Pero cuando la procedencia extraterrestre de la voz narradora puede omitirse SIN alterar la validez, pureza y verdad del mensaje, se omite.

- ✗ "lo que vuestros profetas enseñaron..." (marca otredad innecesaria)
- ✓ "lo que los profetas enseñaron..." (mismo mensaje, sin barrera)

Este libro será leído en la Tierra. Decir "los profetas" en lugar de "vuestros profetas" no altera en nada la enseñanza. Pero elimina una barrera que podría impedir que el lector la reciba.

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
8. Eco evangélico: `{src:gospel}` o `{src:gospel+17.11}`

Las marcas `{src:}` son metadata de trabajo. Se eliminan del JSON final publicable.

---

## MARCAS DE TRACKING

| Marca | Uso | ¿Va en JSON final? |
|-------|-----|---------------------|
| `{term:keyword}` | Primera mención significativa de término del glosario | ✓ Sí |
| `{ref:category:id}` | Conexión natural con ciencia/filosofía/tradiciones | ✓ Sí |
| `{src:XX.YY}` | Proveniencia → lawofone.info | ✗ Solo metadata |

---

## NOTAS DE TRADUCCIÓN (ES → EN)

### Dirección de traducción

El idioma base de este libro es **español**. Las traducciones se generan hacia inglés (principal) y portugués (secundario).

### Terminología ES → EN

| Español | English | Nota |
|---------|---------|------|
| errante | Wanderer | Capitalizado |
| el Verbo | the Word | Capitalizado |
| centro de energía | energy center | NUNCA "chakra" |
| densidad | density | NUNCA "dimension" |
| cosecha | harvest | No "judgment" ni "rapture" |
| catalizador | catalyst | No "challenge" |
| distorsión | distortion | No "alteration" |
| complejo mente/cuerpo/espíritu | mind/body/spirit complex | Término Ra completo |
| el Creador | the Creator | |
| Infinito Inteligente | Intelligent Infinity | Capitalizado |
| Energía Inteligente | Intelligent Energy | Capitalizado |
| la Elección | the Choice | Capitalizado |
| libre albedrío | free will | |
| servicio a otros | service to others | |
| los Logos | Logoi | Aceptable en EN |
| encarnación | incarnation | No "embodiment" genérico |
| Yo Superior | Higher Self | |

### Terminología ES → PT

| Español | Português | Nota |
|---------|-----------|------|
| errante | errante | Misma palabra |
| el Verbo | o Verbo | |
| centro de energía | centro de energia | Sin acento en PT |
| densidad | densidade | |
| cosecha | colheita | |
| los Logos | os Logos | NUNCA "Logoi" |

### "los Logos" → contexto por idioma

En español y portugués, el plural de Logos es **"Logos"** invariable: "los Logos", "os Logos". NUNCA "Logoi". En inglés, "Logoi" es aceptable — Don Elkins lo usó y la comunidad anglófona lo reconoce.

### Cadenas prohibidas

Las siguientes palabras NUNCA deben aparecer en el texto español:

- `dimensión` (en contexto de densidad — usar siempre "densidad")
- `curación` (usar siempre "sanación" donde aplique)

---

## MODO DE EJECUCIÓN

El prompt de cada capítulo (PROMPT_CHXX.md) define el contenido específico. Este prompt base define CÓMO trabajar. La secuencia es:

### Fase 1 — Investigación (silenciosa)
- Lee los documentos de referencia
- Busca en los .md de Ra TODAS las sesiones relevantes indicadas en el prompt del capítulo
- Busca sesiones adicionales que sean relevantes
- Lee Q'uo para contexto y tono
- Identifica qué dice Ra que la v1 no cubre

### Fase 2 — Escritura ES
- Escribe el capítulo completo en español
- Incluye todas las marcas ({term:}, {ref:}, {src:})
- Sigue estrictamente `book-identity.md` para voz y tono

### Fase 3 — Entregables JSON
Genera los 3 archivos finales:

#### A) `chXX_ES.json` — Capítulo en español
```json
{
  "id": "chX",
  "number": X,
  "numberText": "Capítulo ...",
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
- `numberText` usa el formato: "Capítulo Uno", "Capítulo Dos", "Capítulo Tres", etc.

#### B) `chXX_glossary.json` — Glosario del capítulo
```json
[
  {
    "keyword": "verbo",
    "title": "El Verbo",
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
          "sources": ["17.11", "17.12"],
          "urls": [
            "https://www.lawofone.info/s/17#11",
            "https://www.lawofone.info/s/17#12"
          ],
          "note": "Descripción breve del concepto"
        }
      ]
    }
  ]
}
```

**Nota:** La traducción a EN y PT se ejecuta con Sonnet en Claude Code. Build: `npm run build`.

---

## TARGET DE CALIDAD (calibrar por capítulo)

- Cada afirmación rastreable a una sesión específica de Ra
- Paralelos evangélicos orgánicos, nunca forzados
- Nunca contradecir la fe cristiana — complementarla
- No citar capítulo:versículo de los Evangelios
- Filosofía de la conciencia, no teología
- Ciencia/filosofía integrada donde sea natural, no forzada
- La prosa debe ser bella sin ser pretenciosa
- Oraciones preferiblemente <20 palabras
- Párrafos de 3-4 oraciones
- Variar entre párrafos cortos (énfasis) y largos (explicación)
- Transiciones naturales ("Sin embargo...", "Y aun así...", no "En conclusión...")

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
