# 📜 Memoria del Proyecto — Beyond The Dungeon

**Proyecto Intermodular — 2º DAW**  
**Curso:** 2025-2026  
**Sitio web:** [www.beyondthedungeon.org](https://www.beyondthedungeon.org)  
**Repositorio:** [github.com/oleojake/BeyondTheDungeon](https://github.com/oleojake/BeyondTheDungeon)

---

## Índice

1. [Introducción y objetivos](#1-introducción-y-objetivos)
2. [Antecedentes y estado del arte](#2-antecedentes-y-estado-del-arte)
3. [Análisis de requisitos](#3-análisis-de-requisitos)
4. [Diseño](#4-diseño)
5. [Implementación](#5-implementación)
6. [Conclusiones](#6-conclusiones)
7. [Bibliografía](#7-bibliografía)

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

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-01 | Registro de usuario | El sistema permite crear una cuenta con email/contraseña o Google OAuth, con verificación por email |
| RF-02 | Inicio de sesión | El usuario puede autenticarse con sus credenciales o mediante Google |
| RF-03 | Protección anti-bot | El registro incluye validación hCaptcha |
| RF-04 | Control de acceso por rol | Las rutas protegidas son accesibles solo para usuarios autenticados; el panel admin solo para administradores |
| RF-05 | Gestión de campañas | El DM puede crear, editar y eliminar campañas con estructura jerárquica |
| RF-06 | Invitación de jugadores | El DM puede invitar jugadores por email; los invitados reciben un enlace de acceso |
| RF-07 | Ficha de personaje | El usuario puede crear y editar una ficha de personaje completa de D&D 5e |
| RF-08 | Multiclase | La ficha soporta hasta 3 clases simultáneas con niveles independientes |
| RF-09 | Inventario visual | El inventario incluye paperdoll, consumibles, bolsa y monedero |
| RF-10 | Sesión de juego en vivo | El DM puede iniciar una sesión; todos los participantes ven el mapa y el combate en tiempo real |
| RF-11 | Sistema de combate | La sesión incluye orden de iniciativa, turnos y gestión de HP de criaturas/personajes |
| RF-12 | Editor de mapas | El usuario puede crear mapas con canvas, cuadrícula, zoom y pan; guardarlos y cargarlos en sesiones |
| RF-13 | Compendio bestiario | El sistema muestra el listado completo de criaturas SRD con búsqueda y filtros |
| RF-14 | Compendio hechizos | El sistema muestra el listado completo de hechizos SRD con búsqueda y filtros |
| RF-15 | Compendio objetos | El sistema muestra el catálogo completo de objetos SRD con búsqueda y filtros |
| RF-16 | Lanzador de dados | El usuario puede lanzar dados estándar de D&D con historial de resultados |
| RF-17 | Foro comunitario | Los usuarios pueden crear hilos y publicar mensajes |
| RF-18 | Guías de usuario | La app incluye guías de ayuda por módulo accesibles sin autenticación |
| RF-19 | Panel de administración | El admin puede ver estadísticas y gestionar cuentas de usuario |
| RF-20 | Internacionalización | La interfaz está disponible en español e inglés con selector de idioma |
| RF-21 | Modo oscuro | La interfaz soporta modo claro y modo oscuro |
| RF-22 | Notificaciones por email | El sistema envía emails automáticos en eventos clave (invitaciones, inicio de sesión de juego) |

### 3.3 Requisitos no funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-01 | Rendimiento | Las páginas principales deben cargar en menos de 3 segundos con conexión estándar |
| RNF-02 | Disponibilidad | La plataforma debe estar disponible 24/7; el despliegue en VPS con Docker garantiza reinicio automático |
| RNF-03 | Seguridad | Las contraseñas se gestionan mediante Supabase Auth (bcrypt); los tokens JWT tienen expiración configurable |
| RNF-04 | Seguridad de datos | Las políticas RLS (Row Level Security) de Supabase garantizan que cada usuario solo accede a sus propios datos |
| RNF-05 | Escalabilidad | La arquitectura basada en Supabase y Docker Compose permite escalar componentes de forma independiente |
| RNF-06 | Responsividad | La interfaz debe ser usable en dispositivos móviles, tablets y escritorio (breakpoints TailwindCSS) |
| RNF-07 | Mantenibilidad | El código sigue la arquitectura de pods, con separación container/component y nomenclatura consistente |
| RNF-08 | Tiempo real | Los cambios en la sesión de juego deben propagarse a todos los clientes en menos de 500ms |
| RNF-09 | Compatibilidad | La aplicación debe funcionar en los navegadores modernos (Chrome, Firefox, Safari, Edge) |
| RNF-10 | Despliegue reproducible | El entorno de producción debe poder recrearse desde cero siguiendo el SETUP.md |
| RNF-11 | Internacionalización | Toda cadena de texto visible debe estar externalizada en el sistema i18n; no se permiten strings hardcodeados |
| RNF-12 | Accesibilidad | Los elementos interactivos deben tener atributos ARIA y etiquetas descriptivas |

---

## 4. Diseño

### 4.1 Metodología de desarrollo

Se ha empleado una **metodología ágil basada en Scrum simplificado**, adaptada al contexto de un equipo pequeño:

- **Sprints cortos** de 1-2 semanas con entregables funcionales al final de cada uno.
- **Backlog priorizado** de historias de usuario (Issues en GitHub).
- **Ramas de feature** por cada funcionalidad, con Pull Requests hacia `dev` antes de integrar.
- **Integración continua**: GitHub Actions despliega automáticamente a producción cuando se mergea a `main`.

**Justificación de la elección:** La metodología ágil es adecuada porque los requisitos del proyecto han evolucionado durante el desarrollo (nuevas funcionalidades como el inventario visual o el sistema de entidades emergieron durante la implementación). Un enfoque en cascada habría requerido un análisis completo previo que hubiera retrasado el inicio del desarrollo. Scrum permite entregar valor incremental y adaptar el rumbo según el feedback.

### 4.2 Módulos y componentes principales

El sistema se divide en tres grandes capas:

#### Frontend (React 18 + TypeScript + Vite)

Organizado mediante **Pod Architecture**:

```
frontend/src/
├── core/
│   ├── auth/           # ProtectedRoute, AdminRoute, supabaseAuth.ts
│   └── api/            # Servicios REST (campaigns, characters, etc.)
├── pods/               # Lógica por funcionalidad
│   ├── home/           # Página de inicio (hero, features, CTA)
│   ├── login/          # Formulario de inicio de sesión
│   ├── register/       # Formulario de registro
│   ├── campaigns/      # Gestión de campañas del DM
│   ├── mi-ficha/       # Ficha de personaje
│   ├── inventario/     # Gestor de inventario
│   └── admin/          # Panel de administración
├── scenes/             # Páginas/vistas enrutadas (conectan layout + pod)
├── components/         # Componentes reutilizables (Navbar, Sidebar, ProfileTabs)
├── router/             # app.router.tsx con todas las rutas
├── layout/             # AppLayout, ProfileLayout
└── i18n/               # Sistema de traducciones ES/EN
```

Cada pod sigue el patrón **Container/Component**: el container gestiona el estado y las llamadas API; el component se encarga únicamente de renderizar la UI recibida como props.

#### Backend (Node.js + Express)

API REST con ~50 endpoints organizada en `backend/src/index.js`. Principales grupos:

| Grupo | Endpoints |
|-------|-----------|
| Autenticación | Delegada a Supabase Auth |
| Compendio | `/api/compendium-bestiary`, `/api/compendium-spells`, `/api/compendium-items` |
| Fichas | `/api/character-sheet` (GET/POST/PUT) |
| Campañas | `/api/campaigns` (CRUD) + capítulos, escenas, entidades |
| Mapas | `/api/battle-maps` (CRUD) |
| Sesiones | `/api/game-sessions` (crear, unirse, estado) |
| Foro | `/api/forum-threads`, `/api/forum-posts` |
| Admin | `/api/admin/users`, `/api/admin/stats` |
| Utilidades | `/health`, `/api/ping`, `/api/supabase-status` |

#### Base de datos (Supabase — PostgreSQL)

Tablas principales con RLS activado:

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil público del usuario (username, avatar, is_admin) |
| `campaigns` | Campañas con DM propietario |
| `campaign_chapters` | Capítulos de campaña |
| `campaign_scenes` | Escenas dentro de un capítulo |
| `campaign_members` | Relación N:M entre campañas y jugadores |
| `campaign_invitations` | Tokens de invitación por email |
| `characters` | Fichas de personaje con todos los campos D&D 5e |
| `battle_maps` | Mapas de batalla con imagen en Base64 |
| `game_sessions` | Sesiones de juego activas |
| `scene_entities` | Entidades (criaturas, objetos) añadidas a escenas |
| `forum_threads` | Hilos del foro |
| `forum_posts` | Mensajes dentro de un hilo |
| `compendium_bestiary` | Bestiario D&D 5e SRD (poblado con seed) |
| `compendium_spells` | Hechizos D&D 5e SRD |
| `compendium_items` | Objetos D&D 5e SRD |

### 4.3 Diagrama de casos de uso

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

### 4.4 (Opcional I) Modelo entidad-relación

Las entidades principales y sus relaciones son:

```
USERS (Supabase Auth)
  │ 1:1
  ├──► PROFILES (username, avatar_url, is_admin)
  │
  │ 1:N
  ├──► CHARACTERS (name, race, classes[], stats{}, inventory{}, ...)
  │
  │ 1:N
  ├──► BATTLE_MAPS (name, image_data, grid_size, grid_color)
  │
  │ 1:N (como DM)
  └──► CAMPAIGNS
            │ 1:N
            ├──► CAMPAIGN_CHAPTERS
            │         │ 1:N
            │         └──► CAMPAIGN_SCENES
            │                   │ 1:N
            │                   └──► SCENE_ENTITIES
            │
            │ N:M (a través de CAMPAIGN_MEMBERS)
            ├──► USERS (jugadores)
            │
            │ 1:N
            └──► CAMPAIGN_INVITATIONS (email, token, used)

GAME_SESSIONS
  ├── campaign_id → CAMPAIGNS
  └── dm_id → USERS

FORUM_THREADS
  │ author_id → USERS
  │ 1:N
  └──► FORUM_POSTS (author_id → USERS)

COMPENDIUM_BESTIARY / COMPENDIUM_SPELLS / COMPENDIUM_ITEMS
  (Tablas de referencia, sin FK a usuarios)
```

### 4.5 (Opcional II) Diseño de la interfaz

La interfaz se ha diseñado siguiendo los principios de **dark fantasy** con los siguientes tokens de diseño:

- **Paleta de colores**: Ámbar/dorado (`#d97706`, `#92400e`) como color primario; verdes oscuros como secundario; tonos naranja-rojo como acento.
- **Modo oscuro**: Fondos `#1a1209` (dark), `#231a0e` (dark-lighter), `#2d2210` (dark-card).
- **Tipografía**: Fuente del sistema con soporte para modo claro (`stone-800`) y oscuro (`amber-50`).
- **Componentes**: TailwindCSS + shadcn/ui para formularios, modales y elementos interactivos.
- **Animaciones**: Hover con `scale-[1.02]`, transiciones de 300ms, efectos de gradiente.

La primera versión simplificada del frontend está publicada en producción en [www.beyondthedungeon.org](https://www.beyondthedungeon.org).

### 4.6 Sostenibilidad — ODS 9, 12 y 13

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
- **Optimización de assets:** Vite genera bundles con *tree-shaking* y *code splitting* automáticos, eliminando código no utilizado del bundle de producción y reduciendo el peso descargado por el usuario.
- **TailwindCSS con purge:** en producción, Tailwind elimina todas las clases CSS no utilizadas, generando una hoja de estilos mínima (normalmente < 20 KB).
- **Datos D&D en base de datos local:** el compendio SRD se almacena en Supabase (PostgreSQL) en lugar de hacer peticiones repetidas a APIs externas, reduciendo el tráfico de red y la dependencia de servicios de terceros.
- **Modo oscuro:** la interfaz incluye modo oscuro completo. En pantallas OLED, el modo oscuro reduce significativamente el consumo energético del dispositivo del usuario.

#### ODS 13 — Acción por el clima

Las decisiones de infraestructura se han tomado considerando la huella de carbono del despliegue:

- **VPS en servidor europeo:** el servidor de producción (VPS vmi3022429) está ubicado en Europa, donde la regulación medioambiental es más estricta y los proveedores de energía tienden a tener una mayor proporción de energías renovables respecto a otras regiones.
- **Servidor compartido eficiente:** el uso de un VPS en lugar de instancias dedicadas permite compartir la infraestructura física con otros proyectos, optimizando el uso de los servidores físicos subyacentes y reduciendo la huella por usuario.
- **Sin servicios siempre activos innecesarios:** el backend se activa bajo demanda; no existen *workers* o *cron jobs* ejecutándose de forma continua sin propósito.
- **Compresión de respuestas:** Nginx está configurado para servir el frontend con compresión gzip, reduciendo el volumen de datos transferidos en cada petición y el consumo energético asociado a la transmisión.

---

## 5. Implementación

> *Apartado en construcción — se completará al finalizar el desarrollo.*

---

## 6. Conclusiones

### 6.1 Conclusiones del trabajo realizado

> *Apartado en construcción — se completará al finalizar el proyecto.*

### 6.2 Trabajos futuros

Durante el desarrollo se han identificado las siguientes mejoras y evoluciones que quedan fuera del alcance de la primera fase del proyecto:

- **Pasarela de pago (Stripe):** Implementar un modelo de suscripción o donación para financiar los costes del VPS y garantizar la sostenibilidad del proyecto a largo plazo.
- **Tests automatizados:** Añadir tests unitarios (Vitest + React Testing Library) para las validaciones de formularios y la lógica de autenticación, incrementando la fiabilidad del sistema.
- **Imágenes en el foro:** Permitir adjuntar imágenes a los mensajes del foro, almacenadas en Supabase Storage.
- **Avatar de personaje:** Añadir la posibilidad de subir una imagen de avatar para cada ficha de personaje.
- **Integración con API externa de D&D:** Conectar con una API pública de D&D 5e (como api.open5e.com) para obtener datos actualizados automáticamente sin depender del seed manual.
- **Voz y vídeo integrados:** Añadir comunicación por voz/vídeo dentro de la sesión de juego, eliminando la necesidad de usar Discord en paralelo.
- **Generación de contenido con IA:** Integrar un LLM para ayudar al DM a generar descripciones de escenas, NPCs o encuentros aleatorios.
- **App móvil nativa:** Desarrollar una aplicación nativa (React Native) para consultar fichas de personaje e inventario desde el móvil durante la partida.
- **Certificación de sostenibilidad:** Obtener métricas concretas de huella de carbono del servidor mediante herramientas como [Website Carbon Calculator](https://www.websitecarbon.com) e incorporarlas como evidencia cuantitativa al análisis de ODS.
- **Análisis nube vs local:** Elaborar un documento comparativo de costes, seguridad y legalidad entre el despliegue actual en VPS propio y alternativas cloud (AWS, GCP, serverless).

---

## 7. Bibliografía

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
