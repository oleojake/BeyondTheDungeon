# Página de Hechizos (Spells)

## Descripción

La página de hechizos permite consultar el grimorio completo de hechizos y encantamientos almacenados en la base de datos. Utiliza los endpoints `/api/compendium-spells` y `/api/compendium-spells/:id` del backend para obtener los datos.

## Características

- **Búsqueda en tiempo real**: Filtra hechizos por nombre
- **Filtro por nivel**: Trucos (0) y niveles 1-9
- **Vista de lista y detalle**: Cards clickables que llevan a página de detalle
- **Diseño responsivo**: Se adapta a diferentes tamaños de pantalla
- **Estados visuales**: Loading, error, vacío, sin resultados
- **Indicadores especiales**: Badges para concentración y ritual
- **Estilo coherente**: Sigue el diseño del resto de la aplicación con los colores amber/yellow

## Ubicación

### Lista de Hechizos

- **Ruta**: `/dashboard/hechizos`
- **Componente**: `frontend/src/scenes/dashboard.hechizos.tsx`
- **Acceso**: Desde el sidebar del dashboard, opción "Hechizos" con icono de chispas

### Detalle de Hechizo

- **Ruta**: `/dashboard/hechizos/:id`
- **Componente**: `frontend/src/scenes/dashboard.hechizos-detalle.tsx`
- **Acceso**: Haciendo clic en cualquier card de hechizo

## Datos Mostrados

### En la Lista

Para cada hechizo se muestra:

- **Nombre** y **Nivel** (badge con color según nivel)
- **Escuela de Magia** (badge con color según escuela)
- **Indicadores especiales**:
  - Badge morado si requiere Concentración
  - Badge cyan si es Ritual
- **Información básica**:
  - Tiempo de lanzamiento
  - Alcance
  - Componentes (V, S, M)
  - Duración

### En la Página de Detalle

Información completa del hechizo:

1. **Cabecera**:

   - Nombre con icono de chispas
   - Nivel (Truco o Nivel 1-9)
   - Escuela de magia
   - Indicadores de concentración/ritual

2. **Información Básica**:

   - Tiempo de lanzamiento
   - Alcance
   - Componentes (con descripción de materiales si aplica)
   - Duración

3. **Descripción Completa**:

   - Texto completo del hechizo (múltiples párrafos)

4. **A Niveles Superiores** (si aplica):

   - Cómo escala el hechizo en slots superiores

5. **Daño/Curación** (si aplica):

   - Tipo de daño
   - Dados de daño por nivel de slot
   - Grid comparativo

6. **Área de Efecto** (si aplica):

   - Forma (esfera, cubo, cono, etc.)
   - Tamaño en pies

7. **Clases Disponibles**:

   - Lista de clases que pueden lanzar el hechizo

8. **Navegación**:
   - Botón "Volver a Hechizos" en la parte superior

## Niveles y Colores

El sistema usa códigos de color para los niveles de hechizo:

- **Nivel 0 (Trucos)**: Gris
- **Nivel 1**: Azul
- **Nivel 2**: Verde
- **Nivel 3**: Amarillo
- **Nivel 4**: Naranja
- **Nivel 5**: Rojo
- **Nivel 6**: Morado
- **Nivel 7**: Rosa
- **Nivel 8**: Índigo
- **Nivel 9**: Violeta

## Escuelas de Magia y Colores

- **Abjuration** (Abjuración): Azul
- **Conjuration** (Conjuración): Morado
- **Divination** (Adivinación): Cyan
- **Enchantment** (Encantamiento): Rosa
- **Evocation** (Evocación): Rojo
- **Illusion** (Ilusión): Violeta
- **Necromancy** (Nigromancia): Gris
- **Transmutation** (Transmutación): Verde

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

### Endpoints del Backend

El componente consume los siguientes endpoints:

#### Lista de Hechizos

```
GET /api/compendium-spells
```

**Respuesta:**

```json
{
  "spells": [
    {
      "id": "uuid",
      "name": "Fireball",
      "level": 3,
      "school": { "name": "Evocation" },
      "casting_time": "1 action",
      "range": "150 feet",
      "components": ["V", "S", "M"],
      "material": "A tiny ball of bat guano and sulfur",
      "duration": "Instantaneous",
      "concentration": false,
      "ritual": false,
      "desc": ["A bright streak flashes..."],
      "stats": {
        /* datos adicionales */
      }
    }
  ],
  "count": 319
}
```

#### Detalle de Hechizo

```
GET /api/compendium-spells/:id
```

**Respuesta:** Objeto individual con todos los campos del hechizo.

## Estructura de Datos

Los hechizos se almacenan en la tabla `compendium_spells` con un campo `stats` JSON que contiene:

- **level**: Número de 0 (truco) a 9
- **school**: Objeto con nombre de la escuela
- **casting_time**: Tiempo de lanzamiento
- **range**: Alcance del hechizo
- **components**: Array de componentes (V, S, M)
- **material**: Descripción de materiales (si tiene componente M)
- **duration**: Duración del efecto
- **concentration**: Boolean, si requiere concentración
- **ritual**: Boolean, si puede lanzarse como ritual
- **desc**: Array de párrafos de descripción
- **higher_level**: Array de texto para escalado
- **damage**: Objeto con tipo y dados por nivel
- **heal_at_slot_level**: Objeto con curación por nivel
- **area_of_effect**: Objeto con tipo y tamaño
- **classes**: Array de clases que pueden lanzarlo

## Troubleshooting

### No se cargan los hechizos

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Comprueba la consola del navegador para errores de CORS
3. Verifica que la tabla `compendium_spells` existe en Supabase
4. Comprueba los permisos RLS de la tabla

### Error al hacer clic en un hechizo

1. Verifica que la ruta `/dashboard/hechizos/:id` esté configurada en el router
2. Comprueba que el componente `DashboardHechizosDetalle` esté importado
3. Verifica que el endpoint `/api/compendium-spells/:id` funcione

### Los filtros no funcionan

1. Verifica que los datos tengan el campo `level` como número
2. Comprueba que el campo `school` sea un objeto con propiedad `name` o un string

### Errores de renderizado

Si ves errores de "components.join is not a function":

- El componente incluye verificación de tipo para `components`
- Maneja casos donde `components` es array, string u otro tipo
- Convierte a string seguro antes de renderizar

## Mejoras Futuras

- Filtro por escuela de magia
- Filtro por clase
- Ordenación por nivel o nombre
- Búsqueda por componentes
- Comparación de hechizos
- Favoritos de usuario
- Filtro por tipo de daño
