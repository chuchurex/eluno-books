# Sanacion Book - Digital Edition

> A comprehensive guide to healing practice

This project presents a complete guide to healing in an accessible digital format.

**Website**: https://sanacion.eluno.org

## Features

- 11 comprehensive chapters on healing
- Multilingual support (EN/ES)
- Responsive design (desktop, tablet, mobile)
- Dark/Light theme toggle
- Notes and definitions panel
- PDF generation support
- Audio support (optional)

## Purpose

This digital book aims to share the wisdom and practice of healing in an accessible, modern format.

## Using the Project

### Installation

```bash
# Navigate to project directory
cd packages/sanacion

# Install dependencies
npm install

# Configure environment variables
# Edit .env with your deployment credentials
```

### Local Development

```bash
# Development server
npm run dev

# The site will be available at http://127.0.0.1:3004
```

### Build and Deploy

```bash
# Generate static site
npm run build

# Deploy (requires configuration in .env)
npm run publish
```

## Structure

```
packages/sanacion/
├── i18n/                     # Multilingual content
│   ├── es/                   # Spanish
│   └── en/                   # English
│       ├── ui.json           # Site configuration
│       ├── chapters/         # Book chapters (ch1-ch11.json)
│       ├── about.json        # About page
│       ├── glossary.json     # Glossary of terms
│       ├── references.json   # References
│       └── media.json        # Media resources
├── scripts/                  # Build and deploy scripts
├── dist/                     # Generated static site
└── .env                      # Deployment configuration
```

## Content Structure

Each chapter file (`ch1.json` - `ch11.json`) should follow this structure:

```json
{
  "number": 1,
  "title": "Chapter Title",
  "sections": [
    {
      "title": "Section Title",
      "content": [
        {
          "type": "paragraph",
          "text": "Content here..."
        }
      ]
    }
  ]
}
```

## Configuration

The `.env` file contains deployment credentials:

```env
DOMAIN=sanacion.eluno.org
STATIC_SUBDOMAIN=static.eluno.org
PROJECT_SLUG=sanacion
LANGUAGES=en,es
BASE_LANG=en
```

## Deployment

Deploy to production with:

```bash
npm run publish
```

This will:
1. Build the static site
2. Upload to server via rsync/SSH
3. Commit and push changes to git

## License

© 2026 Sanacion Book - All rights reserved

---

Created with care by Carlos Martinez
