# 📜 Memoria del Proyecto — Beyond The Dungeon

**Proyecto Intermodular — 2º DAW**  
**Curso:** 2025-2026  
**Sitio web:** [www.beyondthedungeon.org](https://www.beyondthedungeon.org)  
**Repositorio:** [github.com/oleojake/BeyondTheDungeon](https://github.com/oleojake/BeyondTheDungeon)

---

### Índice

1. [Introducción y objetivos](#1-introducción-y-objetivos)
2. [Antecedentes y estado del arte](#2-antecedentes-y-estado-del-arte)
3. [Análisis de requisitos](#3-análisis-de-requisitos)
4. [Diseño](#4-diseño)
5. [Metodología de desarrollo](#5-metodología-de-desarrollo)
6. [Módulos y componentes principales](#6-módulos-y-componentes-principales)
7. [Diagrama de casos de uso](#7-diagrama-de-casos-de-uso)
8. [Modelo entidad-relación (Opcional I)](#8-modelo-entidad-relación-opcional-i)
9. [Diseño de la interfaz (Opcional II)](#9-diseño-de-la-interfaz-opcional-ii)
10. [Implementación](#10-implementación)
11. [Conclusiones](#11-conclusiones)
12. [Bibliografía](#12-bibliografía)

---

## 1. Introducción y objetivos

### 1.1 Descripción del problema a resolver

Los juegos de rol de mesa, y en particular **Dungeons & Dragons 5ª Edición (D&D 5e)**, requieren una cantidad significativa de gestión de información durante las partidas: fichas de personaje con decenas de campos, bestiarios con cientos de criaturas, listados de hechizos y objetos mágicos, mapas de batalla y coordinación entre varios jugadores y el Dungeon Master (DM). Tradicionalmente, toda esta información se gestiona en papel o repartida en múltiples herramientas desconectadas entre sí, lo que provoca:

- Pérdida o deterioro de fichas de personaje físicas.
- Necesidad de consultar libros físicos durante la partida (ralentización).
- Dificultad para compartir información entre jugadores en tiempo real, especialmente en partidas online.
- Ausencia de un espacio centralizado donde el DM pueda organizar su campaña (capítulos, escenas, personajes).

### 1.2 Descripción de la solución aportada

**Beyond The Dungeon** es una plataforma web completa de apoyo a partidas de rol de mesa, centrada en D&D 5e. Integra en una única aplicación las herramientas que los jugadores y DMs necesitan:

- **Gestión de campañas** con estructura jerárquica (campaña → capítulos → escenas) y sistema de invitaciones.
- **Fichas de personaje digitales** con todos los campos estándar de D&D 5e, soporte para multiclase, inventario visual y sistema de carga.
- **Mesa virtual (VTT)** con tokens, combate por turnos y comunicación en tiempo real.
- **Editor de mapas de batalla** con cuadrícula personalizable, zoom y pan.
- **Compendio D&D 5e SRD** completo: bestiario (2014 + 2024), hechizos y objetos con búsqueda y filtros.
- **Lanzador de dados** integrado.
- **Gestor de inventario** visual con paperdoll y monedero.
- **Foro comunitario** con hilos y mensajes.
- **Guías de usuario** interactivas dentro de la app.
- **Panel de administración** para gestión de usuarios.

La plataforma está disponible públicamente en [www.beyondthedungeon.org](https://www.beyondthedungeon.org) y soporta dos idiomas (español e inglés).

### 1.3 Motivación

La motivación principal es **centralizar y digitalizar** la experiencia de juego de rol, eliminando la fricción que supone combinar papel, PDFs, Discord y otras herramientas para una sola partida. Existen soluciones similares en el mercado (ver apartado 2), pero la mayoría son de pago, están en inglés o no cubren las necesidades específicas del mercado hispanohablante. Beyond The Dungeon nace como una alternativa **gratuita, en español y con todo integrado**.

Desde el punto de vista educativo, el proyecto sirve como ejercicio práctico de desarrollo web full-stack completo, abordando autenticación, APIs REST, bases de datos relacionales, despliegue en producción y trabajo en equipo con control de versiones.

---

## 2. Antecedentes y estado del arte

### 2.1 Soluciones previas y existentes

#### Roll20 (2012 — presente)

La plataforma líder en mesas virtuales para juegos de rol. Ofrece VTT completo, gestión de campañas, lanzador de dados y chat de voz/vídeo integrado. Su modelo freemium limita características clave (calidad de vídeo, acceso a compendio completo) tras un muro de pago. La interfaz está íntegramente en inglés y la curva de aprendizaje es elevada.

#### D&D Beyond (2017 — presente, adquirida por Hasbro/Wizards en 2022)

La plataforma oficial de D&D 5e. Ofrece el compendio completo (con licencia oficial), fichas de personaje digitales y un constructor de personajes muy completo. Sin embargo, el contenido más allá del SRD requiere compra. La integración con VTT y herramientas de campaña es limitada (requiere conexión con Roll20 o Foundry). Está disponible parcialmente en español.

#### Foundry VTT (2020 — presente)

Software de mesa virtual de pago único que se instala en servidor propio. Es la opción más potente y personalizable (sistema de módulos), pero requiere conocimientos técnicos para el despliegue y un pago inicial (~50 USD). Comunidad muy activa y soporte para múltiples sistemas de juego.

#### Astral Tabletop (2017 — cerrada en 2022)

Plataforma VTT gratuita que cerró sus puertas en 2022, demostrando la dificultad de mantener estos proyectos sin un modelo de negocio sólido. Fue popular por su facilidad de uso y ausencia de coste.

#### Tableplop (2019 — presente)

Alternativa gratuita y minimalista al Roll20, con VTT básico y fichas de personaje simples. Sin compendio integrado ni gestión de campañas estructurada.

### 2.2 Estado del arte y tendencias actuales

El mercado de herramientas digitales para juegos de rol de mesa ha crecido exponencialmente desde 2020 (pandemia → popularización de las partidas online). Las tendencias actuales son:

- **Integración total**: Las plataformas tienden a unificar VTT, fichas, compendio y comunicación en una única herramienta (ej: Roll20 Nexus, en beta).
- **Tiempo real**: Supabase Realtime, Firebase y tecnologías similares permiten sincronización instantánea entre jugadores, elemento ya implementado en Beyond The Dungeon.
- **Móvil-first**: Mayor demanda de interfaces responsivas para consultar fichas desde el móvil durante la partida.
- **IA aplicada**: Generación de contenido (descripciones de escenas, NPCs) mediante LLMs. Rol en expansión.
- **Licencias abiertas**: Tras la controversia de la OGL en 2023, el SRD de D&D 5e se publicó bajo Creative Commons, facilitando el desarrollo de herramientas de terceros sin riesgo legal.
- **Localización**: Creciente demanda de plataformas en idiomas distintos al inglés, especialmente para el mercado hispanohablante (España y Latinoamérica).

Beyond The Dungeon se posiciona en este contexto como una herramienta **gratuita, en español, enfocada en D&D 5e** y con todas las herramientas integradas en una sola aplicación web desplegada en producción.

---

## 3. Análisis de requisitos

### 3.1 Descripción detallada de la funcionalidad

Beyond The Dungeon ofrece las siguientes funcionalidades principales:

**Módulo de autenticación y usuarios:**
Los usuarios pueden registrarse con email/contraseña o mediante Google OAuth. El registro incluye verificación por email y protección anti-bot con hCaptcha. El sistema diferencia entre usuarios normales y administradores, con rutas protegidas según el rol.

**Módulo de campañas:**
El DM puede crear campañas con título, descripción y notas privadas. Cada campaña se organiza en capítulos y escenas, con un editor de texto enriquecido. El DM puede invitar jugadores por email. Los jugadores invitados pueden unirse y acceder a la información compartida de la campaña.

**Módulo de fichas de personaje:**
Ficha completa de D&D 5e con todos los campos estándar: atributos, habilidades, salvaciones, combate (HP, CA, iniciativa), inventario visual (paperdoll, consumibles, bolsa, monedero), hechizos y rasgos de personalidad. Soporta multiclase. Los datos se persisten en base de datos.

**Mesa virtual (VTT):**
Durante una sesión de juego en vivo, el DM y los jugadores acceden a una pantalla compartida con mapa de batalla, tokens de personajes/enemigos y sistema de combate por turnos con orden de iniciativa. Los cambios se sincronizan en tiempo real mediante Supabase Realtime.

**Editor de mapas de batalla:**
Herramienta de canvas interactivo para crear y guardar mapas con cuadrícula personalizable, zoom y paneo. Los mapas pueden cargarse en las sesiones de juego.

**Compendio D&D 5e SRD:**
Base de datos completa (2014 + 2024) de criaturas, hechizos y objetos, con búsqueda por nombre y filtros avanzados. Accesible de forma autónoma y también integrado en el gestor de campañas para añadir entidades a las escenas.

**Módulo de inventario:**
Gestión visual del inventario del personaje con paperdoll de slots de equipo, consumibles con contadores, bolsa de objetos con autocompletado desde el compendio y monedero con todas las denominaciones de D&D 5e.

**Lanzador de dados:**
Simulador de todos los dados estándar de D&D (d4, d6, d8, d10, d12, d20, d100) con historial de tiradas y soporte para notación estándar (ej: 2d6+3).

**Foro comunitario:**
Espacio de discusión organizado en hilos donde los usuarios pueden compartir experiencias, recursos y consultas.

**Guías de usuario:**
Sección de ayuda interactiva dentro de la app que explica el uso de cada módulo principal.

**Panel de administración:**
Accesible únicamente para usuarios con rol `is_admin`. Muestra estadísticas de la plataforma (usuarios registrados, activos, campañas) y permite gestionar cuentas de usuario.

### 3.2 Requisitos funcionales

| ID    | Requisito                 | Descripción                                                                                                   |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| RF-01 | Registro de usuario       | El sistema permite crear una cuenta con email/contraseña o Google OAuth, con verificación por email           |
| RF-02 | Inicio de sesión          | El usuario puede autenticarse con sus credenciales o mediante Google                                          |
| RF-03 | Protección anti-bot       | El registro incluye validación hCaptcha                                                                       |
| RF-04 | Control de acceso por rol | Las rutas protegidas son accesibles solo para usuarios autenticados; el panel admin solo para administradores |
| RF-05 | Gestión de campañas       | El DM puede crear, editar y eliminar campañas con estructura jerárquica                                       |
| RF-06 | Invitación de jugadores   | El DM puede invitar jugadores por email; los invitados reciben un enlace de acceso                            |
| RF-07 | Ficha de personaje        | El usuario puede crear y editar una ficha de personaje completa de D&D 5e                                     |
| RF-08 | Multiclase                | La ficha soporta hasta 3 clases simultáneas con niveles independientes                                        |
| RF-09 | Inventario visual         | El inventario incluye paperdoll, consumibles, bolsa y monedero                                                |
| RF-10 | Sesión de juego en vivo   | El DM puede iniciar una sesión; todos los participantes ven el mapa y el combate en tiempo real               |
| RF-11 | Sistema de combate        | La sesión incluye orden de iniciativa, turnos y gestión de HP de criaturas/personajes                         |
| RF-12 | Editor de mapas           | El usuario puede crear mapas con canvas, cuadrícula, zoom y pan; guardarlos y cargarlos en sesiones           |
| RF-13 | Compendio bestiario       | El sistema muestra el listado completo de criaturas SRD con búsqueda y filtros                                |
| RF-14 | Compendio hechizos        | El sistema muestra el listado completo de hechizos SRD con búsqueda y filtros                                 |
| RF-15 | Compendio objetos         | El sistema muestra el catálogo completo de objetos SRD con búsqueda y filtros                                 |
| RF-16 | Lanzador de dados         | El usuario puede lanzar dados estándar de D&D con historial de resultados                                     |
| RF-17 | Foro comunitario          | Los usuarios pueden crear hilos y publicar mensajes                                                           |
| RF-18 | Guías de usuario          | La app incluye guías de ayuda por módulo accesibles sin autenticación                                         |
| RF-19 | Panel de administración   | El admin puede ver estadísticas y gestionar cuentas de usuario                                                |
| RF-20 | Internacionalización      | La interfaz está disponible en español e inglés con selector de idioma                                        |
| RF-21 | Modo oscuro               | La interfaz soporta modo claro y modo oscuro                                                                  |
| RF-22 | Notificaciones por email  | El sistema envía emails automáticos en eventos clave (invitaciones, inicio de sesión de juego)                |

### 3.3 Requisitos no funcionales

| ID     | Requisito               | Descripción                                                                                                    |
| ------ | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Rendimiento             | Las páginas principales deben cargar en menos de 3 segundos con conexión estándar                              |
| RNF-02 | Disponibilidad          | La plataforma debe estar disponible 24/7; el despliegue en VPS con Docker garantiza reinicio automático        |
| RNF-03 | Seguridad               | Las contraseñas se gestionan mediante Supabase Auth (bcrypt); los tokens JWT tienen expiración configurable    |
| RNF-04 | Seguridad de datos      | Las políticas RLS (Row Level Security) de Supabase garantizan que cada usuario solo accede a sus propios datos |
| RNF-05 | Escalabilidad           | La arquitectura basada en Supabase y Docker Compose permite escalar componentes de forma independiente         |
| RNF-06 | Responsividad           | La interfaz debe ser usable en dispositivos móviles, tablets y escritorio (breakpoints TailwindCSS)            |
| RNF-07 | Mantenibilidad          | El código sigue la arquitectura de pods, con separación container/component y nomenclatura consistente         |
| RNF-08 | Tiempo real             | Los cambios en la sesión de juego deben propagarse a todos los clientes en menos de 500ms                      |
| RNF-09 | Compatibilidad          | La aplicación debe funcionar en los navegadores modernos (Chrome, Firefox, Safari, Edge)                       |
| RNF-10 | Despliegue reproducible | El entorno de producción debe poder recrearse desde cero siguiendo el SETUP.md                                 |
| RNF-11 | Internacionalización    | Toda cadena de texto visible debe estar externalizada en el sistema i18n; no se permiten strings hardcodeados  |
| RNF-12 | Accesibilidad           | Los elementos interactivos deben tener atributos ARIA y etiquetas descriptivas                                 |

---

## 4. Diseño

Este bloque recoge las decisiones de diseño del proyecto: metodología, arquitectura de componentes, interacción entre actores, modelo de datos e interfaz.

Las principales decisiones de diseño tomadas a lo largo del desarrollo han sido:

- **Pod Architecture** en el frontend, para garantizar separación de responsabilidades y facilitar el testing.
- **Supabase como BaaS** (Backend as a Service), delegando autenticación, base de datos PostgreSQL con RLS, Storage S3-compatible y Realtime WebSocket a un único proveedor gestionado.
- **Backend Express minimalista** solo para lógica que requiere servidor (emails, operaciones admin, cálculos sobre datos de múltiples usuarios).
- **Docker Compose multi-servicio** para unificar el despliegue de frontend y backend en un único comando reproducible.
- **CI/CD declarativo con GitHub Actions** para despliegue automático sin intervención manual.
- **JSONB en PostgreSQL** para almacenar estructuras flexibles como las estadísticas del personaje y el inventario, evitando rigidez de esquema en campos que pueden evolucionar.
- **Sistema i18n propio** (sin librerías externas) basado en React Context, para mantener el control total sobre el tipo de las claves de traducción.

---

## 5. Metodología de desarrollo

Se ha empleado una **metodología ágil basada en Scrum simplificado**, adaptada al contexto de un equipo pequeño de dos personas:

- **Sprints cortos** de 1-2 semanas con entregables funcionales al final de cada uno.
- **Backlog priorizado** de historias de usuario gestionado como Issues en GitHub, categorizados con etiquetas (`feature`, `bug`, `docs`, `chore`).
- **Ramas de feature** por funcionalidad, siguiendo el esquema `feature/nombre-funcionalidad`, con Pull Requests hacia `dev` antes de integrar.
- **Rama `dev`** como entorno de integración. Los cambios estables se mergean a `main` para el despliegue a producción.
- **Integración continua**: el workflow `.github/workflows/deploy.yml` se dispara automáticamente en cada push a `main`. Se conecta al VPS por SSH y ejecuta `git pull → docker compose down → docker compose up -d --build → docker system prune -f`.
- **Concurrencia controlada**: el workflow usa `concurrency: cancel-in-progress: true` para evitar despliegues simultáneos si hay pushes rápidos consecutivos.

**División de responsabilidades en el equipo:**

| Área                                   | Responsable           |
| -------------------------------------- | --------------------- |
| Frontend (React, UI, pods, router)     | Miembro A             |
| Backend (Node.js, API REST, emails)    | Miembro B             |
| Base de datos (esquema, RLS, triggers) | Compartido            |
| DevOps (Docker, Nginx, CI/CD, VPS)     | Compartido            |
| hCaptcha, pruebas automatizadas        | Miembro B (pendiente) |

**Justificación de la elección:** La metodología ágil es adecuada porque los requisitos del proyecto han evolucionado durante el desarrollo (nuevas funcionalidades como el inventario visual, el sistema de entidades en escenas o el módulo de foro emergieron durante la implementación). Un enfoque en cascada habría requerido un análisis completo previo que hubiera retrasado el inicio del desarrollo. Scrum permite entregar valor incremental y adaptar el rumbo según el feedback obtenido al probar cada entregable.

## 6. Módulos y componentes principales

El sistema se divide en tres grandes capas: **Frontend** (React 18 + TypeScript + Vite), **Backend** (Node.js 20 + Express) y **Base de datos/BaaS** (Supabase).

### 6.A Pod Architecture (Frontend)

El frontend sigue la **Pod Architecture**, un patrón de organización que agrupa todo lo relacionado con una funcionalidad en una carpeta autónoma (_pod_). Cada pod aplica el patrón **Container/Component**, inspirado en el patrón _Smart/Dumb components_ de React:

- **Container** (`.container.tsx`): gestiona el estado local (`useState`, `useEffect`), realiza las llamadas a la API y pasa los datos al component como props. No contiene HTML ni JSX de presentación.
- **Component** (`.component.tsx`): recibe datos como props y es responsable únicamente de la renderización. No contiene lógica de negocio ni acceso a APIs.
- **ViewModel** (`.vm.ts`): define tipos TypeScript e interfaces que el container pasa al component, desacoplando la capa de datos de la de presentación.

**Ejemplo real — Pod de Login:**

```
pods/login/
├── login.container.tsx   # Estado del formulario, llama a signIn(), gestiona errores
└── login.component.tsx   # JSX: inputs de email/password + botón de Google
```

El container llama a `signIn(email, password)` de `supabaseAuth.ts`. Si el email no está confirmado, activa el flag `emailNotConfirmed` y el component muestra un botón de reenvío del correo. El container también lee `location.state.from` (guardado por `<ProtectedRoute>` al redirigir) para enviar al usuario a la ruta original tras el login exitoso.

**Ventaja de esta separación:** los components son completamente testeables con React Testing Library sin necesidad de mockear ninguna API (solo reciben props).

**Ejemplo real — Pod de Partida (VTT):**

El pod más complejo del proyecto (`pods/partida/`) gestiona la sesión de juego en tiempo real:

- `partida.container.tsx`: ~600 líneas. Gestiona el estado global de la sesión (tokens, combate, escenas, mapa), las tres suscripciones a Supabase Realtime y todas las acciones del DM y los jugadores.
- `partida.component.tsx`: renderiza el mapa, los tokens y los paneles sin ningún acceso directo a la API.
- `partida.vm.ts`: define `MapViewState`, `DraggingToken`, `CombatDialogState`, `ChapterWithScenes`, etc.
- `components/`: subcomponentes reutilizables dentro del pod (`PanelDM`, `PanelJugadores`, `OrdenCombate`, `MapaPartida`, `DadosOverlay`, `FichaOverlay`, `InventoryManager`).

### 6.B Estructura del frontend

```
frontend/src/
├── main.tsx              # Punto de entrada: <I18nProvider><AuthProvider><App />
├── App.tsx               # Monta AppRouter
├── core/
│   ├── auth/
│   │   ├── auth.provider.tsx    # Context con session, user, isAdmin, loading, logout
│   │   ├── useAuth.tsx          # Hook: useContext(AuthContext), lanza error si está fuera del Provider
│   │   ├── ProtectedRoute.tsx   # Redirige a /login si !user, preserva location.pathname
│   │   ├── AdminRoute.tsx       # Redirige a /login o /profile/campanas si !isAdmin
│   │   └── supabaseAuth.ts      # signIn(), signUp(), signOut(), signInWithGoogle(), mapSupabaseError()
│   └── api/
│       ├── api.client.ts        # Wrapper fetch con GET/POST tipados y manejo de errores HTTP
│       ├── backend.service.ts   # Servicios compendio (bestiario, hechizos, objetos)
│       ├── campaign.service.ts  # CRUD campañas, miembros, invitaciones
│       ├── character-sheet.service.ts   # CRUD fichas de personaje
│       ├── battle-map.service.ts        # CRUD mapas de batalla
│       ├── game-session.service.ts      # Sesiones VTT + suscripciones Realtime
│       ├── forum.service.ts             # Hilos y posts del foro
│       ├── profile.service.ts           # Perfil y avatar del usuario
│       ├── chapter.service.ts           # Capítulos de campaña
│       ├── scene.service.ts             # Escenas de capítulo
│       └── scene-entity.service.ts      # Entidades añadidas a escenas
├── pods/                 # Lógica por funcionalidad (Container + Component + ViewModel)
│   ├── login/            # Formulario de inicio de sesión
│   ├── register/         # Formulario de registro con validación
│   ├── partida/          # Motor VTT en tiempo real (pod más complejo)
│   ├── home/             # Página de inicio (hero, features, CTA)
│   └── guias/            # Guías de usuario interactivas
├── scenes/               # 26 páginas/vistas enrutadas (conectan layout + pod)
├── components/           # Componentes reutilizables globales + shadcn/ui components
├── router/               # app.router.tsx (26 rutas) + routes.ts (switchRoutes tipado)
├── layout/               # AppLayout (con sidebar/navbar), FullscreenToolLayout (VTT, mapa)
└── i18n/                 # I18nProvider (React Context), translations.ts, useI18n hook
```

### 6.C Sistema de autenticación y contexto global

El estado de autenticación se gestiona con React Context (`AuthProvider`) en lugar de un gestor de estado externo (Redux, Zustand), lo que reduce dependencias y mantiene la arquitectura simple.

El `AuthProvider` se monta en `main.tsx` como envoltura global sobre toda la aplicación. Su flujo interno es:

1. Al montar, llama a `supabase.auth.getSession()` para recuperar la sesión existente del `localStorage`.
2. Se suscribe a `supabase.auth.onAuthStateChange()` para mantenerse sincronizado con cambios externos (callback OAuth, tokens expirados, cierre de sesión en otra pestaña).
3. Cuando `session.user.id` cambia, hace una consulta adicional a la tabla `profiles` para obtener el campo `is_admin`.
4. Expone vía Context: `{ session, user, loading, isAdmin, logout }`.

Cualquier componente del árbol puede acceder al estado de autenticación con `const { user, isAdmin } = useAuth()`. Si `loading` es `true`, los guardas de ruta (`ProtectedRoute`, `AdminRoute`) no redirigen todavía, evitando _flashes_ de redirección mientras se restaura la sesión.

### 6.D Enrutamiento (26 rutas)

El router (`app.router.tsx`) define **26 rutas** organizadas en tres grupos:

| Grupo                              | Ejemplo de rutas                                                                                                                          | Protección         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Públicas sin autenticación         | `/`, `/login`, `/registro`, `/hechizos`, `/bestiario`, `/objetos`, `/dados`, `/guias`, `/foro`, `/mapa-batalla`, `/inventario`, `/fichas` | Ninguna            |
| Privadas (requieren sesión activa) | `/profile/*`, `/editar-campana/:id`, `/partida/:id`                                                                                       | `<ProtectedRoute>` |
| Solo administradores               | `/admin`                                                                                                                                  | `<AdminRoute>`     |

Rutas especiales:

- `/auth/callback`: recibe el código OAuth de Google o el one-time link de verificación de email, y los intercambia por una sesión activa de Supabase.
- `/fichas/nueva` y `/fichas/:id`: creación y edición de fichas de personaje.
- `/partida/:id`: VTT a pantalla completa con `<FullscreenToolLayout>` (sin sidebar ni navbar).
- `/mapa-batalla`: editor de mapas independiente, también con `<FullscreenToolLayout>`.

Todos los `switchRoutes` están definidos en un objeto tipado (`interface SwitchRoutes`) en `routes.ts`, lo que garantiza en tiempo de compilación que no hay rutas hardcodeadas dispersas por el código.

### 6.E Capa de API y patrones de acceso a datos

Hay dos patrones de acceso a datos según el caso de uso:

**Patrón 1 — Supabase SDK directo:** se usa cuando RLS es suficiente como capa de seguridad. El SDK de `@supabase/supabase-js` envía automáticamente el JWT del usuario en cada petición; las políticas RLS de PostgreSQL filtran los datos a nivel de base de datos. Se usa para campañas, miembros, invitaciones, foro, perfil y sesiones de juego.

**Patrón 2 — Backend Express (API REST):** se usa cuando se necesita lógica de servidor adicional que el cliente no debe ejecutar: envío de emails (Nodemailer), operaciones que requieren `service_role_key` (listar todos los usuarios para el admin), cálculos sobre datos de múltiples usuarios, o validaciones cruzadas. Cada petición al backend incluye el JWT en la cabecera `Authorization: Bearer <token>` y el middleware `requireAuth` lo valida con `supabase.auth.getUser(token)`.

```
// Middleware requireAuth (backend/src/index.js)
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "No autorizado" });
  req.user = user;
  next();
};

// Middleware requireAdmin (comprueba is_admin en tabla profiles)
const requireAdmin = async (req, res, next) => {
  const { data: profile } = await supabase.from("profiles")
    .select("is_admin").eq("id", req.user.id).single();
  if (!profile?.is_admin) return res.status(403).json({ error: "Acceso denegado" });
  next();
};
```

El backend dispone además de dos clientes de Supabase: `supabase` (clave `anon`, respeta RLS) y `supabaseAdmin` (clave `service_role`, bypasa RLS para operaciones de administración).

### 6.F Tiempo real (Supabase Realtime)

El módulo VTT usa **Supabase Realtime** (WebSockets sobre PostgreSQL `LISTEN/NOTIFY`) para sincronizar el estado de la partida entre todos los participantes. Hay tres suscripciones activas durante una sesión de juego:

| Función              | Tabla            | Eventos escuchados     | Qué actualiza en pantalla                      |
| -------------------- | ---------------- | ---------------------- | ---------------------------------------------- |
| `subscribeToTokens`  | `session_tokens` | INSERT, UPDATE, DELETE | Posición y HP de tokens en el mapa             |
| `subscribeToCombat`  | `combat_state`   | UPDATE                 | Orden de iniciativa y turno activo             |
| `subscribeToSession` | `game_sessions`  | INSERT, UPDATE         | Estado de la sesión (activa/pausada/terminada) |

Cada función de suscripción devuelve un callback de limpieza (`() => supabase.removeChannel(channel)`) que el container llama en el `return` del `useEffect` para evitar fugas de memoria al desmontar el componente.

Cuando el DM mueve un token en el mapa, la posición se escribe directamente en Supabase (`updateToken()`); el cambio propaga vía Realtime a todos los clientes en menos de 500 ms sin necesidad de un servidor WebSocket propio.

### 6.G Sistema de internacionalización (i18n propio)

La internacionalización se implementa con un **sistema propio** basado en React Context, sin dependencias externas como `react-i18next`. Las traducciones se almacenan en `translations.ts` como dos objetos literales (`es` y `en`) con exactamente las mismas claves. El tipo `Translations` se define como:

```typescript
type Translations = typeof translations.es | typeof translations.en;
```

Esto hace que TypeScript infiera el tipo de todas las claves a partir del objeto real. Si se añade una clave solo a uno de los idiomas, el compilador lanza un error en tiempo de compilación (`Property 'X' is missing in type...`), garantizando que no haya cadenas sin traducir en producción.

El hook `useI18n()` expone `{ t, locale, setLocale }` donde `t` es el objeto de traducciones del idioma activo. La preferencia de idioma se persiste en `localStorage` y se recupera al montar el `I18nProvider`.

#### Backend (Node.js + Express)

API REST con ~50 endpoints organizada en `backend/src/index.js`. Principales grupos:

| Grupo         | Endpoints                                                                     |
| ------------- | ----------------------------------------------------------------------------- |
| Autenticación | Delegada a Supabase Auth                                                      |
| Compendio     | `/api/compendium-bestiary`, `/api/compendium-spells`, `/api/compendium-items` |
| Fichas        | `/api/character-sheet` (GET/POST/PUT)                                         |
| Campañas      | `/api/campaigns` (CRUD) + capítulos, escenas, entidades                       |
| Mapas         | `/api/battle-maps` (CRUD)                                                     |
| Sesiones      | `/api/game-sessions` (crear, unirse, estado)                                  |
| Foro          | `/api/forum-threads`, `/api/forum-posts`                                      |
| Admin         | `/api/admin/users`, `/api/admin/stats`                                        |
| Utilidades    | `/health`, `/api/ping`, `/api/supabase-status`                                |

#### Base de datos (Supabase — PostgreSQL)

Tablas principales con RLS activado:

| Tabla                  | Descripción                                             |
| ---------------------- | ------------------------------------------------------- |
| `profiles`             | Perfil público del usuario (username, avatar, is_admin) |
| `campaigns`            | Campañas con DM propietario                             |
| `campaign_chapters`    | Capítulos de campaña                                    |
| `campaign_scenes`      | Escenas dentro de un capítulo                           |
| `campaign_members`     | Relación N:M entre campañas y jugadores                 |
| `campaign_invitations` | Tokens de invitación por email                          |
| `characters`           | Fichas de personaje con todos los campos D&D 5e         |
| `battle_maps`          | Mapas de batalla con imagen en Base64                   |
| `game_sessions`        | Sesiones de juego activas                               |
| `scene_entities`       | Entidades (criaturas, objetos) añadidas a escenas       |
| `forum_threads`        | Hilos del foro                                          |
| `forum_posts`          | Mensajes dentro de un hilo                              |
| `compendium_bestiary`  | Bestiario D&D 5e SRD (poblado con seed)                 |
| `compendium_spells`    | Hechizos D&D 5e SRD                                     |
| `compendium_items`     | Objetos D&D 5e SRD                                      |

### 6.1 Sostenibilidad — ODS 9, 12 y 13

Beyond The Dungeon incorpora decisiones de diseño e infraestructura alineadas con los Objetivos de Desarrollo Sostenible de la ONU relacionados con tecnología y medio ambiente.

#### ODS 9 — Industria, innovación e infraestructura

El proyecto apuesta por una infraestructura tecnológica moderna, eficiente y reproducible:

- **Contenerización con Docker Compose:** cada servicio (frontend, backend) se ejecuta en un contenedor aislado y ligero, eliminando dependencias de hardware específico y facilitando la migración o replicación del entorno con coste mínimo de recursos.
- **CI/CD automatizado con GitHub Actions:** el pipeline de despliegue elimina pasos manuales, reduce errores humanos y minimiza el tiempo de inactividad entre versiones.
- **Arquitectura de pods modulares:** el código está organizado en unidades independientes y reutilizables. Esto reduce la deuda técnica y facilita el mantenimiento a largo plazo sin necesidad de reescrituras completas.
- **Backend Express minimalista:** se evita el uso de frameworks pesados; el servidor Express sirve únicamente los endpoints necesarios, manteniendo un consumo de memoria y CPU reducido.

#### ODS 12 — Producción y consumo responsables

Se han aplicado prácticas de desarrollo que reducen el consumo innecesario de recursos computacionales y de red:

- **Sin CDN externo innecesario:** los assets estáticos (imágenes, fuentes) se sirven directamente desde Nginx, evitando dependencias de terceros y peticiones adicionales a servidores externos.
- **Lazy loading de imágenes:** las imágenes de las cards de la página principal usan carga diferida mediante el atributo `loading="lazy"` del navegador, reduciendo el consumo de datos en la carga inicial.
- **Optimización de assets:** Vite genera bundles con _tree-shaking_ y _code splitting_ automáticos, eliminando código no utilizado del bundle de producción y reduciendo el peso descargado por el usuario.
- **TailwindCSS con purge:** en producción, Tailwind elimina todas las clases CSS no utilizadas, generando una hoja de estilos mínima (normalmente < 20 KB).
- **Datos D&D en base de datos local:** el compendio SRD se almacena en Supabase (PostgreSQL) en lugar de hacer peticiones repetidas a APIs externas, reduciendo el tráfico de red y la dependencia de servicios de terceros.
- **Modo oscuro:** la interfaz incluye modo oscuro completo. En pantallas OLED, el modo oscuro reduce significativamente el consumo energético del dispositivo del usuario.

#### ODS 13 — Acción por el clima

Las decisiones de infraestructura se han tomado considerando la huella de carbono del despliegue:

- **VPS en servidor europeo:** el servidor de producción (VPS vmi3022429) está ubicado en Europa, donde la regulación medioambiental es más estricta y los proveedores de energía tienden a tener una mayor proporción de energías renovables respecto a otras regiones.
- **Servidor compartido eficiente:** el uso de un VPS en lugar de instancias dedicadas permite compartir la infraestructura física con otros proyectos, optimizando el uso de los servidores físicos subyacentes y reduciendo la huella por usuario.
- **Sin servicios siempre activos innecesarios:** el backend se activa bajo demanda; no existen _workers_ o _cron jobs_ ejecutándose de forma continua sin propósito.
- **Compresión de respuestas:** Nginx está configurado para servir el frontend con compresión gzip, reduciendo el volumen de datos transferidos en cada petición y el consumo energético asociado a la transmisión.

---

## 7. Diagrama de casos de uso

Los actores del sistema son: **Usuario no autenticado**, **Usuario autenticado (jugador)**, **Dungeon Master (DM)** y **Administrador**.

```
┌─────────────────────────────────────────────────────────────────┐
│                      BEYOND THE DUNGEON                         │
│                                                                 │
│  [Usuario no autenticado]                                       │
│       │── Ver página de inicio                                  │
│       │── Ver compendio (bestiario, hechizos, objetos)          │
│       │── Registrarse                                           │
│       └── Iniciar sesión                                        │
│                                                                 │
│  [Usuario autenticado / Jugador]                                │
│       │── Gestionar ficha de personaje (crear/editar)           │
│       │── Gestionar inventario                                  │
│       │── Unirse a campaña (por invitación)                     │
│       │── Participar en sesión de juego en vivo                 │
│       │── Usar lanzador de dados                                │
│       │── Participar en el foro                                 │
│       │── Consultar guías de usuario                            │
│       └── Cambiar idioma (ES/EN) y modo oscuro                  │
│                                                                 │
│  [Dungeon Master] ⊃ [Usuario autenticado]                       │
│       │── Crear y gestionar campañas                            │
│       │── Gestionar capítulos y escenas                         │
│       │── Invitar jugadores por email                           │
│       │── Añadir entidades del compendio a escenas              │
│       │── Crear y editar mapas de batalla                       │
│       │── Iniciar sesión de juego en vivo                       │
│       └── Gestionar combate (iniciativa, HP, turnos)            │
│                                                                 │
│  [Administrador] ⊃ [Usuario autenticado]                        │
│       │── Ver estadísticas de la plataforma                     │
│       └── Gestionar cuentas de usuario                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Modelo entidad-relación (Opcional I)

Las entidades principales y sus relaciones son:

```
USERS (Supabase Auth — tabla gestionada por GoTrue)
  │ 1:1  (trigger on_auth_user_created)
  ├──► PROFILES (id, username, display_name, avatar_url, is_admin, email)
  │
  │ 1:N
  ├──► CHARACTERS (name, race, classes JSONB, stats JSONB, inventory TEXT, ...)
  │
  │ 1:N
  ├──► BATTLE_MAPS (name, image_data TEXT/Base64, grid_size, grid_color)
  │
  │ 1:N (como DM — gm_id)
  └──► CAMPAIGNS
            │ 1:N
            ├──► CAMPAIGN_CHAPTERS (title, content, order_index)
            │         │ 1:N
            │         └──► CAMPAIGN_SCENES (title, content, narration_text, dm_notes, battle_map_id)
            │                   │ 1:N
            │                   └──► SCENE_ENTITIES (entity_type, entity_ref_id, label, x, y, hp)
            │
            │ N:M → CAMPAIGN_MEMBERS (user_id, role: 'player'|'spectator')
            │
            │ 1:N
            └──► CAMPAIGN_INVITATIONS (email, token UUID, used BOOLEAN, expires_at)

GAME_SESSIONS (session_number, status: active|paused|ended, current_scene_id, current_map_id)
  │ campaign_id → CAMPAIGNS
  │ dm_id → USERS
  │ 1:N
  ├──► SESSION_TOKENS (entity_name, x, y, current_hp, max_hp, initiative_value, token_type, token_color)
  │                    ↑ Habilitada para Supabase Realtime
  │ 1:1
  └──► COMBAT_STATE (participants JSONB, current_turn_index, round_number, is_active)
                     ↑ Habilitada para Supabase Realtime

FORUM_THREADS (title, author_id → PROFILES, created_at)
  │ 1:N
  └──► FORUM_POSTS (content, author_id → PROFILES, created_at, updated_at)

COMPENDIUM_BESTIARY / COMPENDIUM_SPELLS / COMPENDIUM_ITEMS
  (Tablas de solo lectura, pobladas con el script seed-hybrid.js, sin FK a usuarios)
```

### 8.1 Decisiones de diseño del esquema

**Uso de JSONB en PostgreSQL:** los campos que representan estructuras de datos flexibles o anidadas se almacenan como columnas JSONB en lugar de crear tablas adicionales. Esto simplifica el esquema sin sacrificar las capacidades de consulta de PostgreSQL:

- `characters.classes`: array de objetos `[{name, level}]` para soportar multiclase. Ejemplo single class: `[{"name": "Guerrero", "level": 5}]`; ejemplo multiclase: `[{"name": "Guerrero", "level": 3}, {"name": "Pícaro", "level": 2}]`.
- `characters.stats`: objeto con todos los atributos del personaje (STR, DEX, CON, INT, WIS, CHA), habilidades, salvaciones, HP, iniciativa, velocidad, tiradas de muerte, rasgos de personalidad.
- `combat_state.participants`: array ordenado de participantes en el combate con iniciativa, HP actual y referencia al token.

**Trigger `handle_new_user`:** al insertar un nuevo usuario en `auth.users` (login con Google o registro con email), un trigger de PostgreSQL crea automáticamente el registro correspondiente en `public.profiles`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name, avatar_url)
  VALUES (
    new.id, new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'displayName',
    new.raw_user_meta_data->>'avatarUrl'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Row Level Security (RLS):** todas las tablas tienen RLS activado. Las políticas garantizan que cada usuario solo puede acceder a sus propios datos a nivel de base de datos, independientemente de la lógica del backend. Ejemplo de políticas en `characters`:

```sql
CREATE POLICY "Ver mis personajes" ON public.characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "GM ve personajes de su campaña" ON public.characters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND gm_id = auth.uid())
  );
```

**Supabase Realtime habilitado:** las tablas `session_tokens` y `combat_state` están añadidas a la publicación `supabase_realtime`, lo que permite recibir cambios en tiempo real sin polling.

## 9. Diseño de la interfaz (Opcional II)

### 9.1 Identidad visual — Dark Fantasy

La interfaz se ha diseñado siguiendo los principios de **dark fantasy**, evocando la atmósfera de los juegos de rol de mesa:

- **Paleta de colores**: Ámbar/dorado (`#d97706`, `#92400e`) como color primario; verdes oscuros como secundario; tonos naranja-rojo como acento.
- **Modo oscuro**: Fondos `#1a1209` (dark), `#231a0e` (dark-lighter), `#2d2210` (dark-card). Las variantes de color permiten jerarquía visual sin usar grises neutros.
- **Modo claro**: También disponible con fondos `stone-50` y texto `stone-800`, para usuarios que prefieren interfaces claras.
- **Tipografía**: Fuente del sistema (`system-ui`) para máxima compatibilidad y velocidad de carga, con jerarquía via pesos y tamaños de TailwindCSS.
- **Animaciones**: Hover con `scale-[1.02]`, transiciones de 300ms, efectos de gradiente en botones y cards. Sin animaciones de entrada agresivas para no dificultar la usabilidad.

### 9.2 Componentes de diseño

La UI se construye sobre dos capas:

1. **TailwindCSS** (utility-first CSS): permite estilar directamente en el JSX sin crear archivos CSS separados. En producción, el plugin PurgeCSS elimina automáticamente las clases no utilizadas, resultando en un bundle CSS de menos de 20 KB.

2. **shadcn/ui** sobre **Radix UI**: librería de componentes accesibles generados directamente en el proyecto (`frontend/src/components/ui/`). Los componentes de Radix UI usados incluyen: `Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Accordion`, `Collapsible`, `Tooltip`, `Slider`, `Avatar`, `Checkbox`, `Label`. Al generarse en el proyecto, son completamente personalizables y no añaden bundle size de runtime.

3. **lucide-react**: iconografía consistente con más de 100 iconos vectoriales usados en toda la interfaz (navegación, acciones, estados, tipos de dados).

### 9.3 Layouts

Hay dos layouts principales:

- **`AppLayout`**: para la mayoría de las páginas. Incluye barra de navegación superior (logo, selector de idioma, acceso al perfil) y sidebar lateral con los módulos principales. En móvil, el sidebar colapsa en un menú hamburguesa usando el hook `useMobile` que detecta el breakpoint `768px`.

- **`FullscreenToolLayout`**: para el editor de mapas y el VTT de partida. Ocupa el 100% de la pantalla sin sidebar ni navbar, maximizando el espacio disponible para las herramientas interactivas.

### 9.4 Páginas principales

| Página                                                | Descripción                                                                                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inicio** (`/`)                                      | Hero con descripción del producto, cards de características, CTA de registro. Accesible sin autenticación.                                                                                  |
| **Login/Registro** (`/login`, `/registro`)            | Formularios con validación en tiempo real, botón de Google OAuth, gestión de errores con mensajes legibles en español.                                                                      |
| **Compendio** (`/bestiario`, `/hechizos`, `/objetos`) | Listados con buscador por nombre y filtros (CR, escuela de magia, rareza). Cada elemento tiene página de detalle. Accesibles sin autenticación.                                             |
| **Mis Campañas** (`/profile/campanas`)                | Lista de campañas del DM y campañas en las que participa como jugador. Acceso a crear campaña, editar, invitar jugadores.                                                                   |
| **Editor de Campaña** (`/editar-campana/:id`)         | Panel de gestión jerárquica: capítulos y escenas anidadas, editor de contenido, asignación de mapa a escena, entidades de la escena (criaturas/objetos del compendio).                      |
| **Mis Fichas** (`/fichas`)                            | Listado de personajes del usuario con tarjetas resumen (raza, clase, nivel). Acceso a crear nueva ficha.                                                                                    |
| **Ficha de Personaje** (`/fichas/:id`)                | Formulario completo de D&D 5e con pestañas: Resumen, Estadísticas, Inventario, Hechizos. Guarda automáticamente los cambios.                                                                |
| **Inventario** (`/inventario`)                        | Paperdoll de slots de equipo, gestor de consumibles con contadores, bolsa de objetos con autocompletado desde el compendio, monedero (po, pp, pe, pa, pc).                                  |
| **Partida VTT** (`/partida/:id`)                      | Pantalla completa: mapa de batalla con tokens arrastrables, panel DM (capítulos/escenas), panel de jugadores, orden de combate, lanzador de dados integrado, ficha de personaje en overlay. |
| **Editor de Mapas** (`/mapa-batalla`)                 | Canvas interactivo con cuadrícula configurable, zoom (scroll) y pan (click+drag). Guarda y carga mapas desde la base de datos.                                                              |
| **Foro** (`/foro`)                                    | Lista de hilos con autor, fecha y número de respuestas. Creación de nuevos hilos.                                                                                                           |
| **Guías** (`/guias`)                                  | Índice de guías de usuario por módulo. Disponibles en ES/EN.                                                                                                                                |
| **Panel Admin** (`/admin`)                            | Estadísticas globales (usuarios, campañas, sesiones activas). Lista de usuarios con opción de promover/despromover admin.                                                                   |
| **Configuración de perfil** (`/profile/settings`)     | Cambio de username, display name y avatar.                                                                                                                                                  |

La primera versión del frontend está publicada en producción en [www.beyondthedungeon.org](https://www.beyondthedungeon.org).

---

## 10. Implementación

Este apartado describe cómo se ha dado respuesta a cada uno de los requisitos del proyecto, agrupados por categoría. Se indica el estado de cada uno: ✅ implementado, ⏳ pendiente y ❌ descartado.

---

### 🔐 Autenticación y usuarios

### 10.1 Realizar un login ✅

El sistema de autenticación se implementa sobre **Supabase Auth (GoTrue)**. Los usuarios pueden iniciar sesión con email y contraseña mediante `supabase.auth.signInWithPassword()`. El módulo `supabaseAuth.ts` actúa como capa de abstracción sobre el SDK y expone `signIn()`, `signOut()` y `getSession()` de forma tipada.

---

### 10.2 Perfiles de usuario con permisos distintos ✅

La plataforma diferencia dos niveles de permiso:

- **Usuario estándar:** accede a sus campañas, fichas y al foro.
- **Administrador:** usuarios con `is_admin = true` en la tabla `profiles` acceden al panel `/admin` (estadísticas, gestión de cuentas). La comprobación se realiza tanto en el frontend (`<AdminRoute>`) como en el servidor (middleware que verifica `is_admin` antes de procesar endpoints `/api/admin/*`).
- **Dungeon Master vs jugador:** dentro de una campaña, el creador tiene permisos de gestión (editar capítulos, iniciar sesiones, invitar jugadores); los miembros solo acceden a contenido compartido.

---

### 10.3 Validación anti-bot con hCaptcha ⏳ _(pendiente de deploy — compañero)_

La protección anti-bot mediante **hCaptcha** está completamente implementada en la rama `dev`, pendiente de ser desplegada a producción por el compañero de equipo.

- Librería: `@hcaptcha/react-hcaptcha` en modo invisible.
- Al enviar el formulario de login o registro, se obtiene un token con `captchaRef.current.execute()` que se pasa a `supabase.auth.signInWithPassword({ ..., options: { captchaToken } })`.
- Supabase valida el token contra la API de hCaptcha en el servidor antes de completar la autenticación.
- Variable de entorno necesaria: `VITE_HCAPTCHA_SITE_KEY`.

---

### 10.4 Login con sistemas externos (Google) ✅

Implementado mediante `supabase.auth.signInWithOAuth({ provider: 'google' })`. El botón de Google aparece tanto en la pantalla de login como en la de registro. Tras la autenticación, el callback en `/auth/callback` crea automáticamente el perfil en la tabla `profiles` si es el primer acceso del usuario.

---

### 10.5 Encriptación de contraseñas ✅

La gestión de contraseñas (hashing con bcrypt, salting, rotación de tokens de sesión) está delegada íntegramente a **Supabase Auth**, que sigue los estándares de seguridad modernos. No se almacenan ni se procesan contraseñas en texto plano en ningún punto del código propio.

---

### 10.6 Verificación de registro mediante email ✅

Al completar el registro, Supabase envía automáticamente un email de confirmación con un one-time link. El enlace redirige a `/auth/callback`, donde se activa la sesión. Si el usuario intenta iniciar sesión sin haber verificado, el frontend muestra un aviso con un botón de reenvío del correo de confirmación.

---

### 10.7 Gestión de tokens en el cliente ✅

El token JWT emitido por Supabase Auth se almacena automáticamente en `localStorage` mediante el SDK. En cada petición al backend Express, el token se incluye en la cabecera `Authorization: Bearer <token>`. El backend valida el token con `supabase.auth.getUser(token)` antes de procesar cualquier operación protegida, garantizando que los tokens expirados o manipulados sean rechazados.

---

### 10.8 Control de acceso a rutas según usuario/roles ✅

El enrutamiento protegido se implementa mediante dos wrappers de React Router:

- `<ProtectedRoute>`: redirige a `/login` si no hay sesión activa.
- `<AdminRoute>`: extiende `ProtectedRoute` comprobando además `profile.is_admin === true`. Si el usuario autenticado no es admin, redirige al dashboard. La validación se replica en el servidor (_never trust the client_).

---

### 🖥️ Desarrollo (Frontend / Backend)

### 10.9 Frontend en React ✅

El frontend está desarrollado en **React 18 + TypeScript + Vite**, organizado mediante Pod Architecture (ver §6.A). Los puntos técnicos más destacados:

- **Árbol de providers en `main.tsx`:** `<I18nProvider>` → `<AuthProvider>` → `<App>`. El orden importa: el i18n se inicializa antes que la autenticación para que los mensajes de error del login ya estén traducidos.
- **26 rutas declarativas** en `app.router.tsx`, con `<ProtectedRoute>` y `<AdminRoute>` como guardas. Las rutas VTT y editor de mapas usan `<FullscreenToolLayout>`.
- **TypeScript estricto:** el `tsconfig.app.json` tiene `strict: true`. Los tipos de las interfaces de dominio (`Character`, `Campaign`, `GameSession`, etc.) están definidos en los servicios de la capa `core/api/`.
- **Vite con alias `@`:** configurado en `vite.config.ts` (`@` → `./src`) para imports absolutos en toda la base de código, evitando rutas relativas como `../../../core/auth`.
- **Proxy de desarrollo:** Vite proxea `/api` a `http://localhost:3000` en desarrollo local, eliminando problemas de CORS durante el desarrollo.
- **Dependencias UI:** Radix UI (primitivos accesibles), shadcn/ui (componentes generados), lucide-react (iconos), TailwindCSS (estilos), `@hcaptcha/react-hcaptcha` (captcha invisible).

---

### 10.10 Backend con Node.js ✅

El backend es un servidor **Node.js 20 + Express** organizado en un único fichero `backend/src/index.js` por simplicidad operativa. Sus características técnicas principales:

- **~50 endpoints REST** agrupados por dominio: compendio (público), fichas de personaje (auth requerida), campañas, mapas, sesiones de juego, foro, admin.
- **Middleware `requireAuth`:** verifica el JWT de Supabase en todos los endpoints privados. El token se pasa como `Authorization: Bearer <token>` y se valida con `supabase.auth.getUser(token)`. Si el token es inválido o ha expirado, devuelve HTTP 401.
- **Middleware `requireAdmin`:** extiende `requireAuth` consultando `profiles.is_admin` para los endpoints `/api/admin/*`. Devuelve HTTP 403 si el usuario no es admin. Esta doble validación (frontend `<AdminRoute>` + backend `requireAdmin`) sigue el principio _never trust the client_.
- **Dos clientes Supabase:** `supabase` (clave `anon`, respeta RLS) para operaciones normales; `supabaseAdmin` (clave `service_role`, bypasa RLS) para operaciones de administración como listar todos los usuarios o promover admins.
- **Body size de 50 MB:** `express.json({ limit: '50mb' })` para permitir el envío de imágenes de mapas codificadas en Base64.
- **Nodemailer opcional:** si `SMTP_HOST` no está configurado, el servidor arranca igualmente y simplemente omite el envío de emails con un log en consola.
- **Sin framework de base de datos:** el backend usa directamente el SDK de Supabase (`@supabase/supabase-js`) para las consultas, sin ORM. Las consultas siguen la interfaz fluida del SDK: `.from('tabla').select('*').eq('campo', valor).order('created_at')`.
- **Inicio con `node --env-file=.env`:** las variables de entorno se cargan directamente con la flag nativa de Node.js 20, sin depender de `dotenv`.

---

### 10.11 Conexión con base de datos ✅

La base de datos es **Supabase PostgreSQL** con las siguientes garantías de seguridad y consistencia:

- **Row Level Security (RLS)** activado en todas las tablas de usuario. Las políticas a nivel de base de datos garantizan que, incluso si el backend tuviera un bug y realizara una consulta sin filtro, PostgreSQL devolvería solo los datos del usuario autenticado.
- **Trigger automático `handle_new_user`:** al registrarse (email/password o OAuth), un trigger de PostgreSQL crea automáticamente el registro en `public.profiles`. Esto garantiza que nunca haya un usuario autenticado sin perfil asociado.
- **Dos instancias del cliente:** `frontend/src/lib/supabase.ts` (clave anon, en el navegador) y `backend/src/supabase.js` (clave anon + instancia admin con service_role en el servidor). La clave `service_role` nunca llega al cliente.
- **Supabase Storage (S3-compatible):** buckets `avatars` (fotos de perfil), `character-avatars` (fotos de personaje) y `forum-images` (imágenes en posts del foro). Las políticas de bucket definen quién puede subir y leer archivos.
- **Supabase Realtime:** tablas `session_tokens` y `combat_state` habilitadas para recibir cambios en tiempo real via WebSocket, sin necesidad de un servidor WebSocket propio.

---

### 10.12 Desarrollo de API REST ✅

La API REST sigue convenciones REST estándar con métodos HTTP semánticos (GET para lectura, POST para creación, PUT/PATCH para actualización, DELETE para eliminación). Todos los endpoints devuelven JSON:

| Endpoint                               | Método          | Auth       | Descripción                                                   |
| -------------------------------------- | --------------- | ---------- | ------------------------------------------------------------- |
| `/health`                              | GET             | No         | Health check para Docker/CI/CD                                |
| `/api/ping`                            | GET             | No         | Prueba de conectividad frontend-backend                       |
| `/api/supabase-status`                 | GET             | No         | Verifica que las variables de Supabase estén configuradas     |
| `/api/compendium-bestiary`             | GET             | No         | Lista completa del bestiario D&D 5e (con paginación opcional) |
| `/api/compendium-bestiary/:id`         | GET             | No         | Detalle de una criatura por UUID                              |
| `/api/compendium-spells`               | GET             | No         | Lista completa de hechizos                                    |
| `/api/compendium-spells/:id`           | GET             | No         | Detalle de un hechizo                                         |
| `/api/compendium-items`                | GET             | No         | Lista completa de objetos                                     |
| `/api/compendium-items/:id`            | GET             | No         | Detalle de un objeto (acepta UUID o slug SRD)                 |
| `/api/character-sheets`                | GET             | Sí         | Lista de fichas del usuario autenticado                       |
| `/api/character-sheet`                 | GET/POST/PUT    | Sí         | CRUD de ficha de personaje                                    |
| `/api/character-sheet/:id`             | GET/PUT/DELETE  | Sí         | Ficha específica por ID                                       |
| `/api/campaigns`                       | GET/POST        | Sí         | Lista y creación de campañas                                  |
| `/api/campaigns/:id`                   | GET/PUT/DELETE  | Sí         | Detalle y gestión de campaña                                  |
| `/api/campaigns/:id/members`           | GET/POST/DELETE | Sí         | Miembros de la campaña                                        |
| `/api/campaigns/:id/invite`            | POST            | Sí         | Enviar invitación por email                                   |
| `/api/battle-maps`                     | GET/POST        | Sí         | Lista y creación de mapas                                     |
| `/api/battle-maps/:id`                 | GET/PUT/DELETE  | Sí         | Mapa específico                                               |
| `/api/game-sessions/:campaignId`       | GET             | Sí         | Sesión activa de una campaña                                  |
| `/api/game-sessions/:campaignId/start` | POST            | Sí (DM)    | Iniciar sesión y enviar emails a jugadores                    |
| `/api/game-sessions/:campaignId/end`   | POST            | Sí (DM)    | Terminar sesión                                               |
| `/api/forum-threads`                   | GET/POST        | Sí         | Hilos del foro                                                |
| `/api/forum-threads/:id/posts`         | GET/POST        | Sí         | Posts de un hilo                                              |
| `/api/admin/users`                     | GET             | Sí (Admin) | Lista de todos los usuarios                                   |
| `/api/admin/stats`                     | GET             | Sí (Admin) | Estadísticas globales                                         |
| `/api/admin/users/:id/promote`         | POST            | Sí (Admin) | Promover usuario a admin                                      |
| `/api/admin/users/:id/delete`          | DELETE          | Sí (Admin) | Eliminar cuenta de usuario                                    |

---

### 10.13 Consumo de APIs externas ✅

Se consumen dos APIs externas:

1. **`dnd5eapi.co`**: el compendio SRD almacena rutas relativas de imágenes (ej: `/api/images/monsters/aboleth.png`). El frontend las completa dinámicamente con el dominio de la API externa en tiempo de ejecución, sin almacenar las imágenes en Supabase Storage.
2. **hCaptcha API**: la validación del token anti-bot se realiza en el servidor de Supabase contra la API de hCaptcha (pendiente de deploy, ver §10.3).

---

### 10.14 Diseño web responsive ✅

La interfaz funciona en cualquier tamaño de pantalla. Se usan los breakpoints de **TailwindCSS** (`sm`, `md`, `lg`, `xl`) para adaptar layouts, tipografías y espaciados. Los componentes de navegación (sidebar, navbar) colapsan en móvil usando el hook `useMobile` que detecta el ancho de pantalla y adapta la UI.

---

### 10.15 Framework de diseño ✅

Se usa **TailwindCSS** (utility-first CSS) como base y **shadcn/ui** para los componentes de interfaz (botones, modales, formularios, tablas, cards, popovers). Los componentes de shadcn/ui se generan directamente en `frontend/src/components/ui/`, permitiendo personalización total sin dependencias de runtime adicionales. En producción, Tailwind purga automáticamente las clases no utilizadas (bundle CSS < 20 KB).

---

### 💳 Funcionalidades extra

### 10.16 Envío de emails automatizados ✅

Implementado con **Nodemailer** en el backend Express. Se envían emails en dos situaciones:

1. **Invitación a campaña**: el DM invita a un jugador por email; el destinatario recibe un enlace de acceso directo.
2. **Inicio de sesión de juego**: al arrancar una sesión en vivo, todos los jugadores de la campaña reciben el enlace de acceso.

El módulo es opcional: si las variables `SMTP_*` no están configuradas, el backend funciona sin enviar emails.

---

### 10.17 Integración de pasarela de pago ❌ _(descartado)_

La integración con **Stripe** fue descartada por: (1) ausencia de un modelo de negocio definido para el proyecto académico, (2) implicaciones legales y fiscales (normativa PSD2, IVA, facturación) fuera del alcance, y (3) prioridad asignada a módulos con mayor impacto funcional. Técnicamente sería viable en una fase futura sin cambios en la arquitectura actual.

---

### 🌍 Internacionalización y sostenibilidad

### 10.18 Internacionalización (mínimo 2 idiomas) ✅

La interfaz está disponible en **español** e **inglés** mediante un sistema i18n propio con React Context (sin librerías externas). Las traducciones se definen en `frontend/src/i18n/translations.ts` con un objeto por idioma. El tipo `Translations = typeof translations.es | typeof translations.en` permite que TypeScript detecte claves faltantes en tiempo de compilación. El selector de idioma está en la barra de navegación y la preferencia se persiste en `localStorage`.

Datos técnicos del sistema i18n:

- Sin dependencias externas (`react-i18next`, `i18next`, `lingui`, etc.).
- El contexto `I18nProvider` envuelve toda la aplicación (ver `main.tsx`).
- El hook `useI18n()` expone `{ t, locale, setLocale }` donde `t` es el objeto de traducciones del idioma activo.
- La inferencia de tipos garantiza en tiempo de compilación que todas las claves existen en ambos idiomas. Si se añade una clave solo en uno, TypeScript lanza error.

---

### 10.19 Sostenibilidad — ODS 9, 12 y 13 ✅

Beyond The Dungeon aplica buenas prácticas de sostenibilidad alineadas con los ODS de la ONU:

- **ODS 9 (Infraestructura e innovación):** Docker Compose para infraestructura reproducible y ligera, CI/CD automatizado con GitHub Actions, arquitectura modular de pods que reduce deuda técnica.
- **ODS 12 (Producción responsable):** Vite con tree-shaking y code splitting, TailwindCSS con purge automático (CSS < 20 KB), lazy loading de imágenes, modo oscuro completo (reduce consumo energético en pantallas OLED), datos del compendio en base de datos local en lugar de peticiones repetidas a APIs externas.
- **ODS 13 (Acción climática):** VPS en servidor europeo (regulación medioambiental más estricta, mayor proporción de renovables), uso de servidor compartido en lugar de instancia dedicada, compresión gzip en Nginx, sin cron jobs ni workers innecesarios.

---

### 🧪 Calidad y documentación

### 10.20 Documentación de análisis y diseño ✅

La documentación formal del proyecto está recogida en este documento **MEMORIA.md**, que cubre introducción, antecedentes, análisis de requisitos (RF + RNF), diseño (metodología, módulos, casos de uso, ER, interfaz) e implementación. Se complementa con `README.md` (manual técnico), `BBDD.md` (esquema de base de datos) y `SETUP.md` (guía de configuración del entorno de desarrollo).

---

### 10.21 Realización de pruebas ⏳ _(pendiente — compañero)_

Pendiente de implementación por el compañero de equipo. Plan previsto: **Vitest + React Testing Library** para pruebas unitarias de formularios y lógica de autenticación, y pruebas de integración del middleware de autenticación del backend.

---

### 10.22 Manual de usuario ✅

La aplicación incluye una sección `/guias` con guías de usuario interactivas organizadas por módulo (campañas, fichas de personaje, VTT, editor de mapas, lanzador de dados, inventario, etc.). Las guías son accesibles sin autenticación y están disponibles en español e inglés. El `README.md` del repositorio actúa como manual técnico dirigido a desarrolladores.

---

### 10.23 Investigación de IAs aplicables al proyecto ✅

Durante el desarrollo se ha investigado la aplicación de IAs en el contexto de la plataforma. Las líneas identificadas incluyen:

- **Generación de contenido narrativo:** LLMs (GPT-4o, Claude 3.5) para ayudar al DM a generar descripciones de escenas, diálogos de NPCs o encuentros aleatorios basados en el contexto de la campaña.
- **Búsqueda semántica en el compendio:** embeddings vectoriales para encontrar criaturas o hechizos por descripción en lenguaje natural (ej: “uncriaturaquepetrificaconlamirada” en lugar de buscar “basilisco”).
- **Generación procedural de mapas:** IAs generativas de imágenes (Stable Diffusion, DALL-E) para crear mapas de batalla a partir de una descripción textual.
- **Asistente de reglas:** chatbot integrado que responde preguntas sobre las reglas del SRD de D&D 5e sin salir de la plataforma.

Estas funcionalidades quedan como trabajos futuros (ver §11.2). Durante el propio desarrollo del proyecto, **GitHub Copilot** ha sido utilizado como herramienta de asistencia en la escritura de código, generación de tipos TypeScript y redacción de documentación.

---

### 🚀 Despliegue y DevOps

### 10.24 Manual técnico de despliegue reproducible ✅

El fichero `README.md` del repositorio incluye una guía técnica completa para reproducir el entorno de producción desde cero en una VPS vacía:

1. Clonado del repositorio y configuración del archivo `.env` con todas las variables de entorno necesarias (Supabase URL y claves, SMTP, hCaptcha).
2. Ejecución de las migraciones SQL en Supabase (esquema de tablas, buckets de Storage, políticas RLS, trigger `handle_new_user`).
3. Ejecución del script `scripts/seed-hybrid.js` para poblar las tablas del compendio con los datos del SRD (bestiario 2014+2024, hechizos, objetos).
4. Construcción e inicio de los contenedores con `docker compose up -d --build`.
5. Configuración del DNS del dominio y renovación automática de certificados SSL con Let’s Encrypt (`certbot`).
6. Configuración de los secretos en GitHub Actions (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `PROJECT_PATH`) para activar el pipeline CI/CD.

**Pipeline CI/CD (`.github/workflows/deploy.yml`):**

```yaml
on:
  push:
    branches: ["main"]

concurrency:
  group: deploy-production
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ${{ secrets.PROJECT_PATH }}
            git pull origin main
            docker compose down
            docker compose up -d --build
            docker system prune -f
```

El Dockerfile del frontend sigue una **estrategia multi-stage build**: la primera etapa (`node:20-alpine`) instala dependencias, inyecta las variables de entorno en el fichero `.env` y construye el bundle de producción con `npm run build`. La segunda etapa (`nginx:alpine`) copia únicamente el directorio `dist/` resultante, sin incluir `node_modules` ni el código fuente. Esto reduce la imagen final a menos de 30 MB.

El Nginx del contenedor frontend sirve el SPA con `try_files $uri /index.html`, lo que garantiza que el enrutamiento del lado del cliente (React Router) funcione correctamente en cualquier URL.

---

### 10.25 Análisis nube vs local ✅

Se ha realizado un análisis comparativo entre el despliegue actual en VPS propio y las principales alternativas cloud:

| Opción                     | Coste mensual        | Escalabilidad | Control      | Complejidad |
| -------------------------- | -------------------- | ------------- | ------------ | ----------- |
| **VPS propio** _(elegido)_ | ~6-10 €/mes fijo     | Manual        | Total        | Alta        |
| AWS EC2 / GCP Compute      | ~15-30 €/mes         | Auto-scaling  | Total        | Alta        |
| Vercel + Railway (PaaS)    | Gratuito → ~20 €/mes | Auto-scaling  | Limitado     | Baja        |
| Serverless (AWS Lambda)    | Variable por uso     | Automática    | Muy limitado | Media       |

**Justificación de la elección del VPS:** coste predecible y bajo para el nivel de tráfico actual, control total del entorno, sin dependencia de proveedores cloud, y mayor valor educativo en la gestión directa de infraestructura. El VPS está ubicado en Europa, garantizando el cumplimiento del GDPR por defecto. La limitación principal es la ausencia de escalado automático, que no es un requisito para la fase actual del proyecto.

---

### 10.26 Tipos de despliegue ✅

Los requisitos de despliegue son **alternativos entre sí** (cumplir uno equivale a cumplir el bloque). La solución implementada cubre los siguientes:

| Tipo de despliegue                            | Estado | Solución implementada                                                     |
| --------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| Despliegue en VPS con Docker Compose          | ✅     | VPS `vmi3022429`, `docker-compose.yml` con `btd_frontend` y `btd_backend` |
| Despliegue Node.js + Nginx como proxy inverso | ✅     | Nginx sirve el SPA y hace `proxy_pass` al backend en puerto 3000          |
| Despliegue PaaS con contenedores + CI/CD      | ✅     | Docker + GitHub Actions es el equivalente funcional                       |
| Despliegue híbrido (local + cloud)            | —      | No aplica; cubierto por VPS + Supabase Storage                            |
| Despliegue en cloud con VMs (EC2, GCP, Azure) | —      | No aplica; cubierto por VPS propio                                        |
| Despliegue serverless                         | —      | No aplica; el backend requiere proceso persistente (Realtime, emails)     |
| Despliegue Node.js + Apache + Passenger       | —      | No aplica; se usa Nginx como servidor web                                 |

## 11. Conclusiones

### 11.1 Conclusiones del trabajo realizado

Beyond The Dungeon ha cumplido su objetivo principal: construir una plataforma web completa de apoyo a partidas de D&D 5e, desplegada en producción y accesible públicamente en [www.beyondthedungeon.org](https://www.beyondthedungeon.org).

**Resumen de lo conseguido:**

De los 26 requisitos definidos, 23 están implementados en producción, 2 están pendientes de deploy por el compañero de equipo (hCaptcha, pruebas) y 1 fue descartado de forma justificada (pasarela de pago). El proyecto incluye:

- Más de **26 páginas/vistas** con routing declarativo protegido por roles.
- **~50 endpoints REST** en el backend, documentados en este documento y en el `README.md`.
- **15+ tablas** en PostgreSQL con RLS activado, trigger automático de creación de perfil y Realtime habilitado para VTT.
- **3 buckets de Storage** (avatares, fotos de personaje, imágenes de foro).
- **Sistema i18n propio** con tipado completo en TypeScript.
- **Pipeline CI/CD** que despliega a producción en menos de 3 minutos tras cada merge a `main`.

**Lecciones aprendidas técnicas:**

- La **Pod Architecture** ha demostrado su valor: cuando se han necesitado refactorizaciones (como añadir el sistema de multiclase a la ficha de personaje), los cambios han estado contenidos en el pod correspondiente sin afectar al resto del proyecto.
- **Supabase como BaaS** ha eliminado la necesidad de implementar un servidor de autenticación propio, gestionar certificados SSL para la base de datos o configurar almacenamiento de objetos. Esto ha permitido dedicar el tiempo al producto y no a la infraestructura.
- La decisión de usar **JSONB para `characters.stats` y `characters.classes`** fue acertada: los campos del personaje de D&D 5e son numerosos y la estructura varía según la clase (un Mago tiene lista de hechizos, un Guerrero no). Un esquema relacional estricto habría requerido decenas de tablas.
- El **sistema de tiempo real con Supabase Realtime** ha funcionado de forma fiable para el VTT, pero tiene una limitación: las suscripciones filtran por un solo campo (`session_id=eq.X`), lo que no permite filtros complejos. Esto ha condicionado el diseño de algunas consultas.
- El uso de **GitHub Actions para CI/CD** desde el primer día ha eliminado el problema de "funciona en mi máquina": si el pipeline pasa, el código está en producción y funcionando.

**Valoración personal:**

El proyecto ha demostrado que es posible construir y desplegar una aplicación web completa y funcional con un stack moderno (React + Node.js + Supabase + Docker) en el tiempo de un ciclo formativo, siempre que se mantenga una arquitectura clara, un flujo de trabajo con ramas y CI/CD desde el primer día, y se priorice el valor entregado frente a la perfección técnica. La diferencia entre este proyecto y los ejercicios del ciclo no es solo la complejidad técnica, sino el hecho de que está desplegado, accesible públicamente y con usuarios reales.

### 11.2 Trabajos futuros

Durante el desarrollo se han identificado las siguientes mejoras y evoluciones descartadas para esta primera fase del proyecto:

- **Pasarela de pago (Stripe):** modelo de suscripción o donación para financiar los costes del VPS. Descartado por implicaciones legales y fiscales (ver § 10.11).
- **Tests automatizados:** Vitest + React Testing Library para validaciones de formularios y lógica de autenticación. Pendiente de implementación por el compañero de equipo (ver § 10.10).
- **Voz y vídeo integrados:** comunicación por voz/vídeo dentro de la sesión de juego, eliminando la necesidad de usar Discord en paralelo.
- **Generación de contenido con IA:** integrar un LLM para ayudar al DM a generar descripciones de escenas, NPCs o encuentros aleatorios.
- **App móvil nativa:** aplicación React Native para consultar fichas de personaje e inventario desde el móvil durante la partida.
- **Certificación de sostenibilidad:** métricas concretas de huella de carbono mediante [Website Carbon Calculator](https://www.websitecarbon.com) como evidencia cuantitativa al análisis ODS.

---

## 12. Bibliografía

- **Supabase Documentation** — Autenticación, RLS, Realtime y Storage:  
  https://supabase.com/docs

- **React Documentation** — Hooks, Context API, React Router:  
  https://react.dev

- **D&D 5e System Reference Document (SRD) — Creative Commons**:  
  https://www.dndbeyond.com/srd

- **Open5e API** — Referencia de datos D&D 5e en formato JSON:  
  https://api.open5e.com

- **Roll20** — Plataforma de referencia analizada como competidor:  
  https://roll20.net

- **D&D Beyond** — Plataforma oficial analizada como competidor:  
  https://www.dndbeyond.com

- **Foundry VTT** — Software VTT analizado como competidor:  
  https://foundryvtt.com

- **TailwindCSS Documentation**:  
  https://tailwindcss.com/docs

- **Vite Documentation**:  
  https://vitejs.dev/guide

- **Docker Compose Reference**:  
  https://docs.docker.com/compose

- **GitHub Actions Documentation**:  
  https://docs.github.com/en/actions

- **hCaptcha Documentation** — Implementación de captcha en formularios:  
  https://docs.hcaptcha.com

- **shadcn/ui** — Librería de componentes UI:  
  https://ui.shadcn.com
