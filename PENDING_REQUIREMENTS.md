# 📋 Requisitos pendientes — Beyond The Dungeon

> Documento generado tras análisis exhaustivo del código fuente (mayo 2026).  
> Para uso interno del equipo de desarrollo. Pasar a la IA de trabajo como contexto.

---

## 🗂️ Contexto del proyecto

**Beyond The Dungeon** es una plataforma web de gestión de partidas de rol (D&D 5e) con las siguientes herramientas ya implementadas:

- Sistema de campañas (crear, invitar jugadores, gestionar capítulos y escenas)
- Fichas de personaje completas (D&D 5e con multiclase)
- Mesa virtual (VTT) con tokens, combate e iniciativa
- Editor de mapas de batalla (canvas con rejilla, zoom, pan)
- Compendio D&D 5e SRD (bestiario, hechizos, objetos — 2014 y 2024)
- Foro comunitario (hilos y mensajes)
- Guías de usuario
- Lanzador de dados
- Gestor de inventario
- Panel de administración
- Autenticación completa (email/contraseña + Google OAuth + hCaptcha en registro)
- Internacionalización ES/EN
- Despliegue en VPS con Docker Compose + CI/CD (GitHub Actions)

**Stack:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui (frontend) · Node.js + Express (backend) · Supabase (PostgreSQL + Auth + Storage + Realtime) · Docker Compose · Nginx

**Producción:** https://www.beyondthedungeon.org  
**Ramas:** `main` (producción), `dev` (integración), feature branches

---

## ✅ Estado real de los requisitos del backlog

### 🔐 Autenticación y usuarios

| Requisito                                             | Estado                 | Notas                                                                                                                                                                                                                               |
| ----------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Realizar un login                                     | ✅ Completo            | Email/contraseña vía Supabase Auth                                                                                                                                                                                                  |
| Entrar con diferentes perfiles con permisos distintos | ✅ Completo            | Roles DM/jugador dentro de campañas + rol `is_admin` global. Admins acceden a `/admin` (gestión de usuarios, estadísticas, borrado de cuentas) mediante `<AdminRoute>`. Usuarios normales no ven ni acceden a esa sección           |
| Validar registro con captcha                          | ⚠️ Pendiente de deploy | hCaptcha implementado en `dev` (register.component.tsx + login.container.tsx) pero **`dev` no está mergeado a `main`**. El Dockerfile y docker-compose.yml ya tienen la variable `VITE_HCAPTCHA_SITE_KEY` correctamente configurada |
| Login con sistemas externos (Google)                  | ✅ Completo            | `signInWithGoogle()` implementado en supabaseAuth.ts, botón en login y register                                                                                                                                                     |
| Encriptar passwords de forma segura                   | ✅ Completo            | Delegado a Supabase Auth (bcrypt internamente)                                                                                                                                                                                      |
| Verificación de registro mediante email               | ✅ Completo            | Email de confirmación con one-time link → `/auth/callback`. Resend disponible en UI                                                                                                                                                 |
| Gestión de login con tokens en el cliente             | ✅ Completo            | Bearer token en requests, `getSession()`, validación server-side con `supabase.auth.getUser(token)`                                                                                                                                 |
| Control de acceso a rutas según usuario/roles         | ✅ Completo            | `<ProtectedRoute>` y `<AdminRoute>` en app.router.tsx                                                                                                                                                                               |

---

### 🖥️ Desarrollo (Frontend / Backend)

| Requisito                  | Estado      | Notas                                                                                                                                                                                                                    |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend en React          | ✅ Completo | React 18 + TypeScript + Vite                                                                                                                                                                                             |
| Backend con Node.js        | ✅ Completo | Express en puerto 3000                                                                                                                                                                                                   |
| Conexión con base de datos | ✅ Completo | Supabase PostgreSQL                                                                                                                                                                                                      |
| Desarrollo de API REST     | ✅ Completo | ~50 endpoints documentados en backend/src/index.js                                                                                                                                                                       |
| Consumir APIs externas     | ⚠️ Parcial  | Solo Supabase y hCaptcha. Los datos D&D son JSON locales (no llama a api.open5e.com ni dnd5eapi.co). **Para marcar completo**: integrar al menos una API externa real (p.ej. D&D 5e API pública para datos actualizados) |
| Diseño web responsive      | ✅ Completo | TailwindCSS con breakpoints móvil/tablet/desktop                                                                                                                                                                         |
| Framework de diseño        | ✅ Completo | TailwindCSS + shadcn/ui                                                                                                                                                                                                  |

---

### 💳 Funcionalidades extra

| Requisito                       | Estado             | Notas                                                                                                                                        |
| ------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Integración de pasarela de pago | ❌ No implementado | No existe ningún código de pago. **A implementar**: Stripe (recomendado) para suscripciones o donaciones                                     |
| Envío de emails automatizados   | ✅ Completo        | Nodemailer en backend. Se envían emails al iniciar sesión de juego y al invitar a campañas. Requiere `SMTP_HOST` configurado en backend/.env |

---

### 🌍 Internacionalización y sostenibilidad

| Requisito                                          | Estado            | Notas                                                                                                                                                                                                    |
| -------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Internacionalización (mínimo 2 idiomas)            | ✅ Completo       | Sistema i18n propio con Context. ES (principal) + EN. Selector de idioma en UI. Translations en `frontend/src/i18n/translations.ts`                                                                      |
| Buenas prácticas de sostenibilidad (ODS 9, 12, 13) | ✅ Completo       | Documentado en **MEMORIA.md § 4.6**: ODS 9 (Docker, CI/CD, arquitectura modular), ODS 12 (lazy loading, Vite tree-shaking, TailwindCSS purge, sin CDN externo, modo oscuro), ODS 13 (VPS europeo, servidor compartido, Nginx gzip, sin cron jobs innecesarios) |

---

### 🧪 Calidad y documentación

| Requisito                          | Estado             | Notas                                                                                                                                                                               |
| ---------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentación de análisis y diseño | ✅ Completo        | Existe BBDD.md, SETUP.md, README.md, PRODUCCION.md. **Creado MEMORIA.md** con introducción, antecedentes, análisis de requisitos (RF+RNF), diseño (metodología, módulos, casos de uso, ER, interfaz), conclusiones y bibliografía |
| Realización de pruebas             | ❌ No implementado | **Cero archivos de test** en frontend ni backend. No hay Jest/Vitest configurado. **A implementar**: tests unitarios mínimos (validaciones de formularios, lógica de autenticación) |
| Manual de usuario                  | ✅ Completo        | Sección `/guias` dentro de la app con guías interactivas por tema (campañas, fichas, VTT, dados, etc.). El `README.md` cubre el manual técnico de despliegue                        |
| Investigación de IAs aplicables    | ✅ Completo        | Documentado (según backlog)                                                                                                                                                         |

---

### 🚀 Despliegue y DevOps

| Requisito                                     | Estado            | Notas                                                                                                                   |
| --------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Manual técnico de despliegue reproducible     | ✅ Completo       | SETUP.md cubre instalación desde cero                                                                                   |
| Análisis nube vs local                        | ❌ No documentado | **A crear**: documento comparando costes/seguridad/legalidad de VPS vs AWS/GCP vs serverless                            |
| Despliegue en VPS con Docker Compose          | ✅ Completo       | VPS vmi3022429, Docker Compose, GitHub Actions CI/CD automático en push a `main`                                        |
| Despliegue Node.js + Nginx como proxy inverso | ✅ Completo       | Nginx sirve el frontend (nginx.conf) y actúa de reverse proxy. **Marcar como cumplido** ya que es equivalente funcional |

> **Nota sobre "tipos de despliegue":** Los requisitos de despliegue son alternativos (cumplir uno es suficiente). El VPS con Docker Compose + Nginx está completo y en producción.

---

## 🆕 Nuevas funcionalidades a implementar

### 1. 🖼️ Adjuntar fotos en el foro y visualización en mensajes

**Contexto:** El foro existe (`foro.scene.tsx`, `foro-hilo.scene.tsx`, tablas `forum_threads` y `forum_posts`). Actualmente solo admite texto plano.

**Qué falta:**

**Backend:**

- Endpoint `POST /api/forum-posts/:id/image` para subir imagen a un post
- O aceptar `image_url` al crear/editar post en los endpoints existentes
- Añadir columna `image_url` a `forum_posts` y `forum_threads` si no existe

**Frontend:**

- En el formulario de creación de post/hilo: añadir input de imagen con preview
- Subir a Supabase Storage bucket `forum-images`
- En la vista del hilo (`foro-hilo.scene.tsx`): renderizar `<img>` si el post tiene `image_url`
- Lightbox/modal para ver imagen a tamaño completo (opcional pero recomendado)

**Supabase:**

- Crear bucket `forum-images` (public read, authenticated write)
- RLS: solo el autor del post puede subir/eliminar su imagen

---

### 3. 🤖 Captcha en login y registro (completar el deploy)

**Contexto:** El captcha (hCaptcha) ya está **completamente implementado en la rama `dev`** pero **no se ha mergeado a `main`** (producción). El Dockerfile y docker-compose.yml ya tienen la variable `VITE_HCAPTCHA_SITE_KEY` correctamente configurada en `main`.

**Qué falta:**

1. Hacer PR `dev` → `main` (merge estándar)
2. Resolver el conflicto en `frontend/Dockerfile` — conservar la versión de `main` (que tiene el `printf > .env`)
3. Verificar tras el deploy que el widget de captcha aparece en `/login` y `/register`
4. Confirmar que `VITE_HCAPTCHA_SITE_KEY=15b68588-20c0-49ac-8ebc-0098050c4b98` está en el `.env` del VPS

**Archivos afectados en `dev`:**

- `frontend/src/pods/login/login.component.tsx` — tiene `<HCaptcha size="invisible" />`
- `frontend/src/pods/login/login.container.tsx` — tiene `captchaRef`, llama a `.execute()` y pasa `captchaToken` a `signIn()`
- `frontend/src/pods/register/register.component.tsx` — ídem para registro
- `frontend/src/core/auth/supabaseAuth.ts` — `signIn()` acepta `captchaToken` opcional

---

### 4. ✅ Crear y añadir fotos para las cards de la Home que tienen el mock (OBJETOS Y EQUIPO) (INVENTARIO)

**Completado:** Se generaron imágenes con estilo *dark fantasy* y se añadieron a `frontend/public/` como `items.png` e `inventory.png`. Se actualizaron los paths en `features.component.tsx` (líneas `icon: "/items.png"` e `icon: "/inventory.png"`). Las cards ahora muestran imagen correctamente.

---

## 📌 Resumen de prioridades

| Prioridad | Tarea                                                             | Esfuerzo estimado |
| --------- | ----------------------------------------------------------------- | ----------------- |
| 🔴 Alta   | Merge `dev` → `main` (desbloquea captcha + otras features de dev) | 30 min            |
| 🔴 Alta   | Tests unitarios mínimos (Vitest + React Testing Library)          | 2-3 días          |
| ✅ Hecho  | Foto de personaje (upload en mi-ficha)                            | ~~1 día~~         |
| 🟡 Media  | Imágenes en foro                                                  | 1-2 días          |
| ✅ Hecho  | Documento análisis/diseño formal → **MEMORIA.md creado**          | —                 |
| 🟠 Baja   | Pasarela de pago (Stripe)                                         | 3-4 días          |
| 🟠 Baja   | Análisis nube vs local (documento)                                | 2-3 horas         |
| ✅ Hecho  | Documentar sostenibilidad (ODS) → **MEMORIA.md § 4.6**          | —                 |
| 🟠 Baja   | Consumir API externa D&D real                                     | 1-2 días          |

---

## 🏗️ Arquitectura actual (referencia rápida)

```
frontend/src/
├── core/
│   ├── auth/           # ProtectedRoute, AdminRoute, supabaseAuth.ts
│   └── api/            # Servicios REST (campaigns, characters, etc.)
├── pods/               # Lógica por funcionalidad (login, register, home)
├── scenes/             # Páginas/vistas enrutadas
├── components/         # Componentes reutilizables (navbar, sidebar, ProfileTabs)
├── router/             # app.router.tsx, routes.ts
├── layout/             # AppLayout, ProfileLayout
├── i18n/               # Sistema de traducciones ES/EN
└── lib/
    └── supabase.ts     # Cliente Supabase

backend/src/
└── index.js            # Express app + todos los endpoints (~50 rutas)

scripts/
└── seed-hybrid.js      # Poblar Supabase con datos D&D 5e SRD (2014 + 2024)
```

**Variables de entorno necesarias en el VPS** (`/opt/btd/BeyondTheDungeon/.env`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
VITE_BACKEND_URL=
VITE_HCAPTCHA_SITE_KEY=
APP_URL=
```

**Variables de entorno del backend** (`/opt/btd/BeyondTheDungeon/backend/.env`):

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3000
SMTP_HOST=       # Opcional — si no está, emails desactivados
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```
