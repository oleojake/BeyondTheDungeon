# 🚀 Guía de Configuración del Entorno de Desarrollo

## 📋 Requisitos previos

- Node.js 20+
- Docker y Docker Compose (opcional, solo para pruebas locales con containers)
- Git

---

## 🔧 Configuración inicial

### 1. Clonar el repositorio y cambiar a dev

```bash
git clone https://github.com/oleojake/BeyondTheDungeon.git
cd BeyondTheDungeon
git checkout dev
```

### 2. Configurar variables de entorno

#### 📁 Raíz del proyecto (`.env`)

Crea el archivo `.env` en la raíz con estas credenciales:

```env
VITE_SUPABASE_URL=https://frvrzprfdxokhghytbyb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_rYZf-AkP22rKlLUeyxznfA_QY7gzjPC
```

#### 📁 Frontend (`frontend/.env`)

Crea el archivo `frontend/.env` con las mismas credenciales:

```env
VITE_SUPABASE_URL=https://frvrzprfdxokhghytbyb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_rYZf-AkP22rKlLUeyxznfA_QY7gzjPC
```

#### 📁 Backend (`backend/.env`)

Crea el archivo `backend/.env` con estas variables:

```env
PORT=3000
SUPABASE_URL=https://frvrzprfdxokhghytbyb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_rYZf-AkP22rKlLUeyxznfA_QY7gzjPC
```

---

## 🏃 Ejecutar el proyecto localmente

### Opción A: Sin Docker (desarrollo rápido)

#### Terminal 1 - Backend

```bash
cd backend
npm install
npm start
```

El backend estará en http://localhost:3000

**Endpoints disponibles:**

- `GET /health` - Healthcheck
- `GET /api/ping` - Test de conectividad
- `GET /api/supabase-status` - Verifica config de Supabase
- `GET /api/compendium-bestiary` - Obtiene bestiario (ejemplo real con Supabase)

#### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará en http://localhost:5173

**Nota:** Ambos servicios deben estar corriendo simultáneamente para que la aplicación funcione completa.

---

### Opción B: Con Docker (entorno más cercano a producción)

```bash
# Desde la raíz del proyecto
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000

Para detener:

```bash
docker compose down
```

---

## 🌿 Flujo de trabajo con Git

### 1. Crear una nueva funcionalidad

```bash
# Asegúrate de estar en dev actualizado
git checkout dev
git pull origin dev

# Crea tu rama de feature
git checkout -b feature/nombre-de-tu-funcionalidad
```

### 2. Trabajar y commitear

```bash
# Haz tus cambios...
git add .
git commit -m "Descripción clara del cambio"
git push origin feature/nombre-de-tu-funcionalidad
```

### 3. Crear Pull Request

- Ve a GitHub
- Crea un PR de `feature/nombre-de-tu-funcionalidad` → `dev`
- Espera revisión y aprobación
- Una vez aprobado, haz merge a `dev`

### 4. Deploy a producción (solo líderes de equipo)

- Crea un PR de `dev` → `main`
- Al mergear, GitHub Actions desplegará automáticamente al VPS
- Los endpoints del backend estarán disponibles en:
  - `https://beyondthedungeon.org/api/ping`
  - `https://beyondthedungeon.org/api/compendium-bestiary`
  - etc.

---

## 🔍 Verificar que todo funciona

### Backend

```bash
curl http://localhost:3000/api/ping
# Debe responder: {"pong":true,"ts":...}
```

### Frontend

Abre http://localhost:5173 (o :8080 con Docker) y verifica:

- La página home carga correctamente
- Puedes navegar a `/login` y `/register`
- El formulario de login conecta con Supabase

---

## 🐛 Solución de problemas comunes

### Error: "Faltan variables de entorno"

- Verifica que los archivos `.env` existen en raíz, `frontend/` y `backend/`
- Revisa que las claves están correctamente copiadas (sin espacios extra)

### Puerto 3000 o 5173 ya en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### El login da error 400

- Verifica que el usuario existe en el dashboard de Supabase
- Asegúrate de que el email está confirmado en Supabase Auth

---

## 📞 Contacto

Si tienes problemas, pregunta en el canal de desarrollo del equipo.
