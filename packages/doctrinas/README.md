# Doctrinas - Sistema de Preview de Borradores

> **URL de producción**: https://doctrinas.eluno.org
> **Puerto local**: 3007

Este paquete proporciona un entorno de preview para revisar borradores de capítulos antes de convertirlos al formato final JSON.

---

## Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE BORRADORES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  1. ESCRIBIR              2. PREVIEW               3. REVISAR               4. APROBAR
  ┌──────────┐            ┌──────────┐            ┌──────────┐            ┌──────────┐
  │  .md en  │  ────►     │ npm run  │  ────►     │ Revisar  │  ────►     │ Convertir│
  │borradores│            │  build   │            │   HTML   │            │  a JSON  │
  └──────────┘            └──────────┘            └──────────┘            └──────────┘
       │                       │                       │                       │
       │                       │                       │                       │
       ▼                       ▼                       ▼                       ▼
   Markdown              dist/index.html         doctrinas.            Pasa a paquete
   en español            con todos los           eluno.org             final (eluno,
                         capítulos                                     todo, etc.)
```

---

## Estructura

```
packages/doctrinas/
├── borradores/           ← Coloca aquí tus archivos .md
│   ├── 01-introduccion.md
│   ├── 02-fundamentos.md
│   └── ...
├── dist/                 ← Salida generada (HTML)
│   ├── index.html        ← Página de preview con todos los capítulos
│   ├── css/
│   └── fonts/
├── scripts/
│   └── build-preview.js  ← Generador de preview
├── .env                  ← Configuración del dominio
├── package.json
└── README.md             ← Este archivo
```

---

## Comandos

### Desarrollo local

```bash
# Desde packages/doctrinas/
npm run dev              # Inicia servidor en http://localhost:3007 + watch de SCSS
```

### Build

```bash
npm run build            # Genera dist/index.html desde borradores/*.md
npm run build:preview    # Solo el build (sin SCSS)
```

---

## Formato de Borradores

### Nombrado de archivos

```
01-titulo-del-capitulo.md
02-otro-capitulo.md
03-tercer-capitulo.md
```

- El **número** al inicio determina el orden
- Usa **guiones** para separar palabras
- Extensión `.md`

### Estructura del Markdown

```markdown
# Título del Capítulo

Párrafo introductorio del capítulo.

## Sección Principal

Contenido de la sección con **negrita** y *cursiva*.

> Cita o texto destacado que aparecerá con formato especial.

### Subsección

- Lista de elementos
- Otro elemento
- Más contenido

---

## Otra Sección

Continúa el contenido...
```

### Elementos soportados

| Elemento | Markdown | Resultado |
|----------|----------|-----------|
| Título H1 | `# Título` | Título del capítulo |
| Título H2 | `## Sección` | Sección principal |
| Título H3 | `### Subsección` | Subsección |
| Negrita | `**texto**` | **texto** |
| Cursiva | `*texto*` | *texto* |
| Cita | `> texto` | Blockquote estilizado |
| Lista | `- item` | Lista con bullets |
| Separador | `---` | Divisor visual |

---

## Despliegue

### Configurar Cloudflare Pages

1. Crear proyecto en Cloudflare Pages: `doctrinas`
2. Configurar build:
   - **Build command**: `cd packages/doctrinas && npm install && npm run build`
   - **Build output**: `packages/doctrinas/dist`
   - **Root directory**: (vacío)
   - **Environment**: `NODE_VERSION = 20`

3. Agregar dominio personalizado: `doctrinas.eluno.org`

### Despliegue manual

```bash
# Desde la raíz del monorepo
npx wrangler pages deploy packages/doctrinas/dist --project-name=doctrinas
```

---

## Paso a Producción

Una vez aprobado un borrador:

1. **Convertir a JSON**: Transformar el .md al formato estructurado de capítulos
2. **Mover al paquete destino**: Copiar JSON a `packages/[libro]/i18n/es/chapters/`
3. **Traducir** (opcional): Usar scripts de traducción para EN/PT
4. **Generar medios**: PDFs, audiobooks

---

## Agregar scripts a la raíz (opcional)

Para facilitar el acceso desde la raíz del monorepo, agregar a `package.json` raíz:

```json
{
  "scripts": {
    "dev:doctrinas": "npm run dev --workspace=@eluno/doctrinas",
    "build:doctrinas": "npm run build --workspace=@eluno/doctrinas"
  }
}
```

---

*Creado: 2026-01-22*
