# Guía de Traducción - Las Enseñanzas de la Ley del Uno

Este documento explica cómo usar el sistema de traducción automatizada para traducir contenido de español a portugués usando la API de Anthropic Claude.

## Requisitos

1. **API Key de Anthropic**: Necesitas una cuenta en [console.anthropic.com](https://console.anthropic.com/)
2. **Dependencias instaladas**: El paquete `@anthropic-ai/sdk` ya está instalado

## Configuración

### 1. Agregar API Key

Edita el archivo `.env` en la raíz del proyecto y agrega tu API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 2. Verificar configuración de idiomas

En `packages/todo/.env` debe estar configurado:

```bash
LANGUAGES=en,es,pt
```

## Uso del Script

El script `translate-to-pt.js` traduce contenido de español a portugués.

### Traducir todo el contenido

```bash
node packages/core/scripts/translate-to-pt.js all
```

Este comando traduce:
- Todos los archivos UI (ui.json, about.json, media.json)
- Todos los capítulos (01-11)

### Traducir un capítulo específico

```bash
node packages/core/scripts/translate-to-pt.js chapter 01
node packages/core/scripts/translate-to-pt.js chapter 05
```

### Traducir un archivo específico

```bash
node packages/core/scripts/translate-to-pt.js file ui
node packages/core/scripts/translate-to-pt.js file about
```

### Traducir solo capítulos

```bash
node packages/core/scripts/translate-to-pt.js chapters
```

### Traducir solo archivos UI

```bash
node packages/core/scripts/translate-to-pt.js files
```

## Glosario de Términos

El script usa un glosario consistente para términos de La Ley del Uno:

| Español | Português |
|---------|-----------|
| Cosecha | Colheita |
| Distorsión | Distorção |
| Catalizador | Catalisador |
| Densidad | Densidade |
| Servicio a Otros | Serviço aos Outros |
| Libre Albedrío | Livre Arbítrio |
| El Velo | O Véu |
| Infinito Inteligente | Infinito Inteligente |
| Errante | Andarilho |
| La Ley del Uno | A Lei do Um |
| Yo Superior | Eu Superior |

## Estructura de Archivos

Después de traducir, la estructura será:

```
packages/todo/i18n/
├── en/                   # Inglés (fuente original)
│   ├── ui.json
│   ├── about.json
│   └── chapters/
│       ├── 01.json
│       └── ...
├── es/                   # Español
│   ├── ui.json
│   ├── about.json
│   └── chapters/
│       ├── 01.json
│       └── ...
└── pt/                   # Portugués (generado)
    ├── ui.json
    ├── about.json
    └── chapters/
        ├── 01.json
        └── ...
```

## Verificación

Después de traducir:

1. **Verificar JSON válido**:
```bash
node -e "require('./packages/todo/i18n/pt/ui.json')"
node -e "require('./packages/todo/i18n/pt/chapters/01.json')"
```

2. **Build del proyecto**:
```bash
cd packages/todo
npm run build
```

3. **Probar localmente**:
```bash
npm run dev:todo
# Visitar http://127.0.0.1:3002/pt/
```

## Costos Estimados

- ~50K tokens entrada + ~50K tokens salida por traducción completa
- Costo aproximado: $0.30-0.50 USD
