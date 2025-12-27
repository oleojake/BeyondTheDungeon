# Beyond The Dungeon - Frontend

Frontend del proyecto Beyond The Dungeon, construido con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **Supabase** - Backend y autenticación (por configurar)

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 🔍 Linting

```bash
npm run lint
```

## 🌍 Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables necesarias:

```bash
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🚀 Despliegue en Vercel

Este proyecto está configurado para desplegarse automáticamente en Vercel desde la rama `main`.

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── assets/        # Recursos estáticos
│   ├── components/    # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Servicios API
│   ├── hooks/         # Custom hooks
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── public/            # Assets públicos
└── index.html         # HTML principal
```

      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },

},
])

```

```
