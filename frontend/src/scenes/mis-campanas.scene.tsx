// ================================================
// Mis Campañas Scene
// ================================================
// List all campaigns where user is DM or player.
// DM: can start/resume session → /partida/:id
// Player: if session active → /partida/:id ; else → character sheet modal
// ================================================

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileLayout } from "@/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	listCampaigns,
	createCampaign,
	deleteCampaign,
	type Campaign,
} from "@/core/api/campaign.service";
import {
	listUserInvitations,
	acceptInvitation,
	rejectInvitation,
	type CampaignInvitation,
} from "@/core/api/campaign-invitation.service";
import {
	getCampaignSession,
	startSession,
	type GameSession,
} from "@/core/api/game-session.service";
import { supabase } from "@/lib/supabase";
import {
	Plus,
	Trash2,
	Users,
	Scroll,
	Bell,
	Play,
	RotateCcw,
	Swords,
	User,
} from "lucide-react";

type CharacterListItem = {
	id: string;
	name: string;
	campaign_id?: string | null;
	user_id?: string;
	race?: string;
	level?: number;
};

// ─── Character per campaign (for player view) ─────────────────────────────────

async function fetchCampaignCharacter(campaignId: string) {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const API_URL = import.meta.env.VITE_API_URL || "";
	const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/my-character`, {
		headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
	});
	if (!res.ok) return null;
	const data = await res.json();
	return (data.character as Record<string, unknown> | null) ?? null;
}

async function fetchMyCharacters() {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const API_URL = import.meta.env.VITE_API_URL || "";
	const res = await fetch(`${API_URL}/api/character-sheets`, {
		headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
	});
	if (!res.ok) throw new Error("No se pudieron cargar tus fichas");
	const data = await res.json();
	return (data.characters ?? []) as CharacterListItem[];
}

async function assignCharacterToCampaign(characterId: string, campaignId: string) {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const API_URL = import.meta.env.VITE_API_URL || "";
	const res = await fetch(`${API_URL}/api/character-sheet/${characterId}`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${session?.access_token ?? ""}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ campaign_id: campaignId }),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || err.details || "No se pudo asignar la ficha");
	}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MisCampanasScene() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string>("");

	// Session status per campaign
	const [sessionMap, setSessionMap] = useState<Record<string, GameSession | null>>({});
	const [startingSession, setStartingSession] = useState<string | null>(null);

	// Player character-sheet modal
	const [fichaModalData, setFichaModalData] = useState<{
		campaign: Campaign;
		character: Record<string, unknown> | null;
		sessionActive: boolean;
	} | null>(null);
	const [myCharacters, setMyCharacters] = useState<CharacterListItem[]>([]);
	const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
	const [assigningCharacter, setAssigningCharacter] = useState(false);

	// Create campaign dialog state
	const [createOpen, setCreateOpen] = useState(false);
	const [createLoading, setCreateLoading] = useState(false);
	const [newCampaign, setNewCampaign] = useState({
		title: "",
		description: "",
		notes: "",
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) setUserId(user.id);

			const campaignsData = await listCampaigns();
			setCampaigns(campaignsData);

			// Fetch session status for every campaign (non-blocking)
			if (campaignsData.length > 0) {
				const sessions = await Promise.all(
					campaignsData.map((c: Campaign) =>
						getCampaignSession(c.id)
							.then((s) => ({ id: c.id, session: s }))
							.catch(() => ({ id: c.id, session: null }))
					)
				);
				const map: Record<string, GameSession | null> = {};
				sessions.forEach(({ id, session }) => {
					map[id] = session;
				});
				setSessionMap(map);
			}

			try {
				const invitationsData = await listUserInvitations();
				setInvitations(invitationsData);
			} catch {
				setInvitations([]);
			}
		} catch (error) {
			console.error("Error al cargar campañas:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCampaign = async () => {
		if (!newCampaign.title.trim()) {
			alert(t("scenes.campaigns.errors.titleRequired"));
			return;
		}
		setCreateLoading(true);
		try {
			const campaign = await createCampaign(newCampaign);
			setCampaigns([campaign, ...campaigns]);
			setCreateOpen(false);
			setNewCampaign({ title: "", description: "", notes: "" });
			navigate(`/editar-campana/${campaign.id}`);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Error desconocido";
			alert(`Error al crear campaña: ${msg}`);
		} finally {
			setCreateLoading(false);
		}
	};

	const handleDeleteCampaign = async (id: string) => {
		if (!confirm(t("scenes.campaigns.errors.deleteConfirm"))) return;
		try {
			await deleteCampaign(id);
			setCampaigns(campaigns.filter((c) => c.id !== id));
		} catch {
			alert(t("scenes.campaigns.errors.deleteFailed"));
		}
	};

	const handleAcceptInvitation = async (token: string) => {
		try {
			await acceptInvitation(token);
			setInvitations(invitations.filter((inv) => inv.token !== token));
			await loadData();
		} catch {
			alert(t("scenes.campaigns.errors.acceptFailed"));
		}
	};

	const handleRejectInvitation = async (token: string) => {
		try {
			await rejectInvitation(token);
			setInvitations(invitations.filter((inv) => inv.token !== token));
		} catch {
			alert(t("scenes.campaigns.errors.rejectFailed"));
		}
	};

	// DM: start or resume the session then navigate to the game
	const handleStartOrResumeSession = async (e: React.MouseEvent, campaign: Campaign) => {
		e.stopPropagation();
		setStartingSession(campaign.id);
		try {
			await startSession(campaign.id);
			navigate(`/partida/${campaign.id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Error";
			alert(`Error al iniciar sesión: ${msg}`);
		} finally {
			setStartingSession(null);
		}
	};

	// Player: open campaign summary + character modal (never auto-enter on card click)
	const handlePlayerClickCampaign = async (campaign: Campaign) => {
		const sess = sessionMap[campaign.id];
		const sessionActive = sess?.status === "active";
		// Load character for this campaign and show modal
		const [char, chars] = await Promise.all([
			fetchCampaignCharacter(campaign.id),
			fetchMyCharacters().catch(() => []),
		]);
		setMyCharacters(chars);
		setSelectedCharacterId("");
		setFichaModalData({
			campaign,
			character: char as Record<string, unknown> | null,
			sessionActive,
		});
	};

	const handleAssignCharacter = async () => {
		if (!fichaModalData || !selectedCharacterId) return;
		setAssigningCharacter(true);
		try {
			await assignCharacterToCampaign(selectedCharacterId, fichaModalData.campaign.id);
			const char = await fetchCampaignCharacter(fichaModalData.campaign.id);
			setFichaModalData({
				campaign: fichaModalData.campaign,
				character: char as Record<string, unknown> | null,
				sessionActive: fichaModalData.sessionActive,
			});
			setSelectedCharacterId("");
			await loadData();
		} catch (err) {
			alert(err instanceof Error ? err.message : "No se pudo asignar la ficha");
		} finally {
			setAssigningCharacter(false);
		}
	};

	const isDM = (campaign: Campaign) => campaign.dm_id === userId;

	const getSessionBadge = (campaignId: string) => {
		const sess = sessionMap[campaignId];
		if (!sess) return null;
		if (sess.status === "active")
			return (
				<Badge className="bg-green-600 text-white text-xs">
					<Swords className="w-3 h-3 mr-1" />
					En juego
				</Badge>
			);
		if (sess.status === "paused")
			return (
				<Badge variant="outline" className="text-amber-400 border-amber-600 text-xs">
					Pausada · Sesión {sess.session_number}
				</Badge>
			);
		return null;
	};

	return (
		<ProfileLayout>
			<div className="max-w-5xl mx-auto space-y-6">
				{/* Header */}
				<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<Scroll className="h-8 w-8 text-amber-200" />
								<h1 className="text-3xl font-bold text-amber-50">Mis Campañas</h1>
							</div>
							<p className="text-sm text-amber-100/90">
								Gestiona tus aventuras de D&D como DM o jugador
							</p>
						</div>
						<Dialog open={createOpen} onOpenChange={setCreateOpen}>
							<DialogTrigger asChild>
								<Button className="bg-amber-600 hover:bg-amber-700 text-white">
									<Plus className="mr-2 h-4 w-4" />
									Nueva Campaña
								</Button>
							</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Crear Nueva Campaña</DialogTitle>
								<DialogDescription>
									Crea una nueva campaña y conviértete en el Dungeon Master
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div>
									<label className="text-sm font-medium">Título *</label>
									<Input
										value={newCampaign.title}
										onChange={(e) =>
											setNewCampaign({ ...newCampaign, title: e.target.value })
										}
										placeholder={t("scenes.campaigns.createDialog.titlePlaceholder")}
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Descripción</label>
									<Textarea
										value={newCampaign.description}
										onChange={(e) =>
											setNewCampaign({ ...newCampaign, description: e.target.value })
										}
										placeholder={t("scenes.campaigns.createDialog.descPlaceholder")}
										rows={3}
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Notas Privadas (DM)</label>
									<Textarea
										value={newCampaign.notes}
										onChange={(e) =>
											setNewCampaign({ ...newCampaign, notes: e.target.value })
										}
										placeholder={t("scenes.campaigns.createDialog.notesPlaceholder")}
										rows={3}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>
									Cancelar
								</Button>
								<Button onClick={handleCreateCampaign} disabled={createLoading}>
									{createLoading ? t("scenes.campaigns.createDialog.creating") : t("scenes.campaigns.createDialog.create")}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					</div>
				</section>

				{/* Invitations */}
				{invitations.length > 0 && (
					<div>
						<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Invitaciones Pendientes ({invitations.length})
						</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{invitations.map((invitation) => (
								<Card key={invitation.id} className="border-primary">
									<CardHeader>
										<CardTitle className="text-lg">
											{invitation.campaigns?.title || "Campaña"}
										</CardTitle>
										<CardDescription>
											Has sido invitado a unirte a esta campaña
										</CardDescription>
									</CardHeader>
									<CardFooter className="gap-2">
										<Button
											size="sm"
											onClick={() => handleAcceptInvitation(invitation.token)}
										>
											Aceptar
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleRejectInvitation(invitation.token)}
										>
											Rechazar
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					</div>
				)}

				{/* Campaigns List */}
				{loading ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-full mt-2" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>
						))}
					</div>
				) : campaigns.length === 0 ? (
					<div className="text-center py-12">
						<Scroll className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No tienes campañas aún</h3>
						<p className="text-muted-foreground mb-4">
							Crea una nueva campaña o espera a ser invitado a una
						</p>
						<Button onClick={() => setCreateOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Crear Primera Campaña
						</Button>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{campaigns.map((campaign) => {
							const userIsDM = isDM(campaign);
							const sess = sessionMap[campaign.id];
							const sessionActive = sess?.status === "active";
							const sessionPaused = sess?.status === "paused";

							return (
								<Card
									key={campaign.id}
									className="hover:shadow-lg transition-shadow cursor-pointer"
									onClick={() => {
										if (userIsDM) navigate(`/editar-campana/${campaign.id}`);
										else handlePlayerClickCampaign(campaign);
									}}
								>
									<CardHeader>
										<div className="flex items-start justify-between gap-2 flex-wrap">
											<CardTitle className="text-xl">{campaign.title}</CardTitle>
											<div className="flex items-center gap-1.5">
												{userIsDM && (
													<Badge variant="default">DM</Badge>
												)}
												{getSessionBadge(campaign.id)}
											</div>
										</div>
										<CardDescription className="line-clamp-2">
											{campaign.description || t("scenes.campaigns.noDescription")}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Users className="h-4 w-4" />
											<span>
												Creada el{" "}
												{new Date(campaign.created_at).toLocaleDateString()}
											</span>
										</div>
									</CardContent>
									<CardFooter className="flex gap-2 flex-wrap">
										{/* ─ DM actions ─ */}
										{userIsDM && (
											<>
												<Button
													size="sm"
													variant="outline"
													className="flex-1"
													onClick={(e) => {
														e.stopPropagation();
														navigate(`/editar-campana/${campaign.id}`);
													}}
												>
													Editar
												</Button>

												{sessionActive ? (
													<Button
														size="sm"
														className="flex-1 bg-green-700 hover:bg-green-600 text-white"
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/partida/${campaign.id}`);
														}}
													>
														<Play className="h-3 w-3 mr-1" />
														Entrar a partida
													</Button>
												) : (
													<Button
														size="sm"
														className="flex-1 bg-purple-700 hover:bg-purple-600 text-white"
														disabled={startingSession === campaign.id}
														onClick={(e) =>
															handleStartOrResumeSession(e, campaign)
														}
													>
														{sessionPaused ? (
															<>
																<RotateCcw className="h-3 w-3 mr-1" />
																{startingSession === campaign.id
																	? t("scenes.campaigns.resuming")
																	: t("scenes.campaigns.resume")}
															</>
														) : (
															<>
																<Play className="h-3 w-3 mr-1" />
																{startingSession === campaign.id
																	? t("scenes.campaigns.starting")
																	: t("scenes.campaigns.start")}
															</>
														)}
													</Button>
												)}

												<Button
													size="sm"
													variant="destructive"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteCampaign(campaign.id);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</>
										)}

										{/* ─ Player actions ─ */}
										{!userIsDM && (
											<>
												{sessionActive ? (
													<Button
														size="sm"
														className="flex-1 bg-green-700 hover:bg-green-600 text-white"
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/partida/${campaign.id}`);
														}}
													>
														<Swords className="h-3 w-3 mr-1" />
														Unirse a la partida
													</Button>
												) : (
													<Button
														size="sm"
														variant="outline"
														className="flex-1"
														onClick={(e) => {
															e.stopPropagation();
															handlePlayerClickCampaign(campaign);
														}}
													>
														<User className="h-3 w-3 mr-1" />
														Ver mi ficha
													</Button>
												)}
											</>
										)}
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			{/* ─ Player: character sheet modal ─ */}
			<Dialog
				open={fichaModalData !== null}
				onOpenChange={(o) => {
					if (!o) {
						setFichaModalData(null);
						setSelectedCharacterId("");
					}
				}}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{fichaModalData?.campaign.title} – Mi Personaje
						</DialogTitle>
						<DialogDescription>
							Consulta la descripcion de la campaña y el estado de tu ficha.
						</DialogDescription>
					</DialogHeader>

					<div className="rounded-md border border-border bg-muted/20 p-3 text-sm mb-3">
						<p className="font-medium mb-1">Descripcion de la campaña</p>
						<p className="text-muted-foreground">
							{fichaModalData?.campaign.description || "Sin descripcion."}
						</p>
					</div>

					{fichaModalData?.sessionActive && (
						<Button
							className="w-full mb-3 bg-green-700 hover:bg-green-600 text-white"
							onClick={() => {
								navigate(`/partida/${fichaModalData.campaign.id}`);
								setFichaModalData(null);
							}}
						>
							<Swords className="h-4 w-4 mr-2" />
							Unirse a la partida en curso
						</Button>
					)}

					{fichaModalData?.character ? (
						<CharacterSummary char={fichaModalData.character} />
					) : (
						<div className="py-4 space-y-4">
							<div className="text-center text-muted-foreground">
								<User className="h-12 w-12 mx-auto mb-3 opacity-40" />
								<p>No tienes un personaje asignado a esta campaña todavía.</p>
							</div>

							{myCharacters.length > 0 ? (
								<div className="space-y-2">
									<label className="text-sm font-medium">Asignar una de mis fichas</label>
									<select
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										value={selectedCharacterId}
										onChange={(e) => setSelectedCharacterId(e.target.value)}
									>
										<option value="">Selecciona una ficha...</option>
										{myCharacters.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
												{c.campaign_id ? " (ya asociada a otra campaña)" : ""}
											</option>
										))}
									</select>
									<Button
										className="w-full"
										disabled={!selectedCharacterId || assigningCharacter}
										onClick={handleAssignCharacter}
									>
										{assigningCharacter ? t("scenes.campaigns.characterModal.assigning") : t("scenes.campaigns.characterModal.assignButton")}
									</Button>
								</div>
							) : (
								<div className="text-center">
									<p className="text-sm text-muted-foreground mb-3">No tienes fichas creadas todavía.</p>
									<Button variant="outline" onClick={() => navigate("/mis-fichas")}>
										Ir a Mis Fichas
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</ProfileLayout>
	);
}

// ─── Character summary sub-component ─────────────────────────────────────────

function CharacterSummary({ char }: { char: Record<string, unknown> }) {
	const stats = (char.stats ?? {}) as Record<string, unknown>;
	const classes = ((char.classes ?? []) as { name: string; level: number }[])
		.map((c) => `${c.name} ${c.level}`)
		.join(" / ");

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				{(char.avatar_url as string | undefined) && (
					<img
						src={char.avatar_url as string}
						alt={char.name as string}
						className="w-16 h-16 rounded-full object-cover border-2 border-amber-700"
					/>
				)}
				<div>
					<h3 className="text-lg font-bold">{char.name as string}</h3>
					<p className="text-sm text-muted-foreground">
						{char.race as string} · {classes}
					</p>
					<p className="text-sm text-muted-foreground">
						{char.experience_points as number} XP
					</p>
				</div>
			</div>

			<Tabs defaultValue="info">
				<TabsList>
					<TabsTrigger value="info">Info</TabsTrigger>
					<TabsTrigger value="combate">Combate</TabsTrigger>
					<TabsTrigger value="equipo">Equipo</TabsTrigger>
					<TabsTrigger value="notas">Notas</TabsTrigger>
				</TabsList>

				<TabsContent value="info">
					<div className="grid grid-cols-3 gap-2 text-sm">
						{["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map(
							(key) => (
								<div
									key={key}
									className="bg-muted rounded p-2 text-center"
								>
									<div className="text-xs text-muted-foreground capitalize">
										{key === "strength" ? "Fuerza"
											: key === "dexterity" ? "Destreza"
											: key === "constitution" ? "Constitución"
											: key === "intelligence" ? "Inteligencia"
											: key === "wisdom" ? "Sabiduría"
											: "Carisma"}
									</div>
									<div className="font-bold">{Number(stats[key] ?? 10)}</div>
								</div>
							)
						)}
					</div>
				</TabsContent>

				<TabsContent value="combate">
					<div className="grid grid-cols-3 gap-2 text-sm">
						{[
							{ k: "current_hp", l: t("scenes.campaigns.characterTabs.hpCurrent") },
							{ k: "max_hp", l: t("scenes.campaigns.characterTabs.hpMax") },
							{ k: "armor_class", l: "CA" },
							{ k: "initiative", l: "Iniciativa" },
							{ k: "speed", l: "Velocidad" },
						].map(({ k, l }) => (
							<div key={k} className="bg-muted rounded p-2 text-center">
								<div className="text-xs text-muted-foreground">{l}</div>
								<div className="font-bold">{Number(stats[k] ?? 0)}</div>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="equipo">
					<div className="space-y-2 text-sm">
						<div>
							<p className="font-medium mb-1">Equipo</p>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{(char.equipment as string) || t("scenes.campaigns.characterTabs.noEquipment")}
							</p>
						</div>
						<div>
							<p className="font-medium mb-1">Inventario</p>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{(char.inventory as string) || t("scenes.campaigns.characterTabs.emptyInventory")}
							</p>
						</div>
						<div>
							<p className="font-medium mb-1">Hechizos</p>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{(char.spells_known as string) || t("scenes.campaigns.characterTabs.noSpells")}
							</p>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="notas">
					<p className="text-sm text-muted-foreground whitespace-pre-wrap">
						{(char.notes as string) || t("scenes.campaigns.characterTabs.noNotes")}
					</p>
				</TabsContent>
			</Tabs>
		</div>
	);
}
