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
import { fetchSpells, type Spell } from "@/core/api/backend.service";

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
					: "No se pudo cargar los hechizos. Verifica que el backend esté corriendo.",
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
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Sparkles className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">
						Compendio de Hechizos
					</h1>
				</div>
				<p className="mt-2 text-sm text-amber-100/90">
					{selectMode
						? "Selecciona un hechizo para añadir a la escena."
						: "Explora el grimorio completo de hechizos y encantamientos."}
				</p>
			</section>

			{/* Selection Mode Alert */}
			{selectMode && (
				<Alert className="bg-blue-950/50 border-blue-600/50">
					<Info className="h-4 w-4 text-blue-400" />
					<AlertDescription className="text-blue-200">
						Haz clic en un hechizo para añadirlo a tu escena.
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
							placeholder="Buscar hechizo por nombre..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-dark-lighter border-dark-border text-white placeholder:text-gray-400"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm text-gray-400">Nivel:</span>
						<Button
							size="sm"
							variant={levelFilter === "all" ? "default" : "outline"}
							onClick={() => setLevelFilter("all")}
							className={
								levelFilter === "all" ? "bg-amber-600 hover:bg-amber-700" : ""
							}
						>
							Todos
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
								{level === 0 ? "Trucos" : level}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-12 gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-amber-500" />
					<p className="text-sm text-gray-400">Cargando hechizos...</p>
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
									No hay hechizos disponibles
								</h3>
								<p className="text-sm text-gray-400">
									El grimorio está vacío. Asegúrate de que la base de datos esté
									poblada.
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
										No se encontraron resultados
									</h3>
									<p className="text-sm text-gray-400">
										No hay hechizos que coincidan con tu búsqueda
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
							Mostrando {(currentPage - 1) * itemsPerPage + 1}–
							{Math.min(currentPage * itemsPerPage, filteredSpells.length)} de{" "}
							{filteredSpells.length}{" "}
							{filteredSpells.length === 1
								? "hechizo encontrado"
								: "hechizos encontrados"}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedSpells.map((spell) => {
							const SpellCard = (
								<Card className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-pointer group h-full">
									<CardHeader>
										<div className="flex items-start justify-between gap-2 mb-2">
											<CardTitle className="text-amber-100 group-hover:text-amber-300 transition-colors flex-1">
												{spell.name}
											</CardTitle>
											<Badge
												className={`${getLevelColor(spell.level || 0)} text-white shrink-0`}
											>
												{spell.level === 0 ? "Truco" : `Nv ${spell.level}`}
											</Badge>
										</div>
										<div className="flex flex-wrap gap-1">
											{spell.school && (
												<Badge
													className={`${getSchoolColor(spell.school)} text-white text-xs`}
												>
													{typeof spell.school === "object"
														? spell.school.name
														: spell.school}
												</Badge>
											)}
											{spell.concentration && (
												<Badge
													variant="outline"
													className="bg-purple-950/50 border-purple-600/50 text-purple-300 text-xs"
												>
													Concentración
												</Badge>
											)}
											{spell.ritual && (
												<Badge
													variant="outline"
													className="bg-cyan-950/50 border-cyan-600/50 text-cyan-300 text-xs"
												>
													Ritual
												</Badge>
											)}
										</div>
									</CardHeader>
									<CardContent className="space-y-2">
										{spell.casting_time && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">Tiempo:</span>
												<span className="text-gray-200">
													{spell.casting_time}
												</span>
											</div>
										)}
										{spell.range && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">Alcance:</span>
												<span className="text-gray-200">{spell.range}</span>
											</div>
										)}
										{spell.components && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">Componentes:</span>
												<span className="text-gray-200">
													{Array.isArray(spell.components)
														? spell.components.join(", ")
														: typeof spell.components === "string"
															? spell.components
															: "N/A"}
												</span>
											</div>
										)}
										{spell.duration && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-400">Duración:</span>
												<span className="text-gray-200">{spell.duration}</span>
											</div>
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

export default HechizosScene;
