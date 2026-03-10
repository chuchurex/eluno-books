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
3. Verifica que la categoría (bibl:, trad:, hist:, phil:, psych:) sea la correcta
4. Reporta cualquier mismatch o referencia inexistente

**Error típico:** Escribir `{ref:bibl:sermon-mount}` cuando la clave real es `trad:sermon-mount`.

### B) NOMBRES PROPIOS FANTASMA
Cuando el texto usa `{ref:}` como sujeto gramatical o atribución, el nombre propio
DEBE aparecer en la prosa, no solo en el tag.

**Test:** Lee cada oración con `{ref:}` reemplazando el tag por "[enlace]".
¿La oración tiene sentido sin hover/click?

**Error típico:**
- ✗ "La parábola que {ref:bibl:prodigal-son} describe..." → "La parábola que [enlace] describe..."
- ✓ "La parábola del hijo pródigo {ref:bibl:prodigal-son}..." → "La parábola del hijo pródigo [enlace]..."

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
   - ✗ "your scientists", "your planet's minerals"
   - ✓ "scientists have found", "the minerals of this world"
2. ¿Se revela explícitamente un origen no-humano del autor?
   - ✗ "we, who observe from beyond"
   - ✓ "from a broader perspective, it becomes clear that..."

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
| Wanderer / Errante | Starseed |
| Energy center / Centro de energía | Chakra (excepto primera explicación) |
| Catalyst / Catalizador | Problem / Problema |
| Distortion / Distorsión | Error (como sinónimo) |
| Mind/body/spirit complex | Person (en contexto técnico) |
| Density / Densidad | Dimension / Dimensión |
| The Creator / El Creador | God / Dios (excepto en contexto evangélico natural) |
| Harvest / Cosecha | Judgment / Juicio, Rapture / Rapto |
| The Choice / La Elección | — |
| Free will / Libre albedrío | — |
| Incarnation / Encarnación | Embodiment (genérico) |

### I) ATRIBUCIONES PROHIBIDAS
El texto NO debe contener ninguna mención de:
- Ra, Q'uo, Don Elkins, Carla Rueckert, Jim McCarty
- "channeled material", "the sessions", "the instrument"
- "the Law of One material", "the Ra Contact"
- Cualquier referencia directa a fuentes
- Citas bíblicas textuales con capítulo:versículo (e.g., "Juan 3:16", "Mateo 5:3")

### J) PARALELOS EVANGÉLICOS
Verificar que los ecos de los Evangelios en el texto son:
1. Orgánicos — surgen naturalmente del argumento, no insertados a la fuerza
2. Parafraseados — nunca citas textuales de la Biblia
3. Sin referencia — nunca incluyen capítulo:versículo
4. Complementarios — muestran convergencia, no dependen del texto bíblico

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
[Markup duplicado, terminología incorrecta, atribuciones, citas bíblicas]

### OBSERVACIONES (mejoras opcionales)
[Oraciones largas, posesivos, transiciones, paralelos forzados]

### VEREDICTO
- PASA — listo para JSONs
- PASA CON CORRECCIONES — lista de cambios necesarios antes de JSONs
- NO PASA — requiere reescritura parcial
```

---

## INTEGRACIÓN EN EL FLUJO

El flujo actualizado con QA es:

```
PROMPT 1: Investigación → índice temático
    ↓
PROMPT 2: Estructura → plan de secciones
    ↓
PROMPT 3: Escritura → texto + {term:} + {src:}
    ↓
PROMPT 4: Correcciones → iterar hasta aprobado
    ↓
PROMPT 4.5: QA DE LECTURA → reporte + correcciones
    ↓
PROMPT 5: Registros → términos + proveniencia + notas
    ↓
PROMPT 6: JSON capítulo → limpio
    ↓
PROMPT 7: Glosario JSON
    ↓
PROMPT 8: Proveniencia JSON
    ↓
PROMPT 9: Traducción EN
    ↓
PROMPT 9.5: QA DE TRADUCCIÓN EN → reporte + correcciones
    ↓
PROMPT 10: Traducción PT
    ↓
PROMPT 10.5: QA DE TRADUCCIÓN PT → reporte + correcciones
```

---

## NOTAS DE IMPLEMENTACIÓN

- **El QA es automático.** No requiere prompt del operador — Claude lo ejecuta
  como parte del flujo después de que el operador aprueba el contenido.
- **El QA es bloqueante.** Si el veredicto es NO PASA o PASA CON CORRECCIONES, se corrige ANTES de avanzar a JSONs.
- **El QA de traducción** verifica los mismos puntos más:
  - ¿Todas las {ref:} y {term:} se mantuvieron idénticas?
  - ¿La terminología es equivalente (errante→Wanderer, densidad→density→densidade)?
  - ¿La voz sapiencial se mantiene en el idioma destino?
  - ¿Es prosa natural, no traducción literal?

---

*Versión: 1.0 — Marzo 2026*
*Adaptado del protocolo QA de eluno para el libro Jesús.*
