# Configuración de Producción

## Información del Dominio

**Dominio principal:** https://www.beyondthedungeon.org

Este dominio apunta al servidor VPS donde está desplegada la aplicación en producción.

## Variables de Entorno en Producción

### Frontend (Vercel/VPS)

```env
VITE_SUPABASE_URL=https://frvrzprfdxokhghytbyb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_rYZf-AkP22rKlLUeyxznfA_QY7gzjPC
VITE_BACKEND_URL=https://www.beyondthedungeon.org
```

### Backend (VPS)

```env
PORT=3000
SUPABASE_URL=https://frvrzprfdxokhghytbyb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_rYZf-AkP22rKlLUeyxznfA_QY7gzjPC
NODE_ENV=production
```

## Endpoints Disponibles

### Frontend

- **URL principal:** https://www.beyondthedungeon.org
- **Login:** https://www.beyondthedungeon.org/login
- **Registro:** https://www.beyondthedungeon.org/registro
- **Dashboard:** https://www.beyondthedungeon.org/dashboard
- **Bestiario:** https://www.beyondthedungeon.org/dashboard/bestiario
- **Auth Callback:** https://www.beyondthedungeon.org/auth/callback

### Backend API

- **Health Check:** https://www.beyondthedungeon.org/health
- **Ping:** https://www.beyondthedungeon.org/api/ping
- **Supabase Status:** https://www.beyondthedungeon.org/api/supabase-status
- **Usuarios:** https://www.beyondthedungeon.org/api/users
- **Bestiario:** https://www.beyondthedungeon.org/api/compendium-bestiary

## Configuración de Supabase para Producción

### URLs Permitidas (Redirect URLs)

En Supabase Dashboard → Authentication → URL Configuration, añade:

```
https://www.beyondthedungeon.org/auth/callback
http://localhost:5173/auth/callback
```

La primera es para producción, la segunda para desarrollo local.

### Site URL

```
https://www.beyondthedungeon.org
```

### Email Templates

Los emails de confirmación y recuperación de contraseña usarán automáticamente el Site URL configurado, por lo que los enlaces llevarán a:

```
https://www.beyondthedungeon.org/auth/callback?token=...
```

## Verificación de Producción

### 1. Verificar Backend

```bash
# Health check
curl https://www.beyondthedungeon.org/health

# Ping
curl https://www.beyondthedungeon.org/api/ping

# Estado de Supabase
curl https://www.beyondthedungeon.org/api/supabase-status
```

### 2. Verificar Frontend

Accede a https://www.beyondthedungeon.org y verifica:

- ✅ La página home carga correctamente
- ✅ Puedes registrar un usuario
- ✅ Recibes el email de confirmación
- ✅ El enlace del email te lleva a la página de callback
- ✅ Puedes iniciar sesión
- ✅ El dashboard carga correctamente
- ✅ El bestiario muestra datos (si la BD está poblada)

### 3. Verificar Autenticación

1. Registra un usuario de prueba en producción
2. Revisa tu email
3. El enlace debe ser: `https://www.beyondthedungeon.org/auth/callback#access_token=...`
4. Click en el enlace → Debe mostrarte la página de confirmación
5. Intenta iniciar sesión con las credenciales

## Troubleshooting en Producción

### El frontend no carga

- Verifica que el dominio apunte correctamente al servidor
- Revisa los logs del servidor VPS
- Verifica que el servicio de frontend esté corriendo

### El backend no responde

- Verifica que el puerto 3000 esté abierto
- Revisa los logs: `pm2 logs backend` o similar
- Verifica las variables de entorno en el servidor

### Errores de autenticación

- Verifica que las URLs estén configuradas en Supabase
- Revisa que `VITE_BACKEND_URL` apunte al dominio correcto
- Comprueba que las variables de Supabase sean las correctas

### El bestiario no carga datos

- Verifica que la tabla `compendium_bestiary` exista en Supabase
- Asegúrate de que las políticas RLS permitan lectura pública
- Ejecuta los scripts de seed si la tabla está vacía
- Verifica la conectividad backend → Supabase

### Emails no llegan o tienen enlaces incorrectos

- Verifica el Site URL en Supabase: debe ser `https://www.beyondthedungeon.org`
- Comprueba que las Redirect URLs incluyan `/auth/callback`
- Revisa la bandeja de spam
- Verifica en Supabase Dashboard → Authentication → Logs

## Despliegue Automático (CI/CD)

El proyecto usa GitHub Actions para despliegue automático:

1. Hacer push/merge a la rama `main`
2. GitHub Actions ejecuta el workflow de despliegue
3. Se construyen las imágenes Docker
4. Se despliegan al VPS
5. Los servicios se reinician automáticamente

### Verificar el estado del despliegue

- Ve a GitHub → Actions
- Busca el workflow más reciente
- Verifica que todos los pasos hayan pasado
- Si falla, revisa los logs del workflow

## Monitoreo

### Logs del Backend

```bash
# En el VPS
pm2 logs backend
# o
docker logs btd-backend
```

### Logs del Frontend

```bash
# En el VPS
pm2 logs frontend
# o
docker logs btd-frontend
```

### Métricas

Puedes implementar monitoreo adicional con herramientas como:

- **Uptime monitoring:** UptimeRobot, Pingdom
- **Error tracking:** Sentry
- **Analytics:** Google Analytics, Plausible
- **Logs centralizados:** Papertrail, Loggly

## Backups

### Base de Datos (Supabase)

Supabase realiza backups automáticos. Puedes:

- Acceder a backups en Supabase Dashboard → Database → Backups
- Configurar puntos de restauración
- Exportar datos manualmente cuando sea necesario

### Código

- El código está respaldado en GitHub
- Mantén las ramas `main` y `dev` actualizadas
- Usa tags para versiones importantes: `git tag v1.0.0`

## Escalado

Si necesitas escalar la aplicación:

### Frontend

- Usar un CDN (Cloudflare, Vercel Edge)
- Optimizar imágenes y assets
- Implementar caching

### Backend

- Agregar más instancias con load balancer
- Implementar Redis para caching
- Optimizar queries a la base de datos

### Base de Datos

- Supabase escala automáticamente según el plan
- Considera índices adicionales para queries frecuentes
- Implementa paginación en endpoints que devuelvan muchos datos
