// ================================================
// DialogoIniciarCombate – Start combat dialog
// ================================================
// DM selects participants and surprise rules.
// Shows player tokens + scene enemies/NPCs with checkboxes.
// ================================================

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import type { CombatParticipantCandidate } from "../partida.vm";

interface Props {
	open: boolean;
	participants: CombatParticipantCandidate[];
	onConfirm: (
		participantIds: string[],
		surprise: "none" | "heroes" | "enemies"
	) => void;
	onCancel: () => void;
}

export function DialogoIniciarCombate({
	open,
	participants,
	onConfirm,
	onCancel,
}: Props) {
	const [selected, setSelected] = useState<Set<string>>(
		() => new Set(participants.map((p) => p.id))
	);
		useEffect(() => {
			if (!open) return;
			setSelected(new Set(participants.map((p) => p.id)));
		}, [open, participants]);

	const [surprise, setSurprise] = useState<"none" | "heroes" | "enemies">(
		"none"
	);

	const toggleToken = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleConfirm = () => {
		onConfirm(Array.from(selected), surprise);
	};

	const tokensByType = {
		player: participants.filter((t) => t.tokenType === "player"),
		enemy: participants.filter((t) => t.tokenType === "enemy"),
		npc: participants.filter((t) => t.tokenType === "npc"),
	};

	const renderGroup = (label: string, group: CombatParticipantCandidate[]) => {
		if (group.length === 0) return null;
		return (
			<div className="mb-4">
				<h3 className="text-sm font-semibold text-amber-400 mb-2">{label}</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
					{group.map((token) => (
						<label
							key={token.id}
							className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
								selected.has(token.id)
									? "border-amber-500 bg-amber-900/20"
									: "border-gray-700 bg-gray-800/30"
							}`}
						>
							<Checkbox
								checked={selected.has(token.id)}
								onCheckedChange={() => toggleToken(token.id)}
								className="border-amber-600"
							/>
							<div className="flex items-center gap-1.5 min-w-0">
								<div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-700 shrink-0">
									{token.image ? (
										<img
											src={token.image}
											alt={token.label}
											className="w-full h-full object-cover"
										/>
									) : (
										<User className="w-4 h-4 text-gray-400" />
									)}
								</div>
								<span className="text-xs text-gray-200 truncate">
									{token.label}
								</span>
							</div>
						</label>
					))}
				</div>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
			<DialogContent className="bg-[#1a0e06] border-amber-800/50 max-w-lg text-gray-200">
				<DialogHeader>
					<DialogTitle className="text-amber-300">
						⚔️ Iniciar Enfrentamiento
					</DialogTitle>
				</DialogHeader>

				<div className="max-h-80 overflow-y-auto py-2">
					{renderGroup("Héroes", tokensByType.player)}
					{renderGroup("Enemigos", tokensByType.enemy)}
					{renderGroup("NPCs", tokensByType.npc)}
					{participants.length === 0 && (
						<p className="text-gray-500 text-sm text-center py-4">
							No hay participantes en la escena seleccionada.
							<br />
							Selecciona una escena con heroes/enemigos/NPC para iniciar combate.
						</p>
					)}
				</div>

				{/* Surprise */}
				<div className="flex items-center gap-3 border-t border-gray-700 pt-3">
					<label className="text-sm text-gray-300 whitespace-nowrap">
						¿Sorpresa?
					</label>
					<Select
						value={surprise}
						onValueChange={(v) =>
							setSurprise(v as "none" | "heroes" | "enemies")
						}
					>
						<SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-gray-800 border-gray-600">
							<SelectItem value="none">Sin sorpresa</SelectItem>
							<SelectItem value="heroes">
								Los héroes pillan por sorpresa a los enemigos
							</SelectItem>
							<SelectItem value="enemies">
								Los enemigos pillan por sorpresa a los héroes
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{surprise !== "none" && (
					<p className="text-xs text-amber-500 bg-amber-900/20 rounded p-2">
						{surprise === "enemies"
							? "Los héroes sorprendidos no pueden actuar en el primer turno (D&D 5e Reglas de Sorpresa)."
							: "Los enemigos sorprendidos no pueden actuar en el primer turno (D&D 5e Reglas de Sorpresa)."}
					</p>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button
						onClick={handleConfirm}
						className="bg-red-700 hover:bg-red-600 text-white"
						disabled={selected.size === 0}
					>
						¡Comenzar!
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
