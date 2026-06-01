import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { routes } from "@/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Package } from "lucide-react";
import { fetchItemById, type Item } from "@/core/api/backend.service";

const formatCost = (cost: any) => {
	if (!cost) return null;
	if (typeof cost === "object" && cost.quantity !== undefined && cost.unit) {
		return `${cost.quantity} ${cost.unit}`;
	}
	return String(cost);
};

const getCategoryColor = (category: any) => {
	if (!category) return "bg-gray-600";
	const name = typeof category === "object" ? category.name : category;
	const lower = name?.toLowerCase() || "";
	if (lower.includes("weapon")) return "bg-red-600";
	if (lower.includes("armor")) return "bg-blue-600";
	if (lower.includes("potion")) return "bg-purple-600";
	if (lower.includes("tool")) return "bg-yellow-600";
	return "bg-gray-600";
};

const ObjetosDetalleScene = () => {
	const { edition, slug, id } = useParams<{ edition?: string; slug?: string; id?: string }>();
	const navigate = useNavigate();
	const [item, setItem] = useState<Item | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const itemId = slug || id;
		if (itemId) loadItem(itemId, edition);
	}, [slug, id, edition]);

	const loadItem = async (itemId: string, itemEdition?: string) => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchItemById(itemId, itemEdition);
			const stats = data.stats || {};
			const normalized: Item = {
				...data,
				equipment_category: stats.equipment_category || data.equipment_category,
				cost: stats.cost || data.cost,
				weight: stats.weight ?? data.weight,
				damage: stats.damage || data.damage,
				two_handed_damage: stats.two_handed_damage || data.two_handed_damage,
				armor_class: stats.armor_class || data.armor_class,
				properties: stats.properties || data.properties,
				desc: stats.desc || data.desc,
				range: stats.range || data.range,
				throw_range: stats.throw_range || data.throw_range,
				str_minimum: stats.str_minimum ?? data.str_minimum,
				stealth_disadvantage:
					stats.stealth_disadvantage ?? data.stealth_disadvantage,
				weapon_category: stats.weapon_category || data.weapon_category,
				weapon_range: stats.weapon_range || data.weapon_range,
				armor_category: stats.armor_category || data.armor_category,
			};
			setItem(normalized);
		} catch (err) {
			console.error("Error al cargar objeto:", err);
			setError(
				err instanceof Error
					? err.message
					: "No se pudo cargar el objeto. Verifica que el backend esté corriendo.",
			);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 flex flex-col items-center justify-center py-12 gap-4">
				<Loader2 className="h-12 w-12 animate-spin text-amber-500" />
				<p className="text-sm text-gray-400">Cargando objeto...</p>
			</div>
		);
	}

	if (error || !item) {
		return (
			<div className="container mx-auto p-6 max-w-7xl space-y-6">
				<Button
					onClick={() => navigate(routes.objetos)}
					variant="outline"
					className="gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Volver a Objetos
				</Button>
				<Alert
					variant="destructive"
					className="bg-red-950/50 border-red-900"
				>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-red-200">
						{error || "Objeto no encontrado"}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const categoryName =
		typeof item.equipment_category === "object"
			? item.equipment_category?.name
			: item.equipment_category;

	return (
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			<Button
				onClick={() => navigate(routes.objetos)}
				variant="outline"
				className="gap-2 border-amber-600/30 text-amber-200 hover:bg-amber-950/30 hover:text-amber-100"
			>
				<ArrowLeft className="h-4 w-4" />
				Volver a Objetos
			</Button>

			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Package className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">{item.name}</h1>
					{categoryName && (
						<Badge
							className={`${getCategoryColor(item.equipment_category)} text-white text-sm px-3 py-1`}
						>
							{categoryName}
						</Badge>
					)}
				</div>
				<div className="flex flex-wrap gap-2 mt-3">
					{item.weapon_category && (
						<Badge
							variant="outline"
							className="bg-red-950/50 border-red-600/50 text-red-300"
						>
							{item.weapon_category}
						</Badge>
					)}
					{item.armor_category && (
						<Badge
							variant="outline"
							className="bg-blue-950/50 border-blue-600/50 text-blue-300"
						>
							{item.armor_category}
						</Badge>
					)}
					{item.stealth_disadvantage && (
						<Badge
							variant="outline"
							className="bg-gray-800/50 border-gray-600/50 text-gray-300"
						>
							Desventaja en Sigilo
						</Badge>
					)}
				</div>
			</section>

			{/* Stats */}
			<Card className="bg-dark-card border-dark-border">
				<CardHeader>
					<CardTitle className="text-amber-100">Características</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{item.cost && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">Coste</span>
							<span className="text-lg font-semibold text-amber-200">
								{formatCost(item.cost)}
							</span>
						</div>
					)}
					{item.weight !== undefined && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">Peso</span>
							<span className="text-lg font-semibold text-amber-200">
								{item.weight} lb
							</span>
						</div>
					)}
					{item.damage && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">Daño</span>
							<span className="text-lg font-semibold text-amber-200">
								{item.damage.damage_dice}{" "}
								{item.damage.damage_type?.name
									? `(${item.damage.damage_type.name})`
									: ""}
							</span>
						</div>
					)}
					{item.two_handed_damage && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Daño (2 manos)
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{item.two_handed_damage.damage_dice}{" "}
								{item.two_handed_damage.damage_type?.name
									? `(${item.two_handed_damage.damage_type.name})`
									: ""}
							</span>
						</div>
					)}
					{item.armor_class && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Clase de Armadura
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{typeof item.armor_class === "object"
									? item.armor_class.base ||
										item.armor_class.value ||
										JSON.stringify(item.armor_class)
									: item.armor_class}
								{item.armor_class?.dex_bonus ? " + Mod. DES" : ""}
							</span>
						</div>
					)}
					{item.str_minimum ? (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								FUE mínima
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{item.str_minimum}
							</span>
						</div>
					) : null}
					{item.range && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">Alcance</span>
							<span className="text-lg font-semibold text-amber-200">
								{typeof item.range === "object" &&
								item.range.normal !== undefined
									? `${item.range.normal} ft${item.range.long ? ` / ${item.range.long} ft` : ""}`
									: String(item.range)}
							</span>
						</div>
					)}
					{item.throw_range && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Alcance de Lanzamiento
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{typeof item.throw_range === "object"
									? `${item.throw_range.normal} ft / ${item.throw_range.long} ft`
									: String(item.throw_range)}
							</span>
						</div>
					)}
					{item.weapon_range && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Tipo de Alcance
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{item.weapon_range}
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Properties */}
			{item.properties && item.properties.length > 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">Propiedades</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{item.properties.map((prop: any, idx: number) => (
								<Badge
									key={idx}
									variant="outline"
									className="bg-amber-950/30 border-amber-600/30 text-amber-300"
								>
									{prop.name || prop}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Description */}
			{item.desc && item.desc.length > 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">Descripción</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{(Array.isArray(item.desc) ? item.desc : [item.desc]).map(
							(paragraph: string, idx: number) => (
								<p key={idx} className="text-sm text-gray-300 leading-relaxed">
									{paragraph}
								</p>
							),
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default ObjetosDetalleScene;
