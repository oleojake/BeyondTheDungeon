// ================================================
// Campaign Invitation Service
// ================================================
// API service for campaign invitation management
// ================================================

import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "";

// ================================================
// INTERFACES
// ================================================

export interface CampaignInvitation {
	id: string;
	campaign_id: string;
	invited_by: string;
	invited_user_id?: string;
	email: string;
	status: "pending" | "accepted" | "rejected";
	token: string;
	created_at: string;
	expires_at: string;
	campaigns?: {
		title: string;
	};
}

export interface CreateInvitationRequest {
	username: string;
}

// ================================================
// INVITATION API FUNCTIONS
// ================================================

/**
 * List user's pending invitations
 */
export async function listUserInvitations(): Promise<CampaignInvitation[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(`${API_URL}/api/campaign-invitations`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al obtener invitaciones");
	}

	const data = await response.json();
	return data.invitations;
}

/**
 * Create invitation for a campaign
 */
export async function createInvitation(
	campaignId: string,
	request: CreateInvitationRequest
): Promise<CampaignInvitation> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/invitations`,
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
		throw new Error(error.error || "Error al crear invitación");
	}

	const data = await response.json();
	return data.invitation;
}

/**
 * Accept invitation
 */
export async function acceptInvitation(token: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaign-invitations/${token}/accept`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al aceptar invitación");
	}
}

/**
 * Reject invitation
 */
export async function rejectInvitation(token: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaign-invitations/${token}/reject`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al rechazar invitación");
	}
}

/**
 * Delete invitation (DM only)
 */
export async function deleteInvitation(invitationId: string): Promise<void> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("No autenticado");
	}

	const response = await fetch(
		`${API_URL}/api/campaign-invitations/${invitationId}`,
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
		throw new Error(error.error || "Error al eliminar invitación");
	}
}
