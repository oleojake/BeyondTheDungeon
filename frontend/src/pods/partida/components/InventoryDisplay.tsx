// ================================================
// InventoryDisplay – Full inventory display (read-only version of inventario.scene)
// ================================================

import { Package, FlaskConical, ScrollText, Target, Coins, HardHat, Shirt, Wind, Grab, Sword, Swords, Circle, Footprints } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EquippedItem {
	id: string;
	name: string;
	type?: string;
	weight?: number;
	srdIndex?: string;
	tags?: string[];
}

interface BagItem {
	id: string;
	name: string;
	quantity: number;
	weight?: number;
	srdIndex?: string;
	tags?: string[];
}

interface Currency {
	pp: number;
	po: number;
	pe: number;
	pa: number;
	pc: number;
}

interface InventoryState {
	equipped: Record<string, EquippedItem | null>;
	potions: Array<{ id: string; name: string; quantity: number }>;
	scrolls: Array<{ id: string; name: string; quantity: number }>;
	ammo: Array<{ id: string; name: string; quantity: number }>;
	bag: BagItem[];
	currency: Currency;
}

interface Props {
	inventory: string;
}

const EQUIPMENT_SLOTS = [
	{ key: "helmet", labelKey: "inventory.slots.helmet", icon: "⛑️", col: 2, row: 1 },
	{ key: "amulet", labelKey: "inventory.slots.amulet", icon: "💎", col: 1, row: 2 },
	{ key: "armor", labelKey: "inventory.slots.armor", icon: "🛡️", col: 2, row: 2 },
	{ key: "cloak", labelKey: "inventory.slots.cloak", icon: "🧥", col: 3, row: 2 },
	{ key: "gloves", labelKey: "inventory.slots.gloves", icon: "🧤", col: 1, row: 3 },
	{ key: "mainhand", labelKey: "inventory.slots.mainhand", icon: "⚔️", col: 2, row: 3 },
	{ key: "offhand", labelKey: "inventory.slots.offhand", icon: "🗡️", col: 3, row: 3 },
	{ key: "ring1", labelKey: "inventory.slots.ringLeft", icon: "💍", col: 1, row: 4 },
	{ key: "belt", labelKey: "inventory.slots.belt", icon: "⭕", col: 2, row: 4 },
	{ key: "ring2", labelKey: "inventory.slots.ringRight", icon: "💍", col: 3, row: 4 },
	{ key: "boots", labelKey: "inventory.slots.boots", icon: "👢", col: 2, row: 5 },
	{ key: "mount", labelKey: "inventory.slots.mount", icon: "🐴", col: 3, row: 5 },
];

export function InventoryDisplay({ inventory }: Props) {
	const { t } = useTranslation();
	let parsed: InventoryState | null = null;

	try {
		if (inventory && inventory.trim().startsWith("{")) {
			parsed = JSON.parse(inventory) as InventoryState;
		}
	} catch {
		return (
			<div className="text-xs text-gray-400 italic p-4 bg-gray-900/30 rounded border border-gray-700">
				{t("inventory.errors.invalidStructured")}
			</div>
		);
	}

	if (!parsed) {
		return (
			<div className="text-xs text-gray-400 italic p-4 bg-gray-900/30 rounded border border-gray-700">
				{t("inventory.empty")}
			</div>
		);
	}

	const totalBagItems = parsed.bag.reduce((sum, item) => sum + item.quantity, 0);
	const totalPotions = parsed.potions.reduce((sum, item) => sum + item.quantity, 0);
	const totalScrolls = parsed.scrolls.reduce((sum, item) => sum + item.quantity, 0);
	const totalAmmo = parsed.ammo.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<div className="space-y-4">
			{/* PAPERDOLL - Equipo Equipado */}
			<div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-amber-300 mb-3">⚔️ {t("inventory.sections.equipped")}</h3>
				<div className="grid gap-2">
					{EQUIPMENT_SLOTS.map((slot) => (
						<div
							key={slot.key}
							className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700/50 hover:border-amber-700/50 transition-colors"
						>
							<div className="flex items-center gap-2">
								<span className="text-lg">{slot.icon}</span>
								<span className="text-xs text-gray-400 min-w-24">{t(slot.labelKey)}</span>
							</div>
							<span className="text-xs text-amber-300 font-semibold truncate">
								{parsed.equipped[slot.key]?.name || t("common.notAvailable")}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* POCIONES Y PERGAMINOS */}
			<div className="grid grid-cols-2 gap-3">
				{totalPotions > 0 && (
					<div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
						<h3 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-2">
							<FlaskConical className="w-3 h-3" /> {t("inventory.sections.potions", { count: totalPotions })}
						</h3>
						<div className="space-y-1 max-h-32 overflow-y-auto">
							{parsed.potions.map((item) => (
								<div key={item.id} className="text-xs flex justify-between bg-gray-900/50 px-2 py-1 rounded">
									<span className="text-gray-300 truncate">{item.name}</span>
									<span className="text-red-300 font-semibold">×{item.quantity}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{totalScrolls > 0 && (
					<div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
						<h3 className="text-xs font-semibold text-blue-300 mb-2 flex items-center gap-2">
							<ScrollText className="w-3 h-3" /> {t("inventory.sections.scrolls", { count: totalScrolls })}
						</h3>
						<div className="space-y-1 max-h-32 overflow-y-auto">
							{parsed.scrolls.map((item) => (
								<div key={item.id} className="text-xs flex justify-between bg-gray-900/50 px-2 py-1 rounded">
									<span className="text-gray-300 truncate">{item.name}</span>
									<span className="text-blue-300 font-semibold">×{item.quantity}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{totalAmmo > 0 && (
					<div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
						<h3 className="text-xs font-semibold text-green-300 mb-2 flex items-center gap-2">
							<Target className="w-3 h-3" /> {t("inventory.sections.ammo", { count: totalAmmo })}
						</h3>
						<div className="space-y-1 max-h-32 overflow-y-auto">
							{parsed.ammo.map((item) => (
								<div key={item.id} className="text-xs flex justify-between bg-gray-900/50 px-2 py-1 rounded">
									<span className="text-gray-300 truncate">{item.name}</span>
									<span className="text-green-300 font-semibold">×{item.quantity}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* BOLSA DE ITEMS */}
			{totalBagItems > 0 && (
				<div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
					<h3 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-2">
						<Package className="w-3 h-3" /> {t("inventory.sections.bag", { count: totalBagItems })}
					</h3>
					<div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
						{parsed.bag.map((item) => (
							<div
								key={item.id}
								className="text-xs bg-gray-900/50 p-2 rounded border border-gray-700/50 hover:border-amber-700/50 transition-colors"
							>
								<div className="flex justify-between">
									<span className="text-gray-300 truncate font-medium">{item.name}</span>
									<span className="text-amber-300 font-semibold ml-1">×{item.quantity}</span>
								</div>
								{item.weight && (
									<span className="text-gray-500 text-xs">⚖️ {t("inventory.weightLb", { value: item.weight })}</span>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* MONEDAS */}
			<div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
				<h3 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-2">
					<Coins className="w-3 h-3" /> {t("inventory.sections.currency")}
				</h3>
				<div className="grid grid-cols-5 gap-2 text-center">
					<div>
						<div className="text-lg">🥇</div>
						<div className="text-amber-300 font-bold text-sm">{parsed.currency.po}</div>
						<div className="text-xs text-gray-500">{t("inventory.currency.po")}</div>
					</div>
					<div>
						<div className="text-lg">⚪</div>
						<div className="text-gray-300 font-bold text-sm">{parsed.currency.pa}</div>
						<div className="text-xs text-gray-500">{t("inventory.currency.pa")}</div>
					</div>
					<div>
						<div className="text-lg">🟡</div>
						<div className="text-yellow-600 font-bold text-sm">{parsed.currency.pe}</div>
						<div className="text-xs text-gray-500">{t("inventory.currency.pe")}</div>
					</div>
					<div>
						<div className="text-lg">🟤</div>
						<div className="text-orange-700 font-bold text-sm">{parsed.currency.pc}</div>
						<div className="text-xs text-gray-500">{t("inventory.currency.pc")}</div>
					</div>
					<div>
						<div className="text-lg">💎</div>
						<div className="text-blue-300 font-bold text-sm">{parsed.currency.pp}</div>
						<div className="text-xs text-gray-500">{t("inventory.currency.pp")}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
