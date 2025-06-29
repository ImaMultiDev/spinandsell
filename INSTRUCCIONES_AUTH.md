# Configuración de Autenticación - SpinAndSell

## ✅ Estado Actual

- ✅ Sistema de autenticación implementado con NextAuth.js v4
- ✅ Páginas de login (`/auth/signin`) y registro (`/auth/signup`) creadas
- ✅ API routes configuradas (`/api/auth/[...nextauth]` y `/api/auth/register`)
- ✅ Header actualizado con menú de usuario
- ✅ Integración con Prisma y PostgreSQL
- ✅ Soporte para autenticación por credenciales y Google OAuth

## 🔧 Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/spinandsell"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-muy-segura-aqui"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

## 🚀 Pasos para Configurar

### 1. Configurar Base de Datos

```bash
# Ejecutar migraciones de Prisma
npx prisma db push

# Generar cliente de Prisma
npx prisma generate
```

### 2. Generar NEXTAUTH_SECRET

```bash
# Usar OpenSSL para generar una clave secreta
openssl rand -base64 32
```

### 3. Configurar Google OAuth (Opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Crea credenciales OAuth 2.0
5. Configura los URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/callback/google`

### 4. Ejecutar la Aplicación

```bash
npm run dev
```

## 🔐 Funcionalidades Implementadas

### Autenticación por Credenciales

- ✅ Registro de usuarios con validación
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de email único
- ✅ Login con email y contraseña

### Autenticación con Google

- ✅ Login con Google OAuth
- ✅ Creación automática de usuario
- ✅ Sincronización de datos de perfil

### Gestión de Sesiones

- ✅ Sesiones JWT
- ✅ Información de usuario en sesión (id, role, name, email)
- ✅ Persistencia entre recargas de página

### UI/UX

- ✅ Header con menú de usuario dinámico
- ✅ Páginas de login/registro responsive
- ✅ Estados de carga y mensajes de error
- ✅ Redirección automática después del login

## 🎯 Próximos Pasos Sugeridos

1. **Configurar la base de datos PostgreSQL**
2. **Configurar Google OAuth** (opcional)
3. **Probar el sistema de autenticación**
4. **Crear páginas de perfil de usuario**
5. **Implementar roles y permisos**
6. **Integrar con sistema de productos**

## 🐛 Posibles Problemas

### Error de Base de Datos

- Verificar que PostgreSQL esté ejecutándose
- Verificar la cadena de conexión DATABASE_URL
- Ejecutar `npx prisma db push`

### Error de NextAuth

- Verificar que NEXTAUTH_SECRET esté configurado
- Verificar que NEXTAUTH_URL coincida con tu dominio

### Error de Google OAuth

- Verificar que los URIs de callback estén configurados correctamente
- Verificar que las credenciales de Google sean válidas

## 📝 Notas de Desarrollo

- Los usuarios se crean con role "USER" por defecto
- Las contraseñas se hashean con bcrypt (12 rounds)
- Las sesiones usan estrategia JWT
- La autenticación está completamente integrada con el Header
- Los formularios incluyen validación client-side y server-side

## 🔍 Endpoints Disponibles

- `GET/POST /api/auth/signin` - Página de login
- `GET/POST /api/auth/signup` - Página de registro
- `POST /api/auth/register` - API para crear usuario
- `GET /api/auth/session` - Obtener sesión actual
- `POST /api/auth/signout` - Cerrar sesión
