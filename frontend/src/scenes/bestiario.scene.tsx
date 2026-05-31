import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Loader2,
	Search,
	AlertCircle,
	BookOpen,
	Skull,
	Info,
	X,
} from "lucide-react";
import { fetchBestiary, type Monster } from "@/core/api/backend.service";
import { useCompendiumFilters } from "@/hooks/use-compendium-filters";
const DND5E_API_URL = "https://www.dnd5eapi.co";

export const BestiarioScene = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const selectMode = location.state?.selectMode || false;
	const sceneId = location.state?.sceneId;
	const campaignId = location.state?.campaignId;

	const [monsters, setMonsters] = useState<Monster[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const {
		searchTerm,
		setSearchTerm,
		currentPage,
		setCurrentPage,
		itemsPerPage,
		setItemsPerPage,
		hasActiveFilters,
		clearFilters,
	} = useCompendiumFilters();

	useEffect(() => {
		loadMonsters();
	}, []);

	const loadMonsters = async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await fetchBestiary();
			// Mapear los campos de stats al objeto principal
			const mapped = (data.characters || []).map((monster) => {
				const stats = monster.stats || {};
				return {
					...monster,
					...stats,
					// Normalizar challenge_rating y armor_class
					challenge_rating:
						monster.challenge_rating ??
						monster.cr_level ??
						stats.challenge_rating,
					armor_class: Array.isArray(stats.armor_class)
						? stats.armor_class[0]?.value
						: stats.armor_class,
					hit_points: stats.hit_points,
					alignment: stats.alignment,
					size: stats.size,
					type: stats.type || monster.type,
				};
			});
			setMonsters(mapped);
		} catch (err) {
			console.error("Error al cargar bestiario:", err);
			setError(
				err instanceof Error
					? err.message
					: "No se pudo cargar el bestiario. Verifica que el backend esté corriendo.",
			);
		} finally {
			setLoading(false);
		}
	};

	const filteredMonsters = useMemo(
		() =>
			monsters.filter((monster) =>
				monster.name.toLowerCase().includes(searchTerm.toLowerCase()),
			),
		[monsters, searchTerm],
	);

	const totalPages = Math.ceil(filteredMonsters.length / itemsPerPage);
	const paginatedMonsters = filteredMonsters.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	return (
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Skull className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">
						Compendio del Bestiario
					</h1>
				</div>
				<p className="mt-2 text-sm text-amber-100/90">
					{selectMode
						? "Selecciona un monstruo para añadir a la escena."
						: "Consulta las estadísticas de criaturas y monstruos para tus aventuras."}
				</p>
			</section>

			{/* Selection Mode Alert */}
			{selectMode && (
				<Alert className="bg-blue-950/50 border-blue-600/50">
					<Info className="h-4 w-4 text-blue-400" />
					<AlertDescription className="text-blue-200">
						Haz clic en un monstruo para añadirlo a tu escena.
					</AlertDescription>
				</Alert>
			)}

			{/* Search Bar */}
			<Card className="bg-dark-card border-dark-border">
				<CardContent className="pt-6 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							type="text"
							placeholder="Buscar criatura por nombre..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-dark-lighter border-dark-border text-white placeholder:text-gray-400"
						/>
					</div>
					{hasActiveFilters && (
						<div className="flex items-center">
							<Button
								size="sm"
								variant="ghost"
								onClick={clearFilters}
								className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 gap-1.5"
							>
								<X className="h-3.5 w-3.5" />
								Limpiar filtros
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-12 gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-amber-500" />
					<p className="text-sm text-gray-400">Cargando bestiario...</p>
				</div>
			)}

			{/* Error State */}
			{error && !loading && (
				<Alert variant="destructive" className="bg-red-950/50 border-red-900">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-red-200">{error}</AlertDescription>
				</Alert>
			)}

			{/* Empty State */}
			{!loading && !error && monsters.length === 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4 text-center">
							<BookOpen className="h-16 w-16 text-gray-500" />
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">
									No hay criaturas disponibles
								</h3>
								<p className="text-sm text-gray-400">
									El bestiario está vacío. Asegúrate de que la base de datos
									esté poblada.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* No Results State */}
			{!loading &&
				!error &&
				monsters.length > 0 &&
				filteredMonsters.length === 0 && (
					<Card className="bg-dark-card border-dark-border">
						<CardContent className="py-12">
							<div className="flex flex-col items-center gap-4 text-center">
								<Search className="h-16 w-16 text-gray-500" />
								<div>
									<h3 className="text-lg font-semibold text-white mb-2">
										No se encontraron resultados
									</h3>
									<p className="text-sm text-gray-400">
										No hay criaturas que coincidan con "{searchTerm}"
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

			{/* Monsters Grid */}
			{!loading && !error && filteredMonsters.length > 0 && (
				<>
					<div className="flex items-center justify-between">
						<p className="text-sm text-gray-400">
							Mostrando {(currentPage - 1) * itemsPerPage + 1}–
							{Math.min(currentPage * itemsPerPage, filteredMonsters.length)} de{" "}
							{filteredMonsters.length}{" "}
							{filteredMonsters.length === 1
								? "criatura encontrada"
								: "criaturas encontradas"}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedMonsters.map((monster) => {
							const imageUrl = (
								monster.image ||
								monster.image_url ||
								""
							).startsWith("/api/")
								? `${DND5E_API_URL}${monster.image || monster.image_url}`
								: monster.image || monster.image_url || null;

							const MonsterCard = (
								<Card className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-600/20 cursor-pointer group h-full overflow-hidden">
									{/* Image hero */}
									{imageUrl ? (
										<div className="relative w-full h-60 overflow-hidden bg-stone-900">
											<img
												src={imageUrl}
												alt={monster.name}
												className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
												loading="lazy"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/40 to-transparent" />
											{monster.challenge_rating !== undefined && (
												<Badge className="absolute top-3 right-3 bg-amber-600/90 text-white border-0 shadow-lg">
													CR {monster.challenge_rating}
												</Badge>
											)}
										</div>
									) : (
										<div className="relative w-full h-20 overflow-hidden bg-gradient-to-br from-amber-900/40 to-stone-900 flex items-center justify-center">
											<Skull className="h-8 w-8 text-amber-700/50" />
											{monster.challenge_rating !== undefined && (
												<Badge className="absolute top-3 right-3 bg-amber-600/90 text-white border-0">
													CR {monster.challenge_rating}
												</Badge>
											)}
										</div>
									)}

									<CardHeader className="pb-2">
										<CardTitle className="text-amber-100 group-hover:text-amber-300 transition-colors">
											{monster.name}
										</CardTitle>
										{monster.size && monster.type && (
											<CardDescription className="text-gray-400 text-xs">
												{monster.size} {monster.type}
												{monster.alignment && ` · ${monster.alignment}`}
											</CardDescription>
										)}
									</CardHeader>

									<CardContent className="pt-0 space-y-2">
										{monster.armor_class !== undefined && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">CA:</span>
												<span className="text-amber-200 font-semibold">
													{monster.armor_class}
												</span>
											</div>
										)}
										{monster.hit_points !== undefined && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">PG:</span>
												<span className="text-amber-200 font-semibold">
													{monster.hit_points}
												</span>
											</div>
										)}
										{!monster.armor_class && !monster.hit_points && (
											<p className="text-xs text-gray-500 italic">
												Sin datos adicionales
											</p>
										)}
									</CardContent>
								</Card>
							);

							if (selectMode) {
								return (
									<div
										key={monster.id}
										onClick={() => {
											navigate(`/editar-campana/${campaignId}`, {
												state: {
													selectedEntity: {
														id: monster.id,
														name: monster.name,
														entityType: "monster",
														data: monster,
													},
													sceneId,
												},
											});
										}}
										className="block transition-transform hover:scale-[1.02]"
									>
										{MonsterCard}
									</div>
								);
							}

							return (
								<Link
									key={monster.id}
									to={`/bestiario/${monster.stats?.index || monster.id}`}
									className="block transition-transform hover:scale-[1.02]"
								>
									{MonsterCard}
								</Link>
							);
						})}
					</div>

					{/* Pagination */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-400">Mostrar:</span>
							{[25, 50, 100].map((n) => (
								<Button
									key={n}
									size="sm"
									variant={itemsPerPage === n ? "default" : "outline"}
									onClick={() => setItemsPerPage(n)}
									className={
										itemsPerPage === n ? "bg-amber-600 hover:bg-amber-700" : ""
									}
								>
									{n}
								</Button>
							))}
						</div>
						{totalPages > 1 && (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
								>
									Anterior
								</Button>
								<span className="text-sm text-gray-400">
									Página {currentPage} de {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((p) => Math.min(totalPages, p + 1))
									}
									disabled={currentPage === totalPages}
								>
									Siguiente
								</Button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default BestiarioScene;
