# 🚀 Configuración de Producción - SpinAndSell

## 📋 Variables de Entorno Requeridas en Vercel

```env
# Base de datos (Railway)
DATABASE_URL="postgresql://postgres.xxx:yyy@tramway.proxy.rlwy.net:46063/railway"

# NextAuth.js
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="tu-clave-secreta-generada"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
CLOUDINARY_FOLDER="spinandsell"
```

## 🔧 Configuración de Google OAuth para Producción

### 1. Acceder a Google Cloud Console

- Ve a [Google Cloud Console](https://console.cloud.google.com/)
- Selecciona tu proyecto o crea uno nuevo

### 2. Habilitar Google+ API

- Ve a "APIs y servicios" > "Biblioteca"
- Busca "Google+ API" y habilítala

### 3. Configurar OAuth 2.0

- Ve a "APIs y servicios" > "Credenciales"
- Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
- Tipo de aplicación: "Aplicación web"

### 4. Configurar URIs Autorizados

**URIs de JavaScript autorizados:**

```
https://tu-dominio.vercel.app
```

**URIs de redirección autorizados:**

```
https://tu-dominio.vercel.app/api/auth/callback/google
```

### 5. Obtener Credenciales

- Copia el "Client ID" y "Client Secret"
- Agrégalos a las variables de entorno en Vercel

## 🔄 Soluciones a Problemas Comunes

### ❌ Google OAuth no funciona

**Causa:** Dominios no autorizados en Google Console

**Solución:**

1. Verificar que el dominio de producción esté en Google Console
2. Asegurar que `NEXTAUTH_URL` coincida exactamente con el dominio
3. Verificar que no haya espacios extra en las variables de entorno

### ❌ Error "Error al actualizar favoritos"

**Causa:** Error de sintaxis en API (YA CORREGIDO)

**Estado:** ✅ Solucionado - Error de catch corregido

### ❌ Visualizaciones incorrectas

**Causa:** Contaba cada visita, no una por usuario

**Solución:** ✅ Implementado sistema de trackeo por usuario/IP

- Una visualización por usuario autenticado
- Una visualización por IP para usuarios anónimos
- Nuevo modelo `View` en base de datos

### ❌ Avatar no se visualiza

**Causa:** Sesión no se actualizaba tras upload

**Solución:** ✅ Implementada recarga automática

- Actualización forzada de sesión
- Recarga de página para garantizar sincronización

## 📊 Verificaciones Post-Despliegue

### ✅ Checklist de Funcionalidades

- [x] Login con credenciales
- [ ] Login con Google OAuth ⚠️ (requiere configuración de dominios)
- [x] Subir productos
- [x] Visualizar productos
- [x] Filtros y búsqueda
- [x] Contactar vendedor
- [ ] Sistema de favoritos ⚠️ (corregido, por probar)
- [ ] Visualizaciones únicas ⚠️ (mejorado, por probar)
- [x] Eliminar productos
- [ ] Avatar de perfil ⚠️ (corregido, por probar)

### 🔍 Cómo Probar Correcciones

1. **Favoritos:**
   - Intentar agregar/quitar favoritos
   - Verificar que no aparece "Error al actualizar favoritos"

2. **Visualizaciones:**
   - Ver un producto múltiples veces
   - Verificar que el contador solo aumenta una vez por usuario

3. **Avatar:**
   - Subir nueva foto de perfil
   - Verificar que aparece inmediatamente tras la recarga

4. **Google OAuth:**
   - Configurar dominios en Google Console
   - Probar login con cuenta Google

## 🎯 Próximos Pasos

1. **Configurar Google OAuth** - Agregar dominio de producción
2. **Probar todas las correcciones** - Verificar que funcionan en producción
3. **Monitoreo de errores** - Configurar logging avanzado
4. **Optimizaciones** - Caché de imágenes, CDN, etc.

## 📞 Soporte

Si encuentras problemas adicionales:

1. Verificar logs de Vercel
2. Comprobar logs de Railway (base de datos)
3. Verificar Network tab en DevTools del navegador
