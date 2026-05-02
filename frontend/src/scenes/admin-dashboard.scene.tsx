import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileTabs } from "@/components/profile-tabs";
import { supabase } from "@/lib/supabase";
import {
	Users,
	Scroll,
	Map,
	Shield,
	Activity,
	BookOpen,
	Wand2,
	Sword,
	TrendingUp,
	RefreshCw,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AdminStats {
	totalUsers: number;
	activeUsers: number; // Usuarios con sesión en los últimos 7 días
	totalCampaigns: number;
	activeCampaigns: number;
	totalCharacters: number;
	totalBattleMaps: number;
	totalSpells: number;
	totalMonsters: number;
	totalItems: number;
	recentUsers: RecentUser[];
	recentCampaigns: RecentCampaign[];
}

interface RecentUser {
	id: string;
	email: string | null;
	username: string | null;
	display_name: string | null;
	created_at: string;
	is_admin: boolean;
}

interface RecentCampaign {
	id: string;
	title: string;
	created_at: string;
	is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "";

async function fetchAdminStats(): Promise<AdminStats> {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const res = await fetch(`${API_URL}/api/admin/stats`, {
		headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || `Error ${res.status}`);
	}
	return res.json();
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
	icon: Icon,
	label,
	value,
	sub,
	color,
}: {
	icon: React.ElementType;
	label: string;
	value: number | string;
	sub?: string;
	color: string;
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
			<div
				className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
			>
				<Icon className="h-6 w-6 text-white" />
			</div>
			<div className="min-w-0">
				<p className="text-sm text-muted-foreground truncate">{label}</p>
				<p className="text-2xl font-bold tabular-nums leading-tight">{value}</p>
				{sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
			</div>
		</div>
	);
}

// ─── Tipos de confirmación ────────────────────────────────────────────────────

type ConfirmAction =
	| { type: "promote"; user: RecentUser }
	| { type: "delete"; user: RecentUser }
	| null;

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboardScene() {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
	const [actionLoading, setActionLoading] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const navigate = useNavigate();

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchAdminStats();
			setStats(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error desconocido");
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			const data = await fetchAdminStats();
			setStats(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error desconocido");
		} finally {
			setRefreshing(false);
		}
	};

	const handlePromote = async (userId: string) => {
		setActionLoading(true);
		setActionError(null);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const res = await fetch(`${API_URL}/api/admin/users/${userId}/promote`, {
				method: "PATCH",
				headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || `Error ${res.status}`);
			}
			setConfirmAction(null);
			// Refrescar stats para reflejar cambio de rol
			const data = await fetchAdminStats();
			setStats(data);
		} catch (e) {
			setActionError(e instanceof Error ? e.message : "Error desconocido");
		} finally {
			setActionLoading(false);
		}
	};

	const handleDelete = async (userId: string) => {
		setActionLoading(true);
		setActionError(null);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || `Error ${res.status}`);
			}
			setConfirmAction(null);
			const data = await fetchAdminStats();
			setStats(data);
		} catch (e) {
			setActionError(e instanceof Error ? e.message : "Error desconocido");
		} finally {
			setActionLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			<ProfileTabs />

			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-purple-700/30 via-violet-600/20 to-purple-700/30 p-6 shadow-xl border border-purple-600/20">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<Shield className="h-8 w-8 text-purple-300" />
							<h1 className="text-3xl font-bold text-purple-50">
								Panel de Administración
							</h1>
						</div>
						<p className="text-sm text-purple-100/90">
							Estadísticas de uso y gestión del sistema
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={refreshing}
						className="border-purple-400/40 text-purple-200 hover:bg-purple-800/30"
					>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
						/>
						{refreshing ? "Actualizando..." : "Actualizar"}
					</Button>
				</div>
			</section>

			{/* Error state */}
			{error && (
				<div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
					<Shield className="h-4 w-4 shrink-0" />
					<span>{error}</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={load}
						className="ml-auto text-destructive hover:text-destructive"
					>
						Reintentar
					</Button>
				</div>
			)}

			{/* Stats Grid */}
			{loading ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
						>
							<Skeleton className="h-12 w-12 rounded-xl shrink-0" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-7 w-16" />
							</div>
						</div>
					))}
				</div>
			) : stats ? (
				<>
					{/* ── Usuarios ── */}
					<section>
						<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
							<Users className="h-5 w-5 text-blue-400" />
							Usuarios
						</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<StatCard
								icon={Users}
								label="Usuarios registrados"
								value={stats.totalUsers}
								color="bg-blue-600"
							/>
							<StatCard
								icon={Activity}
								label="Activos (últimos 7 días)"
								value={stats.activeUsers}
								sub="sesión iniciada recientemente"
								color="bg-emerald-600"
							/>
						</div>
					</section>

					{/* ── Campañas & Contenido ── */}
					<section>
						<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
							<Scroll className="h-5 w-5 text-amber-400" />
							Campañas y Contenido
						</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							<StatCard
								icon={Scroll}
								label="Total campañas"
								value={stats.totalCampaigns}
								color="bg-amber-600"
							/>
							<StatCard
								icon={TrendingUp}
								label="Campañas activas"
								value={stats.activeCampaigns}
								color="bg-orange-600"
							/>
							<StatCard
								icon={Shield}
								label="Fichas de personaje"
								value={stats.totalCharacters}
								color="bg-rose-600"
							/>
							<StatCard
								icon={Map}
								label="Mapas de batalla"
								value={stats.totalBattleMaps}
								color="bg-teal-600"
							/>
						</div>
					</section>

					{/* ── Compendio ── */}
					<section>
						<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-violet-400" />
							Compendio D&D 5e
						</h2>
						<div className="grid gap-4 sm:grid-cols-3">
							<StatCard
								icon={Sword}
								label="Monstruos en el bestiario"
								value={stats.totalMonsters}
								color="bg-red-700"
							/>
							<StatCard
								icon={Wand2}
								label="Hechizos"
								value={stats.totalSpells}
								color="bg-indigo-600"
							/>
							<StatCard
								icon={BookOpen}
								label="Objetos"
								value={stats.totalItems}
								color="bg-purple-700"
							/>
						</div>
					</section>

					{/* ── Usuarios recientes ── */}
					{stats.recentUsers.length > 0 && (
						<section>
							<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
								<Users className="h-5 w-5 text-sky-400" />
								Últimos usuarios registrados
							</h2>
							<div className="rounded-xl border border-border bg-card overflow-hidden">
								<table className="w-full text-sm">
									<thead className="bg-muted/50 border-b border-border">
										<tr>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground">
												Usuario
											</th>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
												Email
											</th>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
												Registrado
											</th>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground">
												Rol
											</th>
											<th className="px-4 py-3" />
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{stats.recentUsers.map((u) => (
											<tr
												key={u.id}
												className="hover:bg-muted/20 transition-colors"
											>
												<td className="px-4 py-3 font-medium">
													{u.display_name || u.username || "—"}
												</td>
												<td className="px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
													{u.email || "—"}
												</td>
												<td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
													{new Date(u.created_at).toLocaleDateString("es-ES")}
												</td>
												<td className="px-4 py-3">
													{u.is_admin ? (
														<Badge className="bg-purple-700 text-white text-xs">
															Admin
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="text-xs text-muted-foreground border-muted-foreground/40"
														>
															Usuario
														</Badge>
													)}
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center justify-end gap-2">
														{!u.is_admin && (
															<Button
																variant="ghost"
																size="sm"
																className="h-7 px-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
																title="Promover a admin"
																onClick={() => {
																	setActionError(null);
																	setConfirmAction({
																		type: "promote",
																		user: u,
																	});
																}}
															>
																<ShieldCheck className="h-4 w-4" />
															</Button>
														)}
														{!u.is_admin && (
															<Button
																variant="ghost"
																size="sm"
																className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
																title="Eliminar usuario"
																onClick={() => {
																	setActionError(null);
																	setConfirmAction({ type: "delete", user: u });
																}}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					)}

					{/* ── Diálogo de confirmación ── */}
					<Dialog
						open={confirmAction !== null}
						onOpenChange={(open) => {
							if (!open) {
								setConfirmAction(null);
								setActionError(null);
							}
						}}
					>
						<DialogContent className="max-w-sm">
							{confirmAction?.type === "promote" && (
								<>
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<ShieldCheck className="h-5 w-5 text-purple-400" />
											Promover a administrador
										</DialogTitle>
										<DialogDescription>
											¿Seguro que quieres dar permisos de administrador a{" "}
											<strong>
												{confirmAction.user.display_name ||
													confirmAction.user.username ||
													confirmAction.user.email}
											</strong>
											? Esta acción no se puede deshacer desde aquí.
										</DialogDescription>
									</DialogHeader>
									{actionError && (
										<p className="text-sm text-destructive">{actionError}</p>
									)}
									<DialogFooter className="gap-2">
										<DialogClose asChild>
											<Button
												variant="outline"
												size="sm"
												disabled={actionLoading}
											>
												Cancelar
											</Button>
										</DialogClose>
										<Button
											size="sm"
											className="bg-purple-700 hover:bg-purple-600 text-white"
											disabled={actionLoading}
											onClick={() => handlePromote(confirmAction.user.id)}
										>
											{actionLoading ? "Guardando..." : "Sí, promover"}
										</Button>
									</DialogFooter>
								</>
							)}
							{confirmAction?.type === "delete" && (
								<>
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<Trash2 className="h-5 w-5 text-destructive" />
											Eliminar usuario
										</DialogTitle>
										<DialogDescription>
											¿Seguro que quieres eliminar a{" "}
											<strong>
												{confirmAction.user.display_name ||
													confirmAction.user.username ||
													confirmAction.user.email}
											</strong>
											? Se borrarán todos sus datos permanentemente.
										</DialogDescription>
									</DialogHeader>
									{actionError && (
										<p className="text-sm text-destructive">{actionError}</p>
									)}
									<DialogFooter className="gap-2">
										<DialogClose asChild>
											<Button
												variant="outline"
												size="sm"
												disabled={actionLoading}
											>
												Cancelar
											</Button>
										</DialogClose>
										<Button
											variant="destructive"
											size="sm"
											disabled={actionLoading}
											onClick={() => handleDelete(confirmAction.user.id)}
										>
											{actionLoading ? "Eliminando..." : "Sí, eliminar"}
										</Button>
									</DialogFooter>
								</>
							)}
						</DialogContent>
					</Dialog>

					{/* ── Campañas recientes ── */}
					{stats.recentCampaigns.length > 0 && (
						<section>
							<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
								<Scroll className="h-5 w-5 text-amber-400" />
								Últimas campañas creadas
							</h2>
							<div className="rounded-xl border border-border bg-card overflow-hidden">
								<table className="w-full text-sm">
									<thead className="bg-muted/50 border-b border-border">
										<tr>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground">
												Título
											</th>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
												Creada
											</th>
											<th className="text-left px-4 py-3 font-medium text-muted-foreground">
												Estado
											</th>
											<th className="px-4 py-3" />
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{stats.recentCampaigns.map((c) => (
											<tr
												key={c.id}
												className="hover:bg-muted/20 transition-colors cursor-pointer"
												onClick={() => navigate(`/editar-campana/${c.id}`)}
											>
												<td className="px-4 py-3 font-medium">{c.title}</td>
												<td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
													{new Date(c.created_at).toLocaleDateString("es-ES")}
												</td>
												<td className="px-4 py-3">
													{c.is_active ? (
														<Badge className="bg-green-700 text-white text-xs">
															Activa
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="text-xs text-muted-foreground"
														>
															Inactiva
														</Badge>
													)}
												</td>
												<td className="px-4 py-3 text-right">
													<span className="text-xs text-muted-foreground">
														→
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					)}
				</>
			) : null}
		</div>
	);
}
