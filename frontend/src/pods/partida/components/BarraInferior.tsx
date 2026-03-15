// ================================================
// BarraInferior – Bottom toolbar
// ================================================
// Visible to all participants.
// Links: dice roller (opens overlay), compendiums (new tab).
// ================================================

import { Dice5, BookOpen, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
	onOpenDados: () => void;
	campaignTitle: string;
}

export function BarraInferior({ onOpenDados, campaignTitle }: Props) {
	const openBestiario = () =>
		window.open("/bestiario", "_blank");
	const openHechizos = () =>
		window.open("/hechizos", "_blank");
	const openObjetos = () =>
		window.open("/objetos", "_blank");

	return (
		<footer className="flex items-center justify-between px-4 py-2 bg-[#0d0608] border-t border-amber-900/30 shrink-0">
			<span className="text-xs text-amber-700 hidden sm:block truncate max-w-[200px]">
				{campaignTitle}
			</span>

			<div className="flex items-center gap-2">
				<Button
					size="sm"
					variant="ghost"
					className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/30"
					onClick={onOpenDados}
				>
					<Dice5 className="w-4 h-4 mr-1" />
					Dados
				</Button>

				<Button
					size="sm"
					variant="ghost"
					className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/30"
					onClick={openBestiario}
				>
					<Swords className="w-4 h-4 mr-1" />
					Bestiario
				</Button>

				<Button
					size="sm"
					variant="ghost"
					className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/30"
					onClick={openHechizos}
				>
					<BookOpen className="w-4 h-4 mr-1" />
					Hechizos
				</Button>

				<Button
					size="sm"
					variant="ghost"
					className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/30"
					onClick={openObjetos}
				>
					<BookOpen className="w-4 h-4 mr-1" />
					Objetos
				</Button>
			</div>
		</footer>
	);
}
