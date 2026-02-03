# 📚 Documentación de Deployment - Book Template

## ✅ Documentación Completa Disponible

Esta plantilla incluye documentación exhaustiva para desplegar sitios en **Cloudflare + Hostinger**, basada en experiencia real de producción.

---

## 📖 Guías Disponibles

Toda la documentación está en la carpeta **[docs/](./docs/)**:

### 1. [docs/INDEX.md](./docs/INDEX.md)
**Índice maestro de toda la documentación**
- Guía de qué leer según tu nivel
- Búsqueda rápida por problema
- Flujos de lectura recomendados

### 2. [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
**Guía completa de deployment** (~12KB)
- Requisitos previos y credenciales
- Flujo de trabajo paso a paso
- 5 problemas comunes con soluciones
- Scripts de automatización
- Checklist de verificación

### 3. [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)
**Referencia rápida** (~2.5KB)
- Proceso en 5 pasos
- Tabla de errores comunes
- Checklist rápido

### 4. [docs/REAL_EXAMPLES.md](./docs/REAL_EXAMPLES.md)
**Ejemplos reales** (~8KB)
- Timeline de proyecto real
- Intentos fallidos documentados
- Soluciones que funcionaron
- Análisis de problemas

### 5. [docs/COMMAND_TEMPLATES.md](./docs/COMMAND_TEMPLATES.md)
**Comandos copy-paste** (~8KB)
- Comandos listos para ejecutar
- Variables configurables
- One-liners para testing

---

## 🛠️ Scripts Helper

Scripts de automatización incluidos en **[scripts/](./scripts/)**:

```bash
# Verificar DNS completo
./scripts/check-dns.sh example.com

# Crear DNS en Cloudflare automáticamente
./scripts/create-dns.sh subdomain

# Verificar sitio existe en Hostinger
./scripts/verify-site.sh example.com
```

---

## 🚀 Quick Start

### Para Deploy por Primera Vez

```bash
# 1. Lee la guía completa
cat docs/DEPLOYMENT_GUIDE.md

# 2. Sigue el proceso con comandos listos
cat docs/COMMAND_TEMPLATES.md
```

### Si Ya Tienes Experiencia

```bash
# 1. Referencia rápida
cat docs/QUICK_REFERENCE.md

# 2. Ejecuta comandos
# (copiar de COMMAND_TEMPLATES.md)
```

### Si Algo Salió Mal

```bash
# 1. Busca el error en la guía
grep "Error 522" docs/DEPLOYMENT_GUIDE.md

# 2. Ve ejemplos reales
cat docs/REAL_EXAMPLES.md
```

---

## 📋 Proceso Resumido

1. **Panel Hostinger** → Crear sitio web (MANUAL)
2. **Cloudflare API** → Crear DNS (registro A, proxy OFF)
3. **scripts/deploy.js** → Configurar ruta correcta
4. **Build & Deploy** → `node scripts/build.js && node scripts/deploy.js`
5. **Verificar** → DNS, archivos, acceso HTTP

---

## 🎯 Configuración Necesaria

Archivo `.env` debe incluir:

```bash
# HOSTINGER - SSH/RSYNC Deploy + API
UPLOAD_HOST=your-server-ip
UPLOAD_PORT=your-ssh-port
UPLOAD_USER=your-ssh-user
UPLOAD_PASS=your-password
HOSTINGER_API_TOKEN=your-api-token

# CLOUDFLARE - DNS y Cache
CF_API_KEY=your-api-key
CF_EMAIL=your-email@example.com
CF_ZONE_ID=your-zone-id
```

Ver [.env.example](./.env.example) para plantilla completa.

---

## 💡 Problemas Comunes Documentados

La documentación cubre todos estos problemas:

1. ✅ **Error 522 (Timeout)** - CNAME con proxy activo
2. ✅ **Error 403 (Forbidden)** - Sitio no creado en Hostinger
3. ✅ **DNS no resuelve** - Falta crear registro
4. ✅ **Archivos no actualizan** - Ruta de deploy incorrecta
5. ✅ **API Hostinger falla** - Token inválido

Cada problema incluye:
- Síntomas específicos
- Causa raíz explicada
- Solución paso a paso
- Comandos para verificar

---

## 📊 Contenido de la Documentación

- **Total palabras**: ~12,000
- **Comandos de ejemplo**: 50+
- **Problemas documentados**: 5 mayores
- **Scripts incluidos**: 3 automatizados
- **Tiempo lectura completa**: ~40 minutos
- **Tiempo usando guía rápida**: ~10 minutos

---

## 🎓 Niveles de Usuario

### 🌱 Principiante
**Primera vez desplegando**
1. [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) - Lee completo
2. [REAL_EXAMPLES.md](./docs/REAL_EXAMPLES.md) - Ve ejemplos
3. [COMMAND_TEMPLATES.md](./docs/COMMAND_TEMPLATES.md) - Ejecuta

### 🌿 Intermedio
**Ya desplegaste 1-2 sitios**
1. [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) - Repaso
2. [COMMAND_TEMPLATES.md](./docs/COMMAND_TEMPLATES.md) - Copy-paste
3. Si hay problema → [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

### 🌳 Avanzado
**Dominas el proceso**
1. [COMMAND_TEMPLATES.md](./docs/COMMAND_TEMPLATES.md) - Solo comandos
2. Scripts - `./scripts/*.sh`

---

## 🔗 Enlaces Útiles

- Panel Hostinger: https://hpanel.hostinger.com/
- Hostinger API Docs: https://developers.hostinger.com/
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Cloudflare API Docs: https://developers.cloudflare.com/api/

---

## 📝 Origen de la Documentación

Esta documentación fue creada basándose en la experiencia real de desplegar **chuchu.lawofone.cl**, documentando:
- Todos los intentos fallidos
- Problemas encontrados
- Soluciones implementadas
- Lecciones aprendidas

Ha sido adaptada para ser completamente genérica y reutilizable en cualquier proyecto.

---

## ✨ Características de la Documentación

- ✅ **Completa**: Cubre todo el proceso de A a Z
- ✅ **Práctica**: Comandos copy-paste listos
- ✅ **Real**: Basada en problemas reales resueltos
- ✅ **Agnóstica**: Sin credenciales ni dominios específicos
- ✅ **Automatizada**: Scripts helper incluidos
- ✅ **Multi-nivel**: Para principiantes y avanzados

---

**Última actualización**: Enero 2026
**Versión**: 1.0
**Estado**: ✅ Documentación completa y lista para usar
