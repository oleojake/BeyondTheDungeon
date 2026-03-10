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
