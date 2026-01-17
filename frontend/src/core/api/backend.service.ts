/**
 * Servicio para interactuar con el backend API
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export interface Monster {
  id: string;
  name: string;
  size?: string;
  type?: string;
  subtype?: string;
  alignment?: string;
  challenge_rating?: number;
  armor_class?: number | any[];
  hit_points?: number;
  hit_dice?: string;
  hit_points_roll?: string;
  speed?: any;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  proficiencies?: any[];
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: any[];
  senses?: any;
  languages?: string;
  proficiency_bonus?: number;
  xp?: number;
  special_abilities?: any[];
  actions?: any[];
  legendary_actions?: any[];
  reactions?: any[];
  desc?: string;
  image?: string;
  image_url?: string;
  stats?: any;
  created_at?: string;
  cr_level?: number;
}

export interface BestiaryResponse {
  characters: Monster[];
  count: number;
}

/**
 * Obtiene el listado de monstruos del bestiario
 */
export async function fetchBestiary(): Promise<BestiaryResponse> {
  const response = await fetch(`${BACKEND_URL}/api/compendium-bestiary`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Obtiene un monstruo específico por ID
 */
export async function fetchMonsterById(id: string): Promise<Monster> {
  const response = await fetch(`${BACKEND_URL}/api/compendium-bestiary/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// ============================================
// ITEMS / EQUIPMENT
// ============================================

export interface Item {
  id: string;
  name: string;
  equipment_category?: any;
  weapon_category?: string;
  weapon_range?: string;
  armor_category?: string;
  armor_class?: any;
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  cost?: any;
  weight?: number;
  damage?: any;
  two_handed_damage?: any;
  range?: any;
  throw_range?: any;
  properties?: any[];
  desc?: string[];
  stats?: any;
  created_at?: string;
}

export interface ItemsResponse {
  items: Item[];
  count: number;
}

/**
 * Obtiene el listado de objetos/items
 */
export async function fetchItems(): Promise<ItemsResponse> {
  const response = await fetch(`${BACKEND_URL}/api/compendium-items`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// ============================================
// SPELLS
// ============================================

export interface Spell {
  id: string;
  name: string;
  level: number;
  school?: any;
  casting_time?: string;
  range?: string;
  components?: string[];
  material?: string;
  duration?: string;
  concentration?: boolean;
  ritual?: boolean;
  desc?: string[];
  higher_level?: string[];
  damage?: any;
  dc?: any;
  heal_at_slot_level?: any;
  area_of_effect?: any;
  classes?: any[];
  subclasses?: any[];
  attack_type?: string;
  stats?: any;
  created_at?: string;
}

export interface SpellsResponse {
  spells: Spell[];
  count: number;
}

/**
 * Obtiene el listado de hechizos
 */
export async function fetchSpells(): Promise<SpellsResponse> {
  const response = await fetch(`${BACKEND_URL}/api/compendium-spells`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Obtiene un hechizo específico por ID
 */
export async function fetchSpellById(id: string): Promise<Spell> {
  const response = await fetch(`${BACKEND_URL}/api/compendium-spells/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Verifica el estado de la conexión con Supabase
 */
export async function checkSupabaseStatus() {
  const response = await fetch(`${BACKEND_URL}/api/supabase-status`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Ping al backend para verificar conectividad
 */
export async function pingBackend() {
  const response = await fetch(`${BACKEND_URL}/api/ping`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
