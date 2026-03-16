// ================================================
// Partida Pod – View Models
// ================================================

import type {
	GameSession,
	SessionToken,
	CombatState,
	SessionMember,
} from "@/core/api/game-session.service";

export type { GameSession, SessionToken, CombatState, SessionMember };

// ─── Re-export for convenience ───────────────────────────────────────────────

export interface MapViewState {
	panX: number;
	panY: number;
	zoom: number;
	gridSize: number;
	gridColor: string;
	showGrid: boolean;
}

export interface DraggingToken {
	tokenId: string;
	startX: number;
	startY: number;
	offsetX: number;
	offsetY: number;
}

export interface CombatDialogState {
	open: boolean;
	participants: string[]; // token IDs selected to join combat
	surprise: "none" | "heroes" | "enemies";
}

/** A chapter with its scenes, used in the DM panel */
export interface ChapterWithScenes {
	id: string;
	title: string;
	content: string;
	order_index: number;
	scenes: SceneWithEntities[];
}

export interface SceneWithEntities {
	id: string;
	title: string;
	content: string;
	narration_text: string;
	dm_notes: string;
	battle_map_id: string | null;
	order_index: number;
	entities: SceneEntityBasic[];
}

export interface SceneEntityBasic {
	id: string;
	entity_type: "monster" | "item" | "spell" | "npc" | "map";
	entity_id: string;
	entity_name: string;
	entity_data: Record<string, unknown> | null;
}

export interface CombatParticipantCandidate {
	id: string;
	label: string;
	tokenType: "player" | "enemy" | "npc";
	image: string | null;
}

export interface PartidaVM {
	campaignId: string;
	session: GameSession | null;
	isSessionActive: boolean;
	isDM: boolean;
	userId: string;
	members: SessionMember[];
	tokens: SessionToken[];
	combatState: CombatState | null;
	mapImageData: string | null;
	mapView: MapViewState;
	selectedSceneId: string | null;
	chapters: ChapterWithScenes[];
	loading: boolean;
}
