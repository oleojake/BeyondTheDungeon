import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchItems, type Item } from "@/core/api/backend.service";
import {
	translateCompendiumName,
	translateCompendiumDescriptionArray,
	translateEnumValue,
} from "@/i18n/compendium";

export const ObjetosScene = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const selectMode = location.state?.selectMode || false;
	const sceneId = location.state?.sceneId;
	const campaignId = location.state?.campaignId;

	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(25);
	const { t } = useTranslation();

	useEffect(() => {
		loadItems();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, categoryFilter, itemsPerPage]);

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
					: t("compendium.items.error"),
			);
		} finally {
			setLoading(false);
		}
	};

	const filteredItems = items.filter((item) => {
		const matchesSearch = item.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const itemCategory =
			typeof item.equipment_category === "object"
				? item.equipment_category?.name
				: item.equipment_category;
		const matchesCategory =
			categoryFilter === "all" || itemCategory === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	// Helper function to format cost
	const formatCost = (cost: any) => {
		if (!cost) return t("common.notAvailable");
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
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Package className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">
						{t("compendium.items.headerTitle")}
					</h1>
				</div>
				<p className="mt-2 text-sm text-amber-100/90">
					{selectMode
						? t("compendium.items.subtitleSelect")
						: t("compendium.items.subtitleDefault")}
				</p>
			</section>

			{/* Selection Mode Alert */}
			{selectMode && (
				<Alert className="bg-blue-950/50 border-blue-600/50">
					<Info className="h-4 w-4 text-blue-400" />
					<AlertDescription className="text-blue-200">
						{t("compendium.items.selectModeHint")}
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
							placeholder={t("compendium.items.searchPlaceholder")}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-dark-lighter border-dark-border text-white placeholder:text-gray-400"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm text-gray-400">
							{t("compendium.items.categoryLabel")}
						</span>
						<Button
							size="sm"
							variant={categoryFilter === "all" ? "default" : "outline"}
							onClick={() => setCategoryFilter("all")}
							className={
								categoryFilter === "all"
									? "bg-amber-600 hover:bg-amber-700"
									: ""
							}
						>
							{t("common.all")}
						</Button>
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
								variant={categoryFilter === category ? "default" : "outline"}
								onClick={() => setCategoryFilter(category)}
								className={
									categoryFilter === category
										? "bg-amber-600 hover:bg-amber-700"
										: ""
								}
							>
								{translateEnumValue(
									t,
									"dnd.equipmentCategories",
									category,
								)}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-12 gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-amber-500" />
					<p className="text-sm text-gray-400">
						{t("compendium.items.loading")}
					</p>
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
									{t("compendium.items.emptyTitle")}
								</h3>
								<p className="text-sm text-gray-400">
									{t("compendium.items.emptyDescription")}
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
									{t("compendium.items.noResultsTitle")}
								</h3>
								<p className="text-sm text-gray-400">
									{t("compendium.items.noResultsDescription", {
										query: searchTerm,
									})}
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
							{t("compendium.resultsCount", {
								from: (currentPage - 1) * itemsPerPage + 1,
								to: Math.min(currentPage * itemsPerPage, filteredItems.length),
								total: filteredItems.length,
							})} {" "}
							{t("compendium.items.resultsLabel", {
								count: filteredItems.length,
							})}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedItems.map((item) => {
							const translatedName = translateCompendiumName(
								t,
								"items",
								item.id,
								item.name,
							);
							const translatedDesc = translateCompendiumDescriptionArray(
								t,
								"items",
								item.id,
								item.desc,
							);
							const translatedCategory = item.equipment_category
								? translateEnumValue(
										t,
										"dnd.equipmentCategories",
										typeof item.equipment_category === "object"
											? item.equipment_category?.name
											: item.equipment_category,
									)
								: "";
							return (
								<div
									key={item.id}
									onClick={() => {
										if (selectMode) {
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
									}
								}}
								className={
									selectMode
										? "cursor-pointer transition-transform hover:scale-[1.02]"
										: ""
								}
							>
								<Card className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 h-full">
									<CardHeader>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<CardTitle className="text-amber-100 truncate">
													{translatedName}
												</CardTitle>
												{item.equipment_category && (
													<div className="mt-1">
														<Badge
															className={`${getCategoryColor(item.equipment_category)} text-white text-xs`}
														>
															{translatedCategory ||
																(typeof item.equipment_category === "object"
																	? item.equipment_category.name
																	: item.equipment_category)}
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
														<span className="text-gray-400 text-xs">
															{t("compendium.items.cost")}
														</span>
													<span className="text-gray-200 font-semibold">
														{formatCost(item.cost)}
													</span>
												</div>
											)}
											{item.weight !== undefined && (
												<div className="flex flex-col">
														<span className="text-gray-400 text-xs">
															{t("compendium.items.weight")}
														</span>
													<span className="text-gray-200 font-semibold">
															{t("compendium.items.weightValue", {
																value: item.weight,
															})}
													</span>
												</div>
											)}
										</div>

										{/* Weapon Stats */}
										{item.damage && (
											<div className="space-y-1">
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-400">
														{t("compendium.items.damage")}
													</span>
													<span className="text-gray-200 font-semibold">
														{item.damage.damage_dice}{" "}
														{translateEnumValue(
															t,
															"dnd.damageTypes",
															item.damage.damage_type?.name || "",
														)}
													</span>
												</div>
												{item.two_handed_damage && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-gray-400">
															{t("compendium.items.twoHandedDamage")}
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
													<span className="text-gray-400">
														{t("compendium.items.armorClass")}
													</span>
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
														<span className="text-gray-400">
															{t("compendium.items.strMinimum")}
														</span>
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
												<span className="text-gray-400">
													{t("compendium.items.range")}
												</span>
												<span className="text-gray-200 font-semibold">
													{typeof item.range === "object" &&
													item.range.normal !== undefined
														? `${item.range.normal} ft${item.range.long ? ` / ${item.range.long} ft` : ""}`
														: typeof item.range === "string" ||
															  typeof item.range === "number"
															? item.range
															: t("common.notAvailable")}
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
																{translateEnumValue(
																t,
																"dnd.weaponProperties",
																prop.name || prop,
															)}
													</Badge>
												))}
											</div>
										)}

										{/* Description */}
										{item.desc && item.desc.length > 0 && (
											<p className="text-xs text-gray-400 italic mt-2 line-clamp-2">
													{translatedDesc.length > 0
														? translatedDesc[0]
														: Array.isArray(item.desc)
															? item.desc[0]
															: item.desc}
											</p>
										)}
									</CardContent>
								</Card>
							</div>
						);
						})}
					</div>

					{/* Pagination */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-400">
								{t("common.show")}
							</span>
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
									{t("common.previous")}
								</Button>
								<span className="text-sm text-gray-400">
									{t("common.pageOf", {
										current: currentPage,
										total: totalPages,
									})}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((p) => Math.min(totalPages, p + 1))
									}
									disabled={currentPage === totalPages}
								>
									{t("common.next")}
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
