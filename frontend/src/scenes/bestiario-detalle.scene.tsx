import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Skull } from "lucide-react";
import { fetchMonsterById, type Monster } from "@/core/api/backend.service";

const DND5E_API_URL = "https://www.dnd5eapi.co";

export const BestiarioDetalleScene = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [monster, setMonster] = useState<Monster | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (id) {
			loadMonster(id);
		}
	}, [id]);

	const loadMonster = async (monsterId: string) => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchMonsterById(monsterId);

			// Normalize data: extract stats from the stats field if they exist
			const stats = data.stats || {};
			const normalized = {
				...data,
				// Override with stats data if available
				alignment: stats.alignment || data.alignment,
				armor_class: stats.armor_class || data.armor_class,
				hit_points: stats.hit_points || data.hit_points,
				hit_dice: stats.hit_dice || data.hit_dice,
				hit_points_roll: stats.hit_points_roll || data.hit_points_roll,
				speed: stats.speed || data.speed,
				strength: stats.strength || data.strength,
				dexterity: stats.dexterity || data.dexterity,
				constitution: stats.constitution || data.constitution,
				intelligence: stats.intelligence || data.intelligence,
				wisdom: stats.wisdom || data.wisdom,
				charisma: stats.charisma || data.charisma,
				proficiencies: stats.proficiencies || data.proficiencies,
				damage_vulnerabilities:
					stats.damage_vulnerabilities || data.damage_vulnerabilities,
				damage_resistances: stats.damage_resistances || data.damage_resistances,
				damage_immunities: stats.damage_immunities || data.damage_immunities,
				condition_immunities:
					stats.condition_immunities || data.condition_immunities,
				senses: stats.senses || data.senses,
				languages: stats.languages || data.languages,
				proficiency_bonus: stats.proficiency_bonus || data.proficiency_bonus,
				xp: stats.xp || data.xp,
				special_abilities: stats.special_abilities || data.special_abilities,
				actions: stats.actions || data.actions,
				legendary_actions: stats.legendary_actions || data.legendary_actions,
				reactions: stats.reactions || data.reactions,
				desc: stats.desc || data.desc,
				size: stats.size || data.size,
				type: stats.type || data.type,
				subtype: stats.subtype || data.subtype,
				challenge_rating:
					data.cr_level || stats.challenge_rating || data.challenge_rating,
				image: stats.image || data.image_url || data.image,
			};

			setMonster(normalized);
		} catch (err) {
			console.error("Error al cargar monstruo:", err);
			setError(
				err instanceof Error
					? err.message
					: "No se pudo cargar el monstruo. Verifica que el backend esté corriendo.",
			);
		} finally {
			setLoading(false);
		}
	};

	// Helper function to format armor class
	const formatArmorClass = (ac: any) => {
		if (!ac) return "N/A";
		if (Array.isArray(ac)) {
			if (ac.length === 0) return "N/A";
			const first = ac[0];
			if (typeof first === "object" && first.value !== undefined) {
				return first.type ? `${first.value} (${first.type})` : first.value;
			}
			return ac[0];
		}
		return ac;
	};

	// Helper function to format speed
	const formatSpeed = (speed: any) => {
		if (!speed) return "N/A";
		return Object.entries(speed)
			.map(([key, value]) => `${key}: ${value}`)
			.join(", ");
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-12 gap-4">
				<Loader2 className="h-12 w-12 animate-spin text-amber-500" />
				<p className="text-sm text-gray-400">Cargando criatura...</p>
			</div>
		);
	}

	if (error || !monster) {
		return (
			<div className="container mx-auto p-6 max-w-7xl space-y-6">
				<Button
					onClick={() => navigate("/bestiario")}
					variant="outline"
					className="gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Volver al Bestiario
				</Button>
				<Alert variant="destructive" className="bg-red-950/50 border-red-900">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-red-200">
						{error || "Monstruo no encontrado"}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			{/* Back Button */}
			<Button
				onClick={() => navigate("/bestiario")}
				variant="outline"
				className="gap-2 border-amber-600/30 text-amber-200 hover:bg-amber-950/30 hover:text-amber-100"
			>
				<ArrowLeft className="h-4 w-4" />
				Volver al Bestiario
			</Button>

			{/* Hero header */}
			{(() => {
				const imgSrc = (monster.image || monster.image_url || "").startsWith(
					"/api/",
				)
					? `${DND5E_API_URL}${monster.image || monster.image_url}`
					: monster.image || monster.image_url || null;
				return (
					<section className="relative rounded-2xl overflow-hidden border border-amber-600/20 shadow-2xl min-h-[280px] flex items-end">
						{/* Background */}
						{imgSrc ? (
							<div
								className="absolute inset-0 bg-cover bg-center scale-105"
								style={{ backgroundImage: `url(${imgSrc})` }}
							/>
						) : (
							<div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 to-stone-900" />
						)}
						{/* Overlays */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
						<div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

						{/* Centered portrait for creatures with image */}
						{imgSrc && (
							<div className="absolute inset-0 flex items-center justify-center">
								<img
									src={imgSrc}
									alt={monster.name}
									className="h-64 object-contain drop-shadow-2xl"
								/>
							</div>
						)}

						{/* Content overlay */}
						<div className="relative z-10 p-8 w-full">
							<div className="flex flex-wrap items-end justify-between gap-4">
								<div>
									<div className="flex items-center gap-3 mb-2">
										<Skull className="h-6 w-6 text-amber-400" />
										<h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
											{monster.name}
										</h1>
									</div>
									{monster.size && monster.type && (
										<p className="text-amber-200/90 text-sm">
											{monster.size} {monster.type}
											{monster.subtype && ` (${monster.subtype})`}
											{monster.alignment && ` · ${monster.alignment}`}
										</p>
									)}
									{monster.desc && (
										<p className="mt-2 text-gray-300 text-sm italic max-w-2xl">
											{monster.desc}
										</p>
									)}
								</div>
								{monster.challenge_rating !== undefined && (
									<div className="flex flex-col items-center bg-amber-600/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-amber-500/50 shadow-lg">
										<span className="text-xs text-amber-200 uppercase tracking-widest">
											CR
										</span>
										<span className="text-3xl font-black text-white">
											{monster.challenge_rating}
										</span>
										{monster.xp !== undefined && (
											<span className="text-xs text-amber-200">
												{monster.xp.toLocaleString()} XP
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					</section>
				);
			})()}

			{/* Basic Stats */}
			<Card className="bg-dark-card border-dark-border">
				<CardHeader>
					<CardTitle className="text-amber-100">Estadísticas Básicas</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{monster.armor_class !== undefined && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Clase de Armadura
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{formatArmorClass(monster.armor_class)}
							</span>
						</div>
					)}
					{monster.hit_points !== undefined && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Puntos de Golpe
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{monster.hit_points}
								{monster.hit_dice && ` (${monster.hit_dice})`}
							</span>
						</div>
					)}
					{monster.speed && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">Velocidad</span>
							<span className="text-sm text-gray-200">
								{formatSpeed(monster.speed)}
							</span>
						</div>
					)}
					{monster.proficiency_bonus !== undefined && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Bonificador de Competencia
							</span>
							<span className="text-lg font-semibold text-amber-200">
								+{monster.proficiency_bonus}
							</span>
						</div>
					)}
					{monster.xp !== undefined && (
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase">
								Experiencia
							</span>
							<span className="text-lg font-semibold text-amber-200">
								{monster.xp.toLocaleString()} XP
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Ability Scores */}
			{(monster.strength ||
				monster.dexterity ||
				monster.constitution ||
				monster.intelligence ||
				monster.wisdom ||
				monster.charisma) && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">
							Puntuaciones de Habilidad
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						{monster.strength !== undefined && (
							<div className="flex flex-col items-center p-3 bg-dark-lighter rounded-lg">
								<span className="text-xs text-gray-400 uppercase">FUE</span>
								<span className="text-2xl font-bold text-amber-200">
									{monster.strength}
								</span>
								<span className="text-xs text-gray-500">
									({Math.floor((monster.strength - 10) / 2) >= 0 ? "+" : ""}
									{Math.floor((monster.strength - 10) / 2)})
								</span>
							</div>
						)}
						{monster.dexterity !== undefined && (
							<div className="flex flex-col items-center p-3 bg-dark-lighter rounded-lg">
								<span className="text-xs text-gray-400 uppercase">DES</span>
								<span className="text-2xl font-bold text-amber-200">
									{monster.dexterity}
								</span>
								<span className="text-xs text-gray-500">
									({Math.floor((monster.dexterity - 10) / 2) >= 0 ? "+" : ""}
									{Math.floor((monster.dexterity - 10) / 2)})
								</span>
							</div>
						)}
						{monster.constitution !== undefined && (
							<div className="flex flex-col items-center p-3 bg-dark-lighter rounded-lg">
								<span className="text-xs text-gray-400 uppercase">CON</span>
								<span className="text-2xl font-bold text-amber-200">
									{monster.constitution}
								</span>
								<span className="text-xs text-gray-500">
									({Math.floor((monster.constitution - 10) / 2) >= 0 ? "+" : ""}
									{Math.floor((monster.constitution - 10) / 2)})
								</span>
							</div>
						)}
						{monster.intelligence !== undefined && (
							<div className="flex flex-col items-center p-3 bg-dark-lighter rounded-lg">
								<span className="text-xs text-gray-400 uppercase">INT</span>
								<span className="text-2xl font-bold text-amber-200">
									{monster.intelligence}
								</span>
								<span className="text-xs text-gray-500">
									({Math.floor((monster.intelligence - 10) / 2) >= 0 ? "+" : ""}
									{Math.floor((monster.intelligence - 10) / 2)})
								</span>
							</div>
						)}
						{monster.wisdom !== undefined && (
							<div className="flex flex-col items-center p-3 bg-dark-lighter rounded-lg">
								<span className="text-xs text-gray-400 uppercase">SAB</span>
								<span className="text-2xl font-bold text-amber-200">
									{monster.wisdom}
								</span>
								<span className="text-xs text-gray-500">
									({Math.floor((monster.wisdom - 10) / 2) >= 0 ? "+" : ""}
									{Math.floor((monster.wisdom - 10) / 2)})
								</span>
							</div>
						)}
						{monster.charisma !== undefined && (
							<div className="flex flex-col items-center p-3 bg-dark-lighter rounded-lg">
								<span className="text-xs text-gray-400 uppercase">CAR</span>
								<span className="text-2xl font-bold text-amber-200">
									{monster.charisma}
								</span>
								<span className="text-xs text-gray-500">
									({Math.floor((monster.charisma - 10) / 2) >= 0 ? "+" : ""}
									{Math.floor((monster.charisma - 10) / 2)})
								</span>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Proficiencies */}
			{monster.proficiencies && monster.proficiencies.length > 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">Competencias</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{monster.proficiencies.map((prof: any, idx: number) => (
								<div key={idx} className="flex justify-between text-sm">
									<span className="text-gray-400">
										{prof.proficiency?.name || "Unknown"}:
									</span>
									<span className="text-gray-200 font-semibold">
										+{prof.value}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Resistances and Immunities */}
			{((monster.damage_vulnerabilities &&
				monster.damage_vulnerabilities.length > 0) ||
				(monster.damage_resistances && monster.damage_resistances.length > 0) ||
				(monster.damage_immunities && monster.damage_immunities.length > 0) ||
				(monster.condition_immunities &&
					monster.condition_immunities.length > 0)) && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">
							Resistencias e Inmunidades
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{monster.damage_vulnerabilities &&
							monster.damage_vulnerabilities.length > 0 && (
								<div>
									<span className="text-sm text-gray-400">
										Vulnerabilidades al Daño:{" "}
									</span>
									<span className="text-sm text-gray-200">
										{monster.damage_vulnerabilities.join(", ")}
									</span>
								</div>
							)}
						{monster.damage_resistances &&
							monster.damage_resistances.length > 0 && (
								<div>
									<span className="text-sm text-gray-400">
										Resistencias al Daño:{" "}
									</span>
									<span className="text-sm text-gray-200">
										{monster.damage_resistances.join(", ")}
									</span>
								</div>
							)}
						{monster.damage_immunities &&
							monster.damage_immunities.length > 0 && (
								<div>
									<span className="text-sm text-gray-400">
										Inmunidades al Daño:{" "}
									</span>
									<span className="text-sm text-gray-200">
										{monster.damage_immunities.join(", ")}
									</span>
								</div>
							)}
						{monster.condition_immunities &&
							monster.condition_immunities.length > 0 && (
								<div>
									<span className="text-sm text-gray-400">
										Inmunidades a Condiciones:{" "}
									</span>
									<span className="text-sm text-gray-200">
										{monster.condition_immunities
											.map((c: any) => c.name || c)
											.join(", ")}
									</span>
								</div>
							)}
					</CardContent>
				</Card>
			)}

			{/* Senses and Languages */}
			{(monster.senses || monster.languages) && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">Sentidos e Idiomas</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{monster.senses && (
							<div>
								<span className="text-sm text-gray-400">Sentidos: </span>
								<span className="text-sm text-gray-200">
									{Object.entries(monster.senses)
										.map(([key, value]) => `${key}: ${value}`)
										.join(", ")}
								</span>
							</div>
						)}
						{monster.languages && (
							<div>
								<span className="text-sm text-gray-400">Idiomas: </span>
								<span className="text-sm text-gray-200">
									{monster.languages}
								</span>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Special Abilities */}
			{monster.special_abilities && monster.special_abilities.length > 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">
							Habilidades Especiales
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{monster.special_abilities.map((ability: any, idx: number) => (
							<div key={idx} className="border-l-2 border-amber-600/50 pl-4">
								<h4 className="font-semibold text-amber-200 mb-1">
									{ability.name}
								</h4>
								<p className="text-sm text-gray-300">{ability.desc}</p>
								{ability.usage && (
									<p className="text-xs text-gray-500 mt-1">
										Uso: {ability.usage.times} veces {ability.usage.type}
									</p>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Actions */}
			{monster.actions && monster.actions.length > 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">Acciones</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{monster.actions.map((action: any, idx: number) => (
							<div key={idx} className="border-l-2 border-amber-600/50 pl-4">
								<h4 className="font-semibold text-amber-200 mb-1">
									{action.name}
									{action.attack_bonus &&
										` (+${action.attack_bonus} al ataque)`}
								</h4>
								<p className="text-sm text-gray-300">{action.desc}</p>
								{action.damage && action.damage.length > 0 && (
									<div className="mt-2 text-xs text-gray-400">
										Daño:{" "}
										{action.damage
											.map(
												(d: any) =>
													`${d.damage_dice} ${d.damage_type?.name || ""}`,
											)
											.join(", ")}
									</div>
								)}
								{action.usage && (
									<p className="text-xs text-gray-500 mt-1">
										{action.usage.type === "recharge on roll"
											? `Recarga ${action.usage.min_value}-6 en ${action.usage.dice}`
											: `${action.usage.times} veces ${action.usage.type}`}
									</p>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Legendary Actions */}
			{monster.legendary_actions && monster.legendary_actions.length > 0 && (
				<Card className="bg-dark-card border-dark-border border-amber-600/30">
					<CardHeader>
						<CardTitle className="text-amber-100">
							Acciones Legendarias
						</CardTitle>
						<CardDescription className="text-gray-400">
							Esta criatura puede realizar 3 acciones legendarias, eligiendo
							entre las opciones siguientes.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{monster.legendary_actions.map((action: any, idx: number) => (
							<div key={idx} className="border-l-2 border-amber-500 pl-4">
								<h4 className="font-semibold text-amber-200 mb-1">
									{action.name}
								</h4>
								<p className="text-sm text-gray-300">{action.desc}</p>
								{action.damage && action.damage.length > 0 && (
									<div className="mt-2 text-xs text-gray-400">
										Daño:{" "}
										{action.damage
											.map(
												(d: any) =>
													`${d.damage_dice} ${d.damage_type?.name || ""}`,
											)
											.join(", ")}
									</div>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Reactions */}
			{monster.reactions && monster.reactions.length > 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardHeader>
						<CardTitle className="text-amber-100">Reacciones</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{monster.reactions.map((reaction: any, idx: number) => (
							<div key={idx} className="border-l-2 border-amber-600/50 pl-4">
								<h4 className="font-semibold text-amber-200 mb-1">
									{reaction.name}
								</h4>
								<p className="text-sm text-gray-300">{reaction.desc}</p>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default BestiarioDetalleScene;
