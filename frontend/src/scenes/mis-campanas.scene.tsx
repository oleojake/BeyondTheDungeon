// ================================================
// Mis Campañas Scene
// ================================================
// List all campaigns where user is DM or player.
// DM: can start/resume session → /partida/:id
// Player: if session active → /partida/:id ; else → character sheet modal
// ================================================

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

// ─── Character per campaign (for player view) ─────────────────────────────────

async function fetchCampaignCharacter(campaignId: string, userId: string) {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const API_URL = import.meta.env.VITE_API_URL || "";
	const res = await fetch(`${API_URL}/api/character-sheets?campaign=${campaignId}`, {
		headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
	});
	if (!res.ok) return null;
	const data = await res.json();
	if (!data.characters) return null;
	return (data.characters as { user_id: string; campaign_id: string }[]).find(
		(c) => c.user_id === userId && c.campaign_id === campaignId
	) ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MisCampanasScene() {
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
	} | null>(null);

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
			alert("El título es obligatorio");
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
		if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;
		try {
			await deleteCampaign(id);
			setCampaigns(campaigns.filter((c) => c.id !== id));
		} catch {
			alert("Error al eliminar campaña");
		}
	};

	const handleAcceptInvitation = async (token: string) => {
		try {
			await acceptInvitation(token);
			setInvitations(invitations.filter((inv) => inv.token !== token));
			await loadData();
		} catch {
			alert("Error al aceptar invitación");
		}
	};

	const handleRejectInvitation = async (token: string) => {
		try {
			await rejectInvitation(token);
			setInvitations(invitations.filter((inv) => inv.token !== token));
		} catch {
			alert("Error al rechazar invitación");
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

	// Player: if session active → join game; else → show character sheet
	const handlePlayerClickCampaign = async (campaign: Campaign) => {
		const sess = sessionMap[campaign.id];
		if (sess?.status === "active") {
			navigate(`/partida/${campaign.id}`);
			return;
		}
		// Load character for this campaign and show modal
		const char = await fetchCampaignCharacter(campaign.id, userId);
		setFichaModalData({ campaign, character: char as Record<string, unknown> | null });
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
			<div className="container mx-auto py-8 px-4 max-w-7xl">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
							<Scroll className="h-8 w-8" />
							Mis Campañas
						</h1>
						<p className="text-muted-foreground mt-1">
							Gestiona tus aventuras de D&D como DM o jugador
						</p>
					</div>
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button>
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
										placeholder="Ej: La Mina Perdida de Phandelver"
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Descripción</label>
									<Textarea
										value={newCampaign.description}
										onChange={(e) =>
											setNewCampaign({ ...newCampaign, description: e.target.value })
										}
										placeholder="Descripción de la campaña..."
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
										placeholder="Notas privadas del DM..."
										rows={3}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>
									Cancelar
								</Button>
								<Button onClick={handleCreateCampaign} disabled={createLoading}>
									{createLoading ? "Creando..." : "Crear Campaña"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Invitations */}
				{invitations.length > 0 && (
					<div className="mb-8">
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
											{campaign.description || "Sin descripción"}
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
																	? "Reanudando..."
																	: "Reanudar campaña"}
															</>
														) : (
															<>
																<Play className="h-3 w-3 mr-1" />
																{startingSession === campaign.id
																	? "Iniciando..."
																	: "Comenzar campaña"}
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
				onOpenChange={(o) => !o && setFichaModalData(null)}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{fichaModalData?.campaign.title} – Mi Personaje
						</DialogTitle>
						<DialogDescription>
							La partida aún no está en marcha. Consulta el estado de tu
							personaje.
						</DialogDescription>
					</DialogHeader>

					{fichaModalData?.character ? (
						<CharacterSummary char={fichaModalData.character} />
					) : (
						<div className="py-8 text-center text-muted-foreground">
							<User className="h-12 w-12 mx-auto mb-3 opacity-40" />
							<p>No tienes un personaje asignado a esta campaña todavía.</p>
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
							{ k: "current_hp", l: "HP Act." },
							{ k: "max_hp", l: "HP Máx" },
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
								{(char.equipment as string) || "Sin equipo registrado."}
							</p>
						</div>
						<div>
							<p className="font-medium mb-1">Inventario</p>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{(char.inventory as string) || "Inventario vacío."}
							</p>
						</div>
						<div>
							<p className="font-medium mb-1">Hechizos</p>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{(char.spells_known as string) || "Sin hechizos registrados."}
							</p>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="notas">
					<p className="text-sm text-muted-foreground whitespace-pre-wrap">
						{(char.notes as string) || "Sin notas."}
					</p>
				</TabsContent>
			</Tabs>
		</div>
	);
}
