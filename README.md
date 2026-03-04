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

- `.env` en raíz: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `backend/.env`: `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

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
    "class_level": "Guerrero 5",
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
  "class_level": "Guerrero 5",
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

- **Información básica**: nombre, raza, clase, nivel, trasfondo, alineamiento
- **Atributos**: STR, DEX, CON, INT, WIS, CHA
- **Combate**: HP (max/actual/temp), CA, iniciativa, velocidad
- **Habilidades**: 18 skills con competencias
- **Salvaciones**: Competencias en 6 atributos
- **Rasgos**: personalidad, ideales, vínculos, defectos
- **Equipo**: Campo de texto libre
- **Inventario**: Campo de texto libre
- **Hechizos**: Campo de texto libre
- **Notas**: Campo de texto libre

**Nota**: Los campos de equipo, inventario y hechizos son de texto libre. En futuras versiones se vincularán con las tablas de compendio.

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
- **Guardado automático**: Pulsa "Guardar Ficha" para almacenar tus cambios
- **Organización por pestañas**:
  - 📋 **Info**: Datos básicos y rasgos de personalidad
  - ⚔️ **Stats**: Atributos y bonificadores
  - 🛡️ **Combate**: HP, CA, iniciativa, tiradas de salvación
  - 💪 **Habilidades**: Skills y características especiales
  - 🎒 **Equipo**: Armas, armaduras e inventario
  - 📜 **Hechizos**: Lista de hechizos y notas
- **Privacidad**: Opción de hacer la ficha pública o privada
- **Campos de texto libre**: Equipo, inventario, hechizos y notas son campos editables libremente

#### Uso:

1. Inicia sesión con tu cuenta
2. Ve a "Mi Ficha" en el menú
3. Rellena los campos de tu personaje
4. Pulsa "Guardar Ficha" para almacenar los cambios

#### Acceso del Dungeon Master:

Cuando el sistema de campañas esté implementado:

- El DM podrá ver las fichas de los jugadores de su campaña
- Los jugadores solo pueden editar su propia ficha
- Si un usuario es DM de una campaña, no podrá ver su propia ficha como jugador en esa misma campaña

**⚠️ Pendiente**: Sistema de campañas y asignación de jugadores

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
