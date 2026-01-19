# Página del Bestiario

## Descripción

La página del bestiario permite consultar el compendio de criaturas y monstruos almacenados en la base de datos. Utiliza el endpoint `/api/compendium-bestiary` del backend para obtener los datos.

## Características

- **Búsqueda en tiempo real**: Filtra criaturas por nombre
- **Diseño responsivo**: Se adapta a diferentes tamaños de pantalla (móvil, tablet, desktop)
- **Estados visuales**: Loading, error, vacío, sin resultados
- **Estilo coherente**: Sigue el diseño del resto de la aplicación con los colores amber/yellow
- **Información detallada**: Muestra stats básicas de cada criatura

## Ubicación

- **Ruta**: `/dashboard/bestiario`
- **Componente**: `frontend/src/scenes/dashboard.bestiario.tsx`
- **Servicio API**: `frontend/src/core/api/backend.service.ts`
- **Acceso**: Desde el sidebar del dashboard, opción "Bestiario" con icono de calavera

## Datos Mostrados

Para cada criatura se muestra:

- Nombre
- Tamaño y tipo (ej: "Large Beast")
- Alineamiento
- Challenge Rating (CR)
- Clase de Armadura (AC)
- Puntos de Golpe (HP)

## Configuración

### Variables de Entorno

Asegúrate de tener configurada la URL del backend en tu archivo `.env`:

**Para desarrollo:**

```env
VITE_BACKEND_URL=http://localhost:3000
```

**Para producción:**

```env
VITE_BACKEND_URL=https://www.beyondthedungeon.org
```

### Backend

El endpoint del backend debe estar funcionando:

```bash
cd backend
npm start
```

Verifica que el endpoint responde:

```bash
curl http://localhost:3000/api/compendium-bestiary
```

## Base de Datos

La página consulta la tabla `compendium_bestiary` en Supabase. Asegúrate de que:

1. La tabla existe (ver [BBDD.md](../BBDD.md))
2. Las políticas RLS permiten lectura pública
3. La tabla tiene datos (usa los scripts de seed en `/scripts`)

### Poblar el Bestiario

Para añadir monstruos a la base de datos:

```bash
cd scripts
npm install
npm run seed
```

Esto cargará los datos de D&D 5e desde los archivos JSON en `scripts/data/`.

## Flujo de Datos

```
Usuario → Frontend → Backend → Supabase → Backend → Frontend → UI
```

1. El usuario accede a `/dashboard/bestiario`
2. El componente llama a `fetchBestiary()` del servicio
3. El servicio hace una petición a `/api/compendium-bestiary`
4. El backend consulta Supabase
5. Los datos se renderizan en tarjetas

## Personalización

### Cambiar el número de resultados

En `backend/src/index.js`, línea 71:

```javascript
.limit(10) // Cambia este número
```

### Añadir más filtros

En `dashboard.bestiario.tsx`, añade más estados y campos de búsqueda:

```typescript
const [typeFilter, setTypeFilter] = useState("");
const [crFilter, setCrFilter] = useState<number | null>(null);

// Luego actualiza filteredMonsters
const filteredMonsters = monsters.filter(
  (monster) =>
    monster.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!typeFilter || monster.type === typeFilter) &&
    (!crFilter || monster.challenge_rating === crFilter),
);
```

### Añadir vista detallada

Puedes crear un modal o página separada para mostrar todos los detalles de una criatura:

1. Crear `dashboard.bestiario-detalle.tsx`
2. Añadir ruta `/dashboard/bestiario/:id`
3. Al hacer clic en una tarjeta, navegar a esa ruta

## Troubleshooting

### "No se pudo cargar el bestiario"

- Verifica que el backend esté corriendo en el puerto 3000
- Comprueba la variable `VITE_BACKEND_URL` en tu `.env`
- Revisa la consola del navegador para más detalles

### "No hay criaturas disponibles"

- La tabla `compendium_bestiary` está vacía
- Ejecuta los scripts de seed: `cd scripts && npm run seed`
- Verifica en Supabase que la tabla tiene datos

### Errores de CORS

Si ves errores de CORS en la consola:

1. Verifica que el backend tenga configurado CORS correctamente
2. En `backend/src/index.js` debe estar: `app.use(cors())`
3. Para desarrollo, CORS debe permitir `http://localhost:5173`

### Backend no responde

Verifica que:

- El backend esté corriendo: `cd backend && npm start`
- El puerto 3000 esté libre
- Las variables de entorno de Supabase estén configuradas en `backend/.env`

## Próximas Mejoras

- [ ] Paginación para grandes cantidades de criaturas
- [ ] Filtros avanzados (por tipo, CR, tamaño)
- [ ] Vista detallada individual
- [ ] Favoritos/marcadores
- [ ] Compartir criaturas entre usuarios
- [ ] Crear criaturas personalizadas
- [ ] Importar/exportar en diferentes formatos
