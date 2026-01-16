# Configuración de Autenticación Email en Supabase

## Problema Resuelto

Cuando un usuario se registra en producción, el email de confirmación que recibe de Supabase debe redirigir a la URL correcta de tu aplicación (`/auth/callback`) y no a Vercel u otra página.

## Solución Implementada en el Código

1. ✅ **Ruta de callback creada**: `/auth/callback` - maneja la confirmación de emails
2. ✅ **emailRedirectTo configurado**: En `signUp()` se añadió la URL de redirección
3. ✅ **Componente de callback**: `AuthCallbackScene` procesa la confirmación

## Configuración Requerida en Supabase Dashboard

Debes configurar las URLs permitidas en tu proyecto de Supabase:

### Paso 1: Accede a Supabase Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto

### Paso 2: Configurar URL Redirect Allowlist

1. Ve a **Authentication** → **URL Configuration**
2. En **Redirect URLs**, añade las siguientes URLs:

   **Para desarrollo:**

   ```
   http://localhost:5173/auth/callback
   ```

   **Para producción:**

   ⚠️ **IMPORTANTE**: Usa el dominio real por el que los usuarios acceden a tu aplicación.
   - **Si tienes dominio personalizado** (ej: `www.beyondthedungeon.org`):
     ```
     https://www.beyondthedungeon.org/auth/callback
     ```
   - **Si usas el dominio de Vercel** (sin dominio propio):
     ```
     https://tu-proyecto.vercel.app/auth/callback
     ```
     (Reemplaza `tu-proyecto` con el nombre real de tu proyecto en Vercel)

3. Guarda los cambios

### Paso 3: Configurar Site URL

En la misma sección **URL Configuration**:

1. **Site URL** para desarrollo:

   ```
   http://localhost:5173
   ```

2. **Site URL** para producción:

   ⚠️ **Usa el mismo dominio que en el paso anterior**:
   - Con dominio propio: `https://www.beyondthedungeon.org`
   - Sin dominio propio: `https://tu-proyecto.vercel.app`

### Paso 4: Verificar Email Templates (Opcional)

Si quieres personalizar el email:

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Confirm signup**
3. Verifica que el enlace tenga la variable correcta. En Supabase, la plantilla por defecto usa:
   ```html
   <a href="{{ .confirm_url }}">Confirm your email</a>
   ```
   Esta variable se reemplazará automáticamente con la URL que incluye el token de confirmación
4. Personaliza el mensaje si lo deseas, pero mantén la variable `{{ .confirm_url }}` en el atributo `href`

## Flujo de Confirmación de Email

### Desarrollo (localhost)

1. Usuario se registra en `http://localhost:5173`
2. Recibe email con enlace: `http://localhost:5173/auth/callback#access_token=...`
3. Click en el enlace → Supabase procesa el token automáticamente
4. La app redirige al dashboard o login

### Producción

1. Usuario se registra en tu aplicación web (tu dominio)
2. Recibe email con enlace a tu dominio: `https://tu-dominio.com/auth/callback#access_token=...`
3. Click en el enlace → Confirmación automática en TU aplicación
4. Redirección al dashboard

**Nota**: El dominio del enlace será el mismo que uses para acceder a tu app, sea un dominio personalizado o el dominio `.vercel.app` asignado por defecto.

## Código sobre el OTP (código de 6 dígitos)

El código que aparece en el email (ej: `77237077`) es un **One-Time Password (OTP)** alternativo.

**Casos de uso:**

- Si el enlace no funciona
- Para confirmación en apps móviles
- Para recuperación de contraseña

**Para implementar verificación por OTP:**

```typescript
// En una nueva ruta o modal de verificación
import { supabase } from "@/lib/supabase";

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) throw error;
  return data;
}
```

## Despliegue y Testing

### Antes de desplegar a producción:

1. ✅ Asegúrate de que las URLs de producción estén en Supabase
2. ✅ Actualiza las variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. ✅ Despliega el código actualizado

### Después del despliegue:

1. Registra un usuario de prueba en producción
2. Verifica que el email llegue correctamente
3. Haz click en el enlace del email
4. Confirma que redirige a `https://www.beyondthedungeon.org/auth/callback`
5. Verifica que el mensaje de confirmación aparece
6. Intenta iniciar sesión

## Troubleshooting

### "Email not confirmed" al hacer login

- El usuario aún no ha confirmado su email
- Revisa que el enlace en el email funcione
- Verifica que la URL esté en la lista permitida de Supabase

### El enlace del email redirige a una página incorrecta

- Verifica que `emailRedirectTo` en el código coincida con las URLs configuradas en Supabase
- Asegúrate de haber guardado los cambios en Supabase Dashboard

### "Invalid redirect URL"

- La URL no está en la lista permitida de Supabase
- Añádela en **Authentication** → **URL Configuration** → **Redirect URLs**

### El código OTP no funciona

- Por ahora no está implementado en el frontend
- Usa el enlace del email
- Si necesitas la función OTP, avísame para implementarla

## Desactivar Confirmación de Email (NO recomendado para producción)

Si por alguna razón quieres desactivar la confirmación de email:

1. Ve a **Authentication** → **Providers** → **Email**
2. Desactiva **Confirm email**
3. Los usuarios podrán loguearse inmediatamente sin confirmar

⚠️ **No recomendado para producción** - permite emails falsos y spam.

## Notas Adicionales

- Los tokens de confirmación expiran después de 24 horas
- Puedes reenviar emails de confirmación usando `supabase.auth.resend()`
- Los cambios en Supabase Dashboard pueden tardar unos segundos en aplicarse
