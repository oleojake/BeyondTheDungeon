require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
);

// Definimos qué archivos buscar en el disco según TU lista
const RESOURCES = [
  // ==================================================================================
  // VERSIÓN 2014 (Legacy)
  // ==================================================================================
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Spells.json', table: 'compendium_spells' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Monsters.json', table: 'compendium_bestiary' },
  
  // Equipo
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Equipment.json', table: 'compendium_items', type: 'Gear' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Magic-Items.json', table: 'compendium_items', type: 'Magic Item' },
  
  // Personaje
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Classes.json', table: 'compendium_classes' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Subclasses.json', table: 'compendium_subclasses' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Races.json', table: 'compendium_races' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Backgrounds.json', table: 'compendium_backgrounds' },
  
  // Mecánicas y Reglas
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Feats.json', table: 'compendium_mechanics', type: 'Feat' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Conditions.json', table: 'compendium_mechanics', type: 'Condition' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Traits.json', table: 'compendium_mechanics', type: 'Racial Trait' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Weapon-Properties.json', table: 'compendium_mechanics', type: 'Weapon Property' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Skills.json', table: 'compendium_mechanics', type: 'Skill' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Proficiencies.json', table: 'compendium_mechanics', type: 'Proficiency' },
  { version: '2014', system: 'dnd5e-2014', file: '5e-SRD-Damage-Types.json', table: 'compendium_mechanics', type: 'Damage Type' },

  // ==================================================================================
  // VERSIÓN 2024 (Revised)
  // ==================================================================================
  // Nota: Mapeamos solo los archivos que tienes disponibles en tu lista
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Backgrounds.json', table: 'compendium_backgrounds' },
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Equipment.json', table: 'compendium_items', type: 'Gear' },
  
  // Mecánicas Nuevas y Actualizadas
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Feats.json', table: 'compendium_mechanics', type: 'Feat' },
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Conditions.json', table: 'compendium_mechanics', type: 'Condition' },
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Skills.json', table: 'compendium_mechanics', type: 'Skill' },
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Weapon-Properties.json', table: 'compendium_mechanics', type: 'Weapon Property' },
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Weapon-Mastery-Properties.json', table: 'compendium_mechanics', type: 'Weapon Mastery' }, // ¡Nueva mecánica!
  { version: '2024', system: 'dnd5e-2024', file: '5e-SRD-Damage-Types.json', table: 'compendium_mechanics', type: 'Damage Type' },
];

const safeStringify = (data) => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
};

async function seedLocal() {
  console.log('🏠 Iniciando Carga LOCAL con nombres de archivo actualizados...');

  for (const res of RESOURCES) {
    // Construimos la ruta exacta: scripts/data/2014/5e-SRD-Spells.json
    const localPath = path.join(__dirname, 'data', res.version, res.file);
    
    try {
      console.log(`\n📂 Buscando: data/${res.version}/${res.file}`);
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️ Archivo no encontrado: ${localPath} (Saltando)`);
        continue;
      }

      const rawData = fs.readFileSync(localPath, 'utf8');
      const jsonData = JSON.parse(rawData);

      console.log(`   ✅ Leído. Procesando ${jsonData.length} registros...`);

      const records = jsonData.map(item => {
        const base = {
          system_id: res.system,
          name: item.name, // A veces viene como 'index' o 'name', asumimos 'name' por el estándar SRD
          is_official: true
        };

        // --- LÓGICA DE MAPEO ---

        if (res.table === 'compendium_spells') {
          return {
            ...base,
            level: item.level,
            school: item.school ? (item.school.name || item.school) : null,
            casting_time: item.casting_time,
            range: item.range,
            components: safeStringify(item.components),
            duration: item.duration,
            description: safeStringify(item.desc || item.description)
          };
        }

        if (res.table === 'compendium_bestiary') {
          return {
            ...base,
            type: item.type,
            cr_level: typeof item.challenge_rating === 'string' ? parseFloat(item.challenge_rating) : (item.challenge_rating || 0),
            image_url: null, // Estos jsons suelen no traer imagen
            stats: item // Guardamos todo el monstruo
          };
        }

        if (res.table === 'compendium_items') {
          return {
            ...base,
            type: res.type === 'Magic Item' ? 'Magic Item' : (item.equipment_category?.name || 'Gear'),
            rarity: item.rarity?.name || 'Common',
            price: item.cost ? `${item.cost.quantity} ${item.cost.unit}` : null,
            weight: item.weight ? item.weight.toString() : '0',
            effects_description: safeStringify(item.desc),
            stats: item
          };
        }

        if (res.table === 'compendium_classes') {
           return { ...base, hit_die: item.hit_die, full_data: item };
        }
        if (res.table === 'compendium_subclasses') {
           return { ...base, parent_class: item.class?.name || 'Unknown', full_data: item };
        }
        if (res.table === 'compendium_races') {
           return { ...base, speed: item.speed, size: item.size, full_data: item };
        }
        if (res.table === 'compendium_backgrounds') {
           return { ...base, full_data: item };
        }
        
        // MECÁNICAS (Skills, Feats, Conditions, Weapon Mastery...)
        if (res.table === 'compendium_mechanics') {
           return { 
             ...base, 
             type: res.type, 
             description: safeStringify(item.desc || item.description) 
           };
        }

        return null;
      }).filter(Boolean);

      // INSERTAR EN SUPABASE
      const BATCH_SIZE = 100;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(res.table).insert(batch);
        
        if (error && !error.message.includes('duplicate key')) {
           console.error(`   ❌ Error subiendo lote: ${error.message}`);
        }
      }
      console.log(`   💾 ¡Guardado!`);

    } catch (err) {
      console.error(`   💀 Error procesando archivo: ${err.message}`);
    }
  }

  console.log('\n🏁 CARGA LOCAL TERMINADA.');
}

seedLocal();