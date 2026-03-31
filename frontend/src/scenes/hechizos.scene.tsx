import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
	Sparkles,
	Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchSpells, type Spell } from "@/core/api/backend.service";
import {
	translateCompendiumName,
	translateCompendiumDescriptionArray,
	translateEnumValue,
} from "@/i18n/compendium";

export const HechizosScene = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const selectMode = location.state?.selectMode || false;
	const sceneId = location.state?.sceneId;
	const campaignId = location.state?.campaignId;

	const [spells, setSpells] = useState<Spell[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [levelFilter, setLevelFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(25);
	const { t } = useTranslation();

	useEffect(() => {
		loadSpells();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, levelFilter, itemsPerPage]);

	const loadSpells = async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await fetchSpells();
			// Mapear los campos de stats al objeto principal
			const mapped = (data.spells || []).map((spell) => {
				const stats = spell.stats || {};
				return {
					...spell,
					// Normalizar campos - no spread stats para evitar sobrescribir
					level: stats.level ?? spell.level ?? 0,
					school: stats.school || spell.school,
					casting_time: stats.casting_time || spell.casting_time,
					range: stats.range || spell.range,
					components: stats.components || spell.components,
					duration: stats.duration || spell.duration,
					concentration: stats.concentration ?? spell.concentration,
					ritual: stats.ritual ?? spell.ritual,
					desc: stats.desc || spell.desc,
				};
			});
			setSpells(mapped);
		} catch (err) {
			console.error("Error al cargar hechizos:", err);
			setError(
				err instanceof Error
					? err.message
					: t("compendium.spells.error"),
			);
		} finally {
			setLoading(false);
		}
	};

	const filteredSpells = spells.filter((spell) => {
		const matchesSearch = spell.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesLevel =
			levelFilter === "all" || spell.level?.toString() === levelFilter;
		return matchesSearch && matchesLevel;
	});

	const totalPages = Math.ceil(filteredSpells.length / itemsPerPage);
	const paginatedSpells = filteredSpells.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	// Helper function to get spell level badge color
	const getLevelColor = (level: number) => {
		const colors = [
			"bg-gray-600", // 0 - Cantrip
			"bg-blue-600", // 1
			"bg-green-600", // 2
			"bg-yellow-600", // 3
			"bg-orange-600", // 4
			"bg-red-600", // 5
			"bg-purple-600", // 6
			"bg-pink-600", // 7
			"bg-indigo-600", // 8
			"bg-violet-600", // 9
		];
		return colors[level] || "bg-gray-600";
	};

	// Helper function to get school color
	const getSchoolColor = (school: any) => {
		if (!school) return "bg-gray-700";
		const name =
			typeof school === "object"
				? school.name?.toLowerCase()
				: school.toLowerCase();

		const schoolColors: Record<string, string> = {
			abjuration: "bg-blue-700",
			conjuration: "bg-purple-700",
			divination: "bg-cyan-700",
			enchantment: "bg-pink-700",
			evocation: "bg-red-700",
			illusion: "bg-violet-700",
			necromancy: "bg-gray-700",
			transmutation: "bg-green-700",
		};

		return schoolColors[name] || "bg-gray-700";
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Sparkles className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">
						{t("compendium.spells.headerTitle")}
					</h1>
				</div>
				<p className="mt-2 text-sm text-amber-100/90">
					{selectMode
						? t("compendium.spells.subtitleSelect")
						: t("compendium.spells.subtitleDefault")}
				</p>
			</section>

			{/* Selection Mode Alert */}
			{selectMode && (
				<Alert className="bg-blue-950/50 border-blue-600/50">
					<Info className="h-4 w-4 text-blue-400" />
					<AlertDescription className="text-blue-200">
						{t("compendium.spells.selectModeHint")}
					</AlertDescription>
				</Alert>
			)}

			{/* Search and Filters */}
			<Card className="bg-dark-card border-dark-border">
				<CardContent className="pt-6 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							type="text"
							placeholder={t("compendium.spells.searchPlaceholder")}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-dark-lighter border-dark-border text-white placeholder:text-gray-400"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm text-gray-400">
							{t("compendium.spells.levelLabel")}
						</span>
						<Button
							size="sm"
							variant={levelFilter === "all" ? "default" : "outline"}
							onClick={() => setLevelFilter("all")}
							className={
								levelFilter === "all" ? "bg-amber-600 hover:bg-amber-700" : ""
							}
						>
							{t("common.all")}
						</Button>
						{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
							<Button
								key={level}
								size="sm"
								variant={
									levelFilter === level.toString() ? "default" : "outline"
								}
								onClick={() => setLevelFilter(level.toString())}
								className={
									levelFilter === level.toString()
										? "bg-amber-600 hover:bg-amber-700"
										: ""
								}
							>
								{level === 0 ? t("compendium.spells.cantrips") : level}
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
						{t("compendium.spells.loading")}
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
			{!loading && !error && spells.length === 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4 text-center">
							<BookOpen className="h-16 w-16 text-gray-500" />
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">
									{t("compendium.spells.emptyTitle")}
								</h3>
								<p className="text-sm text-gray-400">
									{t("compendium.spells.emptyDescription")}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* No Results State */}
			{!loading &&
				!error &&
				spells.length > 0 &&
				filteredSpells.length === 0 && (
					<Card className="bg-dark-card border-dark-border">
						<CardContent className="py-12">
							<div className="flex flex-col items-center gap-4 text-center">
								<Search className="h-16 w-16 text-gray-500" />
								<div>
									<h3 className="text-lg font-semibold text-white mb-2">
										{t("compendium.spells.noResultsTitle")}
									</h3>
									<p className="text-sm text-gray-400">
										{t("compendium.spells.noResultsDescription")}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

			{/* Spells Grid */}
			{!loading && !error && filteredSpells.length > 0 && (
				<>
					<div className="flex items-center justify-between">
						<p className="text-sm text-gray-400">
							{t("compendium.resultsCount", {
								from: (currentPage - 1) * itemsPerPage + 1,
								to: Math.min(currentPage * itemsPerPage, filteredSpells.length),
								total: filteredSpells.length,
							})} {" "}
							{t("compendium.spells.resultsLabel", {
								count: filteredSpells.length,
							})}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedSpells.map((spell) => {
							const translatedName = translateCompendiumName(
								t,
								"spells",
								spell.id,
								spell.name,
							);
							const translatedDesc = translateCompendiumDescriptionArray(
								t,
								"spells",
								spell.id,
								spell.desc,
							);
							const translatedSchool = spell.school
								? translateEnumValue(
										t,
										"dnd.magicSchools",
										typeof spell.school === "object"
											? spell.school.name
											: spell.school,
									)
								: "";
							const SpellCard = (
								<Card className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-pointer group h-full">
									<CardHeader>
										<div className="flex items-start justify-between gap-2 mb-2">
											<CardTitle className="text-amber-100 group-hover:text-amber-300 transition-colors flex-1">
												{translatedName}
											</CardTitle>
											<Badge
												className={`${getLevelColor(spell.level || 0)} text-white shrink-0`}
											>
												{spell.level === 0
													? t("compendium.spells.cantrip")
													: t("compendium.spells.levelShort", { level: spell.level })}
											</Badge>
										</div>
										<div className="flex flex-wrap gap-1">
											{spell.school && (
												<Badge
													className={`${getSchoolColor(spell.school)} text-white text-xs`}
												>
													{translatedSchool ||
														(typeof spell.school === "object"
															? spell.school.name
															: spell.school)}
												</Badge>
											)}
											{spell.concentration && (
												<Badge
													variant="outline"
													className="bg-purple-950/50 border-purple-600/50 text-purple-300 text-xs"
												>
													{t("compendium.spells.concentration")}
												</Badge>
											)}
											{spell.ritual && (
												<Badge
													variant="outline"
													className="bg-cyan-950/50 border-cyan-600/50 text-cyan-300 text-xs"
												>
													{t("compendium.spells.ritual")}
												</Badge>
											)}
										</div>
									</CardHeader>
									<CardContent className="space-y-2">
										{spell.casting_time && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">
													{t("compendium.spells.castingTime")}
												</span>
												<span className="text-gray-200">
													{spell.casting_time}
												</span>
											</div>
										)}
										{spell.range && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">
													{t("compendium.spells.range")}
												</span>
												<span className="text-gray-200">{spell.range}</span>
											</div>
										)}
										{spell.components && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">
													{t("compendium.spells.components")}
												</span>
												<span className="text-gray-200">
													{Array.isArray(spell.components)
														? spell.components.join(", ")
														: typeof spell.components === "string"
															? spell.components
															: t("common.notAvailable")}
												</span>
											</div>
										)}
										{spell.duration && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">
													{t("compendium.spells.duration")}
												</span>
												<span className="text-gray-200">{spell.duration}</span>
											</div>
										)}
										{translatedDesc.length > 0 && (
											<p className="text-xs text-gray-400 line-clamp-2">
												{translatedDesc[0]}
											</p>
										)}
									</CardContent>
								</Card>
							);

							if (selectMode) {
								return (
									<div
										key={spell.id}
										onClick={() => {
											navigate(`/editar-campana/${campaignId}`, {
												state: {
													selectedEntity: {
														id: spell.id,
														name: spell.name,
														entityType: "spell",
														data: spell,
													},
													sceneId,
												},
											});
										}}
										className="block transition-transform hover:scale-[1.02]"
									>
										{SpellCard}
									</div>
								);
							}

							return (
								<Link
									key={spell.id}
									to={`/hechizos/${spell.id}`}
									className="block transition-transform hover:scale-[1.02]"
								>
									{SpellCard}
								</Link>
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

export default HechizosScene;
