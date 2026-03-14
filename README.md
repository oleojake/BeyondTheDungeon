# 🎲 Beyond The Dungeon

Herramientas de apoyo para partidas de rol con compendio completo de D&D 5e (bestiario, objetos y hechizos). Proyecto desarrollado con React, TypeScript, Vite y Tailwind CSS.

🌐 **Sitio web:** [www.beyondthedungeon.org](https://www.beyondthedungeon.org)

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v7
- **Database**: Supabase + PostgreSQL
- **Backend**: Node.js + Express (API REST)
- **Deploy**: Docker + VPS con GitHub Actions (automático en `main`)

## ✨ Características Destacadas

- **📚 Compendio Completo de D&D 5e**: Bestiario, objetos y hechizos con búsqueda y filtros
- **📝 Fichas de Personaje**: Sistema completo con soporte para multiclase y todos los campos estándar de D&D 5e
- **🗺️ Mapas de Batalla Interactivos**: Carga imágenes, cuadrícula personalizable, zoom y paneo
- **🎭 Sistema de Campañas para DMs**:
  - Organización jerárquica: Campaña → Capítulos → Escenas
  - Invitaciones por email con sistema de tokens
  - Editor de texto rico con formato markdown
  - **Modo de selección en compendios**: Navega directamente al bestiario/objetos/hechizos y selecciona elementos con un click
  - **Sistema de entidades**: Añade monstruos, objetos, hechizos, NPCs y mapas a tus escenas
  - **Alias personalizables**: Reutiliza entidades del compendio con nombres únicos (ej: "Goblin" → "Goblin Centinela 1")
- **🎮 Partidas Online en Vivo**:
  - Pantalla de juego VTT completa con mapa de batalla, tokens y sistema de combate
  - Panel del DM para navegar la historia en tiempo real
  - Combate por turnos con orden de iniciativa configurable (reglas D&D 5e, incluye sorpresa)
  - **Tiempo real con Supabase Realtime**: todos los participantes ven los cambios al instante
  - Fichas de personaje consultables y editables desde la partida
  - Tirada de dados integrada sin salir de la partida
  - Notificación por email a todos los jugadores cuando el DM inicia sesión
- **🎲 Tirada de Dados**: Simulador de dados para D&D
- **🔐 Autenticación segura**: Sistema de usuarios con Supabase Auth
- **🌓 Modo Oscuro**: Interfaz adaptada para sesiones nocturnas

## 📁 Estructura del Proyecto

```
BeyondTheDungeon/
├── src/
│   ├── api/             # APIs de Supabase
│   ├── layout/          # Layouts principales (AppLayout)
│   ├── router/          # Configuración de rutas
│   ├── scenes/          # Scenes = Layout + Pods
│   ├── global-css/      # Estilos globales (Tailwind)
│   └── pods/            # Módulos funcionales (Pod Architecture)
│       └── home/
│           ├── home.container.tsx    # Lógica + Estado
│           ├── home.component.tsx    # UI Pura
│           └── index.ts
├── package.json
├── vite.config.ts
└── index.html
```

## 🧩 Arquitectura de Pods

Usamos **Pod Architecture** para mantener el código modular y escalable:

### ¿Qué es un Pod?

Un **pod** es una funcionalidad autocontenida (normalmente una página o sección).

### Estructura de un Pod:

```
pods/nombre-feature/
├── nombre.container.tsx   # Lógica, estado, llamadas API
├── nombre.component.tsx   # Solo UI, sin lógica
├── nombre.vm.ts           # View Models (tipos)
├── components/            # Componentes internos del pod
└── api/                   # Llamadas API específicas (cuando las haya)
    ├── api.ts
    ├── api-model.ts
    ├── mapper.ts
    └── repository.ts
```

### Separación Container/Component:

- **Container**: Maneja estado, efectos, llamadas API → Pasa props al Component
- **Component**: Solo renderiza UI → No tiene lógica de negocio

### Scenes:

Las **scenes** conectan un **layout** con uno o más **pods**:

```tsx
// scenes/home.scene.tsx
import { AppLayout } from "@/layout";
import { HomeContainer } from "@/pods/home";

export const HomeScene = () => {
  return (
    <AppLayout>
      <HomeContainer />
    </AppLayout>
  );
};
```

---

## 🌿 Workflow de Git

### Estrategia de Ramas

```
main (producción)
  ↑
  └── dev (base de desarrollo)
       ↑
       ├── feature/#numero-nombre
       ├── fix/#numero-nombre
       └── hotfix/#numero-nombre
```

### Reglas:

1. **`main`**: Protegida. Solo se mergea desde `dev` cuando está probado.
2. **`dev`**: Rama de integración. Todos los PRs van aquí primero.
3. **Feature branches**: Siempre salen de `dev` y vuelven a `dev`.

### Nomenclatura de Ramas

```bash
feature/#6-initial-frontend-template
fix/#12-navigation-bug
chore/#15-update-dependencies
```

**Formato**: `tipo/#numero-descripcion-corta`

### Flujo de Trabajo

```bash
# 1. Crear rama desde dev
git checkout dev
git pull origin dev
git checkout -b feature/#6-mi-funcionalidad

# 2. Hacer commits (Conventional Commits)
git add .
git commit -m "feat(auth): add login form"

# 3. Subir rama
git push -u origin feature/#6-mi-funcionalidad

# 4. Abrir PR hacia dev en GitHub
# 5. Después de review → Merge to dev
# 6. Probar en dev
# 7. Cuando esté estable → PR de dev → main
```

---

## 📝 Conventional Commits

Usamos **Conventional Commits** para mantener el historial limpio:

```bash
feat(scope): descripción corta       # Nueva funcionalidad
fix(scope): descripción corta        # Corrección de bug
chore(scope): descripción corta      # Tareas de mantenimiento
docs(scope): descripción corta       # Documentación
style(scope): descripción corta      # Formato, no afecta código
refactor(scope): descripción corta   # Refactorización
test(scope): descripción corta       # Tests
```

**Ejemplos:**

```bash
feat(auth): add login form
fix(dice): correct roll calculation
chore(deps): update react to v19
docs(readme): add setup instructions
```

---

## 🔗 Issues y PRs

### Al crear una rama:

```bash
feature/#6-initial-frontend-template
         ↑
    número de issue
```

### Al hacer PR:

En la descripción, añade:

```markdown
Closes #6
```

Esto cierra automáticamente la issue cuando se mergea el PR.

### Al hacer commits:

```bash
git commit -m "feat(frontend): setup inicial (#6)"
                                           ↑
                                  referencia al issue
```

---

## 🚀 Deploy (Docker + VPS)

### Configuración Actual:

- ✅ **Deploy automático** cuando se mergea a `main`
- ❌ **No deploy** en commits a `dev` o en PRs
- 🐳 Contenedores Docker orquestados con Docker Compose
- 🔄 GitHub Actions ejecuta el deploy vía SSH al VPS

### Proceso:

1. Se hace merge de `dev` → `main`
2. GitHub Actions detecta el push a `main`
3. Se conecta al VPS vía SSH
4. Ejecuta en el VPS:
   ```bash
   git pull origin main
   docker compose down
   docker compose up -d --build
   docker system prune -f
   ```
5. Los contenedores se reconstruyen y reinician automáticamente

### Servicios desplegados:

- **Frontend**: Nginx en puerto 8080 (https://beyondthedungeon.org)
- **Backend**: Express en puerto 3000 (https://beyondthedungeon.org/api/*)

### Variables de Entorno:

Configuradas en el VPS:

- `.env` en raíz (frontend): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- `backend/.env`: `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `backend/.env` (opcional para emails): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Ver `backend/.env.example` para la plantilla completa con comentarios.

---

## 📡 API Endpoints

El backend expone los siguientes endpoints REST:

### Compendio (Compendium)

#### Bestiario (Bestiary)

```
GET /api/compendium-bestiary
GET /api/compendium-bestiary/:id
```

Devuelve el listado completo de monstruos o un monstruo específico por ID.

**Documentación**: Ver [BESTIARIO.md](./BESTIARIO.md)

#### Objetos (Items/Equipment)

```
GET /api/compendium-items
```

Devuelve el catálogo completo de objetos, armas, armaduras y equipo.

**Respuesta**: `{ items: [...], count: number }`

**Documentación**: Ver [OBJETOS.md](./OBJETOS.md)

#### Hechizos (Spells)

```
GET /api/compendium-spells
GET /api/compendium-spells/:id
```

Devuelve el grimorio completo de hechizos o un hechizo específico por ID.

**Respuesta**: `{ spells: [...], count: number }`

**Documentación**: Ver [HECHIZOS.md](./HECHIZOS.md)

### Fichas de Personaje (Character Sheets)

**⚠️ Requieren autenticación**: Enviar token JWT en header `Authorization: Bearer <token>`

#### Obtener mi ficha

```
GET /api/character-sheet
```

Obtiene la ficha del personaje del usuario autenticado.

**Headers**: `Authorization: Bearer <token>`

**Respuesta**:

```json
{
  "character": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Thorin Escudo de Roble",
    "race": "Enano de las Montañas",
    "classes": [
      {"name": "Guerrero", "level": 5}
    ],
    "background": "Soldado",
    "alignment": "Legal Bueno",
    "experience_points": 6500,
    "stats": {
      "strength": 16,
      "dexterity": 12,
      "constitution": 14,
      "max_hp": 45,
      ...
    },
    "inventory": "...",
    "spells_known": "...",
    "equipment": "...",
    "notes": "...",
    "is_public": false,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-03-04T14:20:00Z"
  }
}
```

**Ejemplo con multiclase**:

```json
{
  "character": {
    "name": "Aria Sombra",
    "race": "Semielfo",
    "classes": [
      {"name": "Pícaro", "level": 3},
      {"name": "Mago", "level": 2}
    ],
    ...
  }
}
```

Si el usuario no tiene ficha aún: `{ "character": null }`

#### Crear ficha

```
POST /api/character-sheet
```

Crea una nueva ficha de personaje para el usuario autenticado.

**Headers**: `Authorization: Bearer <token>`

**Body**:

```json
{
  "name": "Thorin Escudo de Roble",
  "race": "Enano de las Montañas",
  "classes": [
    {"name": "Guerrero", "level": 5}
  ],
  "background": "Soldado",
  "alignment": "Legal Bueno",
  "experience_points": 6500,
  "stats": { ... },
  "inventory": "...",
  "spells_known": "...",
  "equipment": "...",
  "notes": "...",
  "is_public": false
}
```

**Respuesta**: `{ "character": { ... } }` (ficha creada)

#### Actualizar ficha

```
PUT /api/character-sheet/:id
```

Actualiza la ficha de personaje existente.

**Headers**: `Authorization: Bearer <token>`

**Body**: Mismo formato que POST

**Respuesta**: `{ "character": { ... } }` (ficha actualizada)

**Restricciones**:

- Solo el dueño puede editar su ficha
- El campo `user_id` no puede modificarse
- Retorna `403 Forbidden` si se intenta editar la ficha de otro usuario

#### Campos de la Ficha

La ficha incluye todos los campos estándar de D&D 5e:

- **Información básica**:
  - Nombre, raza (desplegable con 18 opciones), trasfondo (desplegable con 14 opciones), alineamiento (desplegable con 9 opciones)
  - Puntos de experiencia
- **Sistema de Clases** (campo `classes` JSONB):
  - Clase simple: Un objeto con nombre y nivel
  - Multiclase: Array con hasta 3 objetos {name, level}
  - Desplegable con 12 clases de D&D 5e en español
- **Atributos** (en español):
  - Fuerza, Destreza, Constitución, Inteligencia, Sabiduría, Carisma
  - Modificadores calculados automáticamente
- **Combate**:
  - HP (máximos/actuales/temporales), CA, iniciativa, velocidad
  - Tiradas de salvación contra la muerte (éxitos/fallos)
  - Dados de golpe
- **Habilidades** (18 skills en español):
  - Acrobacias, Trato con Animales, Arcano, Atletismo, Engaño, Historia, Perspicacia, Intimidación, Investigación, Medicina, Naturaleza, Percepción, Interpretación, Persuasión, Religión, Juego de Manos, Sigilo, Supervivencia
  - Checkboxes de competencia
- **Salvaciones** (6 atributos en español):
  - Checkboxes de competencia para cada atributo
- **Rasgos de personalidad**:
  - Personalidad, ideales, vínculos, defectos
  - Idiomas, competencias, características especiales
- **Campos de texto libre**:
  - **Equipo**: Armas, armaduras y herramientas
  - **Inventario**: Objetos, monedas y tesoros
  - **Hechizos**: Lista de hechizos conocidos/preparados
  - **Notas**: Notas generales y historia del personaje

**Características del formulario**:

- Interfaz completamente en español
- Desplegables (Select) para razas, clases, alineamientos y trasfondos
- Botón "Multiclase" para activar clases adicionales
- Botón de guardado adaptativo al tema (modo claro/oscuro)
- Organización en 6 pestañas (Info, Stats, Combate, Habilidades, Equipo, Hechizos)

**Nota**: Los campos de equipo, inventario y hechizos son de texto libre. En futuras versiones se vincularán con las tablas de compendio.

### Mapas de Batalla (Battle Maps)

**⚠️ Requieren autenticación**: Enviar token JWT en header `Authorization: Bearer <token>`

#### Listar mapas

```
GET /api/battle-maps
```

Obtiene todos los mapas de batalla del usuario autenticado.

**Headers**: `Authorization: Bearer <token>`

**Respuesta**:

```json
{
  "maps": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Cueva del Dragón",
      "image_data": "data:image/png;base64,...",
      "grid_size": 50,
      "grid_color": "rgba(255, 255, 255, 0.3)",
      "created_at": "2026-03-15T10:30:00Z",
      "updated_at": "2026-03-15T14:20:00Z"
    }
  ],
  "count": 1
}
```

#### Obtener mapa específico

```
GET /api/battle-maps/:id
```

Obtiene un mapa de batalla específico por ID.

**Headers**: `Authorization: Bearer <token>`

**Respuesta**: `{ "map": { ... } }`

#### Crear mapa

```
POST /api/battle-maps
```

Crea un nuevo mapa de batalla.

**Headers**: `Authorization: Bearer <token>`

**Body**:

```json
{
  "name": "Cueva del Dragón",
  "image_data": "data:image/png;base64,iVBORw0KGgo...",
  "grid_size": 50,
  "grid_color": "rgba(255, 255, 255, 0.3)"
}
```

**Respuesta**: `{ "map": { ... } }` (mapa creado)

**Nota**: El campo `image_data` debe ser una imagen codificada en Base64 (máximo 50MB).

#### Actualizar mapa

```
PUT /api/battle-maps/:id
```

Actualiza un mapa de batalla existente.

**Headers**: `Authorization: Bearer <token>`

**Body**: Mismo formato que POST

**Respuesta**: `{ "map": { ... } }` (mapa actualizado)

#### Eliminar mapa

```
DELETE /api/battle-maps/:id
```

Elimina un mapa de batalla.

**Headers**: `Authorization: Bearer <token>`

**Respuesta**: `{ "message": "Mapa eliminado correctamente" }`

**Restricciones**:

- Solo el dueño puede ver, editar y eliminar sus mapas
- Retorna `403 Forbidden` si se intenta acceder al mapa de otro usuario

### Campañas (Campaigns)

**⚠️ Requieren autenticación**: Enviar token JWT en header `Authorization: Bearer <token>`

#### Listar campañas

```
GET /api/campaigns
```

Obtiene todas las campañas donde el usuario es DM o jugador.

**Respuesta**:

```json
{
  "campaigns": [
    {
      "id": "uuid",
      "dm_id": "uuid",
      "title": "La Mina Perdida de Phandelver",
      "description": "Aventura para niveles 1-5",
      "notes": "Notas privadas del DM...",
      "created_at": "2026-03-10T10:00:00Z",
      "updated_at": "2026-03-10T14:00:00Z"
    }
  ],
  "count": 1
}
```

#### Crear campaña

```
POST /api/campaigns
```

Crea una nueva campaña. El usuario creador se convierte automáticamente en DM.

**Body**:

```json
{
  "title": "Mi Campaña",
  "description": "Descripción...",
  "notes": "Notas del DM..."
}
```

#### Actualizar campaña

```
PUT /api/campaigns/:id
```

Actualiza los datos de una campaña (solo DM).

#### Eliminar campaña

```
DELETE /api/campaigns/:id
```

Elimina una campaña y todo su contenido (solo DM).

#### Transferir rol de DM

```
PUT /api/campaigns/:id/transfer-dm
```

Transfiere el rol de DM a otro miembro de la campaña.

**Body**: `{ "new_dm_id": "uuid" }`

#### Miembros de campaña

```
GET /api/campaigns/:id/members        # Listar miembros
DELETE /api/campaigns/:campaignId/members/:userId  # Expulsar jugador
```

#### Invitaciones

```
GET /api/campaign-invitations                      # Mis invitaciones pendientes
POST /api/campaigns/:id/invitations                # Crear invitación
PUT /api/campaign-invitations/:token/accept        # Aceptar invitación
PUT /api/campaign-invitations/:token/reject        # Rechazar invitación
DELETE /api/campaign-invitations/:id               # Eliminar invitación (DM)
```

**Crear invitación**:

```json
{
  "email": "jugador@ejemplo.com"
}
```

#### Capítulos

```
GET /api/campaigns/:campaignId/chapters          # Listar capítulos
POST /api/campaigns/:campaignId/chapters         # Crear capítulo
PUT /api/chapters/:id                            # Actualizar capítulo
DELETE /api/chapters/:id                         # Eliminar capítulo
```

**Crear capítulo**:

```json
{
  "title": "Capítulo 1: El Inicio",
  "content": "Texto del capítulo con **negrita** y > diálogos",
  "order_index": 0
}
```

#### Escenas

```
GET /api/chapters/:chapterId/scenes              # Listar escenas
POST /api/chapters/:chapterId/scenes             # Crear escena
PUT /api/scenes/:id                              # Actualizar escena
DELETE /api/scenes/:id                           # Eliminar escena
```

**Crear escena**:

```json
{
  "title": "La Emboscada",
  "content": "Descripción general",
  "narration_text": "**Os encontráis** en un claro del bosque cuando...\n> ¡Alto ahí, viajeros!",
  "dm_notes": "3 goblins escondidos, DC 12 Percepción",
  "battle_map_id": "uuid-del-mapa",
  "order_index": 0
}
```

#### Entidades de Escena

```
GET /api/scenes/:sceneId/entities                # Listar entidades
POST /api/scenes/:sceneId/entities               # Añadir entidad
DELETE /api/scene-entities/:id                   # Eliminar entidad
```

**Añadir entidad**:

```json
{
  "entity_type": "monster",
  "entity_id": "goblin",
  "entity_name": "Goblin Líder"
}
```

**Tipos de entidad**: `monster`, `item`, `spell`, `npc`, `map`

**Flujo de añadir entidades**:

1. **Desde el compendio** (monster, item, spell):
   - El usuario navega al compendio correspondiente en "modo de selección"
   - Selecciona el elemento deseado
   - Es redirigido de vuelta al editor de campaña con los datos de la entidad
   - Puede añadir un alias opcional antes de confirmar

2. **NPCs personalizados**:
   - El usuario introduce el nombre del NPC directamente
   - Puede añadir notas adicionales sobre el NPC

3. **Mapas de batalla**:
   - El usuario selecciona de un desplegable con sus mapas guardados
   - El mapa se asocia a la escena

### Utilidades

```
GET /health              # Health check
GET /api/ping            # Ping test
GET /api/supabase-status # Estado de Supabase
```

---

## 🎮 Funcionalidades

### 🧙 Fichas de Personaje

Los usuarios registrados pueden crear y gestionar su ficha de personaje de D&D 5e.

#### Características:

- **Ficha completa de D&D 5e**: Todos los campos estándar (atributos, habilidades, salvaciones, HP, CA, etc.)
- **Sistema de Multiclase**:
  - Opción de activar multiclase con checkbox
  - Hasta 3 clases simultáneas con niveles independientes
  - Botones para agregar/quitar clases adicionales
- **Selección mediante desplegables**:
  - **Razas**: 18 razas de D&D 5e en español (Humano, Elfo, Enano, etc.)
  - **Clases**: 12 clases base en español (Guerrero, Mago, Pícaro, etc.)
  - **Alineamientos**: 9 alineamientos estándar (Legal Bueno, Caótico Neutral, etc.)
  - **Trasfondos**: 14 trasfondos comunes (Soldado, Noble, Sabio, etc.)
- **Interfaz traducida**: Todos los atributos, habilidades y salvaciones en español
- **Guardado con tema adaptativo**: Botón de guardado que se adapta al modo claro/oscuro
- **Organización por pestañas**:
  - 📋 **Info**: Datos básicos, multiclase y rasgos de personalidad
  - ⚔️ **Stats**: Atributos y bonificadores calculados automáticamente
  - 🛡️ **Combate**: HP, CA, iniciativa, tiradas de salvación contra la muerte
  - 💪 **Habilidades**: 18 skills en español con checkboxes de competencia
  - 🎒 **Equipo**: Armas, armaduras e inventario (texto libre)
  - 📜 **Hechizos**: Lista de hechizos y notas generales (texto libre)
- **Privacidad**: Opción de hacer la ficha pública o privada
- **Campos de texto libre**: Equipo, inventario, hechizos y notas son campos editables libremente

#### Uso:

1. Inicia sesión con tu cuenta
2. Ve a "Mi Ficha" en el menú
3. Rellena los campos de tu personaje:
   - Selecciona raza, clase, alineamiento y trasfondo desde los desplegables
   - Marca "Multiclase" si quieres combinar varias clases
   - Introduce tus atributos (los modificadores se calculan automáticamente)
   - Marca las habilidades y salvaciones en las que eres competente
4. Pulsa "Guardar Ficha" para almacenar los cambios

#### Sistema de Multiclase:

- **Clase simple**: Por defecto, un solo campo de clase y nivel
- **Activar multiclase**: Marca el checkbox "Multiclase" para activar clases adicionales
- **Agregar clases**: Click en "+ Agregar Clase" (máximo 3 clases)
- **Eliminar clases**: Click en la X al lado de cada clase adicional
- **Ejemplo**: Guerrero nivel 5, Pícaro nivel 3 (multiclase nivel 8 total)

#### Estructura de Datos:

**Campo `classes`** (JSONB):

```json
[
  { "name": "Guerrero", "level": 5 },
  { "name": "Pícaro", "level": 3 }
]
```

**Campo `stats`** (JSONB): Contiene todos los atributos, habilidades, salvaciones, HP, rasgos de personalidad, etc.

**Campos de texto libre**: `inventory`, `spells_known`, `equipment`, `notes`

#### Acceso del Dungeon Master:

Cuando el sistema de campañas esté implementado:

- El DM podrá ver las fichas de los jugadores de su campaña
- Los jugadores solo pueden editar su propia ficha
- Si un usuario es DM de una campaña, no podrá ver su propia ficha como jugador en esa misma campaña

**⚠️ Pendiente**: Sistema de campañas y asignación de jugadores

---

### 🗺️ Mapas de Batalla

Los usuarios registrados pueden cargar y gestionar mapas de batalla interactivos con cuadrícula personalizable.

#### Características:

- **Carga de imágenes**: Arrastra y suelta o selecciona una imagen desde tu dispositivo
- **Cuadrícula personalizable**:
  - **Tamaño ajustable**: Desde 20px hasta 200px por celda
  - **Color personalizado**: Selector de color con opacidad ajustable
  - **Mostrar/ocultar**: Toggle para activar o desactivar la cuadrícula
- **Controles de visualización**:
  - **Zoom**: Rueda del ratón o botones +/- (25% - 300%)
  - **Paneo**: Arrastra el mapa para moverte por él
  - **Pantalla completa**: Visualización inmersiva del mapa
- **Guardado persistente**: Los mapas se almacenan en la base de datos vinculados al usuario
- **Gestión de mapas**: Lista de todos tus mapas guardados con opciones de apertura y eliminación

#### Uso:

1. **Crear un nuevo mapa**:
   - Accede a "Mapa de Batalla" desde el menú
   - Arrastra una imagen al área designada o haz click para seleccionarla
   - Ajusta el tamaño de la cuadrícula con el slider (20-200px)
   - Personaliza el color de la cuadrícula con el selector de color
   - Ajusta la opacidad de la cuadrícula (0-100%)
   - Usa la rueda del ratón o los botones para hacer zoom
   - Arrastra el mapa para moverte por él
   - Introduce un nombre para el mapa
   - Click en "Guardar Mapa" para almacenarlo

2. **Gestionar mapas guardados**:
   - Ve a "Mis Mapas" en el menú del perfil
   - Visualiza la lista de todos tus mapas con información de tamaño de cuadrícula
   - Click en un mapa para abrirlo en el visor
   - Click en el icono de papelera para eliminarlo (con confirmación)

3. **Abrir un mapa existente**:
   - Accede desde "Mis Mapas" o directamente con la URL `/mapa-batalla?mapId=<id>`
   - El mapa se cargará con la configuración guardada (imagen, tamaño de cuadrícula, color)
   - Puedes modificar la cuadrícula y guardar los cambios

#### Controles del visor:

- **Zoom In/Out**: Botones `+` y `-` o rueda del ratón
- **Reset Zoom**: Botón "↻" para volver al 100%
- **Toggle Cuadrícula**: Checkbox "Mostrar cuadrícula"
- **Tamaño de cuadrícula**: Slider de 20 a 200 píxeles
- **Color de cuadrícula**: Selector de color + slider de opacidad
- **Paneo**: Click y arrastra el mapa con el ratón

#### Estructura de Datos:

**Tabla `battle_maps`**:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Cueva del Dragón",
  "image_data": "data:image/png;base64,...",
  "grid_size": 50,
  "grid_color": "rgba(255, 255, 255, 0.3)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Formato de color**: `rgba(R, G, B, A)` donde R, G, B son 0-255 y A es 0-1 (opacidad)

#### Rutas:

- `/mapa-batalla`: Visor de mapas de batalla
- `/mapa-batalla?mapId=<uuid>`: Abrir mapa específico
- `/mis-mapas`: Gestión de mapas guardados (requiere autenticación)

#### Consideraciones técnicas:

- **Formato de imagen**: PNG, JPG, JPEG, WebP
- **Tamaño máximo**: 50MB (codificado en Base64)
- **Renderizado**: Canvas HTML5 con renderizado optimizado
- **Persistencia**: Imágenes almacenadas en Base64 en PostgreSQL
- **Seguridad**: Row Level Security (RLS) - cada usuario solo puede ver/editar sus mapas

#### Funcionalidades futuras:

- **Tokens de personajes**: Arrastrar y colocar tokens sobre el mapa
- **Medición de distancia**: Herramienta para medir distancias en casillas
- **Capas**: Sistema de capas para tokens, efectos y anotaciones
- **Compartir mapas**: Compartir mapas entre el DM y los jugadores de una campaña
- **Integración con campañas**: Vincular mapas con sesiones de juego específicas

---

### 📜 Campañas

Sistema completo de gestión de campañas de D&D para Dungeon Masters y jugadores.

#### Características:

- **Gestión de campañas como DM**:
  - Crear campañas con título, descripción y notas privadas
  - Invitar jugadores por email con sistema de tokens
  - Transferir rol de DM a otro jugador
  - Expulsar jugadores de la campaña
  - Organización jerárquica: Campaña → Capítulos → Escenas

- **Sistema de invitaciones**:
  - Invitar jugadores por email
  - Notificaciones de invitaciones pendientes
  - Aceptar/rechazar invitaciones
  - Expiración automática (7 días)

- **Capítulos**:
  - Crear capítulos con título y contenido
  - Editor de texto rico con formato markdown
  - Ordenar capítulos (order_index)
  - Cada capítulo contiene múltiples escenas

- **Escenas**:
  - **Texto de narración**: Texto formateado para leer a los jugadores
    - `**negrita**` para énfasis (se mostrará destacado)
    - `> texto` para diálogos de personajes (formato de cita)
  - **Notas privadas del DM**: Solo visibles para el Dungeon Master
  - **Asociar mapa de batalla**: Vincular un mapa a la escena
  - **Entidades asociadas**: Añadir monstruos, objetos, hechizos o NPCs
  - Ordenar escenas dentro del capítulo

- **Entidades en escenas**:
  - Asociar **monstruos** del bestiario navegando al compendio
  - Asociar **objetos** del compendio de equipo y armas
  - Asociar **hechizos** del grimorio completo
  - Crear **NPCs personalizados** con nombre y notas
  - Asociar **mapas de batalla** a la escena
  - Sistema de **alias**: Personalizar el nombre de entidades del compendio
  - **Modo de selección**: Los compendios detectan cuando estás añadiendo entidades y te permiten seleccionar directamente

- **Editor de texto rico**:
  - Botón para aplicar **negrita** al texto seleccionado
  - Botón para convertir línea en > diálogo
  - Vista previa en tiempo real del formato
  - Sintaxis markdown simple y clara

#### Uso:

**1. Crear una campaña (DM)**:

- Accede a "Mis Campañas" desde el sidebar
- Click en "Nueva Campaña"
- Introduce título, descripción y notas privadas del DM
- Click en "Crear Campaña" → Te conviertes en DM automáticamente
- Serás redirigido al editor de la campaña

**2. Invitar jugadores**:

- En el editor de campaña, ve a la pestaña "Jugadores"
- Introduce el email del jugador
- Click en "Enviar Invitación"
- El jugador recibirá una invitación que aparecerá en su "Mis Campañas"

**3. Organizar la campaña**:

- **Pestaña General**: Edita título, descripción y notas DM
- **Pestaña Capítulos y Escenas**:
  - Click en "+ Nuevo Capítulo"
  - Escribe el título y contenido del capítulo
  - Dentro del capítulo, click en "+ Nueva Escena"
  - Completa los datos de la escena:
    - **Título**: Nombre de la escena
    - **Narración**: Texto para leer a los jugadores
      - Usa `**texto**` para destacar cosas importantes
      - Usa `> Diálogo` para palabras de NPCs
    - **Notas DM**: Recordatorios, DCs, tesoros ocultos, etc.
    - **Mapa**: Selecciona un mapa de batalla (opcional)
  - Click en "Añadir Entidad" para asociar contenido a la escena

**4. Añadir entidades a una escena**:

El sistema te permite añadir 5 tipos de entidades:

- **Monstruos, Objetos y Hechizos** (del compendio):
  1. En el diálogo de "Añadir Entidad", selecciona el tipo (Monstruo/Objeto/Hechizo)
  2. Click en "Ir al Compendio" → Se abrirá el compendio correspondiente
  3. El compendio mostrará una alerta azul indicando el modo de selección
  4. Busca y haz click en el elemento que deseas añadir
  5. Volverás automáticamente a la campaña con la entidad seleccionada
  6. Se mostrará un card con información de la entidad (tamaño/CR para monstruos, nivel/escuela para hechizos)
  7. _(Opcional)_ Añade un alias/nombre personalizado (ej: "Dragón Rojo Adulto" → "Smaug el Terrible")
  8. Click en "Añadir Entidad" para confirmar

- **NPCs personalizados**:
  1. Selecciona tipo "NPC"
  2. Introduce el nombre del NPC (ej: "Tabernero Willem")
  3. _(Opcional)_ Añade notas sobre el NPC (descripción, motivaciones, estadísticas)
  4. Click en "Añadir Entidad"

- **Mapas de batalla**:
  1. Selecciona tipo "Mapa de Batalla"
  2. Elige uno de tus mapas guardados del desplegable
  3. Click en "Añadir Entidad"

**Ventajas del sistema de alias**:

- Puedes usar el mismo monstruo múltiples veces con nombres diferentes
  - Ejemplo: "Goblin" → "Goblin Centinela 1", "Goblin Centinela 2"
- Personaliza objetos genéricos
  - Ejemplo: "Espada Larga" → "Espada del Alba"
- Si no añades alias, se usará el nombre original del compendio

**5. Durante la partida** (funcionalidad futura):

- El DM abrirá la escena correspondiente
- Verá el texto de narración formateado
- Podrá abrir el mapa de batalla asociado
- Las entidades de la escena estarán disponibles como tokens

#### Ejemplo de narración:

```markdown
**Os adentráis** en la oscura cueva. El olor a azufre es insoportable.

> ¿Quién osa entrar en mi guarida? - retumba una voz grave

Al fondo, sobre un montículo de oro, veis la silueta de un **enorme dragón rojo**.
```

**Vista previa renderizada**:

**Os adentráis** en la oscura cueva. El olor a azufre es insoportable.

> ¿Quién osa entrar en mi guarida? - retumba una voz grave

Al fondo, sobre un montículo de oro, veis la silueta de un **enorme dragón rojo**.

#### Estructura de datos:

**Campaña**:

```json
{
  "id": "uuid",
  "dm_id": "uuid",
  "title": "La Mina Perdida de Phandelver",
  "description": "Aventura inicial para nuevos jugadores",
  "notes": "Recordar: Gundren está capturado en Cragmaw Castle"
}
```

**Capítulo**:

```json
{
  "id": "uuid",
  "campaign_id": "uuid",
  "title": "Capítulo 1: El Camino a Phandalin",
  "content": "Los personajes son contratados para escoltar un carro...",
  "order_index": 0
}
```

**Escena**:

```json
{
  "id": "uuid",
  "chapter_id": "uuid",
  "title": "Emboscada Goblin",
  "narration_text": "**Veis dos caballos** muertos en el camino...\n> ¡Atacad!",
  "dm_notes": "4 goblins (HP:7 cada uno). DC 15 Percepción para detectar la trampa.",
  "battle_map_id": "uuid",
  "order_index": 0
}
```

**Entidad de Escena**:

```json
{
  "id": "uuid",
  "scene_id": "uuid",
  "entity_type": "monster",
  "entity_id": "goblin",
  "entity_name": "Goblin Arquero",
  "entity_data": {
    "quantity": 4,
    "hp_current": 7,
    "notes": "Escondidos detrás de las rocas"
  }
}
```

**Tipos de entidad**: `monster`, `item`, `spell`, `npc`, `map`

**Ejemplos de entidades**:

1. **Monstruo con alias**:

   ```json
   {
     "entity_type": "monster",
     "entity_id": "ancient-red-dragon",
     "entity_name": "Smaug el Terrible"
   }
   ```

2. **NPC personalizado**:

   ```json
   {
     "entity_type": "npc",
     "entity_id": "tabernero-willem",
     "entity_name": "Tabernero Willem"
   }
   ```

3. **Objeto del compendio**:

   ```json
   {
     "entity_type": "item",
     "entity_id": "longsword",
     "entity_name": "Espada Larga"
   }
   ```

4. **Mapa de batalla**:
   ```json
   {
     "entity_type": "map",
     "entity_id": "uuid-del-mapa",
     "entity_name": "Cueva del Dragón"
   }
   ```

#### Rutas:

- `/`: Página principal pública (información del proyecto)
- `/mis-campanas`: Listado de campañas (como DM o jugador) - **Ruta por defecto después del login**
- `/editar-campana/:id`: Editor completo de campaña (solo DM)
- `/bestiario`: Compendio de monstruos (público)
- `/objetos`: Compendio de objetos y equipo (público)
- `/hechizos`: Compendio de hechizos (público)
- `/dados`: Tirada de dados (accesible desde el sidebar)

**Navegación**:

- El **logo "Beyond the Dungeon"** en el sidebar siempre redirige a la página principal pública (`/`)
- Después de **iniciar sesión o confirmar email**, se redirige automáticamente a `/mis-campanas`
- El sidebar incluye acceso directo a "Tirada de Dados" para una experiencia rápida durante las partidas

#### Roles y permisos:

- **Dungeon Master (DM)**:
  - Crear, editar y eliminar la campaña
  - Invitar y expulsar jugadores
  - Crear y editar capítulos y escenas
  - Ver y editar todas las notas
  - Transferir rol de DM a otro jugador

- **Jugador**:
  - Ver la campaña en la lista
  - Ver contenido público (futuro: durante la partida)
  - No puede editar ni ver notas del DM

#### Consideraciones técnicas:

- **Base de datos**: PostgreSQL con RLS estricto
- **Seguridad**: Solo el DM puede modificar la campaña
- **Formato de texto**: Markdown simple (**negrita** y > diálogos)
- **Cascada**: Eliminar campaña → elimina capítulos → elimina escenas → elimina entidades
- **Ordenamiento**: `order_index` para mantener orden de capítulos y escenas

#### Funcionalidades futuras (campañas):

- **Notas de jugador**: Los jugadores pueden tomar notas en cada sesión
- **Historial de sesiones**: Registro de qué escenas se jugaron y cuándo
- **Compartir campañas**: Exportar/importar campañas entre DMs
- **Notificaciones por email en invitaciones**: Emails reales cuando te invitan a una campaña (actualmente disponible solo al iniciar sesión)

---

### 🎮 Partidas Online en Vivo

Sistema VTT (Virtual Tabletop) para jugar campañas de D&D 5e online con todos los participantes en tiempo real.

#### Cómo funciona (visión general)

- El **DM accede al editor de su campaña** y pulsa "Comenzar campaña" o "Reanudar campaña".
- Todos los **miembros de la campaña reciben un email** notificando que la sesión va a comenzar.
- El DM es redirigido a la **pantalla de partida** (`/partida/:id`).
- Los **jugadores ven en "Mis Campañas"** un badge "En curso" en tiempo real y pueden unirse pulsando "Unirse a la partida".
- El **DM puede jugar aunque ningún jugador se haya conectado**: controla todo unilateralmente (puede usarse también en partidas presenciales).
- Al terminar, el DM pulsa "Terminar Sesión" → el estado se guarda y la sesión queda pausada para poder reanudarla en otro momento en el mismo punto exacto.

#### Layout de la pantalla de partida

```
┌──────────────────────────────────────────────────────────────────┐
│ [ORDEN DE COMBATE — franja superior — solo visible en combate]   │
├──────────────┬────────────────────────────────┬──────────────────┤
│ PANEL IZQ.   │                                │ PANEL DM         │
│ (solo jug.)  │      MAPA DE BATALLA           │ (solo DM)        │
│              │      (canvas + tokens)         │                  │
│ Avatar       │                                │ Estructura hist. │
│ Nombre       │                                │ Capítulos/escenas│
│ HP           │                                │ Entidades escena │
│              │                                │ Mapas, enemigos, │
│ (click →     │                                │ NPCs, objetos,   │
│  ficha modal)│                                │ hechizos         │
│              │                                │                  │
│              │                                │ [Comenzar/       │
│              │                                │  Terminar comba.]│
│              │                                │ [Terminar sesión]│
├──────────────┴────────────────────────────────┴──────────────────┤
│   BARRA INFERIOR: [🎲 Dados] [Bestiario] [Hechizos] [Objetos]    │
└──────────────────────────────────────────────────────────────────┘
```

#### Panel izquierdo (todos los participantes)

Muestra la lista de todos los **jugadores no-DM** de la campaña:
- Avatar circular del personaje
- Nombre del personaje
- HP actuales / HP máximos
- Clic en el avatar → abre la ficha del personaje en un modal
  - **DM**: puede ver y editar todas las fichas
  - **Jugador**: solo puede ver y editar la suya propia

#### Mapa de batalla (centro — canvas HTML5)

- Carga el mapa asociado a la escena seleccionada por el DM
- **Controles de cuadrícula, zoom y paneo** (solo visibles al DM)
- **Tokens**: círculos con el avatar de cada participante colocados sobre el mapa
  - Borde azul para jugadores, rojo para enemigos, morado para NPCs
  - Borde amarillo/glow para el turno activo en combate
  - HP mostrados debajo de cada token (visibles para todos)
  - Aspa de eliminación en la esquina (visible solo al DM)
- **Arrastrar tokens**:
  - El **DM** puede arrastrar cualquier token en cualquier momento
  - Un **jugador** solo puede arrastrar su propio token, y únicamente durante su turno en combate
  - Los cambios de posición se propagan a todos en tiempo real via Supabase Realtime

#### Panel del DM (derecha — solo visible al DM)

Contiene cuatro secciones:

1. **Historia**: árbol de Capítulos y Escenas de la campaña. Al seleccionar una escena aparece un botón "Ir" que la activa para todos.

2. **Escena actual**: al entrar en una escena el DM ve paneles desplegables con las entidades de esa escena:
   - **Mapas**: al seleccionar uno y pulsar "Desplegar mapa", se carga en el canvas para todos
   - **Enemigos / NPCs / Objetos / Hechizos**: al seleccionar uno y pulsar "Introducir en mapa" (solo disponible si hay mapa cargado), se crea un token en el mapa

3. **Combate**: botón "Comenzar Enfrentamiento" → "Terminar Enfrentamiento"

4. **Sesión**: botón "Terminar Sesión"

#### Sistema de combate por turnos

**Configurar el combate** (diálogo al pulsar "Comenzar Enfrentamiento"):

1. Se muestra un grid con todos los tokens del mapa (jugadores + enemigos/NPCs). El DM puede desmarcar a quienes no participen.
2. Selector de **sorpresa**: Sin sorpresa / Héroes sorprendidos / Enemigos sorprendidos.
   - Si hay sorpresa, el bando sorprendido no actúa en la primera ronda (reglas D&D 5e).
3. El **orden de iniciativa** se calcula automáticamente según el campo `initiative_value` de cada token (mayor → primero).
4. Al confirmar, aparece la **franja superior** de combate para todos los participantes.

**Franja de orden de combate** (visible para todos durante el combate):

- Fila horizontal con los avatares en orden de iniciativa
- El token con el turno activo tiene borde amarillo brillante
- Solo el DM puede reordenar los tokens arrastrándolos
- Solo el DM puede eliminar tokens del combate (clic en el aspa)
- El jugador con el turno activo (y el DM) ven un botón "**Terminar turno**" para pasar al siguiente

**Durante el combate**:

- Solo puede mover su token en el mapa:
  - El **jugador activo** (es su turno)
  - El **DM** (puede mover cualquier token siempre)
- El DM puede añadir enemigos/NPCs adicionales desde el panel durante el combate
- Pulsar "Terminar Enfrentamiento" elimina la franja de combate y los tokens de enemigos/NPCs del mapa

#### Ficha de personaje en partida

Cuando un jugador (o el DM) hace clic en un avatar del panel izquierdo:

- Se abre un **modal** con el formulario completo de la ficha de personaje (tabs: Stats, Combate, Equipo, Hechizos, Notas)
- El jugador solo puede abrir su propia ficha
- El DM puede abrir y editar la ficha de cualquier participante
- Los cambios se guardan directamente en la base de datos sin salir de la partida

#### Dados durante la partida

- Botón "🎲 Dados" en la barra inferior → abre un overlay flotante sin abandonar la pantalla
- Soporta d4, d6, d8, d10, d12, d20, d100
- Ventaja / Desventaja
- Modificadores numéricos

#### Terminación y reanudación de sesión

Al pulsar **"Terminar Sesión"**, el DM confirma en un diálogo y se guarda:

- Estado del mapa (zoom, pan, cuadrícula)
- Escena activa
- Posición de todos los tokens en el mapa
- HP actuales de cada participante
- Estado del combate (si lo había)

La sesión queda en estado `"paused"`. La próxima vez que el DM pulse "Reanudar campaña" en el editor, todo se restaura exactamente igual.

#### Tiempo real (Supabase Realtime)

Se suscribe automáticamente a tres canales:

| Canal | Evento | Efecto |
|---|---|---|
| `session_tokens` | INSERT / UPDATE / DELETE | Tokens aparecen, se mueven o desaparecen del mapa en tiempo real |
| `combat_state` | UPDATE | Cambio de turno, inicio/fin de combate visible para todos |
| `game_sessions` | UPDATE | Si el DM termina la sesión, todos los jugadores son redirigidos a "Mis Campañas" |

También en "Mis Campañas" hay una suscripción a `game_sessions` que detecta cuando una sesión comienza y muestra el botón "Unirse" en tiempo real.

#### Estructura de datos (nuevas tablas)

**`game_sessions`**: ciclo de vida de cada sesión

```json
{
  "id": "uuid",
  "campaign_id": "uuid",
  "dm_id": "uuid",
  "status": "active | paused | ended",
  "session_number": 3,
  "current_scene_id": "uuid | null",
  "current_map_id": "uuid | null",
  "session_state": {
    "mapPanX": 0, "mapPanY": 0, "mapZoom": 1,
    "mapGridSize": 50, "mapGridColor": "rgba(255,255,255,0.3)",
    "mapShowGrid": true
  },
  "started_at": "timestamp",
  "ended_at": "timestamp | null"
}
```

**`session_tokens`**: tokens en el mapa

```json
{
  "id": "uuid",
  "session_id": "uuid",
  "token_type": "player | enemy | npc",
  "entity_name": "Thorin Escudo de Roble",
  "entity_image": "url | null",
  "x": 320.5,
  "y": 180.0,
  "current_hp": 28,
  "max_hp": 45,
  "initiative_value": 14,
  "is_on_map": true
}
```

**`combat_state`**: estado del combate

```json
{
  "id": "uuid",
  "session_id": "uuid",
  "is_active": true,
  "current_turn_index": 2,
  "round_number": 1,
  "initiative_order": ["token-uuid-1", "token-uuid-2", "token-uuid-3"],
  "surprise": "none | heroes | enemies"
}
```

#### Nuevos endpoints de API

```
GET  /api/campaigns/:id/session           # Obtener sesión activa/pausada
POST /api/campaigns/:id/session/start     # Iniciar o reanudar sesión (+ email a miembros)
PUT  /api/sessions/:id/state              # Actualizar estado (mapa, escena) - DM
PUT  /api/sessions/:id/end               # Pausar sesión y guardar estado - DM
GET  /api/sessions/:id/tokens            # Listar tokens
POST /api/sessions/:id/tokens            # Crear token
PUT  /api/sessions/:id/tokens/:tokenId  # Actualizar token (posición, HP, etc.)
DELETE /api/sessions/:id/tokens/:tokenId # Eliminar token
GET  /api/sessions/:id/combat           # Obtener estado de combate
PUT  /api/sessions/:id/combat           # Actualizar combate (turnos, orden, inicio/fin)
GET  /api/campaigns/:id/members-with-characters  # Miembros con sus fichas (DM)
```

#### Configuración de email (notificaciones de sesión)

El backend usa **nodemailer**. Para activar el envío de emails, añade estas variables en `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com          # Tu servidor SMTP
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu@email.com
SMTP_PASS=tu_contraseña_o_app_key
SMTP_FROM=Beyond The Dungeon <noreply@beyondthedungeon.org>
```

Si no se configura `SMTP_HOST`, los emails se omiten silenciosamente (útil en desarrollo).

#### Nueva ruta

- `/partida/:id` — Pantalla de partida online (requiere autenticación)

---

### 🔗 Modo de Selección en Compendios

Los compendios (Bestiario, Objetos, Hechizos) tienen un **modo de selección** integrado que simplifica el proceso de añadir entidades a las escenas de campaña.

#### ¿Cómo funciona?

Cuando accedes a un compendio desde el editor de campaña (al añadir una entidad), el compendio entra automáticamente en **modo de selección**:

1. **Indicador visual**: Se muestra una alerta azul en la parte superior indicando que estás en modo de selección
2. **Comportamiento cambiado**: Al hacer click en un elemento, en lugar de ver su detalle, vuelves automáticamente a la campaña con ese elemento seleccionado
3. **Flujo continuo**: No necesitas copiar IDs ni buscar manualmente - todo es visual e intuitivo

#### Características del modo de selección:

- **Sin cambio de contexto**: El compendio mantiene tu búsqueda y filtros mientras seleccionas
- **Información previa**: Puedes ver las estadísticas básicas antes de seleccionar (CR, nivel, tipo, etc.)
- **Cancela fácilmente**: Si cambias de opinión, simplemente navega de vuelta a la campaña sin seleccionar nada
- **Vista previa en campaña**: Una vez seleccionado, ves un resumen de la entidad antes de confirmar

#### Parámetros de navegación:

Cuando navegas al compendio en modo selección, se pasan estos parámetros vía `state`:

```javascript
{
  selectMode: true,           // Activa el modo de selección
  sceneId: "uuid",           // ID de la escena
  campaignId: "uuid"         // ID de la campaña
}
```

Al seleccionar una entidad, se navega de vuelta con:

```javascript
{
  selectedEntity: {
    id: "ancient-red-dragon",
    name: "Dragón Rojo Ancestral",
    entityType: "monster",
    data: { /* datos completos del monstruo */ }
  },
  sceneId: "uuid"
}
```

#### Ejemplo de uso:

1. Estás editando la escena "Emboscada en el Bosque"
2. Click en "Añadir Entidad" → Seleccionas tipo "Monstruo"
3. Click en "Ir al Compendio" → Se abre el bestiario con alerta azul
4. Buscas "goblin" en la barra de búsqueda
5. Click en "Goblin" → Vuelves a la campaña automáticamente
6. Ves el card con "Goblin" seleccionado (Tamaño: Small, CR: 0.25)
7. Añades alias "Goblin Centinela 1" (opcional)
8. Click en "Añadir Entidad" → ¡Listo!

#### Beneficios:

- ✅ **Navegación fluida**: No pierdes el contexto de lo que estabas haciendo
- ✅ **Visual e intuitivo**: Ves las opciones antes de seleccionar
- ✅ **Sin errores**: No necesitas copiar/pegar IDs manualmente
- ✅ **Búsqueda completa**: Acceso a todo el compendio con filtros y búsqueda
- ✅ **Reutilizable**: El mismo sistema funciona para monstruos, objetos y hechizos

---

## 🛠️ Instalación Local

```bash
# 1. Clonar repo
git clone https://github.com/oleojake/BeyondTheDungeon.git
cd BeyondTheDungeon

# 2. Instalar dependencias
npm install

# 3. Crear .env (copiar de .env.example)
cp .env.example .env

# 4. Configurar variables en .env
SUPABASE_URL=tu_url_aqui
SUPABASE_ANON_KEY=tu_key_aqui

# 5. Arrancar servidor de desarrollo
npm run dev
```

El proyecto estará en `http://localhost:5173`

---

## 🧪 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Linter (ESLint)
npm run preview  # Preview del build
```
