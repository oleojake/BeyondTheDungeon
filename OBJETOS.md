# Página de Objetos (Items)

## Descripción

La página de objetos permite consultar el compendio completo de equipo, armas, armaduras y herramientas almacenados en la base de datos. Utiliza el endpoint `/api/compendium-items` del backend para obtener los datos.

## Características

- **Búsqueda en tiempo real**: Filtra objetos por nombre
- **Filtro por categoría**: 13 categorías disponibles (Armas, Armaduras, Equipo, Herramientas, Pociones, etc.)
- **Diseño responsivo**: Se adapta a diferentes tamaños de pantalla
- **Estados visuales**: Loading, error, vacío, sin resultados
- **Información completa en cards**: No requiere vista de detalle
- **Estilo coherente**: Sigue el diseño del resto de la aplicación con los colores amber/yellow

## Ubicación

- **Ruta**: `/dashboard/objetos`
- **Componente**: `frontend/src/scenes/dashboard.objetos.tsx`
- **Servicio API**: `frontend/src/core/api/backend.service.ts`
- **Acceso**: Desde el sidebar del dashboard, opción "Objetos" con icono de paquete

## Datos Mostrados

Para cada objeto se muestra:

- **Nombre** y **Categoría** (con badge de color)
- **Coste** (en gp, sp, cp, pp)
- **Peso** (en libras)
- **Stats de Armas** (si aplica):
  - Daño (dados y tipo)
  - Daño a dos manos (para armas versátiles)
  - Alcance (normal/largo)
- **Stats de Armaduras** (si aplica):
  - Clase de Armadura (CA)
  - Fuerza mínima requerida
- **Propiedades**: Ligera, Finesse, Dos manos, etc.
- **Descripción**: Vista previa del primer párrafo

## Categorías Disponibles

El filtro de categorías incluye:

1. **Armas** (Weapons) - Badge rojo
2. **Armaduras** (Armor) - Badge azul
3. **Equipo** (Adventuring Gear)
4. **Herramientas** (Tools) - Badge amarillo
5. **Pociones** (Potions) - Badge morado
6. **Objetos Maravillosos** (Wondrous Items)
7. **Anillos** (Rings)
8. **Varas** (Rods)
9. **Bastones** (Staffs)
10. **Varitas** (Wands)
11. **Pergaminos** (Scrolls)
12. **Munición** (Ammunition)
13. **Monturas y Vehículos** (Mounts and Vehicles)

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

### Endpoint del Backend

El componente consume el siguiente endpoint:

```
GET /api/compendium-items
```

**Respuesta:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Longsword",
      "equipment_category": { "name": "Weapon" },
      "cost": { "quantity": 15, "unit": "gp" },
      "weight": 3,
      "damage": {
        "damage_dice": "1d8",
        "damage_type": { "name": "Slashing" }
      },
      "properties": [{ "name": "Versatile" }],
      "stats": {
        /* datos adicionales */
      }
    }
  ],
  "count": 778
}
```

## Estructura de Datos

Los objetos se almacenan en la tabla `compendium_items` con un campo `stats` JSON que contiene:

- **equipment_category**: Categoría del equipo
- **cost**: Objeto con `quantity` y `unit` (cp, sp, gp, pp)
- **weight**: Peso en libras
- **damage**: Para armas (dados, tipo de daño)
- **armor_class**: Para armaduras
- **properties**: Array de propiedades especiales
- **desc**: Array de párrafos de descripción

## Troubleshooting

### No se cargan los objetos

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Comprueba la consola del navegador para errores de CORS
3. Verifica que la tabla `compendium_items` existe en Supabase
4. Comprueba los permisos RLS de la tabla

### Los filtros no funcionan

1. Verifica que los datos tengan el campo `equipment_category`
2. Comprueba que el campo sea un objeto con propiedad `name` o un string

### Errores de renderizado

Si ves errores de "Objects are not valid as a React child":

- El componente incluye helpers de formateo seguro para `cost`, `armor_class` y `range`
- Estos helpers convierten objetos complejos a strings antes de renderizar

## Mejoras Futuras

- Ordenación por coste, peso o nombre
- Filtros combinados (categoría + propiedades)
- Búsqueda avanzada por tipo de daño
- Vista de comparación de objetos
- Favoritos de usuario
