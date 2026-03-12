/**
 * Servicio para interactuar con la API de mapas de batalla
 */

import { supabase } from "@/lib/supabase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Obtiene el token de sesión del usuario autenticado
 */
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("No estás autenticado. Por favor inicia sesión.");
  }
  
  return session.access_token;
}

export interface BattleMap {
  id: string;
  user_id: string;
  name: string;
  image_data: string;
  grid_size: number;
  grid_color: string;
  created_at: string;
  updated_at: string;
}

export interface BattleMapListItem {
  id: string;
  name: string;
  grid_size: number;
  created_at: string;
  updated_at: string;
}

export interface BattleMapListResponse {
  maps: BattleMapListItem[];
}

export interface BattleMapResponse {
  map: BattleMap;
}

export interface CreateBattleMapRequest {
  name: string;
  image_data: string;
  grid_size: number;
  grid_color: string;
}

export interface UpdateBattleMapRequest {
  name: string;
  grid_size: number;
  grid_color: string;
}

/**
 * Obtiene la lista de todos los mapas del usuario autenticado
 */
export async function listBattleMaps(): Promise<BattleMapListResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/battle-maps`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`El servidor backend no respondió correctamente. ¿Está arrancado en ${BACKEND_URL}?`);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || `Error ${response.status}`);
    }
    
    return response.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con el backend en ${BACKEND_URL}. ¿Está el servidor arrancado?`);
    }
    throw err;
  }
}

/**
 * Obtiene un mapa específico por ID
 */
export async function getBattleMap(id: string): Promise<BattleMapResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/battle-maps/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`El servidor backend no respondió correctamente. ¿Está arrancado en ${BACKEND_URL}?`);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || `Error ${response.status}`);
    }
    
    return response.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con el backend en ${BACKEND_URL}. ¿Está el servidor arrancado?`);
    }
    throw err;
  }
}

/**
 * Crea un nuevo mapa de batalla
 */
export async function createBattleMap(mapData: CreateBattleMapRequest): Promise<BattleMapResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/battle-maps`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapData),
    });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`El servidor backend no respondió correctamente. ¿Está arrancado en ${BACKEND_URL}?`);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || `Error ${response.status}`);
    }
    
    return response.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con el backend en ${BACKEND_URL}. ¿Está el servidor arrancado?`);
    }
    throw err;
  }
}

/**
 * Actualiza un mapa de batalla existente
 */
export async function updateBattleMap(id: string, mapData: UpdateBattleMapRequest): Promise<BattleMapResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/battle-maps/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapData),
    });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`El servidor backend no respondió correctamente. ¿Está arrancado en ${BACKEND_URL}?`);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || `Error ${response.status}`);
    }
    
    return response.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con el backend en ${BACKEND_URL}. ¿Está el servidor arrancado?`);
    }
    throw err;
  }
}

/**
 * Elimina un mapa de batalla
 */
export async function deleteBattleMap(id: string): Promise<void> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/battle-maps/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`El servidor backend no respondió correctamente. ¿Está arrancado en ${BACKEND_URL}?`);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || `Error ${response.status}`);
    }
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con el backend en ${BACKEND_URL}. ¿Está el servidor arrancado?`);
    }
    throw err;
  }
}
