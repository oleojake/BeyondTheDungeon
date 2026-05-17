# 📋 Estado de requisitos — Beyond The Dungeon

> Estado final del proyecto a fecha de entrega (mayo 2026).  
> Para uso interno del equipo de desarrollo.

---

## ⏳ Pendientes / Descartados

| Estado        | Requisito                       | Nota                                                             |
| ------------- | ------------------------------- | ---------------------------------------------------------------- |
| ⏳ Pendiente  | Validar registro con captcha    | Lo implementa el compañero                                       |
| ⏳ Pendiente  | Realización de pruebas          | Lo implementa el compañero                                       |
| ⏳ Pendiente  | Análisis: nube vs local         | Se documenta en MEMORIA.md § 5.11                                |
| ❌ Descartado | Integración de pasarela de pago | Fuera del alcance del proyecto; justificado en MEMORIA.md § 5.14 |

---

## ✅ Listado completo de requisitos

### 🔐 Autenticación y usuarios

| Estado | Requisito                                             | Notas                                                                  |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| ✅     | Realizar un login                                     | Email/contraseña vía Supabase Auth                                     |
| ✅     | Entrar con diferentes perfiles con permisos distintos | Roles DM/jugador en campañas + `is_admin` global con `<AdminRoute>`    |
| ⏳     | Validar registro con captcha                          | hCaptcha implementado en rama `dev`; pendiente de deploy por compañero |
| ✅     | Login con sistemas externos (Google)                  | `signInWithGoogle()` en supabaseAuth.ts, botón en login y register     |
| ✅     | Encriptar passwords de forma segura                   | Delegado a Supabase Auth (bcrypt internamente)                         |
| ✅     | Verificación de registro mediante email               | One-time link → `/auth/callback`; resend disponible en UI              |
| ✅     | Gestión de login con tokens en el cliente             | Bearer token en requests, `getSession()`, validación server-side       |
| ✅     | Control de acceso a rutas según usuario/roles         | `<ProtectedRoute>` y `<AdminRoute>` en app.router.tsx                  |

---

### 🖥️ Desarrollo (Frontend / Backend)

| Estado | Requisito                               | Notas                                                           |
| ------ | --------------------------------------- | --------------------------------------------------------------- |
| ✅     | Frontend en React                       | React 18 + TypeScript + Vite                                    |
| ✅     | Backend con Node.js                     | Express en puerto 3000, ~50 endpoints                           |
| ✅     | Conexión con base de datos              | Supabase PostgreSQL con RLS                                     |
| ✅     | Desarrollo de API REST para el frontend | CRUD completo para campañas, fichas, mapas, foro, admin         |
| ✅     | Consumir APIs externas                  | `dnd5eapi.co` para imágenes del bestiario + hCaptcha + Supabase |
| ✅     | Diseño web responsive                   | TailwindCSS con breakpoints móvil/tablet/desktop                |
| ✅     | Uso de framework de diseño              | TailwindCSS + shadcn/ui                                         |

---

### 💳 Funcionalidades extra

| Estado | Requisito                       | Notas                                                          |
| ------ | ------------------------------- | -------------------------------------------------------------- |
| ❌     | Integración de pasarela de pago | Descartado; justificado en MEMORIA.md § 5.14                   |
| ✅     | Envío de emails automatizados   | Nodemailer: invitaciones a campaña + inicio de sesión de juego |

---

### 🌍 Internacionalización y sostenibilidad

| Estado | Requisito                                          | Notas                                                    |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| ✅     | Internacionalización (mínimo 2 idiomas)            | Sistema i18n propio con Context. ES + EN. Selector en UI |
| ✅     | Buenas prácticas de sostenibilidad (ODS 9, 12, 13) | Documentado en MEMORIA.md § 4.6                          |

---

### 🧪 Calidad y documentación

| Estado | Requisito                          | Notas                                                                  |
| ------ | ---------------------------------- | ---------------------------------------------------------------------- |
| ✅     | Documentación de análisis y diseño | MEMORIA.md con todos los apartados requeridos                          |
| ⏳     | Realización de pruebas             | Pendiente; lo implementa el compañero (Vitest + React Testing Library) |
| ✅     | Manual de usuario                  | Sección `/guias` en la app + README.md como manual técnico             |
| ✅     | Investigación de IAs aplicables    | Documentado en MEMORIA.md                                              |

---

### 🚀 Despliegue y DevOps

| Estado | Requisito                                             | Notas                                                                  |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| ✅     | Manual técnico de despliegue reproducible             | README.md — guía completa desde cero                                   |
| ⏳     | Análisis nube vs local (costes, seguridad, legalidad) | Se desarrolla en MEMORIA.md § 5.11                                     |
| ✅     | **Despliegue en VPS con Docker Compose**              | VPS vmi3022429, Docker Compose, GitHub Actions CI/CD en push a `main`  |
| ✅     | **Despliegue Node.js + Nginx como proxy inverso**     | Nginx sirve el frontend y hace reverse proxy al backend en puerto 3000 |
| ✅     | **Despliegue PaaS con contenedores + CI/CD**          | Docker + GitHub Actions equivale funcionalmente a este requisito       |
| —      | Despliegue híbrido (local + S3/CloudFront)            | No aplica — cubierto por VPS + Supabase Storage                        |
| —      | Despliegue en cloud con VMs (EC2/GCP/Azure)           | No aplica — cubierto por VPS                                           |
| —      | Despliegue serverless                                 | No aplica — cubierto por VPS                                           |
| —      | Despliegue Node.js + Apache + Passenger               | No aplica — se usa Nginx                                               |

> **Nota:** Los tipos de despliegue son **alternativos**. Cumplir VPS + Docker + Nginx + CI/CD cubre el requisito de despliegue completo.
