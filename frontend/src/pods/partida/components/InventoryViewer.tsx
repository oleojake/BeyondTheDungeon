// ================================================
// InventoryViewer – Visual representation of JSON inventory
// ================================================

import { useMemo, useState } from "react";
import { Package, FlaskConical, ScrollText, Target, Coins, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

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

export function InventoryViewer({ inventory }: Props) {
	const { t } = useTranslation();
	const [showAvailableItems, setShowAvailableItems] = useState(false);
	let parsed: InventoryState | null = null;

	try {
		if (inventory && inventory.trim().startsWith("{")) {
			parsed = JSON.parse(inventory) as InventoryState;
		}
	} catch {
		// Not valid JSON, will display as text
	}

	if (!parsed) {
		return (
			<div className="text-xs text-gray-400 italic p-2 bg-gray-900/30 rounded border border-gray-700">
				{t("inventory.errors.notStructuredEdit")}
			</div>
		);
	}

	const slotLabels = useMemo(
		() => ({
			helmet: t("inventory.slots.helmet"),
			amulet: t("inventory.slots.amulet"),
			armor: t("inventory.slots.armor"),
			cloak: t("inventory.slots.cloak"),
			gloves: t("inventory.slots.gloves"),
			mainhand: t("inventory.slots.mainhand"),
			offhand: t("inventory.slots.offhand"),
			ring1: t("inventory.slots.ringLeft"),
			belt: t("inventory.slots.belt"),
			ring2: t("inventory.slots.ringRight"),
			boots: t("inventory.slots.boots"),
			mount: t("inventory.slots.mount"),
		}),
		[t]
	);

	const equippedCount = Object.values(parsed.equipped).filter((item) => item !== null).length;
	const totalBagItems = parsed.bag.reduce((sum, item) => sum + item.quantity, 0);
	const totalPotions = parsed.potions.reduce((sum, item) => sum + item.quantity, 0);
	const totalScrolls = parsed.scrolls.reduce((sum, item) => sum + item.quantity, 0);
	const totalAmmo = parsed.ammo.reduce((sum, item) => sum + item.quantity, 0);

	const currencyTotal =
		parsed.currency.pp * 10 +
		parsed.currency.po +
		parsed.currency.pe * 0.5 +
		parsed.currency.pa * 0.1 +
		parsed.currency.pc * 0.01;

	return (
		<div className="space-y-3 text-xs">
			{/* ─── Resumen Equipado ─── */}
			<div className="grid grid-cols-2 gap-2 bg-amber-950/20 p-2 rounded border border-amber-700/30">
				<div className="text-center">
					<p className="text-amber-600">⚔️ {t("inventory.summary.equipped")}</p>
					<p className="text-lg font-bold text-amber-300">{equippedCount}</p>
				</div>
				<div className="text-center">
					<p className="text-amber-600">💰 {t("inventory.sections.currency")}</p>
					<p className="text-amber-300 text-xs">
						{t("inventory.currencyInline", {
							po: parsed.currency.po,
							pa: parsed.currency.pa ? ` ${parsed.currency.pa}pa` : "",
						})}
					</p>
				</div>
			</div>

			{/* ─── Items Equipados (Slots Ocupados) ─── */}
			{equippedCount > 0 && (
				<div className="space-y-1">
					<p className="text-amber-600 font-semibold">{t("inventory.sections.equippedItems")}</p>
					<div className="space-y-1 max-h-32 overflow-y-auto">
						{Object.entries(parsed.equipped)
							.filter(([, item]) => item !== null)
							.map(([slot, item]) => (
								<div
									key={slot}
									className="flex justify-between text-gray-300 bg-gray-800/30 px-2 py-1 rounded text-xs hover:bg-gray-800/50 transition-colors"
								>
									<span className="capitalize text-gray-500">{slotLabels[slot as keyof typeof slotLabels] ?? slot}:</span>
									<span className="text-amber-300 font-semibold truncate">{item?.name}</span>
								</div>
							))}
					</div>
				</div>
			)}

			{/* ─── Resumen Inventario ─── */}
			<div className="grid grid-cols-2 gap-2 text-center text-gray-400">
				{totalBagItems > 0 && (
					<div className="bg-gray-800/20 p-1 rounded border border-gray-700">
						<Package className="w-4 h-4 mx-auto mb-1 text-gray-500" />
						<p className="text-amber-300 font-bold">{totalBagItems}</p>
						<p className="text-xs">{t("inventory.count.objects")}</p>
					</div>
				)}
				{totalPotions > 0 && (
					<div className="bg-gray-800/20 p-1 rounded border border-gray-700">
						<FlaskConical className="w-4 h-4 mx-auto mb-1 text-red-500" />
						<p className="text-amber-300 font-bold">{totalPotions}</p>
						<p className="text-xs">{t("inventory.count.potions")}</p>
					</div>
				)}
				{totalScrolls > 0 && (
					<div className="bg-gray-800/20 p-1 rounded border border-gray-700">
						<ScrollText className="w-4 h-4 mx-auto mb-1 text-blue-500" />
						<p className="text-amber-300 font-bold">{totalScrolls}</p>
						<p className="text-xs">{t("inventory.count.scrolls")}</p>
					</div>
				)}
				{totalAmmo > 0 && (
					<div className="bg-gray-800/20 p-1 rounded border border-gray-700">
						<Target className="w-4 h-4 mx-auto mb-1 text-green-500" />
						<p className="text-amber-300 font-bold">{totalAmmo}</p>
						<p className="text-xs">{t("inventory.count.ammo")}</p>
					</div>
				)}
			</div>

			{/* ─── Items Disponibles para Equipar (desde bolsa) ─── */}
			{totalBagItems > 0 && (
				<div className="border-t border-gray-700 pt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowAvailableItems(!showAvailableItems)}
						className="w-full text-xs h-7 justify-between"
					>
						<span>📦 {t("inventory.availableItems.title")}</span>
						<ChevronDown
							className={`w-3 h-3 transition-transform ${
								showAvailableItems ? "rotate-180" : ""
							}`}
						/>
					</Button>

					{showAvailableItems && (
						<div className="mt-2 p-2 bg-gray-900/50 rounded border border-gray-700 max-h-40 overflow-y-auto">
							{parsed.bag.length > 0 ? (
								<div className="space-y-1">
									{parsed.bag.map((item) => (
										<div
											key={item.id}
											className="flex justify-between bg-gray-800/40 px-2 py-1 rounded text-xs hover:bg-gray-800/60 transition-colors"
										>
											<span className="text-gray-300">{item.name}</span>
											<span className="text-amber-400 font-semibold">x{item.quantity}</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 text-xs italic">{t("inventory.availableItems.empty")}</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
