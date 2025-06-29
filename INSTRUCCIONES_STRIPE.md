# 🔒 Configuración de Stripe para SpinAndSell

## **📋 Resumen**

Esta guía te ayudará a configurar Stripe para procesar pagos en SpinAndSell, incluyendo:

- Configuración de cuenta Stripe
- Variables de entorno
- Webhooks para eventos de pago
- Testing en modo desarrollo

---

## **1️⃣ Crear Cuenta de Stripe**

### **Paso 1: Registro**

1. Visita [https://stripe.com](https://stripe.com)
2. Crea una cuenta o inicia sesión
3. Activa el modo **Test** para desarrollo

### **Paso 2: Obtener Claves API**

1. Ve a **Developers > API Keys**
2. Copia las siguientes claves:
   - **Publishable key** (pk*test*...)
   - **Secret key** (sk*test*...)

---

## **2️⃣ Variables de Entorno**

Añade estas variables a tu archivo `.env.local`:

```bash
# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_test_tu_clave_secreta_aqui"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_tu_clave_publica_aqui"
STRIPE_WEBHOOK_SECRET="whsec_tu_webhook_secret_aqui"
```

> ⚠️ **IMPORTANTE**: Nunca commits las claves reales en el repositorio

---

## **3️⃣ Configurar Webhooks**

### **Paso 1: Crear Webhook en Stripe**

1. En el Dashboard de Stripe, ve a **Developers > Webhooks**
2. Haz clic en **Add endpoint**
3. URL del endpoint: `https://tu-dominio.com/api/webhooks/stripe`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### **Paso 2: Obtener Secret del Webhook**

1. Copia el **Signing secret** (whsec\_...)
2. Añádelo a tu archivo `.env.local`

### **Para Desarrollo Local:**

```bash
# Usar ngrok para exponer localhost
npx ngrok http 3000

# Usar la URL ngrok como webhook endpoint
# Ejemplo: https://abc123.ngrok.io/api/webhooks/stripe
```

---

## **4️⃣ Configuración del Marketplace**

### **Comisiones Configuradas:**

- **Comisión de plataforma**: 5%
- **Comisión mínima**: €0.50
- **Moneda**: EUR (Euros)

### **Personalizar Comisiones:**

Edita el archivo `src/lib/stripe.ts`:

```typescript
export const STRIPE_CONFIG = {
  currency: "eur",
  platformFeePercent: 5, // Cambiar aquí
  minimumFeeAmount: 50, // En centavos (0.50€)
};
```

---

## **5️⃣ Flujo de Pago Implementado**

### **Proceso de Compra:**

1. **Usuario hace clic en "Comprar Ahora"**
2. **Validaciones del servidor** (producto disponible, no es el vendedor)
3. **Creación de sesión Stripe** (`/api/checkout`)
4. **Redirección a Stripe Checkout**
5. **Procesamiento del pago**
6. **Webhook confirma pago** (`/api/webhooks/stripe`)
7. **Producto marcado como vendido**
8. **Redirección a página de éxito**

### **APIs Implementadas:**

- `POST /api/checkout` - Crear sesión de pago
- `POST /api/webhooks/stripe` - Procesar eventos de Stripe
- `GET /checkout/success` - Página de confirmación

---

## **6️⃣ Testing**

### **Tarjetas de Prueba de Stripe:**

```
Pago exitoso:    4242 4242 4242 4242
Pago fallido:    4000 0000 0000 0002
Requiere 3DS:    4000 0025 0000 1001
```

### **Verificación:**

1. **Crear producto** en `/vender`
2. **Ver producto** en `/producto/[id]`
3. **Hacer clic en "Comprar Ahora"**
4. **Usar tarjeta de prueba**
5. **Verificar webhook** en Stripe Dashboard
6. **Confirmar producto vendido** en base de datos

---

## **7️⃣ Producción**

### **Pasos para Go-Live:**

1. **Cambiar a claves Live** (pk*live* y sk*live*)
2. **Configurar webhook** con dominio de producción
3. **Completar onboarding** de Stripe
4. **Verificar compliance** PCI DSS
5. **Activar cuenta** para pagos reales

### **Monitoreo:**

- **Dashboard Stripe**: Transacciones y análisis
- **Logs del servidor**: `/api/webhooks/stripe`
- **Base de datos**: Productos vendidos y pagados

---

## **8️⃣ Seguridad**

### **Medidas Implementadas:**

- ✅ **Validación de firma** de webhooks
- ✅ **Verificación de sesión** de usuario
- ✅ **Validaciones de negocio** (producto disponible)
- ✅ **Manejo de errores** robusto
- ✅ **No almacenamiento** de datos de tarjetas

### **Recomendaciones:**

- Usar **HTTPS** en producción
- **Rotar claves** periódicamente
- **Monitorear transacciones** sospechosas
- **Backup regular** de base de datos

---

## **🚀 Estado Actual**

### **✅ Implementado:**

- Sistema de pagos completo con Stripe
- Límite de 5 productos por usuario
- Validaciones de autenticación
- Webhooks para confirmación de pago
- UI/UX optimizada para compras
- Manejo de errores completo

### **📋 Próximas Mejoras:**

- [ ] Stripe Connect para pagos directos a vendedores
- [ ] Reembolsos automatizados
- [ ] Analytics de ventas
- [ ] Notificaciones por email
- [ ] Sistema de disputas

---

## **❓ Soporte**

Si tienes problemas:

1. **Revisar logs** del servidor y Stripe Dashboard
2. **Verificar webhooks** están llegando correctamente
3. **Comprobar variables** de entorno
4. **Consultar documentación** de Stripe

**Documentación oficial**: [https://stripe.com/docs](https://stripe.com/docs)
