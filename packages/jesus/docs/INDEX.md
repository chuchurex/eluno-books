# 📚 Documentación - Book Template

## 🎯 Guías de Deploy (Cloudflare + Hostinger)

Esta documentación cubre el proceso completo para crear y desplegar sitios estáticos usando **Cloudflare** (DNS) + **Hostinger** (hosting).

### 📖 Guías Disponibles

| Documento | Descripción | Cuándo Usar |
|-----------|-------------|-------------|
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Guía completa del proceso | Para entender todo el proceso |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Referencia rápida de 5 pasos | Para recordar el proceso |
| **[REAL_EXAMPLES.md](./REAL_EXAMPLES.md)** | Ejemplos reales con comandos | Para ver casos de éxito/error |
| **[COMMAND_TEMPLATES.md](./COMMAND_TEMPLATES.md)** | Comandos copy-paste listos | Para ejecutar sin pensar |

---

## 🚀 Para Empezar

### Si es tu primera vez:
1. Lee [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) completa
2. Sigue los pasos con [COMMAND_TEMPLATES.md](./COMMAND_TEMPLATES.md)

### Si ya tienes experiencia:
1. Usa [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Copia comandos de [COMMAND_TEMPLATES.md](./COMMAND_TEMPLATES.md)

### Si algo salió mal:
1. Consulta [DEPLOYMENT_GUIDE.md - Problemas Comunes](./DEPLOYMENT_GUIDE.md#-problemas-comunes-y-soluciones)
2. Ve ejemplos en [REAL_EXAMPLES.md](./REAL_EXAMPLES.md)

---

## 🛠️ Scripts Helper

El template incluye scripts de automatización:

```bash
# Verificar DNS de un sitio
./scripts/check-dns.sh example.com

# Crear DNS automáticamente
./scripts/create-dns.sh subdomain

# Verificar sitio en servidor
./scripts/verify-site.sh example.com
```

---

## 📋 Proceso Resumido

1. **Panel Hostinger** → Crear sitio web (MANUAL)
2. **Cloudflare API** → Crear DNS (registro A, proxy OFF)
3. **deploy.js** → Configurar ruta correcta
4. **Build & Deploy** → `node scripts/build.js && node scripts/deploy.js`
5. **Verificar** → DNS, archivos, acceso HTTP

---

## 🎓 Por Nivel de Usuario

### 🌱 Principiante
**Nunca has desplegado un sitio con esta infraestructura**

1. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Lee todo
2. [REAL_EXAMPLES.md](./REAL_EXAMPLES.md) - Ve ejemplos
3. [COMMAND_TEMPLATES.md](./COMMAND_TEMPLATES.md) - Ejecuta comandos

### 🌿 Intermedio
**Ya desplegaste 1-2 sitios**

1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Repaso rápido
2. [COMMAND_TEMPLATES.md](./COMMAND_TEMPLATES.md) - Copy-paste
3. Si hay problema → [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 🌳 Avanzado
**Dominas el proceso**

1. [COMMAND_TEMPLATES.md](./COMMAND_TEMPLATES.md) - Solo comandos
2. Scripts helper - `./scripts/*.sh`

---

## 🔍 Búsqueda Rápida

| Necesito... | Ver documento... |
|-------------|------------------|
| Crear DNS | [COMMAND_TEMPLATES.md - DNS](./COMMAND_TEMPLATES.md#paso-3-crear-dns-en-cloudflare) |
| Error 522 | [REAL_EXAMPLES.md - Error 522](./REAL_EXAMPLES.md#problema-2-error-522-connection-timeout) |
| Verificar sitio | [COMMAND_TEMPLATES.md - Verificar](./COMMAND_TEMPLATES.md#paso-2-verificar-sitio-creado) |
| Archivos no actualizan | [DEPLOYMENT_GUIDE.md - Problema 3](./DEPLOYMENT_GUIDE.md#problema-3-archivos-no-se-cargan) |
| Orden de pasos | [DEPLOYMENT_GUIDE.md - Orden](./DEPLOYMENT_GUIDE.md#-orden-de-operaciones-óptimo) |

---

## 💡 Antes de Empezar

Asegúrate de tener:

- ✅ Acceso al panel de Hostinger
- ✅ Credenciales SSH de Hostinger
- ✅ API Token de Cloudflare
- ✅ `sshpass` instalado (`brew install sshpass`)
- ✅ Archivo `.env` configurado

---

**Última actualización**: Enero 2026
**Versión**: 1.0
**Proyecto base**: book-template
