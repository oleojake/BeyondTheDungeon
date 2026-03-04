/**
 * Servicio para interactuar con la API de fichas de personaje
 */

import { supabase } from "@/lib/supabase";
import type { Character, CharacterFormData } from "@/interfaces/character";

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

/**
 * Obtiene la ficha del usuario autenticado
 */
export async function fetchCharacterSheet(): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  const response = await fetch(`${BACKEND_URL}/api/character-sheet`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || `Error ${response.status}`);
  }
  
  return response.json();
}

/**
 * Crea una nueva ficha de personaje
 */
export async function createCharacterSheet(data: CharacterFormData): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  const response = await fetch(`${BACKEND_URL}/api/character-sheet`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || `Error ${response.status}`);
  }
  
  return response.json();
}

/**
 * Actualiza la ficha de personaje existente
 */
export async function updateCharacterSheet(id: string, data: CharacterFormData): Promise<CharacterSheetResponse> {
  const token = await getAuthToken();
  
  const response = await fetch(`${BACKEND_URL}/api/character-sheet/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || `Error ${response.status}`);
  }
  
  return response.json();
}
