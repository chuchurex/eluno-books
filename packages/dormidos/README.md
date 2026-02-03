# Dormidos

**dormidos.eluno.org**

Work in progress.

## Structure

```
dormidos/
├── dist/           # Built files (served by web server)
│   ├── css/        # Compiled CSS
│   ├── fonts/      # Web fonts
│   ├── es/         # Spanish version
│   └── pt/         # Portuguese version
├── i18n/           # Translations
│   ├── en/         # English
│   ├── es/         # Spanish
│   └── pt/         # Portuguese
└── package.json    # Scripts and dependencies
```

## Development

```bash
# Install dependencies
npm install

# Start development server (port 3006)
npm run dev

# Build for production
npm run build
```

## Scripts

- `npm run dev` - Start development server with live reload
- `npm run build` - Build CSS and HTML for production
- `npm run translate` - Translate chapters to other languages
- `npm run build:pdf` - Generate PDF version
- `npm run publish` - Deploy to server

## Languages

- English (EN) - default
- Spanish (ES)
- Portuguese (PT)

## Chapters

20 chapters (to be added)
