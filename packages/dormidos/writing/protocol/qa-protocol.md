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
3. Verifica que la categoria (gurd:, phil:, psych:, trad:) sea la correcta
4. Extrae TODOS los `{term:keyword}` y verifica formato kebab-case
5. Reporta cualquier mismatch, referencia inexistente o formato incorrecto

**Error tipico:** Escribir `{ref:gurd:self-observation}` cuando la clave real es `psych:self-observation`.
**Error tipico:** Escribir `{term:Auto Observacion}` en vez de `{term:auto-observacion}`.

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

1. Se usa "vuestro/su" de maneras que marcan explicitamente otredad no-humana?
   - Mal: "vuestros psicologos", "los minerales de vuestro planeta"
   - Bien: "los psicologos han observado", "los minerales de este mundo"
2. Se revela explicitamente un origen no-humano del autor?
   - Mal: "nosotros, que observamos desde fuera"
   - Bien: "desde una perspectiva mas amplia, se hace evidente que..."

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
| Densidad | Dimension |
| Catalizador | Problema |
| Distorsion | Error (como sinonimo) |
| Complejo mente/cuerpo/espiritu | Persona (en contexto tecnico) |
| Centro de energia | Chakra (excepto primera explicacion) |
| Cosecha | Juicio |
| La Eleccion | — |
| Libre albedrio | — |
| El Creador | Dios (excepto contexto comparativo) |
| Buffers | Mecanismos de defensa (generico) |
| Identificacion | Apego (como sinonimo directo) |
| Auto-observacion | Introspeccion (generico) |
| Sueno de la conciencia | Inconciencia (generico) |

### I) ATRIBUCIONES PROHIBIDAS
El texto NO debe contener ninguna mencion de:
- Ra, Q'uo, Don Elkins, Carla Rueckert, Jim McCarty
- "material canalizado", "las sesiones", "el instrumento"
- "el material de la Ley del Uno", "el Contacto Ra"
- Gurdjieff, Ouspensky, de Salzmann (nunca por nombre en el texto final)
- Cualquier referencia directa a fuentes

### J) COHERENCIA CON EL CUARTO CAMINO
Verificar que los conceptos del Cuarto Camino integrados en el texto:
1. Son coherentes con la tradicion original (buffers, identificacion, auto-observacion)
2. Se integran organicamente con la perspectiva Ra (no forzados)
3. No contradicen la cosmologia Ra (densidades, catalizador, cosecha)
4. Usan terminologia propia del libro, no prestada directamente de Gurdjieff

---

## FORMATO DE REPORTE

```
## QA DE LECTURA — Capitulo [N]: [Titulo]

### BUGS (rompen rendering)
[Lista de referencias rotas, categorias incorrectas, formatos {term:} invalidos]

### ISSUES NARRATIVOS (afectan experiencia de lectura)
[Nombres fantasma, contenido repetido, saltos de coherencia]

### ISSUES DE PROTOCOLO (violan las reglas)
[Markup duplicado, terminologia incorrecta, atribuciones, nombres de fuentes]

### OBSERVACIONES (mejoras opcionales)
[Oraciones largas, posesivos, transiciones, conceptos forzados]

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
```

---

## NOTAS DE IMPLEMENTACION

- **El QA es automatico.** No requiere prompt del operador — Claude lo ejecuta
  como parte del flujo despues de que el operador aprueba el contenido.
- **El QA es bloqueante.** Si el veredicto es NO PASA o PASA CON CORRECCIONES, se corrige ANTES de avanzar a JSONs.
- **Sin traduccion.** Dormidos es un libro ES-only, no hay fases de traduccion.

---

*Version: 1.0 — Marzo 2026*
