// ================================================
// PanelJugadores – Left player panel
// ================================================
// Shows avatar + name of each non-DM participant.
// Clicking opens that player's character sheet overlay.
// Players can only open their own. DM can open everyone's.
// ================================================

import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SessionMember, SessionToken } from "../partida.vm";

interface Props {
	members: SessionMember[];
	tokens: SessionToken[];
	isDM: boolean;
	currentUserId: string;
	onOpenFicha: (member: SessionMember) => void;
}

export function PanelJugadores({
	members,
	tokens,
	isDM,
	currentUserId,
	onOpenFicha,
}: Props) {
	const { t } = useTranslation();
	// Only show non-DM members (players) in this panel
	const players = members.filter((m) => m.role !== "dm");

	return (
		<aside className="w-20 flex flex-col items-center gap-3 py-4 bg-[#120a04] border-r border-amber-900/30 overflow-y-auto shrink-0">
			{players.map((member) => {
				const token = tokens.find((t) => t.user_id === member.user_id);
				const canOpen = isDM || member.user_id === currentUserId;
				const displayName =
					member.character?.name ||
					member.profile?.display_name ||
					member.profile?.username ||
					t("session.player");
				const avatarUrl =
					member.character?.avatar_url || member.profile?.avatar_url;

				return (
					<button
						key={member.user_id}
						onClick={() => canOpen && onOpenFicha(member)}
						className={`flex flex-col items-center gap-1 group relative ${
							canOpen ? "cursor-pointer" : "cursor-default"
						}`}
						title={displayName}
					>
						{/* HP bar under avatar (visible once token exists) */}
						<div className="relative">
							<div
								className={`w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-800 ${
									canOpen
										? "group-hover:border-amber-500 border-amber-700/50 transition-colors"
										: "border-gray-600"
								}`}
							>
								{avatarUrl ? (
									<img
										src={avatarUrl}
										alt={displayName}
										className="w-full h-full object-cover"
									/>
								) : (
									<User className="w-6 h-6 text-gray-400" />
								)}
							</div>
							{/* Online indicator */}
							<div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#120a04]" />
						</div>

						{/* HP */}
						{token && (
							<div className="text-xs text-amber-300 text-center leading-tight">
								<span className="text-green-400">{token.current_hp}</span>
								<span className="text-gray-500">/{token.max_hp}</span>
							</div>
						)}

						{/* Name */}
						<span className="text-xs text-amber-200/70 text-center leading-tight max-w-[68px] truncate">
							{displayName}
						</span>
					</button>
				);
			})}
		</aside>
	);
}
