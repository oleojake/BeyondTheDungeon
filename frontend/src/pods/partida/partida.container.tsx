// ================================================
// Partida Container
// ================================================
// Central state manager for the online VTT game session.
// Handles: session lifecycle, tokens, combat state,
//          Supabase Realtime subscriptions, API calls.
// ================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getBattleMap, listBattleMaps } from "@/core/api/battle-map.service";
import { listChapters } from "@/core/api/chapter.service";
import { listScenes } from "@/core/api/scene.service";
import { listSceneEntities } from "@/core/api/scene-entity.service";
import {
	getCampaignSession,
	startSession,
	endSession,
	listTokens,
	createToken,
	updateToken,
	deleteToken,
	getCombatState,
	updateCombatState,
	updateSessionState,
	getCampaignMembersWithCharacters,
	subscribeToTokens,
	subscribeToCombat,
	subscribeToSession,
	type GameSession,
	type SessionToken,
	type CombatState,
	type SessionMember,
} from "@/core/api/game-session.service";
import { PartidaComponent } from "./partida.component";
import type {
	MapViewState,
	ChapterWithScenes,
	SceneEntityBasic,
	SceneWithEntities,
	CombatParticipantCandidate,
} from "./partida.vm";
import type { CharacterUpdates } from "./components/FichaOverlay";

const API_URL = import.meta.env.VITE_API_URL || "";

import type { BattleMapListItem } from "@/core/api/battle-map.service";
type BattleMap = BattleMapListItem;

interface Props {
	campaignId: string;
	campaignTitle: string;
	isDM: boolean;
}

const DEFAULT_MAP_VIEW: MapViewState = {
	panX: 0,
	panY: 0,
	zoom: 1,
	gridSize: 50,
	gridColor: "rgba(255,255,255,0.3)",
	showGrid: true,
};

type SceneCombatCandidate = {
	id: string;
	label: string;
	tokenType: "player" | "enemy" | "npc";
	image: string | null;
	tokenId?: string;
	initiative: number;
	currentHp: number;
	maxHp: number;
	entity?: SceneEntityBasic;
};

function pickNumber(...values: unknown[]): number | null {
	for (const value of values) {
		if (typeof value === "number" && Number.isFinite(value)) return value;
		if (typeof value === "string") {
			const n = Number(value);
			if (Number.isFinite(n)) return n;
		}
	}
	return null;
}

function getEntityImage(
	entityData: Record<string, unknown> | null,
): string | null {
	if (!entityData) return null;
	const stats = (entityData.stats as Record<string, unknown> | undefined) ?? {};
	const fromValues = [
		entityData.image,
		entityData.image_url,
		entityData.avatar_url,
		entityData.img,
		stats.image,
		stats.image_url,
		stats.avatar_url,
		stats.img,
	];
	for (const value of fromValues) {
		if (typeof value !== "string" || value.trim().length === 0) continue;
		const image = value.trim();
		if (
			image.startsWith("http://") ||
			image.startsWith("https://") ||
			image.startsWith("data:")
		) {
			return image;
		}
		// dnd5eapi returns many image paths as /api/... relative URLs
		if (image.startsWith("/api/")) {
			return `https://www.dnd5eapi.co${image}`;
		}
		if (image.startsWith("api/")) {
			return `https://www.dnd5eapi.co/${image}`;
		}
		return image;
	}
	return null;
}

async function resolveCompendiumEntityImage(
	entity: SceneEntityBasic,
): Promise<string | null> {
	const inlineImage = getEntityImage(entity.entity_data);
	if (inlineImage) return inlineImage;

	const endpoint =
		entity.entity_type === "monster"
			? `${API_URL}/api/compendium-bestiary/${entity.entity_id}`
			: entity.entity_type === "spell"
				? `${API_URL}/api/compendium-spells/${entity.entity_id}`
				: null;

	if (!endpoint) return null;

	try {
		const res = await fetch(endpoint);
		if (!res.ok) return null;
		const data = await res.json();
		return getEntityImage(data as Record<string, unknown>);
	} catch {
		return null;
	}
}

export function PartidaContainer({ campaignId, campaignTitle, isDM }: Props) {
	const navigate = useNavigate();

	const [userId, setUserId] = useState("");
	const [session, setSession] = useState<GameSession | null>(null);
	const [members, setMembers] = useState<SessionMember[]>([]);
	const [tokens, setTokens] = useState<SessionToken[]>([]);
	const [selectedToken, setSelectedToken] = useState<SessionToken | null>(null);
	const [combatState, setCombatState] = useState<CombatState | null>(null);
	const [mapImageData, setMapImageData] = useState<string | null>(null);
	const [availableMaps, setAvailableMaps] = useState<BattleMap[]>([]);
	const [mapView, setMapView] = useState<MapViewState>(DEFAULT_MAP_VIEW);
	const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
	const [chapters, setChapters] = useState<ChapterWithScenes[]>([]);
	const [loading, setLoading] = useState(true);
	const [showDados, setShowDados] = useState(false);
	const [fichaTarget, setFichaTarget] = useState<SessionMember | null>(null);
	const [showCombatDialog, setShowCombatDialog] = useState(false);
	const [combatCandidates, setCombatCandidates] = useState<
		SceneCombatCandidate[]
	>([]);

	// Pending token position updates (debounced writes)
	const pendingMoves = useRef<Map<string, { x: number; y: number }>>(new Map());
	const moveFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ── Bootstrap ──────────────────────────────────────────────────────────────

	useEffect(() => {
		let unsubTokens: (() => void) | null = null;
		let unsubCombat: (() => void) | null = null;
		let unsubSession: (() => void) | null = null;

		const init = async () => {
			setLoading(true);
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;
				setUserId(user.id);

				// Load current session
				const sess = await getCampaignSession(campaignId);
				setSession(sess);

				if (sess) {
					// Restore map view from session state
					setMapView({
						panX: sess.session_state.mapPanX ?? 0,
						panY: sess.session_state.mapPanY ?? 0,
						zoom: sess.session_state.mapZoom ?? 1,
						gridSize: sess.session_state.mapGridSize ?? 50,
						gridColor:
							sess.session_state.mapGridColor ?? "rgba(255,255,255,0.3)",
						showGrid: sess.session_state.mapShowGrid ?? true,
					});

					// Load map if one was active
					if (sess.current_map_id) {
						loadMap(sess.current_map_id);
					}

					if (sess.current_scene_id) {
						setSelectedSceneId(sess.current_scene_id);
					}

					// Load tokens
					const toks = await listTokens(sess.id);
					setTokens(toks);

					// Load combat state
					const combat = await getCombatState(sess.id);
					setCombatState(combat);

					// Subscribe to realtime
					unsubTokens = subscribeToTokens(
						sess.id,
						(updated) =>
							setTokens((prev) => {
								const idx = prev.findIndex((t) => t.id === updated.id);
								if (idx >= 0) {
									const next = [...prev];
									next[idx] = updated;
									return next;
								}
								return [...prev, updated];
							}),
						(deletedId) =>
							setTokens((prev) => prev.filter((t) => t.id !== deletedId)),
					);

					unsubCombat = subscribeToCombat(sess.id, (combat) =>
						setCombatState(combat),
					);
				}

				// Subscribe to session changes (so player knows when DM starts)
				unsubSession = subscribeToSession(campaignId, (updated) => {
					setSession(updated);
					if (updated.status === "active" && !sess) {
						// DM just started the session – reload
						window.location.reload();
					}
				});

				// Load members
				const mems = await getCampaignMembersWithCharacters(campaignId);
				setMembers(mems);

				// Load chapters + scenes and available maps (DM only)
				if (isDM) {
					await loadChapters();
					const mapsRes = await listBattleMaps();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					setAvailableMaps(
						(mapsRes.maps ?? []).map((m: any) => m as BattleMap),
					);
				}
			} catch (err) {
				console.error("[Partida] init error", err);
			} finally {
				setLoading(false);
			}
		};

		init();

		return () => {
			unsubTokens?.();
			unsubCombat?.();
			unsubSession?.();
		};
	}, [campaignId, isDM]);

	// ── Load chapters + scenes ─────────────────────────────────────────────────

	const loadChapters = async () => {
		try {
			const chaptersData = await listChapters(campaignId);
			const chaptersWithScenes: ChapterWithScenes[] = await Promise.all(
				chaptersData.map(async (chapter) => {
					const scenesData = await listScenes(chapter.id);
					const scenesWithEntities: SceneWithEntities[] = await Promise.all(
						scenesData.map(async (scene) => {
							const entities = await listSceneEntities(scene.id);
							return {
								...scene,
								content: scene.content ?? "",
								narration_text: scene.narration_text ?? "",
								dm_notes: scene.dm_notes ?? "",
								battle_map_id: scene.battle_map_id ?? null,
								entities: entities.map(
									(e) =>
										({
											id: e.id,
											entity_type: e.entity_type,
											entity_id: e.entity_id,
											entity_name: e.entity_name,
											entity_data: e.entity_data ?? null,
										}) satisfies SceneEntityBasic,
								),
							} satisfies SceneWithEntities;
						}),
					);
					return {
						...chapter,
						content: chapter.content ?? "",
						scenes: scenesWithEntities,
					} satisfies ChapterWithScenes;
				}),
			);
			setChapters(chaptersWithScenes);
		} catch (err) {
			console.error("[Partida] loadChapters error", err);
		}
	};

	// ── Load map ───────────────────────────────────────────────────────────────

	const loadMap = async (mapId: string) => {
		try {
			const { map } = await getBattleMap(mapId);
			setMapImageData(map.image_data);
			setMapView((prev) => ({
				...prev,
				gridSize: map.grid_size ?? 50,
				gridColor: map.grid_color ?? "rgba(255,255,255,0.3)",
			}));
		} catch (err) {
			console.error("[Partida] loadMap error", err);
		}
	};

	// ── Session lifecycle (DM only) ────────────────────────────────────────────

	const handleStartSession = async () => {
		try {
			const newSession = await startSession(campaignId);
			setSession(newSession);
		} catch (err) {
			console.error("[Partida] startSession error", err);
			alert("Error al iniciar la sesión");
		}
	};

	const handleEndSession = async () => {
		if (!session) return;
		if (
			!confirm(
				"¿Seguro que quieres terminar la sesión? El estado se guardará y podrás reanudarla.",
			)
		)
			return;
		try {
			// Persist all pending position changes first
			await flushPendingMoves();
			await endSession(session.id, {
				session_state: {
					mapPanX: mapView.panX,
					mapPanY: mapView.panY,
					mapZoom: mapView.zoom,
					mapGridSize: mapView.gridSize,
					mapGridColor: mapView.gridColor,
					mapShowGrid: mapView.showGrid,
				},
				current_scene_id: selectedSceneId,
				current_map_id: session.current_map_id,
			});
			navigate("/profile/campanas");
		} catch (err) {
			console.error("[Partida] endSession error", err);
			alert("Error al terminar la sesión");
		}
	};

	// ── Token management ──────────────────────────────────────────────────────

	const flushPendingMoves = async () => {
		if (pendingMoves.current.size === 0 || !session) return;
		const moves = new Map(pendingMoves.current);
		pendingMoves.current.clear();
		for (const [tokenId, { x, y }] of moves) {
			await updateToken(session.id, tokenId, { x, y });
		}
	};

	// Optimistic local update + debounced DB write
	const handleTokenMove = useCallback(
		(tokenId: string, x: number, y: number) => {
			setTokens((prev) =>
				prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t)),
			);
			pendingMoves.current.set(tokenId, { x, y });

			if (moveFlushTimer.current) clearTimeout(moveFlushTimer.current);
			moveFlushTimer.current = setTimeout(() => flushPendingMoves(), 300);
		},
		[session],
	);

	const handleTokenRemove = useCallback(
		async (tokenId: string) => {
			if (!session) return;
			setTokens((prev) => prev.filter((t) => t.id !== tokenId));
			await deleteToken(session.id, tokenId);
		},
		[session],
	);

	const handleTokenHpChange = useCallback(
		async (tokenId: string, delta: number) => {
			if (!session) return;
			const token = tokens.find((t) => t.id === tokenId);
			if (!token) return;
			const newHp = Math.max(
				0,
				Math.min(token.max_hp, token.current_hp + delta),
			);
			// Optimistic update
			setTokens((prev) =>
				prev.map((t) => (t.id === tokenId ? { ...t, current_hp: newHp } : t)),
			);
			await updateToken(session.id, tokenId, { current_hp: newHp });
			// Sync to character sheet if this is a player token
			if (token.token_type === "player" && token.character_id) {
				const API_URL = import.meta.env.VITE_API_URL || "";
				const {
					data: { session: authSession },
				} = await supabase.auth.getSession();
				await fetch(`${API_URL}/api/character-sheet/${token.character_id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authSession?.access_token ?? ""}`,
					},
					body: JSON.stringify({ stats: { current_hp: newHp } }),
				});
				// Update local member character data
				setMembers((prev) =>
					prev.map((m) => {
						if (m.character?.id !== token.character_id) return m;
						return {
							...m,
							character: {
								...m.character!,
								stats: { ...(m.character!.stats as object), current_hp: newHp },
							},
						};
					}),
				);
			}
		},
		[session, tokens],
	);

	// ── Deploy map (DM) ───────────────────────────────────────────────────────

	const handleDeployMap = useCallback(
		async (map: BattleMap) => {
			if (!session) return;
			// Fetch full map data (image_data, grid settings) from API
			await loadMap(map.id);
			await updateSessionState(session.id, { current_map_id: map.id });
			setSession((prev) => (prev ? { ...prev, current_map_id: map.id } : prev));
		},
		[session],
	);

	// ── Deploy entity (DM puts enemy/NPC on map) ──────────────────────────────

	const handleDeployEntity = useCallback(
		async (entity: SceneEntityBasic, iconKey?: string) => {
			if (!session) return;
			if (!session.current_map_id) {
				alert("Primero despliega un mapa antes de añadir este elemento.");
				return;
			}

			const resolvedImage =
				entity.entity_type === "item" && iconKey
					? `icon:${iconKey}`
					: entity.entity_type === "spell" && iconKey
						? iconKey
						: await resolveCompendiumEntityImage(entity);

			const token = await createToken(session.id, {
				token_type:
					entity.entity_type === "monster"
						? "enemy"
						: entity.entity_type === "npc"
							? "npc"
							: entity.entity_type === "item"
								? "npc"
								: "enemy",
				character_id: null,
				user_id: null,
				entity_ref_id: entity.id,
				entity_name: entity.entity_name,
				entity_image: resolvedImage,
				x: 80,
				y: 80,
				current_hp:
					pickNumber(
						(entity.entity_data as { hp_current?: unknown } | null)?.hp_current,
						(entity.entity_data as { current_hp?: unknown } | null)?.current_hp,
						(entity.entity_data as { hp?: unknown } | null)?.hp,
						(entity.entity_data?.stats as { hp?: unknown } | undefined)?.hp,
						(entity.entity_data?.stats as { max_hp?: unknown } | undefined)
							?.max_hp,
					) ?? 10,
				max_hp:
					pickNumber(
						(entity.entity_data as { max_hp?: unknown } | null)?.max_hp,
						(entity.entity_data as { hp?: unknown } | null)?.hp,
						(entity.entity_data as { hp_current?: unknown } | null)?.hp_current,
						(entity.entity_data?.stats as { max_hp?: unknown } | undefined)
							?.max_hp,
						(entity.entity_data?.stats as { hp?: unknown } | undefined)?.hp,
					) ?? 10,
				initiative_value: 0,
				is_on_map: true,
				token_color: null,
				token_size: null,
			});
			setTokens((prev) => [...prev, token]);
			handleTokenSelect(token);
		},
		[session],
	);

	// ── Change icon of an item token already on map ───────────────────────────

	const handleChangeTokenIcon = useCallback(
		async (tokenId: string, iconKey: string) => {
			if (!session) return;
			const entityImage = iconKey.startsWith("shape:")
				? iconKey
				: `icon:${iconKey}`;
			const updated = await updateToken(session.id, tokenId, {
				entity_image: entityImage,
			});
			setTokens((prev) =>
				prev.map((t) =>
					t.id === tokenId ? { ...t, entity_image: updated.entity_image } : t,
				),
			);
			// Keep selectedToken in sync
			setSelectedToken((prev) =>
				prev?.id === tokenId
					? { ...prev, entity_image: updated.entity_image }
					: prev,
			);
		},
		[session],
	);

	const handleUpdateToken = useCallback(
		async (
			tokenId: string,
			updates: {
				token_color?: string;
				token_size?: "S" | "M" | "L" | "XL" | null;
			},
		) => {
			if (!session) return;
			const updated = await updateToken(session.id, tokenId, updates);
			setTokens((prev) =>
				prev.map((t) => (t.id === tokenId ? { ...t, ...updates } : t)),
			);
			setSelectedToken((prev) =>
				prev?.id === tokenId ? { ...prev, ...updated } : prev,
			);
		},
		[session],
	);

	const handleTokenSelect = useCallback((token: SessionToken | null) => {
		setSelectedToken(token);
	}, []);

	// ── Scene selection ───────────────────────────────────────────────────────

	const handleSelectScene = useCallback(
		async (sceneId: string) => {
			setSelectedSceneId(sceneId);
			if (session && isDM) {
				await updateSessionState(session.id, { current_scene_id: sceneId });
			}
		},
		[session, isDM],
	);

	const handleGoToScene = useCallback(
		async (scene: SceneWithEntities) => {
			handleSelectScene(scene.id);
			// If scene has a map, auto-load it
			if (scene.battle_map_id) {
				const mapObj = availableMaps.find((m) => m.id === scene.battle_map_id);
				if (mapObj) handleDeployMap(mapObj);
				else loadMap(scene.battle_map_id);
			}
		},
		[handleSelectScene, handleDeployMap, availableMaps],
	);

	// ── Combat ────────────────────────────────────────────────────────────────

	const buildSceneCombatCandidates = useCallback((): SceneCombatCandidate[] => {
		const playerTokenCandidates: SceneCombatCandidate[] = tokens
			.filter((t) => t.token_type === "player")
			.map((t) => ({
				id: t.id,
				label: t.entity_name,
				tokenType: "player",
				image: t.entity_image,
				tokenId: t.id,
				initiative: t.initiative_value ?? 0,
				currentHp: t.current_hp,
				maxHp: t.max_hp,
			}));

		const playersWithoutToken: SceneCombatCandidate[] = members
			.filter((m) => m.role !== "dm")
			.filter(
				(m) =>
					!tokens.some(
						(t) => t.token_type === "player" && t.user_id === m.user_id,
					),
			)
			.map((m) => {
				const stats =
					(m.character?.stats as Record<string, unknown> | undefined) ?? {};
				const maxHp = pickNumber(stats.max_hp, stats.hp) ?? 10;
				const currentHp =
					pickNumber(stats.current_hp, stats.hp, maxHp) ?? maxHp;
				const initiative = pickNumber(stats.initiative) ?? 0;
				const label =
					m.character?.name ||
					m.profile?.display_name ||
					m.profile?.username ||
					"Heroe";

				return {
					id: `member:${m.user_id}`,
					label,
					tokenType: "player",
					image: m.character?.avatar_url ?? m.profile?.avatar_url ?? null,
					initiative,
					currentHp,
					maxHp,
				};
			});

		const playerCandidates = [...playerTokenCandidates, ...playersWithoutToken];

		const scene = selectedSceneId
			? chapters.flatMap((c) => c.scenes).find((s) => s.id === selectedSceneId)
			: null;
		if (!scene) return playerCandidates;

		const entityCandidates: SceneCombatCandidate[] = scene.entities
			.filter((e) => e.entity_type === "monster" || e.entity_type === "npc")
			.map((entity) => {
				const tokenType = entity.entity_type === "npc" ? "npc" : "enemy";
				const existing = tokens.find(
					(t) => t.entity_ref_id === entity.id && t.token_type === tokenType,
				);
				const stats =
					(entity.entity_data?.stats as Record<string, unknown> | undefined) ??
					{};
				const maxHp =
					pickNumber(
						(entity.entity_data as { max_hp?: unknown } | null)?.max_hp,
						(entity.entity_data as { hp?: unknown } | null)?.hp,
						stats.max_hp,
						stats.hp,
						(entity.entity_data as { hp_current?: unknown } | null)?.hp_current,
					) ?? 10;
				const currentHp =
					pickNumber(
						(entity.entity_data as { hp_current?: unknown } | null)?.hp_current,
						(entity.entity_data as { current_hp?: unknown } | null)?.current_hp,
						stats.current_hp,
						stats.hp,
						maxHp,
					) ?? maxHp;

				return {
					id: existing?.id ?? `scene:${entity.id}`,
					label: entity.entity_name,
					tokenType,
					image: existing?.entity_image ?? getEntityImage(entity.entity_data),
					tokenId: existing?.id,
					initiative: existing?.initiative_value ?? 0,
					currentHp,
					maxHp,
					entity,
				};
			});

		return [...playerCandidates, ...entityCandidates];
	}, [chapters, selectedSceneId, tokens, members]);

	const handleStartCombat = useCallback(() => {
		// Open combat dialog with scene participants (all pre-selected)
		setCombatCandidates(buildSceneCombatCandidates());
		setShowCombatDialog(true);
	}, [buildSceneCombatCandidates]);

	const handleConfirmCombat = useCallback(
		async (
			participantIds: string[],
			surprise: "none" | "heroes" | "enemies",
		) => {
			if (!session || !combatState) return;
			setShowCombatDialog(false);

			const selectedCandidates = combatCandidates.filter((c) =>
				participantIds.includes(c.id),
			);

			const participantTokens: SessionToken[] = [];
			for (const candidate of selectedCandidates) {
				if (candidate.id.startsWith("member:")) {
					const memberUserId = candidate.id.replace("member:", "");
					const member = members.find((m) => m.user_id === memberUserId);
					if (!member) continue;
					const createdPlayer = await createToken(session.id, {
						token_type: "player",
						character_id: member.character?.id ?? null,
						user_id: member.user_id,
						entity_ref_id: null,
						entity_name: candidate.label,
						entity_image: candidate.image,
						x: 40,
						y: 40,
						current_hp: candidate.currentHp,
						max_hp: candidate.maxHp,
						initiative_value: candidate.initiative,
						is_on_map: true,
						token_color: null,
						token_size: null,
					});
					participantTokens.push(createdPlayer);
					continue;
				}

				if (candidate.tokenId) {
					const existingToken = tokens.find((t) => t.id === candidate.tokenId);
					if (existingToken) {
						const resolvedCandidateImage =
							candidate.image ||
							(candidate.entity
								? await resolveCompendiumEntityImage(candidate.entity)
								: null);
						participantTokens.push(existingToken);
						if (
							!existingToken.is_on_map ||
							!existingToken.entity_image ||
							resolvedCandidateImage
						) {
							const updated = await updateToken(session.id, existingToken.id, {
								is_on_map: true,
								entity_image:
									existingToken.entity_image ?? resolvedCandidateImage,
							});
							participantTokens[participantTokens.length - 1] = updated;
						}
					}
					continue;
				}

				if (!candidate.entity) continue;

				const resolvedCandidateImage =
					candidate.image ||
					(await resolveCompendiumEntityImage(candidate.entity));

				const spawnIndex = participantTokens.length;
				const spawned = await createToken(session.id, {
					token_type: candidate.tokenType,
					character_id: null,
					user_id: null,
					entity_ref_id: candidate.entity.id,
					entity_name: candidate.label,
					entity_image: resolvedCandidateImage,
					x: 80 + (spawnIndex % 6) * 60,
					y: 80 + Math.floor(spawnIndex / 6) * 60,
					current_hp: candidate.currentHp,
					max_hp: candidate.maxHp,
					initiative_value: candidate.initiative,
					is_on_map: true,
					token_color: null,
					token_size: null,
				});
				participantTokens.push(spawned);
			}

			setTokens((prev) => {
				const map = new Map(prev.map((t) => [t.id, t]));
				for (const t of participantTokens) map.set(t.id, t);
				return Array.from(map.values());
			});

			// Sort by initiative (descending), applying D&D 5e surprise rules
			const sorted = [...participantTokens].sort((a, b) => {
				const aSurprised =
					surprise === "heroes" && a.token_type === "player"
						? -1000
						: surprise === "enemies" &&
							  (a.token_type === "enemy" || a.token_type === "npc")
							? -1000
							: 0;
				const bSurprised =
					surprise === "heroes" && b.token_type === "player"
						? -1000
						: surprise === "enemies" &&
							  (b.token_type === "enemy" || b.token_type === "npc")
							? -1000
							: 0;

				const aInit = a.initiative_value + aSurprised;
				const bInit = b.initiative_value + bSurprised;
				return bInit - aInit;
			});

			const newOrder = sorted.map((t) => t.id);

			const updated = await updateCombatState(session.id, {
				is_active: true,
				current_turn_index: 0,
				round_number: 1,
				initiative_order: newOrder,
				surprise,
			});
			setCombatState(updated);
		},
		[session, combatState, tokens, combatCandidates, members],
	);

	const handleEndCombat = useCallback(async () => {
		if (!session || !combatState) return;
		const updated = await updateCombatState(session.id, {
			is_active: false,
			initiative_order: [],
			current_turn_index: 0,
			round_number: 1,
		});
		setCombatState(updated);

		// Remove enemy/npc tokens from map
		const enemiesToRemove = tokens.filter(
			(t) => t.is_on_map && t.token_type !== "player",
		);
		for (const tok of enemiesToRemove) {
			await deleteToken(session.id, tok.id);
		}
		setTokens((prev) => prev.filter((t) => t.token_type === "player"));
	}, [session, combatState, tokens]);

	const handleReorderInitiative = useCallback(
		async (newOrder: string[]) => {
			if (!session || !combatState) return;
			const updated = await updateCombatState(session.id, {
				initiative_order: newOrder,
			});
			setCombatState(updated);
		},
		[session, combatState],
	);

	const handleEndTurn = useCallback(async () => {
		if (!session || !combatState) return;
		const nextIdx =
			(combatState.current_turn_index + 1) %
			combatState.initiative_order.length;
		const newRound =
			nextIdx === 0 ? combatState.round_number + 1 : combatState.round_number;
		const updated = await updateCombatState(session.id, {
			current_turn_index: nextIdx,
			round_number: newRound,
		});
		setCombatState(updated);
	}, [session, combatState]);

	const handleRemoveFromCombat = useCallback(
		async (tokenId: string) => {
			if (!session || !combatState) return;
			const newOrder = combatState.initiative_order.filter(
				(id) => id !== tokenId,
			);
			const updated = await updateCombatState(session.id, {
				initiative_order: newOrder,
				current_turn_index: Math.min(
					combatState.current_turn_index,
					Math.max(0, newOrder.length - 1),
				),
			});
			setCombatState(updated);
		},
		[session, combatState],
	);

	// ── Character sheet update ────────────────────────────────────────────────

	const handleSaveFicha = useCallback(
		async (
			memberId: string,
			characterId: string,
			updates: CharacterUpdates,
		) => {
			const API_URL = import.meta.env.VITE_API_URL || "";
			const {
				data: { session: authSession },
			} = await supabase.auth.getSession();
			await fetch(`${API_URL}/api/character-sheet/${characterId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authSession?.access_token ?? ""}`,
				},
				body: JSON.stringify(updates),
			});
			// Update local members
			setMembers((prev) =>
				prev.map((m) => {
					if (m.user_id !== memberId || !m.character) return m;
					return {
						...m,
						character: { ...m.character, ...updates },
					};
				}),
			);
			// Sync HP to token if character sheet includes stats.current_hp
			const newCurrentHp = (
				updates.stats as { current_hp?: number } | undefined
			)?.current_hp;
			if (newCurrentHp !== undefined && session) {
				const playerToken = tokens.find(
					(t) => t.token_type === "player" && t.character_id === characterId,
				);
				if (playerToken) {
					setTokens((prev) =>
						prev.map((t) =>
							t.id === playerToken.id ? { ...t, current_hp: newCurrentHp } : t,
						),
					);
					await updateToken(session.id, playerToken.id, {
						current_hp: newCurrentHp,
					});
				}
			}
		},
		[session, tokens],
	);

	// ── Map view persistence (debounced) ──────────────────────────────────────

	const viewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const handleMapViewChange = useCallback(
		(view: MapViewState) => {
			setMapView(view);
			if (!session || !isDM) return;
			if (viewTimer.current) clearTimeout(viewTimer.current);
			viewTimer.current = setTimeout(async () => {
				await updateSessionState(session.id, {
					session_state: {
						mapPanX: view.panX,
						mapPanY: view.panY,
						mapZoom: view.zoom,
						mapGridSize: view.gridSize,
						mapGridColor: view.gridColor,
						mapShowGrid: view.showGrid,
					},
				});
			}, 1000);
		},
		[session, isDM],
	);

	// ── Ensure player tokens exist on session start ───────────────────────────

	useEffect(() => {
		if (!session || !isDM || tokens.length > 0 || members.length === 0) return;

		const ensurePlayerTokens = async () => {
			const players = members.filter((m) => m.role !== "dm" && m.character);
			for (const player of players) {
				const exists = tokens.some((t) => t.user_id === player.user_id);
				if (exists) continue;
				const char = player.character!;
				const initVal =
					(char.stats as { initiative?: number } | null)?.initiative ?? 0;
				const maxHp = (char.stats as { max_hp?: number } | null)?.max_hp ?? 0;
				const currentHp =
					(char.stats as { current_hp?: number } | null)?.current_hp ?? maxHp;
				const tok = await createToken(session.id, {
					token_type: "player",
					character_id: char.id,
					user_id: player.user_id,
					entity_ref_id: null,
					entity_name: char.name,
					entity_image: char.avatar_url,
					x: 40,
					y: 40,
					current_hp: currentHp,
					max_hp: maxHp,
					initiative_value: initVal,
					is_on_map: false,
					token_color: null,
					token_size: null,
				});
				setTokens((prev) => [...prev, tok]);
			}
		};

		ensurePlayerTokens();
	}, [session, isDM, members]);

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<PartidaComponent
			campaignId={campaignId}
			campaignTitle={campaignTitle}
			session={session}
			isDM={isDM}
			userId={userId}
			members={members}
			tokens={tokens}
			combatState={combatState}
			mapImageData={mapImageData}
			mapView={mapView}
			selectedSceneId={selectedSceneId}
			chapters={chapters}
			availableMaps={availableMaps}
			loading={loading}
			showDados={showDados}
			fichaTarget={fichaTarget}
			showCombatDialog={showCombatDialog}
			combatParticipants={combatCandidates.map(
				(c): CombatParticipantCandidate => ({
					id: c.id,
					label: c.label,
					tokenType: c.tokenType,
					image: c.image,
				}),
			)}
			onMapViewChange={handleMapViewChange}
			onTokenMove={handleTokenMove}
			onTokenRemove={handleTokenRemove}
			onTokenHpChange={handleTokenHpChange}
			onTokenSelect={handleTokenSelect}
			selectedToken={selectedToken}
			onDeployMap={handleDeployMap}
			onDeployEntity={handleDeployEntity}
			onChangeTokenIcon={handleChangeTokenIcon}
			onUpdateToken={handleUpdateToken}
			onSelectScene={handleSelectScene}
			onGoToScene={handleGoToScene}
			onStartCombat={handleStartCombat}
			onConfirmCombat={handleConfirmCombat}
			onEndCombat={handleEndCombat}
			onReorderInitiative={handleReorderInitiative}
			onEndTurn={handleEndTurn}
			onRemoveFromCombat={handleRemoveFromCombat}
			onEndSession={handleEndSession}
			onOpenDados={() => setShowDados(true)}
			onCloseDados={() => setShowDados(false)}
			onOpenFicha={(member) => setFichaTarget(member)}
			onCloseFicha={() => setFichaTarget(null)}
			onSaveFicha={handleSaveFicha}
			onCancelCombatDialog={() => setShowCombatDialog(false)}
		/>
	);
}
