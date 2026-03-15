// ================================================
// Scene Service
// ================================================
// API service for scene management
// ================================================

import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "";

// ================================================
// INTERFACES
// ================================================

export interface Scene {
	id: string;
	chapter_id: string;
	title: string;
	content?: string;
	narration_text?: string;
	dm_notes?: string;
	battle_map_id?: string | null;
	order_index: number;
	created_at: string;
	updated_at: string;
}

export interface CreateSceneRequest {
	title: string;
	content?: string;
	narration_text?: string;
	dm_notes?: string;
	battle_map_id?: string | null;
	order_index?: number;
}

export interface UpdateSceneRequest {
	title?: string;
	content?: string;
	narration_text?: string;
	dm_notes?: string;
	battle_map_id?: string | null;
	order_index?: number;
}

// ================================================
// SCENE API FUNCTIONS
// ================================================

/**
 * List all scenes for a chapter
 */
export async function listScenes(chapterId: string): Promise<Scene[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/chapters/${chapterId}/scenes`,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener escenas");
	}

	const data = await response.json();
	return data.scenes;
}

/**
 * Create new scene
 */
export async function createScene(
	chapterId: string,
	request: CreateSceneRequest
): Promise<Scene> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/chapters/${chapterId}/scenes`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al crear escena");
	}

	const data = await response.json();
	return data.scene;
}

/**
 * Update scene
 */
export async function updateScene(
	id: string,
	request: UpdateSceneRequest
): Promise<Scene> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/scenes/${id}`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al actualizar escena");
	}

	const data = await response.json();
	return data.scene;
}

/**
 * Delete scene
 */
export async function deleteScene(id: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/scenes/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al eliminar escena");
	}
}
