// ================================================
// Chapter Service
// ================================================
// API service for chapter management
// ================================================

import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "";

// ================================================
// INTERFACES
// ================================================

export interface Chapter {
	id: string;
	campaign_id: string;
	title: string;
	content?: string;
	order_index: number;
	created_at: string;
	updated_at: string;
}

export interface CreateChapterRequest {
	title: string;
	content?: string;
	order_index?: number;
}

export interface UpdateChapterRequest {
	title?: string;
	content?: string;
	order_index?: number;
}

// ================================================
// CHAPTER API FUNCTIONS
// ================================================

/**
 * List all chapters for a campaign
 */
export async function listChapters(campaignId: string): Promise<Chapter[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/chapters`,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener capítulos");
	}

	const data = await response.json();
	return data.chapters;
}

/**
 * Obtiene todos los capítulos con sus escenas y entidades en una sola request.
 * Evita el N+1 de llamar a listChapters + listScenes + listSceneEntities por separado.
 */
export async function listChaptersFull(campaignId: string): Promise<
	Array<Chapter & {
		scenes: Array<{
			id: string;
			chapter_id: string;
			title: string;
			content?: string;
			narration_text?: string;
			dm_notes?: string;
			battle_map_id?: string | null;
			order_index: number;
			entities: Array<{
				id: string;
				scene_id: string;
				entity_type: string;
				entity_id: string;
				entity_name: string;
				entity_data: Record<string, unknown> | null;
			}>;
		}>;
	}>
> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) throw new Error("No autenticado");

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/chapters-full`,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener capítulos completos");
	}

	const data = await response.json();
	return data.chapters;
}

/**
 * Create new chapter
 */
export async function createChapter(
	campaignId: string,
	request: CreateChapterRequest
): Promise<Chapter> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/chapters`,
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
		throw new Error(error.error || "Error al crear capítulo");
	}

	const data = await response.json();
	return data.chapter;
}

/**
 * Update chapter
 */
export async function updateChapter(
	id: string,
	request: UpdateChapterRequest
): Promise<Chapter> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/chapters/${id}`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al actualizar capítulo");
	}

	const data = await response.json();
	return data.chapter;
}

/**
 * Delete chapter
 */
export async function deleteChapter(id: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/chapters/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al eliminar capítulo");
	}
}
