# QA DE LECTURA — Protocolo Post-Escritura
## Paso intermedio entre escritura (Prompt 3-4) y entrega de JSONs (Prompt 6)

> **Cuándo ejecutar:** Después de que el texto esté aprobado por el operador (post-Prompt 4),
> ANTES de generar los registros de tracking (Prompt 5) y los JSONs finales (Prompt 6).
>
> **Quién ejecuta:** Claude, automáticamente como parte del flujo de escritura.
>
> **Principio:** La escritura tiene puntos ciegos que solo se detectan en la lectura.
> Este paso es una "lectura fría" del texto producido, buscando errores que el escritor
> no ve porque está inmerso en la creación.

---

## INSTRUCCIONES PARA CLAUDE

Acabas de terminar de escribir el capítulo y el operador lo ha aprobado en su contenido.
Ahora vas a realizar un QA de lectura. Esto significa: RELEER todo el texto como si fueras
un lector que lo ve por primera vez, buscando las categorías de errores listadas abajo.

**Modo de lectura:** No estás verificando fidelidad a Ra (eso ya se hizo en la escritura).
Estás buscando errores de EXPERIENCIA DE LECTURA — cosas que funcionan en la escritura
pero no funcionan cuando alguien lee el texto de corrido.

---

## CATEGORÍAS DE QA

### A) REFERENCIAS FANTASMA
Toda marca `{ref:category:id}` usada en el texto DEBE existir como clave en `references.json`.

**Verificación:**
1. Extrae TODAS las marcas `{ref:...}` del capítulo
2. Lista cada una con la clave que debería tener en references.json
3. Verifica que la categoría (phys:, astro:, trad:, text:, phil:, math:) sea la correcta
4. Reporta cualquier mismatch o referencia inexistente

**Error típico:** Escribir `{ref:phys:spiral-galaxies}` cuando la clave real es `astro:spiral-galaxies`.

### B) NOMBRES PROPIOS FANTASMA
Cuando el texto usa `{ref:}` como sujeto gramatical o atribución, el nombre propio
DEBE aparecer en la prosa, no solo en el tag.

**Test:** Lee cada oración con `{ref:}` reemplazando el tag por "[enlace]".
¿La oración tiene sentido sin hover/click?

**Error típico:**
- ❌ "La caverna que {ref:phil:plato-cave} describió..." → "La caverna que [enlace] describió..."
- ✅ "La caverna que Platón describió {ref:phil:plato-cave}..." → "La caverna que Platón describió [enlace]..."

**Regla:** Los tags `{ref:}` son ENRIQUECIMIENTO, nunca REEMPLAZO de información en prosa.

### C) MARKUP {term:} DUPLICADO
El protocolo de escritura dice: primera mención en el capítulo usa `{term:keyword}`,
menciones posteriores en el MISMO capítulo van sin markup.

**Verificación:**
1. Extrae TODOS los `{term:keyword}` del capítulo
2. Verifica que cada keyword aparezca marcado SOLO UNA VEZ
3. Si aparece más de una vez, la primera es correcta, las siguientes son error

### D) CONTENIDO REPETIDO ENTRE SECCIONES
Buscar párrafos o frases que aparezcan casi idénticos en dos secciones diferentes.
Esto ocurre cuando el escritor establece contexto en una sección y luego lo repite
innecesariamente en la siguiente porque no recuerda haberlo escrito.

**Test:** ¿Hay frases de 10+ palabras que aparezcan en más de una sección?

### E) VOZ Y OTREDAD
El texto usa perspectiva "nosotros/ustedes" donde "nosotros" habla DESDE AFUERA
de la experiencia humana. Pero debe ser SUTIL. Verificar:

1. ¿Se usa "your/vuestro/vosso" de maneras que marcan explícitamente otredad no-humana?
   - ❌ "your scientists", "your planet's minerals"
   - ✅ "scientists have found", "the minerals of this world"
2. ¿Se revela explícitamente un origen no-humano del autor?
   - ❌ "we, who observe from beyond"
   - ✅ "from a broader perspective, it becomes clear that..."

### F) COHERENCIA NARRATIVA
Leer el texto de corrido (todas las secciones en orden) y verificar:

1. ¿Hay saltos temáticos abruptos entre secciones?
2. ¿Las transiciones fluyen naturalmente?
3. ¿Se introduce un concepto en una sección y se usa en la siguiente sin re-explicar?
4. ¿El cierre del capítulo se siente como cierre natural de lo que se presentó?
5. ¿Se usa el tipo de cierre correcto según la distribución del Writing Protocol?

### G) ORACIONES Y PÁRRAFOS
- Oraciones: preferiblemente < 20 palabras. Marcar las > 30 palabras.
- Párrafos: 3-4 oraciones promedio. Marcar los > 6 oraciones.
- ¿Hay variedad entre párrafos cortos (énfasis) y largos (explicación)?

### H) TERMINOLOGÍA
Verificar uso estricto según tabla del Writing Protocol:

| Debe usar | NO debe usar |
|-----------|-------------|
| Healing / Sanación | Curing / Cura |
| Energy center / Centro de energía | Chakra (excepto primera explicación) |
| Catalyst / Catalizador | Problem / Problema |
| Distortion / Distorsión | Illness / Enfermedad |
| Mind/body/spirit complex | Person (en contexto técnico) |
| Density / Densidad | Dimension / Dimensión |
| Balancing / Equilibrio | Fixing / Arreglar |
| Blockage / Bloqueo | Issue / Tema |

### I) ATRIBUCIONES PROHIBIDAS
El texto NO debe contener ninguna mención de:
- Ra, Q'uo, Don Elkins, Carla Rueckert, Jim McCarty
- "channeled material", "the sessions", "the instrument"
- "the Law of One material", "the Ra Contact"
- Cualquier referencia directa a fuentes

### J) CALIDEZ Y ACCESIBILIDAD
Verificar que el texto suene como un amigo sabio, no como un manual de texto:

1. **Apertura** — ¿Engancha emocionalmente? ¿NO abre con referencia a capítulo anterior ni con definición?
2. **Voz directa** — ¿Se usa "you/your" más que "the being/the seeker/the one who"? Contar instancias.
   - Target: ratio "you/your" por 1000 palabras ≥ 25 (referencia: todo Ch1 = 30.4)
   - Red flag: ratio "the being/seeker" por 1000 palabras > 5
3. **Imágenes antes de conceptos** — ¿Hay experiencia humana reconocible ANTES de cada concepto abstracto?
4. **Accesibilidad** — ¿Un lector sin conocimiento del Material Ra puede seguir el texto?
5. **Densidad de {term:}** — ¿Hay ≤7 marcas `{term:}` en el capítulo? ¿Ninguna en la primera oración?
6. **Test del amigo** — ¿Suena como algo que le dirías a un amigo que busca comprender, o como una conferencia?

### K) JERGA RA FILTRADA
Terminología cruda del Material Ra que se filtra al texto sin contexto suficiente.
El lector NO conoce el Material Ra. Cada término técnico necesita anclaje experiencial.

**Palabras que NO deben aparecer sin contexto:**
- "entity" como sustituto de "you/someone/a person" — es jerga Ra, no lenguaje natural
- "mind/body/spirit complex" usado como etiqueta sin explicar primero qué son mente, cuerpo y espíritu por separado
- Nombres de rayos por color (green ray, blue ray, indigo, violet) sin explicar el sistema de centros de energía
- "first/second/third distortion" como numeración técnica sin contexto
- "the Creator" como sujeto sin haber establecido qué significa
- "intelligent infinity" sin anclaje experiencial previo
- "harvest/cosecha" sin contexto narrativo

**Test:** Reemplaza cada término técnico por "[???]". ¿La oración pierde sentido completamente?
Si sí → el término es un muleta, no una herramienta. Reescribir con experiencia primero.

**Error típico (v2 Ch1):**
- ❌ "If an entity is not in harmony with its circumstances, it feels a burning within"
- ✅ "If you are not in harmony with your circumstances, you feel a burning within"

---

## FORMATO DE REPORTE

El QA debe producir un reporte con esta estructura:

```
## QA DE LECTURA — Capítulo [N]: [Título]

### BUGS (rompen rendering)
[Lista de referencias rotas, categorías incorrectas, etc.]

### ISSUES NARRATIVOS (afectan experiencia de lectura)
[Nombres fantasma, contenido repetido, saltos de coherencia]

### ISSUES DE PROTOCOLO (violan las reglas)
[Markup duplicado, terminología incorrecta, atribuciones]

### OBSERVACIONES (mejoras opcionales)
[Oraciones largas, posesivos, transiciones]

### VEREDICTO
- 🟢 PASA — listo para JSONs
- 🟡 PASA CON CORRECCIONES — lista de cambios necesarios antes de JSONs
- 🔴 NO PASA — requiere reescritura parcial
```

---

## INTEGRACIÓN EN EL FLUJO

El flujo actualizado con QA es:

```
PROMPT 1: Investigación ──→ índice temático
    ↓
PROMPT 2: Estructura ──→ plan de secciones
    ↓
PROMPT 3: Escritura ──→ texto + {term:} + {src:}
    ↓
PROMPT 4: Correcciones ──→ iterar hasta aprobado
    ↓
★ PROMPT 4.5: QA DE LECTURA ──→ reporte + correcciones ★  ← NUEVO
    ↓
PROMPT 5: Registros ──→ términos + proveniencia + notas
    ↓
PROMPT 6: JSON capítulo ──→ limpio
    ↓
PROMPT 7: Glosario JSON
    ↓
PROMPT 8: Proveniencia JSON
    ↓
PROMPT 9: Traducción ES
    ↓
★ PROMPT 9.5: QA DE TRADUCCIÓN ──→ reporte + correcciones ★  ← NUEVO
    ↓
PROMPT 10: Traducción PT
    ↓
★ PROMPT 10.5: QA DE TRADUCCIÓN PT ──→ reporte + correcciones ★  ← NUEVO
```

---

## NOTAS DE IMPLEMENTACIÓN

- **El QA es automático.** No requiere prompt del operador — Claude lo ejecuta
  como parte del flujo después de que el operador aprueba el contenido.
- **El QA es bloqueante.** Si el veredicto es 🔴 o 🟡, se corrige ANTES de avanzar a JSONs.
- **El QA de traducción** verifica los mismos puntos más:
  - ¿Todas las {ref:} y {term:} se mantuvieron con keywords IDÉNTICOS al EN?
    Los keywords son IDs (ej: `{term:healing}`, no `{term:sanación}`). El glosario
    por idioma resuelve la traducción. Si el EN tiene 5 {term:}, el ES debe tener 5.
  - ¿La terminología es equivalente (density→densidad→densidade)?
  - ¿La voz sapiencial se mantiene en el idioma destino?
  - ¿Es prosa natural, no traducción literal?
  - ¿El ratio "tú/te/ti" vs "el ser/el buscador" es comparable al del EN?

---

*Versión: 1.0 — 12 Febrero 2026*
*Derivado del QA del Capítulo 1 que encontró: 3 refs rotas, 1 nombre fantasma,
1 markup duplicado, 1 contenido repetido, y varias observaciones menores.*
