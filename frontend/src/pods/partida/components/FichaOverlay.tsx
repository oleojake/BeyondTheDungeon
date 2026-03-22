// ================================================
// FichaOverlay – Character sheet in a full-screen overlay
// ================================================
// Shows key character stats and allows editing.
// Players can only open their own sheet.
// DM can open/edit anyone's sheet.
// ================================================

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryManager } from "./InventoryManager";
import type { CompendiumItem } from "./inventory/types";
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

function isSmallRace(race: string): boolean {
	const smallRaces = ["Enano", "Gnomo", "Mediano"];
	return smallRaces.some((smallRace) => race.includes(smallRace));
}

function calculateAutoMaxCarryWeight(strength: number, race: string): number {
	const multiplier = isSmallRace(race) ? 15 : 15;
	return strength * multiplier;
}

export function FichaOverlay({ member, canEdit, onClose, onSave }: Props) {
	const char = member.character;
	const stats = (char?.stats ?? {}) as Record<string, unknown>;

	const [editStats, setEditStats] = useState<Record<string, unknown>>({ ...stats });
	const [inventory, setInventory] = useState(char?.inventory ?? "");
	const [equipment, setEquipment] = useState(char?.equipment ?? "");
	const [notes, setNotes] = useState(char?.notes ?? "");
	const [expPoints, setExpPoints] = useState(char?.experience_points ?? 0);
	const [saving, setSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);

	// Compendium items for InventoryManager
	const [compendiumItems, setCompendiumItems] = useState<CompendiumItem[]>([]);

	// Fetch compendium items
	useEffect(() => {
		const API_URL = import.meta.env.VITE_API_URL || "";
		fetch(`${API_URL}/api/compendium-items`)
			.then((r) => r.json())
			.then(({ items }) => {
				if (Array.isArray(items)) setCompendiumItems(items as CompendiumItem[]);
			})
			.catch(() => {
				/* silently ignore – dropdown will show empty */
			});
	}, []);

	// Detectar cambios
	useEffect(() => {
		const hasChanges =
			JSON.stringify(editStats) !== JSON.stringify(stats) ||
			inventory !== (char?.inventory ?? "") ||
			equipment !== (char?.equipment ?? "") ||
			notes !== (char?.notes ?? "") ||
			expPoints !== (char?.experience_points ?? 0);
		setHasUnsavedChanges(hasChanges);
	}, [editStats, inventory, equipment, notes, expPoints, stats, char]);

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
		setSaveSuccess(false);
		try {
			await onSave(member.user_id, char.id, {
				stats: editStats,
				inventory,
				equipment,
				notes,
				experience_points: expPoints,
			});
			setSaveSuccess(true);
			setHasUnsavedChanges(false);
			// Auto-hide success message after 2 seconds
			setTimeout(() => setSaveSuccess(false), 2000);
		} finally {
			setSaving(false);
		}
	};

	const handleCloseWithWarning = () => {
		if (canEdit && hasUnsavedChanges) {
			setShowCloseConfirm(true);
		} else {
			onClose();
		}
	};

	const displayName =
		member.profile?.display_name || member.profile?.username || "Jugador";
	const classes = char.classes
		.map((c) => `${c.name} ${c.level}`)
		.join(" / ");

	return (
		<>
			{showCloseConfirm && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
					<div className="bg-[#1a0e06] border border-amber-800/50 rounded-xl p-6 max-w-sm shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<AlertCircle className="w-6 h-6 text-amber-500" />
							<h3 className="text-lg font-bold text-amber-300">Cambios sin guardar</h3>
						</div>
						<p className="text-gray-300 mb-6">
							Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?
						</p>
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={() => setShowCloseConfirm(false)}
								className="flex-1"
							>
								Cancelar
							</Button>
							<Button
								onClick={onClose}
								className="flex-1 bg-red-700 hover:bg-red-600 text-white"
							>
								Cerrar sin guardar
							</Button>
						</div>
					</div>
				</div>
			)}

			<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
				<div className="bg-[#1a0e06] border border-amber-800/50 rounded-xl w-full max-w-3xl shadow-2xl">
					{/* Toast de guardado exitoso */}
					{saveSuccess && (
						<div className="bg-green-900/30 border-b border-green-800/50 px-4 py-3 flex items-center gap-2 text-green-300">
							<CheckCircle className="w-5 h-5" />
							<span>Cambios guardados exitosamente</span>
						</div>
					)}

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
									className={`text-white transition-colors ${
										hasUnsavedChanges
											? "bg-amber-700 hover:bg-amber-600"
											: "bg-gray-600 hover:bg-gray-500"
									}`}
								>
									<Save className="w-4 h-4 mr-1" />
									{saving ? "Guardando..." : "Guardar"}
								</Button>
							)}
							<button onClick={handleCloseWithWarning} className="text-gray-400 hover:text-white">
								{hasUnsavedChanges && canEdit && (
									<div className="absolute w-2 h-2 bg-amber-400 rounded-full -top-2 -right-2" />
								)}
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					<Tabs defaultValue="stats" className="p-4">
						<TabsList className="bg-gray-800/50 mb-4">
							<TabsTrigger value="stats">Stats</TabsTrigger>
							<TabsTrigger value="combate">Combate</TabsTrigger>
							<TabsTrigger value="inventario">Inventario</TabsTrigger>
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

						{/* ── Inventario (Equipo + Inventario + Notas) ── */}
						<TabsContent value="inventario">
							<div className="space-y-4">
								<InventoryManager
									inventory={inventory}
									onInventoryChange={(val) => { if (canEdit) setInventory(val); }}
									compendiumItems={compendiumItems}
									notes={notes}
									onNotesChange={(val) => { if (canEdit) setNotes(val); }}
									maxCarryWeight={Number(editStats.max_carry_weight) || 150}
									autoMaxCarryWeight={calculateAutoMaxCarryWeight(Number(editStats.strength) || 10, char.race || "")}
									onMaxCarryWeightChange={(weight) => {
										if (!canEdit) return;
										setEditStats((prev) => ({
											...prev,
											max_carry_weight: Math.max(0, weight),
										}));
									}}
									readOnly={!canEdit}
								/>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
