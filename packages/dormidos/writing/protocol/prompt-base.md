# PROMPT BASE: Instrucciones Estables para Escritura de Capitulos

> Este archivo contiene las instrucciones que NO cambian entre capitulos.
> Se incluye por referencia en cada PROMPT_CHXX.md.
> Version: 1.0 — Marzo 2026

---

## CONTEXTO DEL PROYECTO

**"Dormidos — El Sueno de la Conciencia" (dormidos.eluno.org)** — Exploracion del sueno de la conciencia humana integrando dos corrientes profundas: el Cuarto Camino de Gurdjieff (buffers, identificacion, auto-observacion, organo Kundabuffer) con la perspectiva del Material Ra (Ley del Uno, 1981-1984). 24 capitulos, idioma unico ES. Autorizado por L/L Research, 10 Enero 2026.

---

## DOCUMENTOS DE REFERENCIA

Estos archivos contienen las reglas detalladas. **Leelos ANTES de escribir.**

| Archivo | Que contiene | Secciones criticas |
|---------|-------------|-------------------|
| `writing/protocol/book-identity.md` | Identidad del libro, voz, tono, estructura, terminologia | Todo |
| `writing/protocol/writing-protocol.md` | Protocolo de escritura, fases, entregables | Todo |
| `writing/protocol/qa-protocol.md` | QA de lectura post-escritura | Categorias de QA |
| `writing/protocol/source-hierarchy.md` | Jerarquia de fuentes y reglas de uso | Todo |
| `writing/protocol/references.json` | Categorias y claves de referencias cruzadas | Categorias validas |

**Regla:** Si hay conflicto entre este prompt y los documentos de referencia, los documentos de referencia prevalecen.

---

## FUENTES Y COMO USARLAS

### Archivos de fuentes primarias

Los textos de Ra y Q'uo estan disponibles como archivos `.md` en el proyecto. Son archivos de texto plano, buscables directamente.

| Archivo | Contenido | Uso |
|---------|-----------|-----|
| `the_ra_contact_volume_1.md` | Ra sesiones 1-56 | **FUENTE PRIMARIA.** Unica autoridad para el texto. |
| `the_ra_contact_volume_2.md` | Ra sesiones 57-106 | **FUENTE PRIMARIA.** Unica autoridad para el texto. |
| `ll_research_archive_volume_09.md` | Q'uo Vol 9 | Contexto y tono. NUNCA en texto final. |
| `ll_research_archive_volume_10.md` | Q'uo Vol 10 | Contexto y tono. NUNCA en texto final. |
| `ll_research_archive_volume_11.md` | Q'uo Vol 11 | Contexto y tono. NUNCA en texto final. |

### Tradicion del Cuarto Camino (fuente de nivel 3)

Los conceptos de Gurdjieff, Ouspensky y Jeanne de Salzmann se usan como fuente complementaria conceptual. NO se cargan como archivos — se accede a ellos desde el conocimiento del escritor.

**Reglas de uso del Cuarto Camino:**
- Integrar conceptos como paralelos naturales a la perspectiva Ra.
- NUNCA mencionar a Gurdjieff, Ouspensky o de Salzmann por nombre en el texto final.
- NUNCA citar textualmente obras del Cuarto Camino.
- Los conceptos deben sentirse como descubrimientos propios del texto, no prestamos.
- La convergencia entre Ra y el Cuarto Camino es la contribucion unica de este libro.
- Cuando ambas tradiciones dicen lo mismo de forma diferente, dejar que la convergencia hable por si misma.

### Como buscar en los .md

Los archivos siguen el formato:
```
**XX.YY** QUESTIONER [pregunta]
R A I am Ra. [respuesta]
```

Donde XX = sesion, YY = pregunta. Busca por numero de sesion (ej: "**13.5**") para localizar pasajes especificos.

### Reglas de uso (detalle completo en `source-hierarchy.md`)

- **Ra:** Parafrasear con integridad. NUNCA citar textualmente. Se permite ecoar frases memorables sin atribucion.
- **Q'uo:** Leer para entender matices y tono. NUNCA aparece en el texto final.
- **Cuarto Camino:** Conceptos parafraseados. NUNCA citar textualmente. NUNCA mencionar autores por nombre.
- **Ninguna fuente se menciona jamas en el texto final.**

---

## OMISION DE PROCEDENCIA EXTRATERRESTRE

### El contexto

Este libro escribe las ensenanzas de Ra desde su voz, integradas con la tradicion del Cuarto Camino. Eso se hace explicito cuando el mensaje mira a la Tierra desde fuera o comunica algo que excede el alcance humano ordinario. Pero NO es necesario hacerlo explicito en cada tema que se presenta.

El proposito del libro es despertar al lector a la posibilidad de que vive dormido. No es facil recibir este mensaje si ademas viene de fuentes extraterrestres.

### La regla

No modificamos el mensaje. Somos fieles a la palabra de Ra. Pero cuando la procedencia extraterrestre puede omitirse SIN alterar la validez, pureza y verdad del mensaje, se omite.

- Mal: "lo que vuestros psicologos han observado..." (marca otredad innecesaria)
- Bien: "lo que los psicologos han observado..." (mismo mensaje, sin barrera)

### Cuando SI hacer explicita la perspectiva externa

- Cuando el mensaje REQUIERE mirar la Tierra desde fuera
- Cuando se comunica informacion que excede el alcance humano ordinario
- Cuando la perspectiva "nosotros/ustedes" ES el mensaje

---

## SISTEMA DE PROVENIENCIA {src:}

### Mapeo
`{src:13.5}` -> `https://www.lawofone.info/s/13#5`

### Reglas durante la escritura
1. Coloca `{src:XX.YY}` al final de cada parrafo.
2. Si el siguiente parrafo usa la MISMA fuente, no repitas.
3. Cuando cambie la fuente, coloca la nueva marca.
4. Fuentes multiples: `{src:13.5,15.21,27.6}`
5. Rangos consecutivos: `{src:13.5-13.9}`
6. Sintesis general: `{src:synthesis}`
7. Integracion Cuarto Camino: `{src:4w}` o `{src:4w+13.5}`

Las marcas `{src:}` son metadata de trabajo. Se eliminan del JSON final publicable.

---

## MARCAS DE TRACKING

| Marca | Uso | Va en JSON final? |
|-------|-----|---------------------|
| `{term:keyword}` | Primera mencion significativa de termino del glosario | Si |
| `{ref:category:id}` | Conexion natural con psicologia/filosofia/tradiciones | Si |
| `{src:XX.YY}` | Proveniencia -> lawofone.info | Solo metadata |

### Regla de formato {term:keyword}
`{term:keyword}` DEBE ser kebab-case: minusculas, guiones, sin espacios.
- Correcto: `{term:auto-observacion}`, `{term:sueno-de-la-conciencia}`, `{term:buffers}`
- Incorrecto: `{term:Auto Observacion}`, `{term:Sueno de la Conciencia}`, `{term:Buffers}`

---

## MODO DE EJECUCION

El prompt de cada capitulo (PROMPT_CHXX.md) define el contenido especifico. Este prompt base define COMO trabajar. La secuencia es:

### Fase 1 — Investigacion (silenciosa)
- Lee los documentos de referencia
- Busca en los .md de Ra TODAS las sesiones relevantes indicadas en el prompt del capitulo
- Busca sesiones adicionales que sean relevantes
- Lee Q'uo para contexto y tono
- Identifica que dice Ra que la v1 no cubre

### Fase 2 — Escritura ES
- Escribe el capitulo completo en espanol
- Incluye todas las marcas ({term:}, {ref:}, {src:})
- Sigue estrictamente `book-identity.md` para voz y tono

### Fase 3 — Entregables JSON
Genera los 3 archivos finales:

#### A) `es.json` — Capitulo en espanol
```json
{
  "id": "chX",
  "number": X,
  "numberText": "Capitulo ...",
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
- `numberText` usa el formato: "Capitulo Uno", "Capitulo Dos", etc.

#### B) `glossary.json` — Glosario del capitulo
```json
[
  {
    "keyword": "sueno-de-la-conciencia",
    "title": "sueno de la conciencia",
    "definition": "..."
  }
]
```
Cada definicion debe leerse independientemente del capitulo.
Titulos en minuscula por defecto. Solo mayuscula en nombres propios (Creador Infinito, Yo Superior, Logos).

#### C) `provenance.json` — Mapa de proveniencia
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
          "note": "Descripcion breve del concepto"
        }
      ]
    }
  ]
}
```

**Nota:** Dormidos es un libro ES-only. No hay fases de traduccion.

---

## TARGET DE CALIDAD (calibrar por capitulo)

- Cada afirmacion rastreable a una sesion especifica de Ra
- Conceptos del Cuarto Camino integrados organicamente, nunca forzados
- NUNCA mencionar fuentes (ni Ra, ni Gurdjieff, ni Q'uo)
- La prosa debe ser directa y clara, sin ser fria
- Tono urgente pero compasivo — "el tiempo apremia" pero sin alarmar
- Oraciones preferiblemente <20 palabras
- Parrafos de 3-4 oraciones
- Variar entre parrafos cortos (enfasis) y largos (explicacion)
- Transiciones naturales ("Sin embargo...", "Y aun asi...", no "En conclusion...")

---

## PUBLICACION DE FUENTES

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
