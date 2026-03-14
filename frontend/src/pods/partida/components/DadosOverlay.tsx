// ================================================
// DadosOverlay – Dice roller floating over the game
// ================================================

import { useState } from "react";
import { X, Dice5 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiceResult {
	die: string;
	rolls: number[];
	total: number;
	modifier: number;
	timestamp: number;
}

interface Props {
	onClose: () => void;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

function rollDie(sides: number): number {
	return Math.floor(Math.random() * sides) + 1;
}

export function DadosOverlay({ onClose }: Props) {
	const [quantity, setQuantity] = useState(1);
	const [modifier, setModifier] = useState(0);
	const [results, setResults] = useState<DiceResult[]>([]);

	const roll = (sides: number) => {
		const rolls = Array.from({ length: quantity }, () => rollDie(sides));
		const total = rolls.reduce((a, b) => a + b, 0) + modifier;
		const result: DiceResult = {
			die: `${quantity}d${sides}`,
			rolls,
			total,
			modifier,
			timestamp: Date.now(),
		};
		setResults((prev) => [result, ...prev].slice(0, 15));
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="bg-[#1a0e06] border border-amber-800/50 rounded-xl p-6 w-full max-w-md shadow-2xl">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
						<Dice5 className="w-5 h-5" />
						Tirada de Dados
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-4 mb-4">
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-400">Cantidad</label>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
								className="w-7 h-7 rounded bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600"
							>
								-
							</button>
							<span className="w-8 text-center text-amber-300 font-bold">
								{quantity}
							</span>
							<button
								onClick={() => setQuantity(Math.min(20, quantity + 1))}
								className="w-7 h-7 rounded bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600"
							>
								+
							</button>
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-400">Modificador</label>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setModifier(modifier - 1)}
								className="w-7 h-7 rounded bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600"
							>
								-
							</button>
							<span className="w-10 text-center text-amber-300 font-bold">
								{modifier >= 0 ? `+${modifier}` : modifier}
							</span>
							<button
								onClick={() => setModifier(modifier + 1)}
								className="w-7 h-7 rounded bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600"
							>
								+
							</button>
						</div>
					</div>
				</div>

				{/* Dice buttons */}
				<div className="grid grid-cols-7 gap-2 mb-4">
					{DICE_TYPES.map((sides) => (
						<button
							key={sides}
							onClick={() => roll(sides)}
							className="flex flex-col items-center justify-center py-2 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/30 hover:border-amber-500/50 transition-all group"
						>
							<span className="text-lg font-bold text-amber-300 group-hover:text-amber-100">
								d{sides}
							</span>
						</button>
					))}
				</div>

				{/* Results */}
				<div className="space-y-2 max-h-48 overflow-y-auto">
					{results.length === 0 && (
						<p className="text-gray-500 text-sm text-center py-4">
							¡Pulsa un dado para tirar!
						</p>
					)}
					{results.map((r) => (
						<div
							key={r.timestamp}
							className="flex items-center justify-between bg-gray-800/60 rounded px-3 py-2"
						>
							<div className="flex flex-col">
								<span className="text-xs text-gray-400">{r.die}{r.modifier !== 0 ? (r.modifier > 0 ? `+${r.modifier}` : r.modifier) : ""}</span>
								<span className="text-xs text-gray-500">
									[{r.rolls.join(", ")}]
								</span>
							</div>
							<span className="text-2xl font-bold text-amber-300">
								{r.total}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
