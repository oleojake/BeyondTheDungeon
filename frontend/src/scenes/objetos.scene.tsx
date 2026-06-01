import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Loader2,
	Search,
	AlertCircle,
	BookOpen,
	Package,
	Info,
	X,
} from "lucide-react";
import { fetchItems, type Item } from "@/core/api/backend.service";
import { useCompendiumFilters } from "@/hooks/use-compendium-filters";

export const ObjetosScene = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const selectMode = location.state?.selectMode || false;
	const sceneId = location.state?.sceneId;
	const campaignId = location.state?.campaignId;

	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const {
		searchTerm,
		setSearchTerm,
		filterValues: categoryFilters,
		toggleFilter: toggleCategory,
		isFilterActive: isCategoryActive,
		currentPage,
		setCurrentPage,
		itemsPerPage,
		setItemsPerPage,
		hasActiveFilters,
		clearFilters,
	} = useCompendiumFilters({ filterKey: "category" });

	useEffect(() => {
		loadItems();
	}, []);

	const loadItems = async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await fetchItems();
			// Mapear los campos de stats al objeto principal
			const mapped = (data.items || []).map((item) => {
				const stats = item.stats || {};
				return {
					...item,
					// Normalizar campos - estos sobrescriben lo que venga de stats
					equipment_category:
						stats.equipment_category || item.equipment_category,
					cost: stats.cost || item.cost,
					weight: stats.weight ?? item.weight,
					damage: stats.damage || item.damage,
					armor_class: stats.armor_class || item.armor_class,
					properties: stats.properties || item.properties,
					desc: stats.desc || item.desc,
					range: stats.range || item.range,
					two_handed_damage: stats.two_handed_damage || item.two_handed_damage,
					str_minimum: stats.str_minimum ?? item.str_minimum,
				};
			});
			setItems(mapped);
		} catch (err) {
			console.error("Error al cargar objetos:", err);
			setError(
				err instanceof Error
					? err.message
					: "No se pudo cargar los objetos. Verifica que el backend esté corriendo.",
			);
		} finally {
			setLoading(false);
		}
	};

	const filteredItems = useMemo(
		() =>
			items.filter((item) => {
				const matchesSearch = item.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
				const itemCategory =
					typeof item.equipment_category === "object"
						? item.equipment_category?.name
						: item.equipment_category;
				const matchesCategory =
					categoryFilters.length === 0 || categoryFilters.includes(itemCategory ?? "");
				return matchesSearch && matchesCategory;
			}),
		[items, searchTerm, categoryFilters],
	);

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	// Helper function to format cost
	const formatCost = (cost: any) => {
		if (!cost) return "N/A";
		if (typeof cost === "object" && cost.quantity !== undefined && cost.unit) {
			return `${cost.quantity} ${cost.unit}`;
		}
		if (typeof cost === "object") {
			// Fallback for unexpected object structure
			return JSON.stringify(cost);
		}
		return String(cost);
	};

	// Helper function to get category badge color
	const getCategoryColor = (category: any) => {
		if (!category) return "bg-gray-600";
		const name = typeof category === "object" ? category.name : category;
		const lowerName = name?.toLowerCase() || "";

		if (lowerName.includes("weapon")) return "bg-red-600";
		if (lowerName.includes("armor")) return "bg-blue-600";
		if (lowerName.includes("potion")) return "bg-purple-600";
		if (lowerName.includes("tool")) return "bg-yellow-600";
		return "bg-gray-600";
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Package className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">
						Compendio de Objetos
					</h1>
				</div>
				<p className="mt-2 text-sm text-amber-100/90">
					{selectMode
						? "Selecciona un objeto para añadir a la escena."
						: "Consulta armas, armaduras y objetos mágicos para tus aventuras."}
				</p>
			</section>

			{/* Selection Mode Alert */}
			{selectMode && (
				<Alert className="bg-blue-950/50 border-blue-600/50">
					<Info className="h-4 w-4 text-blue-400" />
					<AlertDescription className="text-blue-200">
						Haz clic en un objeto para añadirlo a tu escena.
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
							placeholder="Buscar objeto por nombre..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-dark-lighter border-dark-border text-white placeholder:text-gray-400"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm text-gray-400">Categoría:</span>
						{[
							"Weapon",
							"Armor",
							"Adventuring Gear",
							"Tools",
							"Potion",
							"Wondrous Items",
							"Ring",
							"Rod",
							"Staff",
							"Wand",
							"Scroll",
							"Ammunition",
							"Mounts and Vehicles",
						].map((category) => (
							<Button
								key={category}
								size="sm"
								variant={isCategoryActive(category) ? "default" : "outline"}
								onClick={() => toggleCategory(category)}
								className={
									isCategoryActive(category)
										? "bg-amber-600 hover:bg-amber-700"
										: ""
								}
							>
								{category === "Adventuring Gear"
									? "Equipo"
									: category === "Tools"
										? "Herramientas"
										: category === "Weapon"
											? "Armas"
											: category === "Armor"
												? "Armaduras"
												: category === "Potion"
													? "Pociones"
													: category === "Wondrous Items"
														? "Objetos Maravillosos"
														: category === "Ring"
															? "Anillos"
															: category === "Rod"
																? "Varas"
																: category === "Staff"
																	? "Bastones"
																	: category === "Wand"
																		? "Varitas"
																		: category === "Scroll"
																			? "Pergaminos"
																			: category === "Ammunition"
																				? "Munición"
																				: category === "Mounts and Vehicles"
																					? "Monturas y Vehículos"
																					: category}
							</Button>
						))}
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
					<p className="text-sm text-gray-400">Cargando objetos...</p>
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
			{!loading && !error && items.length === 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4 text-center">
							<BookOpen className="h-16 w-16 text-gray-500" />
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">
									No hay objetos disponibles
								</h3>
								<p className="text-sm text-gray-400">
									El catálogo está vacío. Asegúrate de que la base de datos esté
									poblada.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* No Results State */}
			{!loading && !error && items.length > 0 && filteredItems.length === 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4 text-center">
							<Search className="h-16 w-16 text-gray-500" />
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">
									No se encontraron resultados
								</h3>
								<p className="text-sm text-gray-400">
									No hay objetos que coincidan con "{searchTerm}"
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Items Grid */}
			{!loading && !error && filteredItems.length > 0 && (
				<>
					<div className="flex items-center justify-between">
						<p className="text-sm text-gray-400">
							Mostrando {(currentPage - 1) * itemsPerPage + 1}–
							{Math.min(currentPage * itemsPerPage, filteredItems.length)} de{" "}
							{filteredItems.length}{" "}
							{filteredItems.length === 1
								? "objeto encontrado"
								: "objetos encontrados"}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedItems.map((item) =>
							selectMode ? (
							<div
								key={item.id}
								onClick={() => {
										navigate(`/editar-campana/${campaignId}`, {
											state: {
												selectedEntity: {
													id: item.id,
													name: item.name,
													entityType: "item",
													data: item,
												},
												sceneId,
											},
										});
								}}
								className="cursor-pointer transition-transform hover:scale-[1.02]"
							>
								<Card className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 h-full">
									<CardHeader>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<CardTitle className="text-amber-100 truncate">
													{item.name}
												</CardTitle>
												{item.equipment_category && (
													<div className="mt-1">
														<Badge
															className={`${getCategoryColor(item.equipment_category)} text-white text-xs`}
														>
															{typeof item.equipment_category === "object"
																? item.equipment_category.name
																: item.equipment_category}
														</Badge>
													</div>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-3">
										{/* Cost and Weight */}
										<div className="grid grid-cols-2 gap-2 text-sm">
											{item.cost && (
												<div className="flex flex-col">
													<span className="text-gray-400 text-xs">Coste:</span>
													<span className="text-gray-200 font-semibold">
														{formatCost(item.cost)}
													</span>
												</div>
											)}
											{item.weight !== undefined && (
												<div className="flex flex-col">
													<span className="text-gray-400 text-xs">Peso:</span>
													<span className="text-gray-200 font-semibold">
														{item.weight} lb
													</span>
												</div>
											)}
										</div>

										{/* Weapon Stats */}
										{item.damage && (
											<div className="space-y-1">
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-400">Daño:</span>
													<span className="text-gray-200 font-semibold">
														{item.damage.damage_dice}{" "}
														{item.damage.damage_type?.name || ""}
													</span>
												</div>
												{item.two_handed_damage && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-gray-400">
															Daño (2 manos):
														</span>
														<span className="text-gray-200 font-semibold">
															{item.two_handed_damage.damage_dice}
														</span>
													</div>
												)}
											</div>
										)}

										{/* Armor Stats */}
										{item.armor_class && (
											<div className="space-y-1">
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-400">CA:</span>
													<span className="text-gray-200 font-semibold">
														{typeof item.armor_class === "object"
															? item.armor_class.base ||
																item.armor_class.value ||
																JSON.stringify(item.armor_class)
															: item.armor_class}
													</span>
												</div>
												{item.str_minimum && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-gray-400">FUE mínima:</span>
														<span className="text-gray-200 font-semibold">
															{item.str_minimum}
														</span>
													</div>
												)}
											</div>
										)}

										{/* Range */}
										{item.range && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">Alcance:</span>
												<span className="text-gray-200 font-semibold">
													{typeof item.range === "object" &&
													item.range.normal !== undefined
														? `${item.range.normal} ft${item.range.long ? ` / ${item.range.long} ft` : ""}`
														: typeof item.range === "string" ||
															  typeof item.range === "number"
															? item.range
															: "N/A"}
												</span>
											</div>
										)}

										{/* Properties */}
										{item.properties && item.properties.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-2">
												{item.properties.map((prop: any, idx: number) => (
													<Badge
														key={idx}
														variant="outline"
														className="bg-amber-950/30 border-amber-600/30 text-amber-300 text-xs"
													>
														{prop.name || prop}
													</Badge>
												))}
											</div>
										)}

										{/* Description */}
										{item.desc && item.desc.length > 0 && (
											<p className="text-xs text-gray-400 italic mt-2 line-clamp-2">
												{Array.isArray(item.desc) ? item.desc[0] : item.desc}
											</p>
										)}
									</CardContent>
								</Card>
							</div>
					) : (
						<Link
							key={item.id}
							to={`/objetos/${item.system_id || 'dnd5e-2014'}/${item.stats?.index || item.id}`}
							className="block transition-transform hover:scale-[1.02]"
						>
							<Card className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 h-full">
								<CardHeader>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<CardTitle className="text-amber-100 truncate">
												{item.name}
											</CardTitle>
											{item.equipment_category && (
												<div className="mt-1">
													<Badge
														className={`${getCategoryColor(item.equipment_category)} text-white text-xs`}
													>
														{typeof item.equipment_category === "object"
															? item.equipment_category.name
															: item.equipment_category}
													</Badge>
												</div>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-2 text-sm">
										{item.cost && (
											<div className="flex flex-col">
												<span className="text-gray-400 text-xs">Coste:</span>
												<span className="text-gray-200 font-semibold">
													{formatCost(item.cost)}
												</span>
											</div>
										)}
										{item.weight !== undefined && (
											<div className="flex flex-col">
												<span className="text-gray-400 text-xs">Peso:</span>
												<span className="text-gray-200 font-semibold">
													{item.weight} lb
												</span>
											</div>
										)}
									</div>
									{item.damage && (
										<div className="space-y-1">
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">Daño:</span>
												<span className="text-gray-200 font-semibold">
													{item.damage.damage_dice}{" "}
													{item.damage.damage_type?.name || ""}
												</span>
											</div>
											{item.two_handed_damage && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-400">Daño (2 manos):</span>
													<span className="text-gray-200 font-semibold">
														{item.two_handed_damage.damage_dice}
													</span>
												</div>
											)}
										</div>
									)}
									{item.armor_class && (
										<div className="space-y-1">
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">CA:</span>
												<span className="text-gray-200 font-semibold">
													{typeof item.armor_class === "object"
														? item.armor_class.base ||
															item.armor_class.value ||
															JSON.stringify(item.armor_class)
														: item.armor_class}
												</span>
											</div>
											{item.str_minimum && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-400">FUE mínima:</span>
													<span className="text-gray-200 font-semibold">
														{item.str_minimum}
													</span>
												</div>
											)}
										</div>
									)}
									{item.range && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-400">Alcance:</span>
											<span className="text-gray-200 font-semibold">
												{typeof item.range === "object" &&
												item.range.normal !== undefined
													? `${item.range.normal} ft${item.range.long ? ` / ${item.range.long} ft` : ""}`
													: typeof item.range === "string" ||
														  typeof item.range === "number"
														? item.range
														: "N/A"}
											</span>
										</div>
									)}
									{item.properties && item.properties.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-2">
											{item.properties.map((prop: any, idx: number) => (
												<Badge
													key={idx}
													variant="outline"
													className="bg-amber-950/30 border-amber-600/30 text-amber-300 text-xs"
												>
													{prop.name || prop}
												</Badge>
											))}
										</div>
									)}
									{item.desc && item.desc.length > 0 && (
										<p className="text-xs text-gray-400 italic mt-2 line-clamp-2">
											{Array.isArray(item.desc) ? item.desc[0] : item.desc}
										</p>
									)}
								</CardContent>
							</Card>
						</Link>
					)
				)}
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

export default ObjetosScene;
