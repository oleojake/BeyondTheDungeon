// ================================================
// Editar Campaña Scene (PARTE 1 DE 2)
// ================================================
// Campaign editor for Dungeon Masters
// Includes: campaign details, invitations, chapters, scenes
// ================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RichTextEditor, FormattedText } from "@/components/rich-text-editor";
import {
	getCampaign,
	updateCampaign,
	listCampaignMembers,
	removeCampaignMember,
	type Campaign,
	type CampaignMember,
} from "@/core/api/campaign.service";
import {
	createInvitation,
} from "@/core/api/campaign-invitation.service";
import {
	listChapters,
	createChapter,
	updateChapter,
	deleteChapter,
	type Chapter,
} from "@/core/api/chapter.service";
import {
	listScenes,
	createScene,
	updateScene,
	deleteScene,
	type Scene,
} from "@/core/api/scene.service";
import {
	listSceneEntities,
	createSceneEntity,
	deleteSceneEntity,
	type SceneEntity,
} from "@/core/api/scene-entity.service";
import { supabase } from "@/lib/supabase";
import { fetchBestiary, fetchItems, fetchSpells, type Monster, type Item, type Spell } from "@/core/api/backend.service";
import {
	getCampaignSession,
	startSession,
	type GameSession,
} from "@/core/api/game-session.service";
import {
	Save,
	Users,
	Mail,
	Trash2,
	Plus,
	BookOpen,
	FileText,
	Map,
	Skull,
	Wand2,
	Package,
	Play,
	RotateCcw,
	UserPlus,
} from "lucide-react";

export function EditarCampanaScene() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [members, setMembers] = useState<CampaignMember[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [scenes, setScenes] = useState<Record<string, Scene[]>>({});
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string>("");
	const [isDM, setIsDM] = useState(false);
	const [sessionStatus, setSessionStatus] = useState<GameSession | null>(null);
	const [startingSession, setStartingSession] = useState(false);

	// Edit states
	const [editedCampaign, setEditedCampaign] = useState({
		title: "",
		description: "",
		notes: "",
	});
	const [inviteUsername, setInviteUsername] = useState("");
	const [inviteLoading, setInviteLoading] = useState(false);

	// Chapter/Scene dialogs
	const [chapterDialog, setChapterDialog] = useState(false);
	const [sceneDialog, setSceneDialog] = useState(false);
	const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
	const [editingScene, setEditingScene] = useState<Scene | null>(null);
	const [currentChapterId, setCurrentChapterId] = useState<string>("");

	const [chapterForm, setChapterForm] = useState({
		title: "",
		content: "",
		order_index: 0,
	});
	const [sceneForm, setSceneForm] = useState({
		title: "",
		content: "",
		narration_text: "",
		dm_notes: "",
		battle_map_id: null as string | null,
		order_index: 0,
	});

	// Entity management
	const [entityDialog, setEntityDialog] = useState(false);
	const [currentSceneId, setCurrentSceneId] = useState<string>("");
	const [sceneEntities, setSceneEntities] = useState<Record<string, SceneEntity[]>>({});
	const [entityForm, setEntityForm] = useState({
		entity_type: "monster" as "monster" | "item" | "spell" | "npc" | "map",
		entity_id: "",
		entity_name: "",
		alias: "",
		notes: "",
		battle_map_id: null as string | null,
	});
	const [selectedEntity, setSelectedEntity] = useState<{
		id: string;
		name: string;
		entityType: "monster" | "item" | "spell";
		data: Record<string, unknown>;
	} | null>(null); // Store full entity data from compendium
	const [availableMaps, setAvailableMaps] = useState<Array<{id: string; name: string}>>([]);
	const [loadingMaps, setLoadingMaps] = useState(false);

	// Inline compendium search
	const [entitySearch, setEntitySearch] = useState("");
	const [entitySearchLoading, setEntitySearchLoading] = useState(false);
	const [compendiumCache, setCompendiumCache] = useState<{
		monster?: Monster[];
		item?: Item[];
		spell?: Spell[];
	}>({});

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// Load maps when dialog opens and type is map
	useEffect(() => {
		if (entityDialog && entityForm.entity_type === "map") {
			loadAvailableMaps();
		}
	}, [entityDialog, entityForm.entity_type]);

	// Handle entity selection from compendium (via location state)
	useEffect(() => {
		const checkForSelectedEntity = () => {
			const state = window.history.state?.usr;
			if (state?.selectedEntity && state?.sceneId) {
				setCurrentSceneId(state.sceneId);
				setSelectedEntity(state.selectedEntity);
				setEntityForm({
					...entityForm,
					entity_type: state.selectedEntity.entityType,
					entity_id: state.selectedEntity.id,
					entity_name: state.selectedEntity.name,
				});
				setEntityDialog(true);
				// Clear the state
				window.history.replaceState({}, document.title);
			}
		};
		checkForSelectedEntity();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadData = async () => {
		if (!id) return;

		setLoading(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}

			const [campaignData, membersData, chaptersData] =
				await Promise.all([
					getCampaign(id),
					listCampaignMembers(id),
					listChapters(id),
				]);

			setCampaign(campaignData);
			setEditedCampaign({
				title: campaignData.title,
				description: campaignData.description || "",
				notes: campaignData.notes || "",
			});
			setMembers(membersData);
			setChapters(chaptersData);
			setIsDM(campaignData.dm_id === user?.id);

			// Load active/paused session for this campaign
			try {
				const sess = await getCampaignSession(id);
				setSessionStatus(sess);
			} catch {
				// non-critical
			}

			// Load scenes for each chapter
			const scenesData: Record<string, Scene[]> = {};
			const entitiesData: Record<string, SceneEntity[]> = {};

			for (const chapter of chaptersData) {
				const chapterScenes = await listScenes(chapter.id);
				scenesData[chapter.id] = chapterScenes;

				// Load entities for each scene
				for (const scene of chapterScenes) {
					const entities = await listSceneEntities(scene.id);
					entitiesData[scene.id] = entities;
				}
			}

			setScenes(scenesData);
			setSceneEntities(entitiesData);
		} catch (error) {
			console.error("Error al cargar campaña:", error);
			alert("Error al cargar campaña");
			navigate("/profile/campanas");
		} finally {
			setLoading(false);
		}
	};

	const handleStartSession = async () => {
		if (!id || !isDM) return;
		setStartingSession(true);
		try {
			await startSession(id);
			navigate(`/partida/${id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Error";
			alert(`Error al iniciar sesión: ${msg}`);
			setStartingSession(false);
		}
	};

	const handleSaveCampaign = async () => {
		if (!id || !isDM) return;

		try {
			const updated = await updateCampaign(id, editedCampaign);
			setCampaign(updated);
			alert("Campaña actualizada correctamente");
		} catch (error) {
			console.error("Error al guardar campaña:", error);
			alert("Error al guardar campaña");
		}
	};

	const handleInvitePlayer = async () => {
		if (!id || !inviteUsername.trim()) return;

		setInviteLoading(true);
		try {
			await createInvitation(id, { username: inviteUsername });
			setInviteUsername("");
			const updatedMembers = await listCampaignMembers(id);
			setMembers(updatedMembers);
			alert("Jugador añadido a la campaña correctamente");
		} catch (error) {
			console.error("Error al añadir jugador:", error);
			const errorMsg = error instanceof Error ? error.message : "Error al añadir jugador";
			alert(errorMsg);
		} finally {
			setInviteLoading(false);
		}
	};

	const handleRemoveMember = async (userId: string) => {
		if (!id || !confirm("¿Eliminar este jugador?")) return;

		try {
			await removeCampaignMember(id, userId);
			setMembers(members.filter((m) => m.user_id !== userId));
		} catch (error) {
			console.error("Error al eliminar miembro:", error);
			alert("Error al eliminar miembro");
		}
	};

	const handleSaveChapter = async () => {
		if (!id) return;

		try {
			if (editingChapter) {
				const updated = await updateChapter(editingChapter.id, chapterForm);
				setChapters(
					chapters.map((c) => (c.id === updated.id ? updated : c))
				);
			} else {
				const newChapter = await createChapter(id, chapterForm);
				setChapters([...chapters, newChapter]);
				setScenes({ ...scenes, [newChapter.id]: [] });
			}
			setChapterDialog(false);
			setEditingChapter(null);
			setChapterForm({ title: "", content: "", order_index: 0 });
		} catch (error) {
			console.error("Error al guardar capítulo:", error);
			alert("Error al guardar capítulo");
		}
	};

	const handleDeleteChapter = async (chapterId: string) => {
		if (!confirm("¿Eliminar este capítulo y todas sus escenas?")) return;

		try {
			await deleteChapter(chapterId);
			setChapters(chapters.filter((c) => c.id !== chapterId));
			const newScenes = { ...scenes };
			delete newScenes[chapterId];
			setScenes(newScenes);
		} catch (error) {
			console.error("Error al eliminar capítulo:", error);
			alert("Error al eliminar capítulo");
		}
	};

	const handleOpenSceneDialog = (chapterId: string, scene?: Scene) => {
		setCurrentChapterId(chapterId);
		if (scene) {
			setEditingScene(scene);
			setSceneForm({
				title: scene.title,
				content: scene.content || "",
				narration_text: scene.narration_text || "",
				dm_notes: scene.dm_notes || "",
				battle_map_id: scene.battle_map_id || null,
				order_index: scene.order_index,
			});
		} else {
			setEditingScene(null);
			setSceneForm({
				title: "",
				content: "",
				narration_text: "",
				dm_notes: "",
				battle_map_id: null,
				order_index: 0,
			});
		}
		setSceneDialog(true);
	};

	const handleSaveScene = async () => {
		if (!currentChapterId) return;

		try {
			// Clean up data before sending
			const sceneData = {
				...sceneForm,
				battle_map_id: sceneForm.battle_map_id || null,
			};

			if (editingScene) {
				const updated = await updateScene(editingScene.id, sceneData);
				setScenes({
					...scenes,
					[currentChapterId]: scenes[currentChapterId].map((s) =>
						s.id === updated.id ? updated : s
					),
				});
			} else {
				const newScene = await createScene(currentChapterId, sceneData);
				setScenes({
					...scenes,
					[currentChapterId]: [...(scenes[currentChapterId] || []), newScene],
				});
				setSceneEntities({ ...sceneEntities, [newScene.id]: [] });
			}
			setSceneDialog(false);
			setEditingScene(null);
			setCurrentChapterId("");
		} catch (error) {
			console.error("Error al guardar escena:", error);
			alert("Error al guardar escena");
		}
	};

	const handleDeleteScene = async (chapterId: string, sceneId: string) => {
		if (!confirm("¿Eliminar esta escena?")) return;

		try {
			await deleteScene(sceneId);
			setScenes({
				...scenes,
				[chapterId]: scenes[chapterId].filter((s) => s.id !== sceneId),
			});
			const newEntities = { ...sceneEntities };
			delete newEntities[sceneId];
			setSceneEntities(newEntities);
		} catch (error) {
			console.error("Error al eliminar escena:", error);
			alert("Error al eliminar escena");
		}
	};

	const handleAddEntity = async () => {
		// Validate based on entity type
		if (!currentSceneId) return;
		
		if (entityForm.entity_type === "npc") {
			if (!entityForm.entity_name) {
				alert("Por favor, ingresa el nombre del NPC");
				return;
			}
		} else if (entityForm.entity_type === "map") {
			if (!entityForm.entity_id || !entityForm.entity_name) {
				alert("Por favor, selecciona un mapa");
				return;
			}
		} else {
			// monster, item, spell - require selection
			if (!selectedEntity || !entityForm.entity_id) {
				alert("Por favor, selecciona una entidad del compendio");
				return;
			}
		}

		try {
			// For NPCs, generate ID from name
			const finalEntityId = entityForm.entity_type === "npc" 
				? entityForm.entity_name.toLowerCase().replace(/\s+/g, '-')
				: entityForm.entity_id;
			
			// Determine final name based on entity type
			let finalEntityName: string;
			if (entityForm.entity_type === "npc" || entityForm.entity_type === "map") {
				// NPCs and maps use entity_name directly (no alias support)
				finalEntityName = entityForm.entity_name;
			} else {
				// monster, item, spell - use alias if provided, otherwise entity_name
				finalEntityName = entityForm.alias.trim() || entityForm.entity_name;
			}

			const entity = await createSceneEntity(currentSceneId, {
				entity_type: entityForm.entity_type,
				entity_id: finalEntityId,
				entity_name: finalEntityName,
				entity_data: selectedEntity?.data,
			});

			setSceneEntities({
				...sceneEntities,
				[currentSceneId]: [
					...(sceneEntities[currentSceneId] || []),
					entity,
				],
			});
			
			// Reset form
			setEntityDialog(false);
			setEntityForm({
				entity_type: "monster",
				entity_id: "",
				entity_name: "",
				alias: "",
				notes: "",
				battle_map_id: null,
			});
			setSelectedEntity(null);
			setAvailableMaps([]);
		} catch (error) {
			console.error("Error al añadir entidad:", error);
			const msg = error instanceof Error ? error.message : "Error al añadir entidad";
			alert(msg);
		}
	};

	const loadAvailableMaps = async () => {
		setLoadingMaps(true);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setAvailableMaps([]);
				setLoadingMaps(false);
				return;
			}

			const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
			const response = await fetch(`${API_URL}/api/battle-maps`, {
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				console.error("Error al cargar mapas");
				setAvailableMaps([]);
			} else {
				const result = await response.json();
				setAvailableMaps(result.maps || []);
			}
		} catch (error) {
			console.error("Error al cargar mapas:", error);
			setAvailableMaps([]);
		} finally {
			setLoadingMaps(false);
		}
	};

	const handleDeleteEntity = async (sceneId: string, entityId: string) => {
		if (!confirm("¿Eliminar esta entidad?")) return;

		try {
			await deleteSceneEntity(entityId);
			setSceneEntities({
				...sceneEntities,
				[sceneId]: sceneEntities[sceneId].filter((e) => e.id !== entityId),
			});
		} catch (error) {
			console.error("Error al eliminar entidad:", error);
			alert("Error al eliminar entidad");
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<Skeleton className="h-10 w-64 mb-8" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (!campaign || !isDM) {
		return (
			<div className="container mx-auto p-6 max-w-7xl text-center">
				<h2 className="text-2xl font-bold mb-4">
					No tienes acceso a esta campaña
				</h2>
				<Button onClick={() => navigate("/profile/campanas")}>
					Volver a Mis Campañas
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{campaign.title}
						</h1>
						<p className="text-muted-foreground mt-1">
							{isDM ? "Editar campaña como Dungeon Master" : "Información de la campaña"}
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => navigate("/profile/campanas")}>
							Volver
						</Button>
						{isDM && (
							<>
								{sessionStatus?.status === "active" ? (
									<Button
										variant="default"
										className="bg-green-600 hover:bg-green-700 text-white"
										onClick={() => navigate(`/partida/${id}`)}
									>
										<Play className="mr-2 h-4 w-4" />
										Ir a la partida activa
									</Button>
								) : (
									<Button
										variant="default"
										className="bg-blue-600 hover:bg-blue-700 text-white"
										disabled={startingSession}
										onClick={handleStartSession}
									>
										{sessionStatus?.status === "paused" ? (
											<>
												<RotateCcw className="mr-2 h-4 w-4" />
												{startingSession ? "Reanudando..." : "Reanudar campaña"}
											</>
										) : (
											<>
												<Play className="mr-2 h-4 w-4" />
												{startingSession ? "Iniciando..." : "Comenzar campaña"}
											</>
										)}
									</Button>
								)}
								<Button onClick={handleSaveCampaign}>
									<Save className="mr-2 h-4 w-4" />
									Guardar Cambios
								</Button>
							</>
						)}
					</div>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="general" className="space-y-6">
					{isDM ? (
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="general">General</TabsTrigger>
							<TabsTrigger value="players">Jugadores</TabsTrigger>
							<TabsTrigger value="content">Capítulos y Escenas</TabsTrigger>
						</TabsList>
					) : (
						<TabsList className="grid w-full grid-cols-1">
							<TabsTrigger value="general">General</TabsTrigger>
						</TabsList>
					)}

					{/* General Tab */}
					<TabsContent value="general" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Información General</CardTitle>
								<CardDescription>
									{isDM ? "Datos básicos de la campaña" : "Información de la campaña en la que participas"}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-foreground">Título</label>
									{isDM ? (
										<Input
											value={editedCampaign.title}
											onChange={(e) =>
												setEditedCampaign({
													...editedCampaign,
													title: e.target.value,
												})
											}
										/>
									) : (
										<div className="p-3 border rounded-md bg-muted/30">
											{campaign?.title}
										</div>
									)}
								</div>
								{isDM && (
									<>
										<div>
											<label className="text-sm font-medium text-foreground">
												Descripción
											</label>
											<Textarea
												value={editedCampaign.description}
												onChange={(e) =>
													setEditedCampaign({
														...editedCampaign,
														description: e.target.value,
													})
												}
												rows={4}
												placeholder="Descripción de la campaña..."
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-foreground">
												Notas Privadas (DM)
											</label>
											<Textarea
												value={editedCampaign.notes}
												onChange={(e) =>
													setEditedCampaign({
														...editedCampaign,
														notes: e.target.value,
													})
												}
												rows={6}
												placeholder="Notas privadas del DM..."
											/>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Players Tab - Only for DM */}
					{isDM && (
						<TabsContent value="players" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Añadir Jugadores
								</CardTitle>
								<CardDescription>
								Añade jugadores a tu campaña por nombre de usuario
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex gap-2">
								<Input
									type="text"
									placeholder="nombre_usuario"
									value={inviteUsername}
									onChange={(e) => setInviteUsername(e.target.value)}
									style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", textTransform: "none" }}
								/>
								<Button
									onClick={handleInvitePlayer}
									disabled={inviteLoading || !inviteUsername.trim()}
									>
										<UserPlus className="mr-2 h-4 w-4" />
										Añadir Jugador
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Miembros de la Campaña ({members.length})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{members.map((member) => (
										<div
											key={member.id}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div>
												<div className="font-medium">
													{member.username || member.email || "Usuario"}
												</div>
												<div className="text-sm text-muted-foreground">
													{member.role === "dm" ? "Dungeon Master" : "Jugador"}
												</div>
											</div>
											{member.user_id !== userId && (
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleRemoveMember(member.user_id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					)}

					{/* Content Tab - Only for DM */}
					{isDM && (
						<TabsContent value="content" className="space-y-6">
						<div className="flex justify-between items-center">
							<h2 className="text-2xl font-bold">Capítulos y Escenas</h2>
							<Button
								onClick={() => {
									setEditingChapter(null);
									setChapterForm({ title: "", content: "", order_index: chapters.length });
									setChapterDialog(true);
								}}
							>
								<Plus className="mr-2 h-4 w-4" />
								Nuevo Capítulo
							</Button>
						</div>

						{chapters.length === 0 ? (
							<Card>
								<CardContent className="py-12 text-center">
									<BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										No hay capítulos aún
									</h3>
									<p className="text-muted-foreground mb-4">
										Crea el primer capítulo para organizar tu campaña
									</p>
								</CardContent>
							</Card>
						) : (
							<Accordion type="single" collapsible className="space-y-4">
								{chapters.map((chapter) => (
									<AccordionItem
										key={chapter.id}
										value={chapter.id}
										className="border rounded-lg px-4"
									>
										<AccordionTrigger className="hover:no-underline">
											<div className="flex items-center gap-3 flex-1">
												<BookOpen className="h-5 w-5 text-primary" />
												<div className="text-left">
													<div className="font-semibold">{chapter.title}</div>
													<div className="text-sm text-muted-foreground">
														{scenes[chapter.id]?.length || 0} escenas
													</div>
												</div>
											</div>
										</AccordionTrigger>
										<AccordionContent className="space-y-4 pt-4">
											{/* Chapter Content */}
											{chapter.content && (
												<div className="border rounded-lg p-4 bg-muted/30">
													<FormattedText text={chapter.content} />
												</div>
											)}

											{/* Chapter Actions */}
											<div className="flex gap-2 border-t pt-4">
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														setEditingChapter(chapter);
														setChapterForm({
															title: chapter.title,
															content: chapter.content || "",
															order_index: chapter.order_index,
														});
														setChapterDialog(true);
													}}
												>
													Editar Capítulo
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleOpenSceneDialog(chapter.id)}
												>
													<Plus className="mr-2 h-4 w-4" />
													Nueva Escena
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleDeleteChapter(chapter.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											{/* Scenes List */}
											<div className="space-y-3 pl-4 border-l-2">
												{scenes[chapter.id]?.map((scene) => (
													<Card key={scene.id} className="overflow-hidden">
														<CardHeader className="pb-3">
															<div className="flex items-start justify-between">
																<div className="flex items-center gap-2">
																	<FileText className="h-4 w-4 text-primary" />
																	<CardTitle className="text-lg">
																		{scene.title}
																	</CardTitle>
																</div>
																<div className="flex gap-1">
																	<Button
																		size="sm"
																		variant="ghost"
																		onClick={() =>
																			handleOpenSceneDialog(
																				chapter.id,
																				scene
																			)
																		}
																	>
																		Editar
																	</Button>
																	<Button
																		size="sm"
																		variant="ghost"
																		onClick={() =>
																			handleDeleteScene(
																				chapter.id,
																				scene.id
																			)
																		}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														</CardHeader>
														<CardContent className="space-y-3">
															{/* Narration */}
															{scene.narration_text && (
																<div>
																	<div className="text-xs font-semibold text-muted-foreground mb-1">
																		NARRACIÓN:
																	</div>
																	<div className="border-l-4 border-primary pl-3 bg-primary/5">
																		<FormattedText
																			text={scene.narration_text}
																		/>
																	</div>
																</div>
															)}

															{/* DM Notes */}
															{scene.dm_notes && (
																<div>
																	<div className="text-xs font-semibold text-muted-foreground mb-1">
																		NOTAS DM:
																	</div>
																	<div className="text-sm text-muted-foreground italic">
																		{scene.dm_notes}
																	</div>
																</div>
															)}

															{/* Battle Map */}
															{scene.battle_map_id && (
																<div className="flex items-center gap-2 text-sm">
																	<Map className="h-4 w-4" />
																	<span>Mapa de batalla asociado</span>
																</div>
															)}

															{/* Entities */}
															{sceneEntities[scene.id]?.length > 0 && (
																<div>
																	<div className="flex items-center justify-between mb-2">
																		<div className="text-xs font-semibold text-muted-foreground">
																			ENTIDADES:
																		</div>
																	</div>
																	<div className="flex flex-wrap gap-2">
																		{sceneEntities[scene.id].map((entity) => (
																			<Badge
																				key={entity.id}
																				variant="secondary"
																				className="gap-1"
																			>
																				{entity.entity_type === "monster" && (
																					<Skull className="h-3 w-3" />
																				)}
																				{entity.entity_type === "item" && (
																					<Package className="h-3 w-3" />
																				)}
																				{entity.entity_type === "spell" && (
																					<Wand2 className="h-3 w-3" />
																				)}
																				{entity.entity_name}
																				<button
																					onClick={() =>
																						handleDeleteEntity(
																							scene.id,
																							entity.id
																						)
																					}
																					className="ml-1 hover:text-destructive"
																				>
																					×
																				</button>
																			</Badge>
																		))}
																	</div>
																</div>
															)}

															<Button
																size="sm"
																variant="outline"
																onClick={() => {
																	setCurrentSceneId(scene.id);
																	setEntityDialog(true);
																}}
															>
																<Plus className="mr-2 h-3 w-3" />
																Añadir Entidad
															</Button>
														</CardContent>
													</Card>
												))}
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						)}
					</TabsContent>
					)}
				</Tabs>

				{/* Chapter Dialog */}
				<Dialog open={chapterDialog} onOpenChange={setChapterDialog}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								{editingChapter ? "Editar Capítulo" : "Nuevo Capítulo"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div>
								<label className="text-sm font-medium text-foreground">Título</label>
								<Input
									value={chapterForm.title}
									onChange={(e) =>
										setChapterForm({ ...chapterForm, title: e.target.value })
									}
									placeholder="Título del capítulo"
								/>
							</div>
							<RichTextEditor
								label="Contenido"
								value={chapterForm.content}
								onChange={(content) =>
									setChapterForm({ ...chapterForm, content })
								}
								placeholder="Describe el capítulo, objetivos, etc."
							/>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setChapterDialog(false)}>
								Cancelar
							</Button>
							<Button onClick={handleSaveChapter}>
								{editingChapter ? "Actualizar" : "Crear"} Capítulo
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Scene Dialog */}
				<Dialog open={sceneDialog} onOpenChange={setSceneDialog}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingScene ? "Editar Escena" : "Nueva Escena"}
							</DialogTitle>
							<DialogDescription>
								Las escenas contienen la narración, notas del DM y entidades
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div>
								<label className="text-sm font-medium text-foreground">Título</label>
								<Input
									value={sceneForm.title}
									onChange={(e) =>
										setSceneForm({ ...sceneForm, title: e.target.value })
									}
									placeholder="Título de la escena"
								/>
							</div>
							<RichTextEditor
								label="Texto de Narración (para los jugadores)"
								value={sceneForm.narration_text}
								onChange={(narration_text) =>
									setSceneForm({ ...sceneForm, narration_text })
								}
								placeholder="Texto que narrarás a los jugadores. Usa **negrita** para énfasis y > para diálogos"
							/>
							<div>
								<label className="text-sm font-medium text-foreground">Notas del DM (privadas)</label>
								<Textarea
									value={sceneForm.dm_notes}
									onChange={(e) => {
										setSceneForm({ ...sceneForm, dm_notes: e.target.value });
										// Auto-resize
										e.target.style.height = 'auto';
										e.target.style.height = e.target.scrollHeight + 'px';
									}}
									placeholder="Notas privadas, recordatorios, etc."
									className="min-h-[100px] resize-none overflow-hidden"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setSceneDialog(false)}>
								Cancelar
							</Button>
							<Button onClick={handleSaveScene}>
								{editingScene ? "Actualizar" : "Crear"} Escena
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Entity Dialog */}
				<Dialog open={entityDialog} onOpenChange={setEntityDialog}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Añadir Entidad a la Escena</DialogTitle>
							<DialogDescription>
								Asocia monstruos, objetos, hechizos, NPCs y mapas de batalla a esta escena
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div>
								<label className="text-sm font-medium text-foreground">Tipo de Entidad</label>
								<Select
									value={entityForm.entity_type}
									onValueChange={(value: "monster" | "item" | "spell" | "npc" | "map") => {
										setEntityForm({ 
											...entityForm, 
											entity_type: value, 
											entity_id: "", 
											entity_name: "",
											alias: "",
											notes: ""
										});
										setSelectedEntity(null);
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monster">Monstruo</SelectItem>
										<SelectItem value="item">Objeto</SelectItem>
										<SelectItem value="spell">Hechizo</SelectItem>
										<SelectItem value="npc">NPC</SelectItem>
										<SelectItem value="map">Mapa de Batalla</SelectItem>
									</SelectContent>
								</Select>
							</div>

{/* Inline compendium search */}
					{(entityForm.entity_type === "monster" || entityForm.entity_type === "item" || entityForm.entity_type === "spell") && !selectedEntity && (
						<InlineCompendiumSearch
							type={entityForm.entity_type}
							search={entitySearch}
							onSearchChange={setEntitySearch}
							loading={entitySearchLoading}
							cache={compendiumCache}
							onCacheUpdate={(type, data) => setCompendiumCache(prev => ({ ...prev, [type]: data }))}
							onLoadingChange={setEntitySearchLoading}
							onSelect={(entity) => {
								setSelectedEntity(entity);
								setEntityForm(prev => ({ ...prev, entity_id: entity.id, entity_name: entity.name }));
								setEntitySearch("");
							}}
						/>
							)}

							{/* Show selected entity card */}
							{selectedEntity && (
								<div className="border rounded-md p-4 bg-card">
									<div className="flex items-start justify-between mb-2">
										<div>
											<h4 className="font-semibold text-foreground">{selectedEntity.name}</h4>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setSelectedEntity(null);
												setEntityForm({
													...entityForm,
													entity_id: "",
													entity_name: "",
													alias: "",
												});
											}}
										>
											Cambiar
										</Button>
									</div>
									{/* Show compact preview based on type */}
									{selectedEntity.entityType === "monster" && (
										<div className="text-sm space-y-1 text-muted-foreground">
											{Boolean(selectedEntity.data?.size) && <p>Tamaño: {String(selectedEntity.data.size)}</p>}
											{selectedEntity.data?.challenge_rating !== undefined && (
												<p>CR: {String(selectedEntity.data.challenge_rating)}</p>
											)}
										</div>
									)}
									{selectedEntity.entityType === "spell" && (
										<div className="text-sm space-y-1 text-muted-foreground">
											{selectedEntity.data?.level !== undefined && (
												<p>Nivel: {selectedEntity.data.level === 0 ? "Truco" : String(selectedEntity.data.level)}</p>
											)}
											{Boolean(selectedEntity.data?.school) && (
												<p>Escuela: {typeof selectedEntity.data.school === 'object' ? String((selectedEntity.data.school as {name?: string})?.name || '') : String(selectedEntity.data.school)}</p>
											)}
										</div>
									)}
								</div>
							)}

							{/* NPC fields */}
							{entityForm.entity_type === "npc" && (
								<div className="space-y-3">
									<div>
										<label className="text-sm font-medium text-foreground">Nombre del NPC</label>
										<Input
											value={entityForm.entity_name}
											onChange={(e) =>
												setEntityForm({ 
													...entityForm, 
													entity_name: e.target.value, 
													entity_id: e.target.value.toLowerCase().replace(/\s+/g, '-') 
												})
											}
											placeholder="ej: Rey Arturo, Tabernero, Mago Oscuro"
										/>
									</div>
									<div>
										<label className="text-sm font-medium text-foreground">Notas (opcional)</label>
										<Textarea
											value={entityForm.notes}
											onChange={(e) => setEntityForm({ ...entityForm, notes: e.target.value })}
											placeholder="Descripción, motivaciones, estadísticas..."
											className="min-h-[100px]"
										/>
									</div>
								</div>
							)}

							{/* Map selector */}
							{entityForm.entity_type === "map" && (
								<div>
									<label className="text-sm font-medium text-foreground">Seleccionar Mapa</label>
									<Select
										value={entityForm.entity_id}
										onValueChange={(value) => {
											const selectedMap = availableMaps.find(m => m.id === value);
											setEntityForm({
												...entityForm,
												entity_id: value,
												entity_name: selectedMap?.name || "",
											});
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Elige un mapa..." />
										</SelectTrigger>
										<SelectContent>
											{loadingMaps ? (
												<div className="p-2 text-sm text-muted-foreground">Cargando mapas...</div>
											) : availableMaps.length === 0 ? (
												<div className="p-2 text-sm text-muted-foreground">No tienes mapas creados</div>
											) : (
												availableMaps.map((map) => (
													<SelectItem key={map.id} value={map.id}>
														{map.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Alias field for selected DB entities */}
							{selectedEntity && (entityForm.entity_type === "monster" || entityForm.entity_type === "item" || entityForm.entity_type === "spell") && (
								<div>
									<label className="text-sm font-medium text-foreground">
										Alias/Nombre Personalizado (opcional)
									</label>
									<Input
										value={entityForm.alias}
										onChange={(e) => setEntityForm({ ...entityForm, alias: e.target.value })}
										placeholder={`Por defecto: ${selectedEntity.name}`}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Deja en blanco para usar el nombre original
									</p>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => {
								setEntityDialog(false);
								setSelectedEntity(null);
								setEntityForm({
									entity_type: "monster",
									entity_id: "",
									entity_name: "",
									alias: "",
									notes: "",
									battle_map_id: null,
								});
							}}>
								Cancelar
							</Button>
							<Button 
								onClick={handleAddEntity}
								disabled={
									(entityForm.entity_type === "npc" && !entityForm.entity_name) ||
									(entityForm.entity_type === "map" && !entityForm.entity_id) ||
									((entityForm.entity_type === "monster" || entityForm.entity_type === "item" || entityForm.entity_type === "spell") && !selectedEntity)
								}
							>
								Añadir Entidad
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// InlineCompendiumSearch — buscador inline para el diálogo de entidades
// ─────────────────────────────────────────────────────────────────────────────
interface InlineCompendiumSearchProps {
	type: "monster" | "item" | "spell";
	search: string;
	onSearchChange: (v: string) => void;
	loading: boolean;
	cache: { monster?: Monster[]; item?: Item[]; spell?: Spell[] };
	onCacheUpdate: (type: "monster" | "item" | "spell", data: Monster[] | Item[] | Spell[]) => void;
	onLoadingChange: (v: boolean) => void;
	onSelect: (entity: { id: string; name: string; entityType: "monster" | "item" | "spell"; data: Record<string, unknown> }) => void;
}

function InlineCompendiumSearch({
	type, search, onSearchChange, loading, cache, onCacheUpdate, onLoadingChange, onSelect,
}: InlineCompendiumSearchProps) {
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		if (cache[type]) return; // already loaded
		onLoadingChange(true);
		const loader =
			type === "monster" ? fetchBestiary().then(r => r.characters) :
			type === "item"    ? fetchItems().then(r => r.items) :
			                     fetchSpells().then(r => r.spells);
		loader
			.then(data => { onCacheUpdate(type, data as Monster[] & Item[] & Spell[]); })
			.catch(console.error)
			.finally(() => onLoadingChange(false));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	const list = (cache[type] ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
	const filtered = search.trim().length > 0
		? list.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
		: list;
	const showList = focused && !loading;

	const placeholder =
		type === "monster" ? "Busca un monstruo…" :
		type === "item"    ? "Busca un objeto…" :
		                     "Busca un hechizo…";

	return (
		<div>
			<div className="relative">
				<Input
					value={search}
					onChange={e => onSearchChange(e.target.value)}
					onFocus={() => setFocused(true)}
					onBlur={() => setTimeout(() => setFocused(false), 150)}
					placeholder={loading ? "Cargando compendio…" : placeholder}
					disabled={loading}
					autoFocus
				/>
			</div>
			{showList && (
				<div className="mt-2 border rounded-md overflow-y-auto max-h-56 bg-background">
					{filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground p-3">Sin resultados</p>
					) : (
						filtered.map(e => (
							<button
								key={e.id}
								type="button"
								onClick={() => onSelect({
									id: e.id,
									name: e.name,
									entityType: type,
									data: e as unknown as Record<string, unknown>,
								})}
								className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between group"
							>
								<span>{e.name}</span>
								{type === "monster" && (
									<span className="flex items-center gap-2 text-xs text-muted-foreground">
										{(e as Monster).challenge_rating !== undefined && (
											<span>CR {(e as Monster).challenge_rating}</span>
										)}
										{(e as Monster).stats?.hit_points !== undefined && (
											<span className="text-red-400">{(e as Monster).stats.hit_points} HP</span>
										)}
									</span>
								)}
								{type === "item" && (
									<span className="text-xs text-muted-foreground">
										{(e as Item).armor_category ?? (e as Item).weapon_category ?? (typeof (e as Item).equipment_category === "object" ? (e as Item).equipment_category?.name : (e as Item).equipment_category)}
									</span>
								)}
								{type === "spell" && (
									<span className="text-xs text-muted-foreground">
										{(e as Spell).level === 0 ? "Truco" : `Nv. ${(e as Spell).level}`}
									</span>
								)}
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
}
