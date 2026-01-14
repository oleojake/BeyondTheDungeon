# 🎲 Beyond The Dungeon

Herramientas de apoyo para partidas de rol. Proyecto desarrollado con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v7
- **Database**: Supabase + PostgreSQL
- **Backend**: APIs directas a Supabase (sin servidor Express)
- **Deploy**: Vercel (automático en `main`)

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

## 🚀 Deploy (Vercel)

### Configuración Actual:

- ✅ **Deploy automático** solo cuando se mergea a `main`
- ❌ **No deploy** en commits a `dev` o en PRs
- 📦 Build desde la raíz del proyecto

### Proceso:

1. Se hace merge de `dev` → `main`
2. Vercel detecta el push a `main`
3. Ejecuta:
   ```bash
   npm install && npm run build
   ```
4. Despliega `dist/` a producción

### Variables de Entorno:

Para configurar en Vercel Dashboard:

```
SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_key
```

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
