// ================================================
// Mis Campañas Scene
// ================================================
// List all campaigns where user is DM or player
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
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Users, Scroll, Bell } from "lucide-react";

export function MisCampanasScene() {
	const navigate = useNavigate();
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string>("");

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
			if (user) {
				setUserId(user.id);
			}

			// Load campaigns and invitations separately to avoid blocking
			const campaignsData = await listCampaigns();
			setCampaigns(campaignsData);

			// Load invitations, but don't fail if it errors
			try {
				const invitationsData = await listUserInvitations();
				setInvitations(invitationsData);
			} catch (invError) {
				console.warn("Error al cargar invitaciones:", invError);
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

			// Navigate to campaign editor
			navigate(`/editar-campana/${campaign.id}`);
		} catch (error: any) {
			console.error("Error completo al crear campaña:", error);
			const errorMsg = error instanceof Error ? error.message : "Error desconocido";
			alert(`Error al crear campaña: ${errorMsg}`);
		} finally {
			setCreateLoading(false);
		}
	};

	const handleDeleteCampaign = async (id: string) => {
		if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;

		try {
			await deleteCampaign(id);
			setCampaigns(campaigns.filter((c) => c.id !== id));
		} catch (error) {
			console.error("Error al eliminar campaña:", error);
			alert("Error al eliminar campaña");
		}
	};

	const handleAcceptInvitation = async (token: string) => {
		try {
			await acceptInvitation(token);
			setInvitations(invitations.filter((inv) => inv.token !== token));
			await loadData(); // Reload campaigns
		} catch (error) {
			console.error("Error al aceptar invitación:", error);
			alert("Error al aceptar invitación");
		}
	};

	const handleRejectInvitation = async (token: string) => {
		try {
			await rejectInvitation(token);
			setInvitations(invitations.filter((inv) => inv.token !== token));
		} catch (error) {
			console.error("Error al rechazar invitación:", error);
			alert("Error al rechazar invitación");
		}
	};

	const isDM = (campaign: Campaign) => campaign.dm_id === userId;

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
									<label className="text-sm font-medium">
										Título *
									</label>
									<Input
										value={newCampaign.title}
										onChange={(e) =>
											setNewCampaign({
												...newCampaign,
												title: e.target.value,
											})
										}
										placeholder="Ej: La Mina Perdida de Phandelver"
									/>
								</div>
								<div>
									<label className="text-sm font-medium">
										Descripción
									</label>
									<Textarea
										value={newCampaign.description}
										onChange={(e) =>
											setNewCampaign({
												...newCampaign,
												description: e.target.value,
											})
										}
										placeholder="Descripción de la campaña..."
										rows={3}
									/>
								</div>
								<div>
									<label className="text-sm font-medium">
										Notas Privadas (DM)
									</label>
									<Textarea
										value={newCampaign.notes}
										onChange={(e) =>
											setNewCampaign({
												...newCampaign,
												notes: e.target.value,
											})
										}
										placeholder="Notas privadas del DM..."
										rows={3}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setCreateOpen(false)}
								>
									Cancelar
								</Button>
								<Button
									onClick={handleCreateCampaign}
									disabled={createLoading}
								>
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
											onClick={() =>
												handleAcceptInvitation(invitation.token)
											}
										>
											Aceptar
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												handleRejectInvitation(invitation.token)
											}
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
						<h3 className="text-lg font-semibold mb-2">
							No tienes campañas aún
						</h3>
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
						{campaigns.map((campaign) => (
							<Card
								key={campaign.id}
								className="hover:shadow-lg transition-shadow cursor-pointer"
								onClick={() =>
									navigate(`/editar-campana/${campaign.id}`)
								}
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<CardTitle className="text-xl">
											{campaign.title}
										</CardTitle>
										{isDM(campaign) && (
											<Badge variant="default">DM</Badge>
										)}
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
											{new Date(
												campaign.created_at
											).toLocaleDateString()}
										</span>
									</div>
								</CardContent>
								{isDM(campaign) && (
									<CardFooter className="flex gap-2">
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
									</CardFooter>
								)}
							</Card>
						))}
					</div>
				)}
			</div>
		</ProfileLayout>
	);
}
