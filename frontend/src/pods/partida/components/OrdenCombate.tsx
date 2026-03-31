// ================================================
// OrdenCombate – Initiative order bar (top of screen)
// ================================================
// Shows tokens in initiative order during combat.
// Active token has a glowing border.
// DM can drag tokens to reorder (HTML5 drag-and-drop).
// DM can remove tokens by clicking the X.
// ================================================

import { X, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { SessionToken, CombatState } from "../partida.vm";

interface Props {
	tokens: SessionToken[];
	combatState: CombatState;
	isDM: boolean;
	currentUserId: string;
	onReorder: (newOrder: string[]) => void;
	onRemove: (tokenId: string) => void;
	onEndTurn: () => void;
}

export function OrdenCombate({
	tokens,
	combatState,
	isDM,
	currentUserId,
	onReorder,
	onRemove,
	onEndTurn,
}: Props) {
	const { t } = useTranslation();
	const [draggedId, setDraggedId] = useState<string | null>(null);

	const orderedTokens = combatState.initiative_order
		.map((id) => tokens.find((t) => t.id === id))
		.filter(Boolean) as SessionToken[];

	const activeToken = orderedTokens[combatState.current_turn_index] ?? null;
	// DM can always end turn (table play mode), player can end only their own turn.
	const canEndTurn = isDM || activeToken?.user_id === currentUserId;

	// Drag-and-drop (DM only)
	const handleDragStart = (e: React.DragEvent, tokenId: string) => {
		if (!isDM) return;
		setDraggedId(tokenId);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDrop = (e: React.DragEvent, targetId: string) => {
		e.preventDefault();
		if (!isDM || !draggedId || draggedId === targetId) return;

		const newOrder = [...combatState.initiative_order];
		const fromIdx = newOrder.indexOf(draggedId);
		const toIdx = newOrder.indexOf(targetId);
		newOrder.splice(fromIdx, 1);
		newOrder.splice(toIdx, 0, draggedId);
		onReorder(newOrder);
		setDraggedId(null);
	};

	return (
		<div className="flex items-center gap-2 px-4 py-2 bg-[#0d0608] border-b border-red-900/40 overflow-x-auto shrink-0">
			<span className="text-xs text-red-400 font-semibold whitespace-nowrap mr-2">
				⚔️ {t("combat.header", { round: combatState.round_number })}
			</span>

			<div className="flex items-center gap-2 flex-1 overflow-x-auto">
				{orderedTokens.map((token, idx) => {
					const isActive = idx === combatState.current_turn_index;
					return (
						<div
							key={token.id}
							draggable={isDM}
							onDragStart={(e) => handleDragStart(e, token.id)}
							onDragOver={(e) => e.preventDefault()}
							onDrop={(e) => handleDrop(e, token.id)}
							className={`relative flex flex-col items-center gap-1 p-1 rounded shrink-0 transition-all ${
								isActive
									? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-black"
									: ""
							} ${isDM ? "cursor-grab" : ""} ${
								draggedId === token.id ? "opacity-40" : ""
							}`}
						>
							<div
								className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${
									isActive ? "border-yellow-400" : "border-gray-600"
								} bg-gray-800`}
							>
								{token.entity_image ? (
									<img
										src={token.entity_image}
										alt={token.entity_name}
										className="w-full h-full object-cover"
									/>
								) : (
									<User className="w-5 h-5 text-gray-400" />
								)}
							</div>

							<span className="text-xs text-gray-300 max-w-[56px] truncate text-center">
							{token.entity_name}
						</span>

						{/* HP */}
							<div className="text-xs leading-tight text-center">
								<span
									className={
										token.current_hp <= 0
											? "text-red-500"
											: "text-green-400"
									}
								>
									{token.current_hp}
								</span>
								<span className="text-gray-500">/{token.max_hp}</span>
							</div>

							{/* Remove button (DM only) */}
							{isDM && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onRemove(token.id);
									}}
									className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500"
									title={t("combat.removeFromCombat")}
								>
									<X className="w-2.5 h-2.5 text-white" />
								</button>
							)}
						</div>
					);
				})}
			</div>

			{/* Terminar turno */}
			{canEndTurn && (
				<button
					onClick={onEndTurn}
					className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold rounded whitespace-nowrap"
				>
					{t("combat.endTurn")}
				</button>
			)}
		</div>
	);
}
