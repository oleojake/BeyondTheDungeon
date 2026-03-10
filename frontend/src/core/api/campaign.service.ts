// ================================================
// Campaign Service
// ================================================
// API service for campaign management
// ================================================

import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ================================================
// INTERFACES
// ================================================

export interface Campaign {
	id: string;
	dm_id: string;
	title: string;
	description?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface CampaignMember {
	id: string;
	campaign_id: string;
	user_id: string;
	role: "dm" | "player";
	joined_at: string;
	email?: string;
}

export interface CreateCampaignRequest {
	title: string;
	description?: string;
	notes?: string;
}

export interface UpdateCampaignRequest {
	title?: string;
	description?: string;
	notes?: string;
}

// ================================================
// CAMPAIGN API FUNCTIONS
// ================================================

/**
 * List all campaigns where user is DM or member
 */
export async function listCampaigns(): Promise<Campaign[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/campaigns`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener campañas");
	}

	const data = await response.json();
	return data.campaigns;
}

/**
 * Get specific campaign by ID
 */
export async function getCampaign(id: string): Promise<Campaign> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener campaña");
	}

	const data = await response.json();
	return data.campaign;
}

/**
 * Create new campaign
 */
export async function createCampaign(
	request: CreateCampaignRequest
): Promise<Campaign> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	console.log("Creating campaign with URL:", `${API_URL}/api/campaigns`);
	console.log("Request data:", request);

	const response = await fetch(`${API_URL}/api/campaigns`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		console.error("Error del backend:", error);
		const errorMsg = error.details
			? `${error.error}: ${error.details}`
			: error.error || "Error al crear campaña";
		throw new Error(errorMsg);
	}

	const data = await response.json();
	return data.campaign;
}

/**
 * Update campaign
 */
export async function updateCampaign(
	id: string,
	request: UpdateCampaignRequest
): Promise<Campaign> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al actualizar campaña");
	}

	const data = await response.json();
	return data.campaign;
}

/**
 * Delete campaign
 */
export async function deleteCampaign(id: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al eliminar campaña");
	}
}

/**
 * Transfer DM role to another user
 */
export async function transferDM(
	campaignId: string,
	newDmId: string
): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/transfer-dm`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ new_dm_id: newDmId }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al transferir DM");
	}
}

// ================================================
// CAMPAIGN MEMBERS API FUNCTIONS
// ================================================

/**
 * List campaign members
 */
export async function listCampaignMembers(
	campaignId: string
): Promise<CampaignMember[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/members`,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener miembros");
	}

	const data = await response.json();
	return data.members;
}

/**
 * Remove member from campaign
 */
export async function removeCampaignMember(
	campaignId: string,
	userId: string
): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/members/${userId}`,
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al eliminar miembro");
	}
}
