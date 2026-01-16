/**
 * Servicio para interactuar con el backend API
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export interface Monster {
  id: string;
  name: string;
  size?: string;
  type?: string;
  alignment?: string;
  challenge_rating?: number;
  armor_class?: number;
  hit_points?: number;
  stats?: any;
  created_at?: string;
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
