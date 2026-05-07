// ================================================
// Scene Entity Service
// ================================================
// API service for scene entity management
// ================================================

import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "";

// ================================================
// INTERFACES
// ================================================

export interface SceneEntity {
	id: string;
	scene_id: string;
	entity_type: "monster" | "item" | "spell" | "npc" | "map";
	entity_id: string;
	entity_name: string;
	entity_data?: Record<string, any>;
	created_at: string;
}

export interface CreateSceneEntityRequest {
	entity_type: "monster" | "item" | "spell" | "npc" | "map";
	entity_id: string;
	entity_name: string;
	entity_data?: Record<string, any>;
}

// ================================================
// SCENE ENTITY API FUNCTIONS
// ================================================

/**
 * List all entities for a scene
 */
export async function listSceneEntities(sceneId: string): Promise<SceneEntity[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/scenes/${sceneId}/entities`,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener entidades");
	}

	const data = await response.json();
	return data.entities;
}

/**
 * Add entity to scene
 */
export async function createSceneEntity(
	sceneId: string,
	request: CreateSceneEntityRequest
): Promise<SceneEntity> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/scenes/${sceneId}/entities`,
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
		const msg = error.details
			? `${error.error}: ${error.details}`
			: error.error || "Error al añadir entidad";
		throw new Error(msg);
	}

	const data = await response.json();
	return data.entity;
}

/**
 * Delete scene entity
 */
export async function deleteSceneEntity(id: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/scene-entities/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al eliminar entidad");
	}
}
