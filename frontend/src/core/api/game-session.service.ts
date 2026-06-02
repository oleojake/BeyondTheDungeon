// ================================================
// Game Session Service
// ================================================
// API calls + Supabase Realtime helpers for online VTT sessions
// ================================================

import { supabase } from "@/lib/supabase";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionState {
	mapPanX: number;
	mapPanY: number;
	mapZoom: number;
	mapGridSize: number;
	mapGridColor: string;
	mapShowGrid: boolean;
}

export interface GameSession {
	id: string;
	campaign_id: string;
	dm_id: string;
	status: "active" | "paused" | "ended";
	session_number: number;
	current_scene_id: string | null;
	current_map_id: string | null;
	session_state: SessionState;
	started_at: string;
	ended_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface SessionToken {
	id: string;
	session_id: string;
	token_type: "player" | "enemy" | "npc";
	character_id: string | null;
	user_id: string | null;
	entity_ref_id: string | null;
	entity_name: string;
	entity_image: string | null;
	x: number;
	y: number;
	current_hp: number;
	max_hp: number;
	initiative_value: number;
	is_on_map: boolean;
	token_color: string | null;
	token_size: "S" | "M" | "L" | "XL" | null;
	created_at: string;
	updated_at: string;
}

export interface CombatState {
	id: string;
	session_id: string;
	is_active: boolean;
	current_turn_index: number;
	round_number: number;
	initiative_order: string[]; // array of token IDs
	surprise: "none" | "heroes" | "enemies";
}

export interface SessionMember {
	user_id: string;
	role: string;
	profile: {
		id: string;
		display_name: string | null;
		username: string | null;
		avatar_url: string | null;
		email: string | null;
	} | null;
	character: {
		id: string;
		user_id: string;
		name: string;
		avatar_url: string | null;
		stats: Record<string, unknown>;
		classes: Array<{ name: string; level: number }>;
		race: string;
		inventory: string;
		spells_known: string;
		equipment: string;
		notes: string;
		experience_points: number;
	} | null;
}

// ─── Helper: bearer token ────────────────────────────────────────────────────

async function getAuthHeaders() {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${session?.access_token ?? ""}`,
	};
}

// ─── Session endpoints ────────────────────────────────────────────────────────

/** Devuelve la sesión activa o pausada de la campaña, o null si no existe. */
export async function getCampaignSession(
	campaignId: string
): Promise<GameSession | null> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/session`, {
		headers,
	});
	// 404 means the route or session doesn't exist yet — not an error
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("Error al obtener la sesión");
	const data = await res.json();
	return data.session;
}

/**
 * Devuelve el estado de sesión de múltiples campañas en una sola request.
 * Mucho más eficiente que llamar a getCampaignSession una vez por campaña.
 */
export async function getSessionsBulk(
	campaignIds: string[]
): Promise<Record<string, GameSession | null>> {
	if (campaignIds.length === 0) return {};
	const headers = await getAuthHeaders();
	const ids = campaignIds.join(",");
	const res = await fetch(`${API_URL}/api/campaigns/sessions/bulk?ids=${encodeURIComponent(ids)}`, {
		headers,
	});
	if (!res.ok) return Object.fromEntries(campaignIds.map((id) => [id, null]));
	const data = await res.json();
	return data.sessions;
}

/** El DM inicia o reanuda la sesión. */
export async function startSession(campaignId: string): Promise<GameSession> {
	const headers = await getAuthHeaders();
	const url = `${API_URL}/api/campaigns/${campaignId}/session/start`;
	const res = await fetch(url, { method: "POST", headers });
	const text = await res.text();
	if (!res.ok) {
		let errorMsg = `Error ${res.status} al iniciar la sesión`;
		try {
			const data = JSON.parse(text);
			errorMsg = data.error || data.message || errorMsg;
		} catch {
			if (text) errorMsg = text.slice(0, 200);
		}
		throw new Error(errorMsg);
	}
	const data = JSON.parse(text);
	return data.session;
}

/** Guarda estado parcial de la sesión (mapa, escena, etc.) */
export async function updateSessionState(
	sessionId: string,
	updates: {
		session_state?: Partial<SessionState>;
		current_scene_id?: string | null;
		current_map_id?: string | null;
	}
): Promise<GameSession> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/sessions/${sessionId}/state`, {
		method: "PUT",
		headers,
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error("Error al guardar el estado");
	const data = await res.json();
	return data.session;
}

/** El DM termina la sesión (status pasa a 'paused' para poder reanudarla). */
export async function endSession(
	sessionId: string,
	state: {
		session_state?: Partial<SessionState>;
		current_scene_id?: string | null;
		current_map_id?: string | null;
	}
): Promise<GameSession> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/sessions/${sessionId}/end`, {
		method: "PUT",
		headers,
		body: JSON.stringify(state),
	});
	if (!res.ok) throw new Error("Error al terminar la sesión");
	const data = await res.json();
	return data.session;
}

// ─── Tokens ──────────────────────────────────────────────────────────────────

export async function listTokens(sessionId: string): Promise<SessionToken[]> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/sessions/${sessionId}/tokens`, {
		headers,
	});
	if (!res.ok) throw new Error("Error al obtener tokens");
	const data = await res.json();
	return data.tokens;
}

export async function createToken(
	sessionId: string,
	token: Omit<
		SessionToken,
		"id" | "session_id" | "created_at" | "updated_at"
	>
): Promise<SessionToken> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/sessions/${sessionId}/tokens`, {
		method: "POST",
		headers,
		body: JSON.stringify(token),
	});
	if (!res.ok) throw new Error("Error al crear token");
	const data = await res.json();
	return data.token;
}

export async function updateToken(
	sessionId: string,
	tokenId: string,
	updates: Partial<
		Omit<SessionToken, "id" | "session_id" | "created_at">
	>
): Promise<SessionToken> {
	const headers = await getAuthHeaders();
	const res = await fetch(
		`${API_URL}/api/sessions/${sessionId}/tokens/${tokenId}`,
		{ method: "PUT", headers, body: JSON.stringify(updates) }
	);
	if (!res.ok) throw new Error("Error al actualizar token");
	const data = await res.json();
	return data.token;
}

export async function deleteToken(
	sessionId: string,
	tokenId: string
): Promise<void> {
	const headers = await getAuthHeaders();
	const res = await fetch(
		`${API_URL}/api/sessions/${sessionId}/tokens/${tokenId}`,
		{ method: "DELETE", headers }
	);
	if (!res.ok) throw new Error("Error al eliminar token");
}

// ─── Combat ──────────────────────────────────────────────────────────────────

export async function getCombatState(
	sessionId: string
): Promise<CombatState | null> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/sessions/${sessionId}/combat`, {
		headers,
	});
	if (!res.ok) throw new Error("Error al obtener combate");
	const data = await res.json();
	return data.combat;
}

export async function updateCombatState(
	sessionId: string,
	updates: Partial<Omit<CombatState, "id" | "session_id" | "created_at">>
): Promise<CombatState> {
	const headers = await getAuthHeaders();
	const res = await fetch(`${API_URL}/api/sessions/${sessionId}/combat`, {
		method: "PUT",
		headers,
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error("Error al actualizar combate");
	const data = await res.json();
	return data.combat;
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function getCampaignMembersWithCharacters(
	campaignId: string
): Promise<SessionMember[]> {
	const headers = await getAuthHeaders();
	const res = await fetch(
		`${API_URL}/api/campaigns/${campaignId}/members-with-characters`,
		{ headers }
	);
	if (!res.ok) throw new Error("Error al obtener miembros");
	const data = await res.json();
	return data.members;
}

// ─── Supabase Realtime ───────────────────────────────────────────────────────

/**
 * Suscribe a cambios en session_tokens para una sesión.
 * Llama a onUpdate(token) cada vez que se inserta o actualiza un token.
 * Devuelve una función para desubscribirse.
 */
export function subscribeToTokens(
	sessionId: string,
	onUpdate: (token: SessionToken) => void,
	onDelete?: (tokenId: string) => void
): () => void {
	const channel = supabase
		.channel(`session_tokens:${sessionId}`)
		.on(
			"postgres_changes",
			{
				event: "INSERT",
				schema: "public",
				table: "session_tokens",
				filter: `session_id=eq.${sessionId}`,
			},
			(payload) => onUpdate(payload.new as SessionToken)
		)
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "session_tokens",
				filter: `session_id=eq.${sessionId}`,
			},
			(payload) => onUpdate(payload.new as SessionToken)
		)
		.on(
			"postgres_changes",
			{
				event: "DELETE",
				schema: "public",
				table: "session_tokens",
				filter: `session_id=eq.${sessionId}`,
			},
			(payload) => {
				if (onDelete) onDelete((payload.old as { id: string }).id);
			}
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}

/**
 * Suscribe a cambios en combat_state para una sesión.
 */
export function subscribeToCombat(
	sessionId: string,
	onUpdate: (combat: CombatState) => void
): () => void {
	const channel = supabase
		.channel(`combat_state:${sessionId}`)
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "combat_state",
				filter: `session_id=eq.${sessionId}`,
			},
			(payload) => onUpdate(payload.new as CombatState)
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}

/**
 * Suscribe a cambios en game_sessions (para detectar cuando el DM inicia/termina).
 */
export function subscribeToSession(
	campaignId: string,
	onUpdate: (session: GameSession) => void
): () => void {
	const channel = supabase
		.channel(`game_sessions:${campaignId}`)
		.on(
			"postgres_changes",
			{
				event: "INSERT",
				schema: "public",
				table: "game_sessions",
				filter: `campaign_id=eq.${campaignId}`,
			},
			(payload) => onUpdate(payload.new as GameSession)
		)
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "game_sessions",
				filter: `campaign_id=eq.${campaignId}`,
			},
			(payload) => onUpdate(payload.new as GameSession)
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}

/**
 * Suscribe a cambios en la tabla characters para una lista de IDs de personaje.
 * Llama a onUpdate cuando un personaje cambia (stats, etc.).
 */
export function subscribeToCharacters(
	characterIds: string[],
	onUpdate: (character: { id: string; stats: Record<string, unknown>; name: string; avatar_url: string | null }) => void
): () => void {
	if (characterIds.length === 0) return () => {};

	const channel = supabase
		.channel(`characters:${characterIds.join("-")}`)
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "characters",
			},
			(payload) => {
				const updated = payload.new as { id: string; stats: Record<string, unknown>; name: string; avatar_url: string | null };
				if (characterIds.includes(updated.id)) {
					onUpdate(updated);
				}
			}
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}

/**
 * Broadcast channel for real-time session updates.
 * Uses Supabase Broadcast (peer-to-peer, bypasses DB) for low-latency sync.
 * Handles position moves, token additions/removals, and combat state changes.
 */
export function createTokenBroadcastChannel(
	sessionId: string,
	handlers: {
		onMove: (tokenId: string, x: number, y: number) => void;
		onAdd: (token: SessionToken) => void;
		onRemove: (tokenId: string) => void;
		onCombatUpdate: (combat: CombatState) => void;
		onMusicChange?: (trackId: string | null) => void;
	}
): {
	sendMove: (tokenId: string, x: number, y: number) => void;
	sendAdd: (token: SessionToken) => void;
	sendRemove: (tokenId: string) => void;
	sendCombatUpdate: (combat: CombatState) => void;
	sendMusicChange: (trackId: string | null) => void;
	unsub: () => void;
} {
	const channel = supabase
		.channel(`token-moves:${sessionId}`)
		.on(
			"broadcast",
			{ event: "token-move" },
			({ payload }: { payload: { tokenId: string; x: number; y: number } }) => {
				handlers.onMove(payload.tokenId, payload.x, payload.y);
			}
		)
		.on(
			"broadcast",
			{ event: "token-add" },
			({ payload }: { payload: { token: SessionToken } }) => {
				handlers.onAdd(payload.token);
			}
		)
		.on(
			"broadcast",
			{ event: "token-remove" },
			({ payload }: { payload: { tokenId: string } }) => {
				handlers.onRemove(payload.tokenId);
			}
		)
		.on(
			"broadcast",
			{ event: "combat-update" },
			({ payload }: { payload: { combat: CombatState } }) => {
				handlers.onCombatUpdate(payload.combat);
			}
		)
		.on(
			"broadcast",
			{ event: "music-change" },
			({ payload }: { payload: { trackId: string | null } }) => {
				handlers.onMusicChange?.(payload.trackId);
			}
		)
		.subscribe();

	return {
		sendMove: (tokenId: string, x: number, y: number) => {
			channel.send({
				type: "broadcast",
				event: "token-move",
				payload: { tokenId, x, y },
			});
		},
		sendAdd: (token: SessionToken) => {
			channel.send({
				type: "broadcast",
				event: "token-add",
				payload: { token },
			});
		},
		sendRemove: (tokenId: string) => {
			channel.send({
				type: "broadcast",
				event: "token-remove",
				payload: { tokenId },
			});
		},
		sendCombatUpdate: (combat: CombatState) => {
			channel.send({
				type: "broadcast",
				event: "combat-update",
				payload: { combat },
			});
		},
		sendMusicChange: (trackId: string | null) => {
			channel.send({
				type: "broadcast",
				event: "music-change",
				payload: { trackId },
			});
		},
		unsub: () => {
			supabase.removeChannel(channel);
		},
	};
}
