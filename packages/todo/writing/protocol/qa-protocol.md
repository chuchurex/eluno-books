# QA DE LECTURA — Protocolo Post-Escritura
## Paso intermedio entre escritura (Prompt 3-4) y entrega de JSONs (Prompt 6)

> **Cuando ejecutar:** Despues de que el texto este aprobado por el operador (post-Prompt 4),
> ANTES de generar los registros de tracking (Prompt 5) y los JSONs finales (Prompt 6).
>
> **Quien ejecuta:** Claude, automaticamente como parte del flujo de escritura.
>
> **Principio:** La escritura tiene puntos ciegos que solo se detectan en la lectura.
> Este paso es una "lectura fria" del texto producido, buscando errores que el escritor
> no ve porque esta inmerso en la creacion.

---

## INSTRUCCIONES PARA CLAUDE

Acabas de terminar de escribir el capitulo y el operador lo ha aprobado en su contenido.
Ahora vas a realizar un QA de lectura. Esto significa: RELEER todo el texto como si fueras
un lector que lo ve por primera vez, buscando las categorias de errores listadas abajo.

**Modo de lectura:** No estas verificando fidelidad a Ra (eso ya se hizo en la escritura).
Estas buscando errores de EXPERIENCIA DE LECTURA — cosas que funcionan en la escritura
pero no funcionan cuando alguien lee el texto de corrido.

---

## CATEGORIAS DE QA

### A) REFERENCIAS Y TERMINOS
Toda marca `{ref:category:id}` usada en el texto DEBE existir como clave en `references.json`.
Todo `{term:keyword}` DEBE usar kebab-case (minusculas, guiones, sin espacios).

**Verificacion:**
1. Extrae TODAS las marcas `{ref:...}` del capitulo
2. Lista cada una con la clave que deberia tener en references.json
3. Verifica que la categoria (sci:, phil:, trad:, psych:) sea la correcta
4. Extrae TODOS los `{term:keyword}` y verifica formato kebab-case
5. Reporta cualquier mismatch, referencia inexistente o formato incorrecto

**Error tipico:** Escribir `{ref:sci:spiral-galaxies}` cuando la clave real es `phil:spiral-galaxies`.
**Error tipico:** Escribir `{term:Free Will}` en vez de `{term:free-will}`.

### B) NOMBRES PROPIOS FANTASMA
Cuando el texto usa `{ref:}` como sujeto gramatical o atribucion, el nombre propio
DEBE aparecer en la prosa, no solo en el tag.

**Test:** Lee cada oracion con `{ref:}` reemplazando el tag por "[enlace]".
La oracion tiene sentido sin hover/click?

**Regla:** Los tags `{ref:}` son ENRIQUECIMIENTO, nunca REEMPLAZO de informacion en prosa.

### C) MARKUP {term:} DUPLICADO
El protocolo de escritura dice: primera mencion en el capitulo usa `{term:keyword}`,
menciones posteriores en el MISMO capitulo van sin markup.

**Verificacion:**
1. Extrae TODOS los `{term:keyword}` del capitulo
2. Verifica que cada keyword aparezca marcado SOLO UNA VEZ
3. Si aparece mas de una vez, la primera es correcta, las siguientes son error

### D) CONTENIDO REPETIDO ENTRE SECCIONES
Buscar parrafos o frases que aparezcan casi identicos en dos secciones diferentes.

**Test:** Hay frases de 10+ palabras que aparezcan en mas de una seccion?

### E) VOZ Y OTREDAD
El texto usa perspectiva "nosotros/ustedes" donde "nosotros" habla DESDE AFUERA
de la experiencia humana. Pero debe ser SUTIL. Verificar:

1. Se usa "your/vuestro" de maneras que marcan explicitamente otredad no-humana?
   - Mal: "your scientists", "your planet's minerals"
   - Bien: "scientists have found", "the minerals of this world"
2. Se revela explicitamente un origen no-humano del autor?
   - Mal: "we, who observe from beyond"
   - Bien: "from a broader perspective, it becomes clear that..."

### F) COHERENCIA NARRATIVA
Leer el texto de corrido (todas las secciones en orden) y verificar:

1. Hay saltos tematicos abruptos entre secciones?
2. Las transiciones fluyen naturalmente?
3. Se introduce un concepto en una seccion y se usa en la siguiente sin re-explicar?
4. El cierre del capitulo se siente como cierre natural de lo que se presento?
5. Se usa el tipo de cierre correcto segun la distribucion del Writing Protocol?

### G) ORACIONES Y PARRAFOS
- Oraciones: preferiblemente < 20 palabras. Marcar las > 30 palabras.
- Parrafos: 3-4 oraciones promedio. Marcar los > 6 oraciones.
- Hay variedad entre parrafos cortos (enfasis) y largos (explicacion)?

### H) TERMINOLOGIA
Verificar uso estricto segun tabla del Writing Protocol:

| Debe usar | NO debe usar |
|-----------|-------------|
| Density / Densidad | Dimension / Dimension |
| Catalyst / Catalizador | Problem / Problema |
| Distortion / Distorsion | Error (como sinonimo) |
| Mind/body/spirit complex | Person (en contexto tecnico) |
| Energy center / Centro de energia | Chakra (excepto primera explicacion) |
| Harvest / Cosecha | Judgment / Juicio |
| The Choice / La Eleccion | — |
| Free will / Libre albedrio | — |
| Wanderer / Errante | Starseed |
| The Creator / El Creador | God / Dios |

### I) ATRIBUCIONES PROHIBIDAS
El texto NO debe contener ninguna mencion de:
- Ra, Q'uo, Don Elkins, Carla Rueckert, Jim McCarty
- "channeled material", "the sessions", "the instrument"
- "the Law of One material", "the Ra Contact"
- Cualquier referencia directa a fuentes

---

## FORMATO DE REPORTE

```
## QA DE LECTURA — Capitulo [N]: [Titulo]

### BUGS (rompen rendering)
[Lista de referencias rotas, categorias incorrectas, formatos {term:} invalidos]

### ISSUES NARRATIVOS (afectan experiencia de lectura)
[Nombres fantasma, contenido repetido, saltos de coherencia]

### ISSUES DE PROTOCOLO (violan las reglas)
[Markup duplicado, terminologia incorrecta, atribuciones]

### OBSERVACIONES (mejoras opcionales)
[Oraciones largas, posesivos, transiciones]

### VEREDICTO
- PASA — listo para JSONs
- PASA CON CORRECCIONES — lista de cambios necesarios antes de JSONs
- NO PASA — requiere reescritura parcial
```

---

## INTEGRACION EN EL FLUJO

```
PROMPT 1: Investigacion -> indice tematico
    |
PROMPT 2: Estructura -> plan de secciones
    |
PROMPT 3: Escritura -> texto + {term:} + {src:}
    |
PROMPT 4: Correcciones -> iterar hasta aprobado
    |
PROMPT 4.5: QA DE LECTURA -> reporte + correcciones
    |
PROMPT 5: Registros -> terminos + proveniencia + notas
    |
PROMPT 6: JSON capitulo -> limpio
    |
PROMPT 7: Glosario JSON
    |
PROMPT 8: Proveniencia JSON
    |
PROMPT 9: Traduccion ES
    |
PROMPT 9.5: QA DE TRADUCCION ES -> reporte + correcciones
    |
PROMPT 10: Traduccion PT
    |
PROMPT 10.5: QA DE TRADUCCION PT -> reporte + correcciones
```

---

## NOTAS DE IMPLEMENTACION

- **El QA es automatico.** No requiere prompt del operador — Claude lo ejecuta
  como parte del flujo despues de que el operador aprueba el contenido.
- **El QA es bloqueante.** Si el veredicto es NO PASA o PASA CON CORRECCIONES, se corrige ANTES de avanzar a JSONs.
- **El QA de traduccion** verifica los mismos puntos mas:
  - Todas las {ref:} y {term:} se mantuvieron identicas?
  - La terminologia es equivalente (density->densidad->densidade)?
  - La voz sapiencial se mantiene en el idioma destino?
  - Es prosa natural, no traduccion literal?

---

*Version: 1.0 — Marzo 2026*
