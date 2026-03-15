// ================================================
// FichaOverlay – Character sheet in a full-screen overlay
// ================================================
// Shows key character stats and allows editing.
// Players can only open their own sheet.
// DM can open/edit anyone's sheet.
// ================================================

import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SessionMember } from "../partida.vm";

interface Props {
	member: SessionMember;
	canEdit: boolean;
	onClose: () => void;
	onSave: (memberId: string, characterId: string, updates: CharacterUpdates) => Promise<void>;
}

export interface CharacterUpdates {
	stats?: Record<string, unknown>;
	inventory?: string;
	spells_known?: string;
	equipment?: string;
	notes?: string;
	experience_points?: number;
}

const ABILITY_LABELS: Record<string, string> = {
	strength: "Fuerza",
	dexterity: "Destreza",
	constitution: "Constitución",
	intelligence: "Inteligencia",
	wisdom: "Sabiduría",
	charisma: "Carisma",
};

function calcMod(score: number): string {
	const mod = Math.floor((score - 10) / 2);
	return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function FichaOverlay({ member, canEdit, onClose, onSave }: Props) {
	const char = member.character;
	const stats = (char?.stats ?? {}) as Record<string, unknown>;

	const [editStats, setEditStats] = useState<Record<string, unknown>>({ ...stats });
	const [inventory, setInventory] = useState(char?.inventory ?? "");
	const [spellsKnown, setSpellsKnown] = useState(char?.spells_known ?? "");
	const [equipment, setEquipment] = useState(char?.equipment ?? "");
	const [notes, setNotes] = useState(char?.notes ?? "");
	const [expPoints, setExpPoints] = useState(char?.experience_points ?? 0);
	const [saving, setSaving] = useState(false);

	if (!char) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
				<div className="bg-[#1a0e06] border border-amber-800/50 rounded-xl p-8 text-center">
					<p className="text-amber-300">Este jugador no tiene ficha en esta campaña.</p>
					<Button variant="outline" className="mt-4" onClick={onClose}>
						Cerrar
					</Button>
				</div>
			</div>
		);
	}

	const handleSave = async () => {
		if (!canEdit) return;
		setSaving(true);
		try {
			await onSave(member.user_id, char.id, {
				stats: editStats,
				inventory,
				spells_known: spellsKnown,
				equipment,
				notes,
				experience_points: expPoints,
			});
		} finally {
			setSaving(false);
		}
	};

	const displayName =
		member.profile?.display_name || member.profile?.username || "Jugador";
	const classes = char.classes
		.map((c) => `${c.name} ${c.level}`)
		.join(" / ");

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
			<div className="bg-[#1a0e06] border border-amber-800/50 rounded-xl w-full max-w-3xl shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-amber-900/30">
					<div className="flex items-center gap-3">
						{(char.avatar_url || member.profile?.avatar_url) && (
							<img
								src={char.avatar_url || member.profile?.avatar_url || ""}
								alt={char.name}
								className="w-12 h-12 rounded-full object-cover border-2 border-amber-700"
							/>
						)}
						<div>
							<h2 className="text-xl font-bold text-amber-300">{char.name}</h2>
							<p className="text-sm text-gray-400">
								{char.race} · {classes} · {displayName}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{canEdit && (
							<Button
								size="sm"
								onClick={handleSave}
								disabled={saving}
								className="bg-amber-700 hover:bg-amber-600 text-white"
							>
								<Save className="w-4 h-4 mr-1" />
								{saving ? "Guardando..." : "Guardar"}
							</Button>
						)}
						<button onClick={onClose} className="text-gray-400 hover:text-white">
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				<Tabs defaultValue="stats" className="p-4">
					<TabsList className="bg-gray-800/50 mb-4">
						<TabsTrigger value="stats">Stats</TabsTrigger>
						<TabsTrigger value="combate">Combate</TabsTrigger>
						<TabsTrigger value="equipo">Equipo</TabsTrigger>
						<TabsTrigger value="hechizos">Hechizos</TabsTrigger>
						<TabsTrigger value="notas">Notas</TabsTrigger>
					</TabsList>

					{/* ── Stats ── */}
					<TabsContent value="stats">
						<div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
							{Object.entries(ABILITY_LABELS).map(([key, label]) => {
								const value = Number(editStats[key] ?? 10);
								return (
									<div
										key={key}
										className="flex flex-col items-center gap-1 bg-gray-800/40 rounded p-2"
									>
										<span className="text-xs text-gray-400">{label}</span>
										{canEdit ? (
											<Input
												type="number"
												min={1}
												max={30}
												value={value}
												onChange={(e) =>
													setEditStats({
														...editStats,
														[key]: parseInt(e.target.value) || 10,
													})
												}
												className="w-full text-center bg-gray-700 border-gray-600 text-amber-300 h-8"
											/>
										) : (
											<span className="text-xl font-bold text-amber-300">
												{value}
											</span>
										)}
										<span className="text-xs text-amber-500">
											{calcMod(value)}
										</span>
									</div>
								);
							})}
						</div>
						<div className="mt-4 flex items-center gap-4">
							<div className="flex flex-col gap-1">
								<label className="text-xs text-gray-400">Experiencia</label>
								{canEdit ? (
									<Input
										type="number"
										min={0}
										value={expPoints}
										onChange={(e) =>
											setExpPoints(parseInt(e.target.value) || 0)
										}
										className="w-28 bg-gray-700 border-gray-600 text-amber-300 h-8"
									/>
								) : (
									<span className="text-amber-300 font-bold">{expPoints} XP</span>
								)}
							</div>
						</div>
					</TabsContent>

					{/* ── Combate ── */}
					<TabsContent value="combate">
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{[
								{ key: "max_hp", label: "HP Máx" },
								{ key: "current_hp", label: "HP Act." },
								{ key: "temp_hp", label: "HP Temp" },
								{ key: "armor_class", label: "CA" },
								{ key: "initiative", label: "Iniciativa" },
								{ key: "speed", label: "Velocidad" },
								{ key: "proficiency_bonus", label: "Bon. Comp." },
							].map(({ key, label }) => {
								const value = Number(editStats[key] ?? 0);
								return (
									<div
										key={key}
										className="flex flex-col items-center gap-1 bg-gray-800/40 rounded p-2"
									>
										<span className="text-xs text-gray-400">{label}</span>
										{canEdit ? (
											<Input
												type="number"
												value={value}
												onChange={(e) =>
													setEditStats({
														...editStats,
														[key]: parseInt(e.target.value) || 0,
													})
												}
												className="w-full text-center bg-gray-700 border-gray-600 text-amber-300 h-8"
											/>
										) : (
											<span className="text-xl font-bold text-amber-300">
												{value}
											</span>
										)}
									</div>
								);
							})}
						</div>
					</TabsContent>

					{/* ── Equipo ── */}
					<TabsContent value="equipo">
						<div className="space-y-3">
							<div>
								<label className="text-sm text-amber-300 block mb-1">
									Equipo
								</label>
								<Textarea
									value={equipment}
									onChange={(e) =>
										canEdit && setEquipment(e.target.value)
									}
									readOnly={!canEdit}
									rows={4}
									className="bg-gray-800/50 border-gray-700 text-gray-300 resize-none"
									placeholder="Espada larga, escudo, armadura de cuero..."
								/>
							</div>
							<div>
								<label className="text-sm text-amber-300 block mb-1">
									Inventario
								</label>
								<Textarea
									value={inventory}
									onChange={(e) =>
										canEdit && setInventory(e.target.value)
									}
									readOnly={!canEdit}
									rows={4}
									className="bg-gray-800/50 border-gray-700 text-gray-300 resize-none"
									placeholder="Objetos, monedas..."
								/>
							</div>
						</div>
					</TabsContent>

					{/* ── Hechizos ── */}
					<TabsContent value="hechizos">
						<Textarea
							value={spellsKnown}
							onChange={(e) =>
								canEdit && setSpellsKnown(e.target.value)
							}
							readOnly={!canEdit}
							rows={10}
							className="bg-gray-800/50 border-gray-700 text-gray-300 resize-none"
							placeholder="Hechizos conocidos..."
						/>
					</TabsContent>

					{/* ── Notas ── */}
					<TabsContent value="notas">
						<Textarea
							value={notes}
							onChange={(e) => canEdit && setNotes(e.target.value)}
							readOnly={!canEdit}
							rows={10}
							className="bg-gray-800/50 border-gray-700 text-gray-300 resize-none"
							placeholder="Notas del personaje..."
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
