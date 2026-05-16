/**
 * Servicio para interactuar con la API de fichas de personaje
 */

import { supabase } from "@/lib/supabase";
import type { Character, CharacterFormData, CharacterClass } from "@/interfaces/character";

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

export interface CharacterSheetResponse {
  character: Character | null;
}

export interface CharacterSheetListItem {
  id: string;
  user_id?: string;
  campaign_id?: string | null;
  name: string;
  classes: CharacterClass | CharacterClass[];
  race: string;
  level: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterSheetListResponse {
  characters: CharacterSheetListItem[];
}

/**
 * Obtiene la ficha del usuario autenticado
 */
export async function fetchCharacterSheet(): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/character-sheet`, {
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
 * Obtiene una ficha específica por ID
 */
export async function fetchCharacterSheetById(id: string): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/character-sheet/${id}`, {
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
 * Crea una nueva ficha de personaje
 */
export async function createCharacterSheet(data: CharacterFormData): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/character-sheet`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
 * Actualiza la ficha de personaje existente
 */
export async function updateCharacterSheet(id: string, data: CharacterFormData): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/character-sheet/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
 * Sube una imagen de avatar para un personaje a Supabase Storage
 * y devuelve la URL pública.
 */
export async function uploadCharacterAvatar(
  userId: string,
  characterId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${characterId}.${ext}`;

  const { error } = await supabase.storage
    .from("character-avatars")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Error al subir la imagen: ${error.message}`);

  const { data } = supabase.storage
    .from("character-avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Obtiene la lista de todas las fichas del usuario autenticado
 */
export async function listCharacterSheets(): Promise<CharacterSheetListResponse> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/character-sheets`, {
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
 * Elimina una ficha de personaje
 */
export async function deleteCharacterSheet(id: string): Promise<void> {
  const token = await getAuthToken();
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/character-sheet/${id}`, {
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
