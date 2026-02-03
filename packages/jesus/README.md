# 📚 Book Template - Static Website Generator

> Plantilla profesional para publicar libros como sitios web estáticos con PDFs, multilingüe y deploy automatizado.

Esta plantilla te permite crear sitios web de libros hermosos y funcionales en minutos. Incluye generación automática de PDFs, soporte multilingüe, sistema de glosario/referencias opcional, y deploy automatizado.

## ✨ Características

- 📖 **Sitio web estático** generado con Node.js
- 📄 **PDFs automáticos** generados con Puppeteer
- 🌍 **Multilingüe** (EN, ES, PT - fácil agregar más)
- 📝 **Glosario y referencias** opcionales con notas al pie
- 🚀 **Deploy automático** vía rsync/SSH
- 🎨 **Diseño responsivo** y elegante
- 🔊 **Soporte para audiolibros** (opcional)
- 📺 **Videos YouTube** integrados (opcional)

## 📚 Documentación Completa de Deploy

**¿Vas a desplegar en Cloudflare + Hostinger?** Consulta la documentación completa:

👉 **[docs/INDEX.md](./docs/INDEX.md)** - Guía completa de deployment

| Documento | Descripción |
|-----------|-------------|
| [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) | Guía completa paso a paso |
| [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) | Referencia rápida de 5 pasos |
| [REAL_EXAMPLES.md](./docs/REAL_EXAMPLES.md) | Ejemplos reales y troubleshooting |
| [COMMAND_TEMPLATES.md](./docs/COMMAND_TEMPLATES.md) | Comandos copy-paste |

### Scripts Helper de Deploy

```bash
# Verificar DNS
./scripts/check-dns.sh example.com

# Crear DNS automáticamente
./scripts/create-dns.sh subdomain

# Verificar sitio en servidor
./scripts/verify-site.sh example.com
```

---

## 🚀 Inicio Rápido

### 1. Usa esta plantilla

```bash
# Clonar
git clone https://github.com/tu-usuario/book-template.git mi-libro
cd mi-libro
```

### 2. Configura tu proyecto

```bash
# Copiar template de configuración
cp .env.example .env
# Edita .env con tu configuración
```

### 3. Agrega tu contenido

Edita `i18n/es/ui.json` con la información de tu libro:
```json
{
  "siteTitle": "Tu Sitio",
  "bookTitle": "Título de tu Libro",
  "subtitle": "Subtítulo o descripción",
  "footer": {
    "credits": "© 2026 Tu Nombre"
  }
}
```

Agrega tus capítulos en `i18n/es/chapters/`:
- Usa `PLANTILLA.json` como referencia
- Nombra los archivos: `01.json`, `02.json`, etc.

### 4. Prueba localmente

```bash
npm install
npm run dev
```

Abre http://127.0.0.1:3002

### 5. Deploy

```bash
npm run publish
```

## 📁 Estructura del Proyecto

```
book-template/
├── i18n/                     # Contenido multilingüe
│   └── es/                   # Español (agrega en/, pt/, etc.)
│       ├── ui.json           # Config del sitio
│       └── chapters/
│           ├── PLANTILLA.json    # Template
│           ├── 01.json           # ← TUS CAPÍTULOS
│           └── 02.json
├── scripts/
│   ├── build.js              # Genera HTMLs
│   ├── build-pdf.js          # Genera PDFs
│   └── deploy.js             # Deploy automático
├── src/scss/                 # Estilos personalizables
├── templates/                # Plantillas HTML
├── .env.example              # Template de configuración
└── package.json              # Dependencias
```

## 🛠 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Genera el sitio estático en `/dist` |
| `npm run build:pdf <cap> <lang>` | Genera PDF de un capítulo |
| `npm run build:pdf all <lang>` | Genera todos los PDFs |
| `npm run publish` | Build + Deploy automático |

## 📖 Formato de Capítulos

Cada capítulo es un archivo JSON:

```json
{
  "id": "ch1",
  "number": 1,
  "numberText": "Capítulo Uno",
  "title": "Título del Capítulo",
  "sections": [
    {
      "id": "ch1-intro",
      "title": "Introducción",
      "content": [
        {
          "type": "paragraph",
          "text": "Texto con **negrita** y *cursiva*."
        },
        {
          "type": "quote",
          "text": "Cita destacada."
        }
      ]
    }
  ]
}
```

### Características del Texto

- **Negrita**: `**texto**`
- **Cursiva**: `*texto*`
- **Términos del glosario**: `{term:id}` o `{term:id|Texto Custom}`
- **Referencias**: `{ref:categoria:id}`

## 🌍 Soporte Multilingüe

### Agregar un nuevo idioma

1. Crea la estructura:
```bash
mkdir -p i18n/en/chapters
```

2. Copia y traduce `ui.json`:
```bash
cp i18n/es/ui.json i18n/en/ui.json
# Edita i18n/en/ui.json
```

3. Traduce los capítulos en `i18n/en/chapters/`

4. El sistema detecta automáticamente los idiomas disponibles

## 🎨 Personalización

### Colores y Tipografía

Edita `src/scss/abstracts/_variables.scss`:

```scss
$color-primary: #c9a227;    // Color principal
$font-heading: 'Cormorant Garamond', serif;
$font-body: 'Spectral', serif;
```

### Con/Sin Glosario

Para un libro sin notas al pie ni glosario:

1. No crees archivos `glossary.json` ni `references.json`
2. No uses `{term:}` ni `{ref:}` en el texto
3. La barra lateral se ocultará automáticamente

## 🚀 Configuración de Deploy

### SSH/Rsync (Recomendado)

Edita `.env`:
```bash
DOMAIN=tu-sitio.com
UPLOAD_HOST=servidor.com
UPLOAD_PORT=65002
UPLOAD_USER=usuario
UPLOAD_PASS=contraseña
REMOTE_DIR=domains/tu-dominio.com/public_html/
```

El script `deploy.js` usa rsync sobre SSH para transferencia eficiente y segura.

#### Deploy automático

```bash
npm run publish
```

Esto ejecuta:
1. `npm run build` - Genera HTMLs y PDFs
2. `node scripts/deploy.js` - Sincroniza vía rsync/SSH

### Otras plataformas

- **Netlify/Vercel**: Build command: `npm run build`, Directory: `dist`
- **GitHub Pages**: Usa GitHub Actions
- **FTP**: Modifica `scripts/deploy.js`

---

## 🔧 Integración con Servicios

### GitHub

#### Crear repositorio desde la plantilla

**Opción 1: Interfaz web**
1. Ve a https://github.com/chuchurex/book-template
2. Click en "Use this template" → "Create a new repository"
3. Nombre: `mi-libro`
4. Click "Create repository"

**Opción 2: GitHub CLI**
```bash
# Autenticarse
gh auth login

# Crear repo desde template
gh repo create mi-libro --template chuchurex/book-template --public

# Clonar
gh repo clone tu-usuario/mi-libro
cd mi-libro
```

#### Configurar GitHub Actions (CI/CD)

Para deploy automático en cada push a `main`:

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy via rsync
        env:
          UPLOAD_HOST: ${{ secrets.UPLOAD_HOST }}
          UPLOAD_PORT: ${{ secrets.UPLOAD_PORT }}
          UPLOAD_USER: ${{ secrets.UPLOAD_USER }}
          UPLOAD_PASS: ${{ secrets.UPLOAD_PASS }}
          REMOTE_DIR: ${{ secrets.REMOTE_DIR }}
        run: |
          sudo apt-get install -y sshpass
          node scripts/deploy.js
```

**Configurar secrets:**
```bash
gh secret set UPLOAD_HOST --body "tu-servidor.com"
gh secret set UPLOAD_PORT --body "65002"
gh secret set UPLOAD_USER --body "usuario"
gh secret set UPLOAD_PASS --body "contraseña"
gh secret set REMOTE_DIR --body "domains/tu-dominio.com/public_html/"
```

#### GitHub API - Ejemplos útiles

**Listar releases:**
```bash
gh release list
```

**Crear release:**
```bash
gh release create v1.0.0 --title "Primera versión" --notes "Versión inicial del libro"
```

**Ver issues:**
```bash
gh issue list
```

---

### Hostinger - SSH y Deploy

#### Configuración SSH

**1. Obtener credenciales SSH:**
- Panel de Hostinger → Hosting → Avanzado → SSH Access
- Activa SSH si está deshabilitado
- Anota: Host, Puerto (generalmente 65002), Usuario

**2. Conectar vía SSH:**
```bash
ssh -p 65002 usuario@tu-servidor.com
```

**3. Configurar rsync (método actual):**

El script `scripts/deploy.js` usa `sshpass` para autenticación:

```javascript
const rsyncCmd = `sshpass -p "${password}" rsync -avz --delete -e "ssh -p ${port} -o StrictHostKeyChecking=accept-new" ${localDir} ${user}@${host}:${remoteDir}`;
```

**Instalar sshpass (si no está instalado):**
```bash
# macOS
brew install hudochenkov/sshpass/sshpass

# Linux
sudo apt-get install sshpass
```

#### Estructura de directorios en Hostinger

```
domains/
└── tu-dominio.com/
    └── public_html/          ← REMOTE_DIR principal
        ├── index.html
        ├── chapters/
        ├── pdf/
        └── css/
```

Para subdominios o subcarpetas:
```bash
# Subdirectorio
REMOTE_DIR=domains/tu-dominio.com/public_html/mi-libro/

# Subdominio
REMOTE_DIR=domains/subdominio.tu-dominio.com/public_html/
```

#### Comandos útiles vía SSH

```bash
# Conectar
ssh -p 65002 usuario@servidor.com

# Ver espacio usado
du -sh domains/tu-dominio.com/public_html/

# Listar archivos recientes
ls -lt domains/tu-dominio.com/public_html/ | head -20

# Ver logs del servidor
tail -f domains/tu-dominio.com/logs/access.log

# Limpiar caché
rm -rf domains/tu-dominio.com/public_html/cache/*
```

---

### Cloudflare - DNS y Caché

#### Configuración DNS

**1. Agregar dominio a Cloudflare:**
- Dashboard → Add a site → Ingresa tu dominio
- Cloudflare te dará nameservers (ej: `cleo.ns.cloudflare.com`)
- Actualiza los nameservers en tu registrador de dominio

**2. Configurar registros DNS:**

**Dominio principal:**
```
Type: A
Name: @
Content: [IP de Hostinger]
Proxy: Enabled (naranja)
```

**Subdominio:**
```
Type: A
Name: libro
Content: [IP de Hostinger]
Proxy: Enabled
```

**3. SSL/TLS:**
- SSL/TLS → Overview → Full (strict)
- Edge Certificates → Always Use HTTPS: On

#### API de Cloudflare - Purgar caché

**Obtener API Token:**
1. Dashboard → My Profile → API Tokens
2. Create Token → Edit zone DNS (template)
3. Permisos: Zone.Cache Purge, Zone.Zone (Read)
4. Copia el token

**Configurar en .env:**
```bash
CF_API_KEY=tu_api_key_aqui
CF_EMAIL=tu_email_aqui
CF_ZONE_ID=tu_zone_id_aqui
```

**Script para purgar caché después de deploy:**

`scripts/purge-cache.js`:
```javascript
require('dotenv').config();
const https = require('https');

async function purgeCache() {
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`,
    method: 'POST',
    headers: {
      'X-Auth-Email': process.env.CF_EMAIL,
      'X-Auth-Key': process.env.CF_API_KEY,
      'Content-Type': 'application/json'
    }
  };

  const data = JSON.stringify({ purge_everything: true });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Cloudflare cache purged');
          resolve();
        } else {
          reject(new Error(`Failed: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

purgeCache().catch(console.error);
```

**Usar desde package.json:**
```json
{
  "scripts": {
    "publish": "npm run build && node scripts/deploy.js && node scripts/purge-cache.js"
  }
}
```

#### Cloudflare CLI (alternativa)

```bash
# Instalar
npm install -g cloudflare-cli

# Autenticar
cloudflare-cli --email tu@email.com --key tu_api_key

# Purgar caché
cloudflare-cli purge https://tu-sitio.com
```

---

## 🔐 Seguridad y Mejores Prácticas

### Variables de Entorno

**NUNCA** commitees el archivo `.env` a git. Siempre está en `.gitignore`.

**Para equipos:**
- Comparte `.env.example` (sin credenciales reales)
- Usa gestores de secretos: 1Password, Bitwarden, AWS Secrets Manager
- En CI/CD: GitHub Secrets, GitLab CI Variables

### SSH sin contraseña (más seguro)

**1. Generar clave SSH:**
```bash
ssh-keygen -t ed25519 -C "tu@email.com"
```

**2. Copiar a servidor:**
```bash
ssh-copy-id -p 65002 usuario@servidor.com
```

**3. Modificar deploy.js para usar claves:**
```javascript
// Sin sshpass, solo con clave SSH
const rsyncCmd = `rsync -avz --delete -e "ssh -p ${port}" ${localDir} ${user}@${host}:${remoteDir}`;
```

### Permisos en servidor

```bash
# Archivos: 644 (rw-r--r--)
find domains/tu-dominio.com/public_html -type f -exec chmod 644 {} \;

# Directorios: 755 (rwxr-xr-x)
find domains/tu-dominio.com/public_html -type d -exec chmod 755 {} \;
```

## 📦 Casos de Uso

Esta plantilla es perfecta para:

- 📚 Libros digitales de no-ficción
- 📖 Documentación técnica
- 📝 Ensayos largos o tesis
- 🎓 Material educativo
- 📜 Textos filosóficos o religiosos
- 📰 Publicaciones periódicas

## 🔧 Requisitos

- Node.js v20+
- npm o yarn
- SSH access para deploy (opcional)

## 🔄 Actualizaciones y Mantenimiento

Esta plantilla se mantiene activamente y recibe mejoras continuas desde el proyecto principal [lawofone.cl](https://lawofone.cl).

### Cómo se actualiza esta plantilla

Los cambios en el frontend (SCSS, templates, fonts, scripts de build) de lawofone.cl se sincronizan automáticamente a este repositorio vía GitHub Actions. Esto significa que:

- ✅ Mejoras de diseño y accesibilidad
- ✅ Optimizaciones de rendimiento
- ✅ Nuevas funcionalidades del generador
- ✅ Correcciones de bugs

Se propagan automáticamente a esta plantilla.

### Recibir actualizaciones en tu proyecto

Si creaste un proyecto usando esta plantilla y quieres recibir actualizaciones:

**Opción 1: Sincronización manual (recomendado)**

```bash
# Agregar book-template como remote
git remote add template https://github.com/chuchurex/book-template.git

# Traer actualizaciones
git fetch template

# Ver qué cambió
git log template/main --oneline

# Mergear cambios específicos (solo frontend)
git checkout template/main -- src/scss
git checkout template/main -- templates
git checkout template/main -- scripts/build.js
git checkout template/main -- scripts/build-pdf.js

# Revisar y commitear
git status
git commit -m "feat: actualizar frontend desde book-template"
```

**Opción 2: GitHub CLI**

```bash
# Ver releases de la plantilla
gh release list --repo chuchurex/book-template

# Comparar con tu proyecto
gh repo view chuchurex/book-template --web
```

### Contribuir mejoras

Si haces mejoras que podrían beneficiar a otros:

1. Fork de book-template
2. Crea una rama con tu mejora
3. Abre un Pull Request

Las mejoras generales al sistema (no específicas de tu contenido) son bienvenidas.

---

## 🐛 Troubleshooting

### PDFs no se generan

```bash
# Instalar dependencias de Puppeteer
# macOS
brew install chromium

# Linux
sudo apt-get install -y chromium-browser
```

### Error de permisos en deploy

```bash
# Verificar que sshpass esté instalado
which sshpass

# macOS
brew install hudochenkov/sshpass/sshpass

# Verificar conexión SSH
ssh -p 65002 usuario@servidor.com
```

### SCSS no compila

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node
node --version  # Debe ser v20+
```

### El sitio no se ve bien en desarrollo

```bash
# Regenerar todo desde cero
npm run build
npm run dev
```

---

## 📄 Licencia

MIT License - Usa esta plantilla libremente para tus proyectos.

## 🙏 Créditos

Plantilla creada y mantenida por el proyecto [lawofone.cl](https://lawofone.cl).

**Arquitectura**: v1.0.0 (Enero 2026)
**Sincronización automática**: Habilitada desde lawofone.cl

---

## 📞 Soporte

- **Documentación**: Este README
- **Issues**: https://github.com/chuchurex/book-template/issues
- **Proyecto origen**: https://github.com/chuchurex/lawofone.cl
- **Sitio de ejemplo**: https://lawofone.cl

**¿Necesitas ayuda?** Abre un issue en GitHub describiendo tu problema.
