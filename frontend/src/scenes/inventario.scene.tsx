import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emptyInventory } from "@/pods/partida/components/inventory/utils/slotConfig";
import {
	Save,
	LogIn,
	UserPlus,
	Info,
	Scale,
	Loader2,
	CheckCircle2,
	AlertCircle,
	User2,
	HardHat,
	Gem,
	Shirt,
	Wind,
	Grab,
	Sword,
	Swords,
	Circle,
	Footprints,
	Shield,
	Anchor,
	FlaskConical,
	ScrollText,
	Target,
	Package,
	Coins,
} from "lucide-react";
import { routes } from "@/router";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EquippedItem {
	id: string;
	name: string;
	type: string;
	weight?: number;
	srdIndex?: string;
	srdEdition?: string;
	tags?: string[];
	capacity?: string;
}

interface ConsumableItem {
	id: string;
	name: string;
	quantity: number;
	srdIndex?: string;
	srdEdition?: string;
	tags?: string[];
}

interface BagItem {
	id: string;
	name: string;
	quantity: number;
	weight?: number;
	srdIndex?: string;
	srdEdition?: string;
	tags?: string[];
}

interface Currency {
	pp: number; // Platino
	po: number; // Oro
	pe: number; // Electrum
	pa: number; // Plata
	pc: number; // Cobre
}

interface InventoryState {
	equipped: Record<string, EquippedItem | null>;
	potions: ConsumableItem[];
	scrolls: ConsumableItem[];
	ammo: ConsumableItem[];
	bag: BagItem[];
	currency: Currency;
}

interface CompendiumItem {
	id: string;
	name: string;
	type: string;
	weight: string | null;
	rarity: string | null;
	system_id?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	stats: Record<string, any>;
}

// ─── Extrae etiquetas relevantes de stats ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemTags(stats: Record<string, any>): string[] {
	const tags: string[] = [];
	if (stats.cost?.quantity && stats.cost.unit)
		tags.push(`${stats.cost.quantity} ${stats.cost.unit}`);
	if (stats.damage?.damage_dice) {
		const dtype = stats.damage.damage_type?.name ?? "";
		tags.push(`${stats.damage.damage_dice} ${dtype}`.trim());
	}
	if (stats.two_handed_damage?.damage_dice)
		tags.push(`(${stats.two_handed_damage.damage_dice})`);
	if (stats.armor_class?.base) {
		const dex = stats.armor_class.dex_bonus ? "+Des" : "";
		tags.push(`CA ${stats.armor_class.base}${dex}`);
	}
	if (
		stats.weapon_range === "Melee" &&
		stats.range?.normal &&
		stats.range.normal > 5
	)
		tags.push(`Alcance ${stats.range.normal} ft`);
	if (stats.throw_range?.normal)
		tags.push(
			`Lanzado ${stats.throw_range.normal}/${stats.throw_range.long ?? "?"} ft`,
		);
	if (stats.weapon_range === "Ranged" && stats.range?.normal)
		tags.push(`${stats.range.normal}/${stats.range.long ?? "?"} ft`);
	if (stats.rarity?.name && stats.rarity.name !== "None")
		tags.push(stats.rarity.name);
	if (stats.weapon_category) tags.push(stats.weapon_category);
	if (stats.armor_category) tags.push(stats.armor_category);
	if (stats.stealth_disadvantage) tags.push("Sigilo DesV");
	if (stats.capacity) tags.push(`Cap. ${stats.capacity}`);
	const skipProps = new Set(["monk", "special"]);
	(stats.properties ?? []).forEach((p: { index: string; name: string }) => {
		if (!skipProps.has(p.index)) tags.push(p.name);
	});
	return tags;
}

// ─── Filtros por categoría ────────────────────────────────────────────────────

const FILTER_POTIONS = (item: CompendiumItem) =>
	item.stats?.equipment_category?.name === "Potion" ||
	item.name.toLowerCase().includes("potion") ||
	item.name.toLowerCase().includes("poci");

const FILTER_SCROLLS = (item: CompendiumItem) =>
	item.stats?.equipment_category?.name === "Scroll" ||
	item.name.toLowerCase().includes("scroll") ||
	item.name.toLowerCase().includes("pergamino");

const FILTER_AMMO = (item: CompendiumItem) =>
	item.stats?.gear_category?.name === "Ammunition" ||
	(item.stats?.properties ?? []).some(
		(p: { name: string }) => p.name === "Thrown",
	);

const FILTER_ALL = (_: CompendiumItem) => true;

// ─── Filtros por slot de equipo ───────────────────────────────────────────────

function filterHelmet(item: CompendiumItem): boolean {
	const n = item.name.toLowerCase();
	const cat = item.stats?.equipment_category?.name ?? "";
	return (
		(cat === "Wondrous Items" &&
			/helm|hat|cap|crown|tiara|headband/i.test(n)) ||
		/helm|hat|cap|crown|tiara|headband/i.test(n)
	);
}

function filterAmulet(item: CompendiumItem): boolean {
	return /necklace|amulet|pendant|medallion/i.test(item.name);
}

function filterArmor(item: CompendiumItem): boolean {
	const cat = item.stats?.equipment_category?.name ?? "";
	const ac = item.stats?.armor_category ?? "";
	const n = item.name.toLowerCase();
	return (
		(cat === "Armor" && ac !== "Shield") ||
		(cat === "Wondrous Items" && /robe|mantle/i.test(n))
	);
}

function filterCloak(item: CompendiumItem): boolean {
	return /cloak|cape|mantle|robe/i.test(item.name);
}

function filterGloves(item: CompendiumItem): boolean {
	return /gloves|gauntlets|bracers|bracer/i.test(item.name);
}

function filterWeapon(item: CompendiumItem): boolean {
	const cat = item.stats?.equipment_category?.name ?? "";
	return (
		cat === "Weapon" ||
		cat === "Rod" ||
		cat === "Staff" ||
		cat === "Wand" ||
		(cat === "Wondrous Items" &&
			/sword|blade|bow|wand|rod|staff/i.test(item.name))
	);
}

function filterOffhand(item: CompendiumItem): boolean {
	const cat = item.stats?.equipment_category?.name ?? "";
	const ac = item.stats?.armor_category ?? "";
	return (
		cat === "Weapon" ||
		cat === "Rod" ||
		cat === "Staff" ||
		cat === "Wand" ||
		(cat === "Armor" && ac === "Shield") ||
		/shield|buckler/i.test(item.name)
	);
}

function filterRing(item: CompendiumItem): boolean {
	const cat = item.stats?.equipment_category?.name ?? "";
	return cat === "Ring" || /ring/i.test(item.name);
}

function filterBelt(item: CompendiumItem): boolean {
	return /belt|girdle/i.test(item.name);
}

function filterBoots(item: CompendiumItem): boolean {
	return /boots|boot|shoes|slippers|sandals|greaves/i.test(item.name);
}

function filterMount(item: CompendiumItem): boolean {
	const cat = item.stats?.equipment_category?.name ?? "";
	return cat === "Mounts and Vehicles";
}

// (intermediate draft constants removed)
function getSlotFilter(slotKey: string): (item: CompendiumItem) => boolean {
	switch (slotKey) {
		case "helmet":
			return filterHelmet;
		case "amulet":
			return filterAmulet;
		case "armor":
			return filterArmor;
		case "cloak":
			return filterCloak;
		case "gloves":
			return filterGloves;
		case "mainhand":
			return filterWeapon;
		case "offhand":
			return filterOffhand;
		case "ring1":
		case "ring2":
			return filterRing;
		case "belt":
			return filterBelt;
		case "boots":
			return filterBoots;
		case "mount":
			return filterMount;
		default:
			return FILTER_ALL;
	}
}

// ─── Slots del Paperdoll ─────────────────────────────────────────────────────
// x/y son porcentajes (0-100) sobre el contenedor del paperdoll (480×600px)
// Referencia: bg-inventary.png, personaje centrado con cabeza a ~12% Y

const EQUIPMENT_SLOTS = [
	{ key: "helmet", label: "Casco", icon: HardHat, x: "50%", y: "7%" },
	{ key: "amulet", label: "Colgante", icon: Gem, x: "50%", y: "22%" },
	{ key: "armor", label: "Armadura", icon: Shirt, x: "50%", y: "40%" },
	{ key: "cloak", label: "Capa", icon: Wind, x: "83%", y: "22%" },
	{ key: "mainhand", label: "Arma principal", icon: Sword, x: "10%", y: "52%" },
	{
		key: "offhand",
		label: "Arma sec. / Escudo",
		icon: Swords,
		x: "90%",
		y: "52%",
	},
	{ key: "gloves", label: "Guantes", icon: Grab, x: "17%", y: "22%" },
	{ key: "ring1", label: "Anillo izq.", icon: Circle, x: "10%", y: "72%" },
	{ key: "belt", label: "Cinturón", icon: Shield, x: "50%", y: "58%" },
	{ key: "ring2", label: "Anillo der.", icon: Circle, x: "90%", y: "72%" },
	{ key: "boots", label: "Botas", icon: Footprints, x: "50%", y: "91%" },
	{ key: "mount", label: "Montura", icon: Anchor, x: "83%", y: "91%" },
] as const;

// ─── Estado inicial ──────────────────────────────────────────────────────────

// (emptyInventory imported from utils)

// ─── Componente de Slot ───────────────────────────────────────────────────────

function EquipSlot({
	slot,
	item,
	onClear,
	onOpen,
}: {
	slot: (typeof EQUIPMENT_SLOTS)[number];
	item: EquippedItem | null;
	onClear: () => void;
	onOpen: () => void;
}) {
	const Icon = slot.icon;
	return (
		<div
			style={{
				position: "absolute",
				left: slot.x,
				top: slot.y,
				transform: "translate(-50%, -50%)",
			}}
			onClick={onOpen}
			title={slot.label}
			className={[
				"group relative flex flex-col items-center justify-center gap-0.5 py-1",
				"w-20 h-24 rounded-lg cursor-pointer select-none transition-all duration-200",
				item
					? "border border-amber-500/70 bg-[#3d1a06]/90 hover:border-amber-400 hover:bg-[#4a2208]/90 shadow-[0_0_12px_rgba(245,158,11,0.18)]"
					: "border-2 border-dashed border-amber-700/50 bg-[#2e1306]/85 hover:border-amber-600/70 hover:bg-[#3d1a06]/90",
			].join(" ")}
		>
			{item ? (
				<>
					<span className="text-[8px] font-bold tracking-widest text-amber-400/90 uppercase text-center leading-none px-1">
						{slot.label}
					</span>
					<Icon className="w-6 h-6 text-amber-500/55 my-0.5" />
					<span className="text-[11px] text-amber-100 text-center leading-tight font-semibold px-1.5 line-clamp-2 max-w-full">
						{item.name}
					</span>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onClear();
						}}
						className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 rounded-full bg-red-700 hover:bg-red-500 text-white items-center justify-center text-[10px] leading-none transition-colors"
					>
						×
					</button>
				</>
			) : (
				<>
					<span className="text-[8px] font-bold tracking-widest text-amber-500/90 uppercase group-hover:text-amber-400 transition-colors text-center leading-none px-1">
						{slot.label}
					</span>
					<Icon className="w-7 h-7 text-amber-600/65 group-hover:text-amber-500/80 transition-colors my-0.5" />
					<span className="text-[8px] text-amber-600/60 group-hover:text-amber-500/80 text-center leading-tight px-1 transition-colors">
						vacío
					</span>
				</>
			)}
		</div>
	);
}

// ─── SlotPickerModal ──────────────────────────────────────────────────────────

function SlotPickerModal({
	slotLabel,
	slotKey,
	allItems,
	onEquip,
	onClose,
}: {
	slotLabel: string;
	slotKey: string;
	allItems: CompendiumItem[];
	onEquip: (
		name: string,
		weight?: number,
		srdIndex?: string,
		tags?: string[],
		capacity?: string,
		srdEdition?: string,
	) => void;
	onClose: () => void;
}) {
	const [query, setQuery] = useState("");
	const [searchAll, setSearchAll] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	const slotFilter = useMemo(() => getSlotFilter(slotKey), [slotKey]);

	const pool = useMemo(
		() => (searchAll ? allItems : allItems.filter(slotFilter)),
		[allItems, slotFilter, searchAll],
	);

	const suggestions = useMemo(() => {
		if (!query.trim()) return pool;
		const q = query.toLowerCase();
		return pool.filter((i) => i.name.toLowerCase().includes(q));
	}, [pool, query]);

	const handleSelect = (item: CompendiumItem) => {
		const w = item.weight ? parseFloat(item.weight) : undefined;
		const tags = getItemTags(item.stats ?? {});
		const capacity = item.stats?.capacity as string | undefined;
		onEquip(
			item.name,
			w !== undefined && !isNaN(w) && w > 0 ? w : undefined,
			item.stats?.index as string | undefined,
			tags.length > 0 ? tags : undefined,
			capacity,
			item.system_id,
		);
		onClose();
	};

	const handleCustom = () => {
		if (!query.trim()) return;
		onEquip(query.trim(), undefined, undefined, ["CUSTOM"]);
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="bg-[#1e0d05] border border-amber-800/50 rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/40">
					<h3 className="text-amber-300 font-semibold text-sm">
						Equipar — <span className="text-amber-500">{slotLabel}</span>
					</h3>
					<button
						onClick={onClose}
						className="text-amber-700 hover:text-amber-400 text-lg leading-none"
					>
						×
					</button>
				</div>
				{/* Search */}
				<div className="p-3 border-b border-amber-900/30">
					<div className="flex gap-2">
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									if (suggestions.length > 0) handleSelect(suggestions[0]);
									else handleCustom();
								}
							}}
							placeholder={`Busca ${slotLabel.toLowerCase()}…`}
							className="flex-1 bg-amber-950/40 border border-amber-700/50 rounded-lg px-3 py-1.5 text-amber-100 placeholder:text-amber-600/70 text-sm focus:outline-none focus:border-amber-500"
						/>
						<button
							onClick={handleCustom}
							title="Añadir como objeto custom"
							className="px-3 py-1.5 rounded-lg border border-amber-700/70 text-amber-400 hover:bg-amber-700/30 text-sm font-semibold shrink-0"
						>
							+
						</button>
					</div>
					<div className="flex items-center justify-between mt-2">
						<label className="flex items-center gap-1.5 text-xs text-amber-500/80 cursor-pointer select-none">
							<input
								type="checkbox"
								checked={searchAll}
								onChange={(e) => setSearchAll(e.target.checked)}
								className="accent-amber-600 w-3 h-3"
							/>
							Buscar en todo el compendio ({allItems.length})
						</label>
						<span className="text-[10px] text-amber-600/60">
							{query.trim()
								? `${suggestions.length} resultado${suggestions.length !== 1 ? "s" : ""}`
								: `${pool.length} objetos`}
						</span>
					</div>
				</div>
				{/* List */}
				<div className="overflow-y-auto flex-1 divide-y divide-amber-900/20">
					{allItems.length === 0 ? (
						<p className="px-4 py-6 text-xs text-amber-600 italic text-center">
							Cargando compendio…
						</p>
					) : suggestions.length === 0 ? (
						<p className="px-4 py-4 text-xs text-amber-600 italic text-center">
							Sin resultados — pulsa + para añadir como objeto custom
						</p>
					) : (
						suggestions.map((item) => {
							const dropTags = getItemTags(item.stats ?? {});
							return (
								<button
									key={item.id}
									onClick={() => handleSelect(item)}
									className="w-full text-left px-4 py-2.5 text-sm text-amber-200 hover:bg-amber-700/25 transition-colors"
								>
									<div className="flex items-baseline justify-between gap-2">
										<span className="font-medium truncate">{item.name}</span>
										<span className="text-[10px] text-amber-600/70 shrink-0 whitespace-nowrap">
											{item.type}
											{item.weight && item.weight !== "0"
												? ` · ${item.weight} lb`
												: ""}
										</span>
									</div>
									{dropTags.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-0.5">
											{dropTags.map((t) => (
												<span
													key={t}
													className="px-1 py-0 rounded text-[9px] bg-amber-800/40 text-amber-400/90 leading-4"
												>
													{t}
												</span>
											))}
										</div>
									)}
								</button>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}

// ─── AutocompleteInput ────────────────────────────────────────────────────────

function AutocompleteInput({
	allItems,
	categoryFilter,
	placeholder,
	onSelect,
	hideSearchAll = false,
}: {
	allItems: CompendiumItem[];
	categoryFilter: (item: CompendiumItem) => boolean;
	placeholder: string;
	onSelect: (
		name: string,
		weight?: number,
		srdIndex?: string,
		tags?: string[],
		srdEdition?: string,
	) => void;
	hideSearchAll?: boolean;
}) {
	const [query, setQuery] = useState("");
	const [searchAll, setSearchAll] = useState(false);
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const pool = useMemo(
		() => (searchAll ? allItems : allItems.filter(categoryFilter)),
		[allItems, categoryFilter, searchAll],
	);

	const suggestions = useMemo(() => {
		if (!query.trim()) return pool;
		const q = query.toLowerCase();
		return pool.filter((i) => i.name.toLowerCase().includes(q));
	}, [pool, query]);

	const handleSelect = (item: CompendiumItem) => {
		const w = item.weight ? parseFloat(item.weight) : undefined;
		const tags = getItemTags(item.stats ?? {});
		onSelect(
			item.name,
			w !== undefined && !isNaN(w) && w > 0 ? w : undefined,
			item.stats?.index as string | undefined,
			tags.length > 0 ? tags : undefined,
			item.system_id,
		);
		setQuery("");
		setOpen(false);
	};

	const handleCustom = () => {
		if (!query.trim()) return;
		onSelect(query.trim(), undefined, undefined, ["CUSTOM"]);
		setQuery("");
		setOpen(false);
	};

	return (
		<div className="relative" ref={wrapRef}>
			<div className="flex gap-2">
				<Input
					placeholder={placeholder}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							if (suggestions.length > 0) handleSelect(suggestions[0]);
							else handleCustom();
						}
						if (e.key === "Escape") setOpen(false);
					}}
					className="bg-amber-950/40 border-amber-700/50 text-amber-100 placeholder:text-amber-600/70 h-8 text-sm"
				/>
				<Button
					size="sm"
					variant="outline"
					className="border-amber-700/70 text-amber-400 hover:bg-amber-700/30 h-8 px-3 shrink-0"
					onClick={handleCustom}
				>
					+
				</Button>
			</div>
			{open && (
				<div className="absolute z-50 w-full mt-1 rounded-lg border border-amber-700/50 bg-[#2a1508] shadow-2xl overflow-hidden">
					{allItems.length > 0 && (
						<div className="px-3 py-1 border-b border-amber-900/40 flex items-center justify-between">
							<span className="text-[10px] text-amber-600/70">
								{query.trim()
									? `${suggestions.length} resultado${suggestions.length !== 1 ? "s" : ""}`
									: `${pool.length} objetos — escribe para filtrar`}
							</span>
						</div>
					)}
					<div className="max-h-56 overflow-y-auto">
						{allItems.length === 0 ? (
							<p className="px-3 py-3 text-xs text-amber-600 italic text-center">
								Cargando compendio…
							</p>
						) : suggestions.length === 0 ? (
							<p className="px-3 py-2 text-xs text-amber-600 italic">
								Sin resultados — pulsa + para añadir como objeto custom
							</p>
						) : (
							suggestions.map((item) => {
								const dropTags = getItemTags(item.stats ?? {});
								return (
									<button
										key={item.id}
										onMouseDown={() => handleSelect(item)}
										className="w-full text-left px-3 py-2 text-sm text-amber-200 hover:bg-amber-700/30 transition-colors border-b border-amber-900/20 last:border-0"
									>
										<div className="flex items-baseline justify-between gap-2">
											<span className="truncate font-medium">{item.name}</span>
											<span className="text-[10px] text-amber-600/70 shrink-0 whitespace-nowrap">
												{item.type}
												{item.weight && item.weight !== "0"
													? ` · ${item.weight} lb`
													: ""}
											</span>
										</div>
										{dropTags.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-0.5">
												{dropTags.map((t) => (
													<span
														key={t}
														className="px-1 py-0 rounded text-[9px] bg-amber-800/40 text-amber-400/90 leading-4"
													>
														{t}
													</span>
												))}
											</div>
										)}
									</button>
								);
							})
						)}
					</div>
					{!hideSearchAll && (
						<div className="sticky bottom-0 border-t border-amber-900/50 px-3 py-1.5 bg-[#1e0e05]">
							<label className="flex items-center gap-2 text-xs text-amber-500/80 cursor-pointer select-none">
								<input
									type="checkbox"
									checked={searchAll}
									onChange={(e) => setSearchAll(e.target.checked)}
									className="accent-amber-600 w-3 h-3"
								/>
								Buscar en todo el compendio ({allItems.length} objetos)
							</label>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Consumable section ───────────────────────────────────────────────────────

const MIN_ROWS = 4;
const MIN_BAG_ROWS = 4;

function ConsumableSection({
	items,
	rowColor,
	allItems,
	categoryFilter,
	inputPlaceholder,
	onSelect,
	onChangeQty,
	onRemove,
}: {
	items: ConsumableItem[];
	rowColor: string;
	allItems: CompendiumItem[];
	categoryFilter: (item: CompendiumItem) => boolean;
	inputPlaceholder: string;
	onSelect: (
		name: string,
		weight?: number,
		srdIndex?: string,
		tags?: string[],
		srdEdition?: string,
	) => void;
	onChangeQty: (id: string, delta: number) => void;
	onRemove: (id: string) => void;
}) {
	const emptyCount = Math.max(0, MIN_ROWS - items.length);
	return (
		<div className="space-y-2">
			<div className="h-44 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-black/15 border border-amber-900/25">
				{items.map((item) => (
					<div
						key={item.id}
						className={`px-3 py-2 rounded-lg border text-sm ${rowColor}`}
					>
						<div className="flex items-center justify-between gap-2">
							{item.srdIndex ? (
								<Link
									to={`/objetos/${item.srdEdition || 'dnd5e-2024'}/${item.srdIndex}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-amber-100 truncate flex-1 hover:text-amber-300 hover:underline"
								>
									{item.name}
								</Link>
							) : (
								<span
									className={`truncate flex-1 ${item.tags?.includes("CUSTOM") ? "text-amber-100/80 italic" : "text-amber-100"}`}
								>
									{item.name}
								</span>
							)}
							<div className="flex items-center gap-1 shrink-0">
								<button
									onClick={() => onChangeQty(item.id, -1)}
									className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-amber-400 font-bold"
								>
									−
								</button>
								<span className="text-xs font-semibold text-amber-200 w-5 text-center">
									{item.quantity}
								</span>
								<button
									onClick={() => onChangeQty(item.id, +1)}
									className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-amber-400 font-bold"
								>
									+
								</button>
								<button
									onClick={() => onRemove(item.id)}
									className="ml-1 text-amber-700 hover:text-red-400 leading-none"
								>
									×
								</button>
							</div>
						</div>
						{item.tags && item.tags.length > 0 && (
							<div className="flex flex-wrap gap-1 mt-1">
								{item.tags.map((t) => (
									<span
										key={t}
										className={`px-1.5 py-0 rounded text-[9px] leading-4 ${
											t === "CUSTOM"
												? "bg-violet-900/60 text-violet-300/90 font-semibold tracking-wide"
												: "bg-amber-800/40 text-amber-400/90"
										}`}
									>
										{t}
									</span>
								))}
							</div>
						)}
					</div>
				))}
				{Array.from({ length: emptyCount }).map((_, i) => (
					<div
						key={`empty-${i}`}
						className="flex items-center px-3 py-2 rounded-lg border border-dashed border-amber-800/20 text-amber-700/30 text-sm italic"
					>
						— vacío —
					</div>
				))}
			</div>
			<AutocompleteInput
				allItems={allItems}
				categoryFilter={categoryFilter}
				placeholder={inputPlaceholder}
				onSelect={onSelect}
			/>
		</div>
	);
}

// ─── Bag section ──────────────────────────────────────────────────────────────

function BagSection({
	items,
	allItems,
	onSelect,
	onChangeQty,
	onRemove,
}: {
	items: BagItem[];
	allItems: CompendiumItem[];
	onSelect: (
		name: string,
		weight?: number,
		srdIndex?: string,
		tags?: string[],
		srdEdition?: string,
	) => void;
	onChangeQty: (id: string, delta: number) => void;
	onRemove: (id: string) => void;
}) {
	const emptyCount = Math.max(0, MIN_BAG_ROWS * 2 - items.length);
	return (
		<div className="space-y-2">
			<div className="h-52 overflow-y-auto p-2 rounded-lg bg-black/15 border border-amber-900/25">
				<div className="grid grid-cols-2 gap-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="px-3 py-2 rounded-lg border border-amber-700/30 bg-amber-900/20 text-sm"
						>
							<div className="flex items-center justify-between gap-2">
								<div className="flex-1 min-w-0">
									{item.srdIndex ? (
										<Link
											to={`/objetos/${item.srdEdition || 'dnd5e-2024'}/${item.srdIndex}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-amber-100 truncate block hover:text-amber-300 hover:underline"
										>
											{item.name}
										</Link>
									) : (
										<span
											className={`truncate block ${item.tags?.includes("CUSTOM") ? "text-amber-100/80 italic" : "text-amber-100"}`}
										>
											{item.name}
										</span>
									)}
									{item.weight !== undefined && (
										<span className="text-[10px] text-amber-600/80">
											{item.weight} lb
										</span>
									)}
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<button
										onClick={() => onChangeQty(item.id, -1)}
										className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-amber-400 font-bold"
									>
										−
									</button>
									<span className="text-xs font-semibold text-amber-200 w-5 text-center">
										{item.quantity}
									</span>
									<button
										onClick={() => onChangeQty(item.id, +1)}
										className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-amber-400 font-bold"
									>
										+
									</button>
									<button
										onClick={() => onRemove(item.id)}
										className="ml-1 text-amber-700 hover:text-red-400 leading-none"
									>
										×
									</button>
								</div>
							</div>
							{item.tags && item.tags.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-1">
									{item.tags.map((t) => (
										<span
											key={t}
											className={`px-1.5 py-0 rounded text-[9px] leading-4 ${t === "CUSTOM" ? "bg-violet-900/60 text-violet-300/90 font-semibold tracking-wide" : "bg-amber-800/40 text-amber-400/90"}`}
										>
											{t}
										</span>
									))}
								</div>
							)}
						</div>
					))}
					{Array.from({ length: emptyCount }).map((_, i) => (
						<div
							key={`empty-${i}`}
							className="flex items-center px-3 py-2 rounded-lg border border-dashed border-amber-800/20 text-amber-700/30 text-sm italic"
						>
							— vacío —
						</div>
					))}
				</div>
			</div>
			<AutocompleteInput
				allItems={allItems}
				categoryFilter={FILTER_ALL}
				placeholder="Busca cualquier objeto del compendio…"
				onSelect={onSelect}
				hideSearchAll
			/>
		</div>
	);
}
// ─── Componente principal ─────────────────────────────────────────────────────

export const InventarioScene = () => {
	const { user, session } = useAuth();
	const [inventory, setInventory] = useState<InventoryState>(emptyInventory);
	const [compendiumItems, setCompendiumItems] = useState<CompendiumItem[]>([]);
	const [maxCarryWeight, setMaxCarryWeight] = useState(150);
	const [autoWeight, setAutoWeight] = useState(true);
	const [manualWeightStr, setManualWeightStr] = useState("0.0");

	// ── Character linking ────────────────────────────────────────────────────
	const [characters, setCharacters] = useState<
		{
			id: string;
			name: string;
			race: string;
			level: number;
			hasInventory: boolean;
		}[]
	>([]);
	const [linkedCharId, setLinkedCharId] = useState<string | null>(null);
	const [linkedCharName, setLinkedCharName] = useState<string | null>(null);
	const [saveStatus, setSaveStatus] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const [charsLoading, setCharsLoading] = useState(false);
	const autoCurrentWeight =
		// Bag items
		inventory.bag.reduce(
			(sum, item) => sum + (item.weight ?? 0) * item.quantity,
			0,
		) +
		// Equipped items (excluding mount slot)
		Object.entries(inventory.equipped)
			.filter(([key, item]) => key !== "mount" && item !== null)
			.reduce((sum, [, item]) => sum + (item!.weight ?? 0), 0);

	// Mount capacity bonus: parse "480 lb." → 480 (stored directly on EquippedItem)
	const mountCapacity = (() => {
		const cap = inventory.equipped["mount"]?.capacity;
		if (!cap) return 0;
		const n = parseFloat(cap.replace(/[^\d.]/g, ""));
		return isNaN(n) ? 0 : n;
	})();

	const effectiveMax = maxCarryWeight + mountCapacity;
	const currentWeight = autoWeight
		? autoCurrentWeight
		: parseFloat(manualWeightStr) || 0;

	// Scroll to top + fetch all compendium items via backend (service role, no RLS cap)
	useEffect(() => {
		window.scrollTo({ top: 0 });
		const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
		fetch(`${API_URL}/api/compendium-items`)
			.then((r) => r.json())
			.then(({ items }) => {
				if (Array.isArray(items)) setCompendiumItems(items as CompendiumItem[]);
			})
			.catch(() => {
				/* silently ignore – dropdown will show empty */
			});
	}, []);

	// ── Fetch characters when user logs in (including cross-tab login via Supabase onAuthStateChange)
	const fetchCharacters = (token: string) => {
		const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
		setCharsLoading(true);
		fetch(`${API_URL}/api/character-sheets`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then(({ characters: chars }) => {
				if (Array.isArray(chars))
					setCharacters(
						chars.map(
							(c: {
								id: string;
								name: string;
								race: string;
								level: number;
								has_inventory?: boolean;
							}) => ({
								...c,
								hasInventory: c.has_inventory ?? false,
							}),
						),
					);
			})
			.catch(() => {})
			.finally(() => setCharsLoading(false));
	};

	useEffect(() => {
		if (!user) {
			setCharacters([]);
			setLinkedCharId(null);
			setLinkedCharName(null);
			return;
		}
		const token = session?.access_token;
		if (!token) return;
		fetchCharacters(token);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

	// ── Equipment ────────────────────────────────────────────────────────────
	const [openSlot, setOpenSlot] = useState<string | null>(null);

	const clearSlot = (key: string) =>
		setInventory((prev) => ({
			...prev,
			equipped: { ...prev.equipped, [key]: null },
		}));

	const equipSlot = (
		key: string,
		name: string,
		weight?: number,
		srdIndex?: string,
		tags?: string[],
		capacity?: string,
		srdEdition?: string,
	) =>
		setInventory((prev) => ({
			...prev,
			equipped: {
				...prev.equipped,
				[key]: {
					id: crypto.randomUUID(),
					name,
					type: srdIndex ?? "custom",
					weight,
					srdIndex,
					srdEdition,
					tags,
					capacity,
				} as EquippedItem,
			},
		}));

	// ── Currency ─────────────────────────────────────────────────────────────
	const setCurrency = (coin: keyof Currency, value: string) => {
		const num = Math.max(0, parseInt(value) || 0);
		setInventory((prev) => ({
			...prev,
			currency: { ...prev.currency, [coin]: num },
		}));
	};

	// ── Consumables ──────────────────────────────────────────────────────────
	const addConsumable = (
		field: "potions" | "scrolls" | "ammo",
		name: string,
		_weight?: number,
		srdIndex?: string,
		tags?: string[],
		srdEdition?: string,
	) => {
		if (!name.trim()) return;
		setInventory((prev) => ({
			...prev,
			[field]: [
				...prev[field],
				{
					id: crypto.randomUUID(),
					name: name.trim(),
					quantity: 1,
					srdIndex,
					srdEdition,
					tags,
				},
			],
		}));
	};

	const changeQty = (
		field: "potions" | "scrolls" | "ammo" | "bag",
		id: string,
		delta: number,
	) =>
		setInventory((prev) => ({
			...prev,
			[field]: (prev[field] as (ConsumableItem | BagItem)[])
				.map((i) =>
					i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
				)
				.filter((i) => i.quantity > 0),
		}));

	const removeItem = (
		field: "potions" | "scrolls" | "ammo" | "bag",
		id: string,
	) =>
		setInventory((prev) => ({
			...prev,
			[field]: (prev[field] as (ConsumableItem | BagItem)[]).filter(
				(i) => i.id !== id,
			),
		}));

	const addBagItem = (
		name: string,
		weight?: number,
		srdIndex?: string,
		tags?: string[],
		srdEdition?: string,
	) => {
		if (!name.trim()) return;
		setInventory((prev) => ({
			...prev,
			bag: [
				...prev.bag,
				{
					id: crypto.randomUUID(),
					name: name.trim(),
					quantity: 1,
					weight,
					srdIndex,
					srdEdition,
					tags,
				},
			],
		}));
	};

	// ── Save ─────────────────────────────────────────────────────────────────
	// Link a character without loading its inventory
	const linkChar = (id: string, name: string) => {
		setLinkedCharId(id);
		setLinkedCharName(name);
	};

	// Load a character's saved inventory and always link to it
	const loadCharInventory = async (id: string, name: string) => {
		const token = session?.access_token;
		if (!token) return;
		const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
		try {
			const res = await fetch(`${API_URL}/api/character-sheet/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const { character } = await res.json();
			if (character?.inventory) {
				const parsed = JSON.parse(character.inventory) as InventoryState;
				setInventory(parsed);
			} else {
				setInventory(emptyInventory);
			}
		} catch {
			/* keep current inventory if load fails */
		}
		setLinkedCharId(id);
		setLinkedCharName(name);
	};

	// Unlink: just clear local state, inventory stays in DB
	const handleUnlink = () => {
		if (!linkedCharId) return;
		const confirmed = window.confirm(
			`¿Desvincular "${linkedCharName}"?\n\nEl inventario seguirá guardado en ese personaje pero dejarás de guardar aquí.`,
		);
		if (!confirmed) return;
		setLinkedCharId(null);
		setLinkedCharName(null);
	};

	const handleSave = async () => {
		if (!user) {
			window.open(routes.login, "_blank");
			return;
		}
		if (!linkedCharId) return;
		const token = session?.access_token;
		if (!token) return;
		const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
		setSaveStatus("saving");
		try {
			const res = await fetch(
				`${API_URL}/api/character-sheet/${linkedCharId}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ inventory: JSON.stringify(inventory) }),
				},
			);
			if (!res.ok) throw new Error();
			setSaveStatus("saved");
			setTimeout(() => setSaveStatus("idle"), 2500);
			// Re-fetch character list so has_inventory reflects reality
			if (session?.access_token) fetchCharacters(session.access_token);
		} catch {
			setSaveStatus("error");
			setTimeout(() => setSaveStatus("idle"), 3000);
		}
	};

	const CURRENCY_LABELS: {
		key: keyof Currency;
		label: string;
		color: string;
	}[] = [
		{ key: "pp", label: "Platino", color: "text-slate-300" },
		{ key: "po", label: "Oro", color: "text-yellow-400" },
		{ key: "pe", label: "Electrum", color: "text-teal-400" },
		{ key: "pa", label: "Plata", color: "text-gray-300" },
		{ key: "pc", label: "Cobre", color: "text-orange-400" },
	];

	const weightPct =
		maxCarryWeight > 0 || mountCapacity > 0
			? Math.min(100, (currentWeight / effectiveMax) * 100)
			: 0;
	const overEncumbered = effectiveMax > 0 && currentWeight > effectiveMax;

	return (
		<>
			<div className="container mx-auto p-6 max-w-7xl space-y-6">
				{/* ── Cabecera ─────────────────────────────────────────────── */}
				<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<Package className="h-8 w-8 text-amber-200" />
								<h1 className="text-3xl font-bold text-amber-50">Inventario</h1>
							</div>
							<p className="text-sm text-amber-100/90">
								Gestiona el equipo, consumibles y monedas de tu personaje
							</p>
						</div>
						<Button
							onClick={handleSave}
							disabled={saveStatus === "saving" || (!!user && !linkedCharId)}
							className="bg-amber-700 hover:bg-amber-600 text-white gap-2 disabled:opacity-60"
						>
							{saveStatus === "saving" && (
								<Loader2 className="w-4 h-4 animate-spin" />
							)}
							{saveStatus === "saved" && (
								<CheckCircle2 className="w-4 h-4 text-green-300" />
							)}
							{saveStatus === "error" && (
								<AlertCircle className="w-4 h-4 text-red-300" />
							)}
							{saveStatus === "idle" &&
								(user ? (
									<Save className="w-4 h-4" />
								) : (
									<LogIn className="w-4 h-4" />
								))}
							{saveStatus === "saving"
								? "Guardando…"
								: saveStatus === "saved"
									? "¡Guardado!"
									: saveStatus === "error"
										? "Error al guardar"
										: !user
											? "Inicia sesión para guardar"
											: !linkedCharId
												? "Elige un personaje"
												: "Guardar"}
						</Button>
					</div>
				</section>

				{/* ── Banner invitados ──────────────────────────────────────── */}
				{!user && (
					<div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
						<Info className="w-4 h-4 mt-0.5 shrink-0" />
						<span>
							Puedes explorar el inventario libremente. Para guardar los cambios
							en un personaje,{" "}
							<Link
								to={routes.login}
								className="underline hover:text-amber-100"
							>
								inicia sesión
							</Link>{" "}
							o{" "}
							<Link
								to={routes.register}
								className="underline hover:text-amber-100"
							>
								crea una cuenta
							</Link>
							.
						</span>
					</div>
				)}

				{/* ── Vinculación y carga de personaje (solo logueado) ─────── */}
				{user && (
					<>
						{/* Bloque: Vincular / desvincular */}
						<div className="flex items-center gap-3 rounded-lg border border-amber-800/40 bg-amber-950/30 px-4 py-3 text-sm">
							<User2 className="w-4 h-4 text-amber-500 shrink-0" />
							{charsLoading ? (
								<span className="text-amber-500 flex items-center gap-2">
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
									Cargando personajes…
								</span>
							) : characters.length === 0 ? (
								<span className="text-amber-600">
									No tienes personajes aún.{" "}
									<Link
										to={routes.fichas}
										className="underline hover:text-amber-400"
									>
										Crea uno primero
									</Link>
									.
								</span>
							) : linkedCharId ? (
								<div className="flex items-center gap-2 flex-1">
									<span className="text-amber-400 text-xs uppercase tracking-widest shrink-0">
										Guardando en:
									</span>
									<span className="font-semibold text-amber-200">
										{linkedCharName}
									</span>
									<button
										onClick={handleUnlink}
										title="Desvincular personaje"
										className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-amber-900/60 text-amber-500 hover:bg-red-900/60 hover:text-red-300 transition-colors text-xs leading-none shrink-0"
									>
										×
									</button>
								</div>
							) : (
								<div className="flex items-center gap-2 flex-1 flex-wrap">
									<span className="text-amber-500 shrink-0">
										Vincular para guardar:
									</span>
									<select
										defaultValue=""
										onChange={(e) => {
											const char = characters.find(
												(c) => c.id === e.target.value,
											);
											if (!char) return;
											linkChar(char.id, char.name);
											e.target.value = "";
										}}
										className="bg-amber-950/60 border border-amber-700/50 rounded px-2 py-1 text-amber-200 text-xs focus:outline-none focus:border-amber-500"
									>
										<option value="" disabled>
											— selecciona —
										</option>
										{characters.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name} (Nv. {c.level})
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						{/* Bloque: Cargar inventario guardado */}
						{characters.length > 0 && (
							<div className="rounded-lg border border-amber-800/30 bg-amber-950/20 px-4 py-3">
								<p className="text-xs text-amber-500 uppercase tracking-widest mb-2">
									Cargar inventario guardado
								</p>
								{characters.filter((c) => c.hasInventory).length === 0 ? (
									<p className="text-xs text-amber-700/60 italic">
										Ningún personaje tiene un inventario guardado todavía.
									</p>
								) : (
									<>
										<div className="flex flex-wrap gap-2">
											{characters
												.filter((c) => c.hasInventory)
												.map((c) => (
													<button
														key={c.id}
														onClick={() => loadCharInventory(c.id, c.name)}
														className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-700/40 bg-amber-900/30 text-amber-200 text-xs hover:bg-amber-700/40 hover:border-amber-600/60 transition-colors"
														title={`Cargar inventario de ${c.name}`}
													>
														<Package className="w-3 h-3 text-amber-500" />
														{c.name}
														<span className="text-amber-600/70 text-[10px]">
															Nv. {c.level}
														</span>
													</button>
												))}
										</div>
										<p className="text-[10px] text-amber-700/60 mt-2">
											Cargar reemplaza el contenido actual del inventario.
										</p>
									</>
								)}
							</div>
						)}
					</>
				)}

				{/* ── Carry Weight ─────────────────────────────────────────── */}
				<div className="rounded-xl border border-amber-800/40 bg-[#2a1204]/70 px-5 py-4 flex flex-wrap items-center gap-6">
					<Scale className="w-6 h-6 text-amber-600 shrink-0" />
					<div className="flex items-center gap-6 flex-wrap flex-1">
						<div className="text-center">
							<div className="flex items-center gap-2 justify-center mb-0.5">
								<p className="text-[10px] uppercase tracking-widest text-amber-600">
									Peso actual
								</p>
								<button
									onClick={() => {
										if (autoWeight)
											setManualWeightStr(autoCurrentWeight.toFixed(1));
										setAutoWeight((v) => !v);
									}}
									title={
										autoWeight
											? "Introducir manualmente"
											: "Volver al cálculo automático"
									}
									className="text-[9px] px-1.5 py-0.5 rounded border border-amber-800/50 text-amber-600 hover:text-amber-400 hover:border-amber-600/60 transition-colors"
								>
									{autoWeight ? "manual" : "auto"}
								</button>
							</div>
							{autoWeight ? (
								<p
									className={`text-2xl font-bold ${overEncumbered ? "text-red-400" : "text-amber-200"}`}
								>
									{currentWeight.toFixed(1)}
									<span className="text-sm font-normal text-amber-600 ml-1">
										lb
									</span>
								</p>
							) : (
								<div className="flex items-baseline gap-1 justify-center">
									<input
										type="text"
										inputMode="decimal"
										value={manualWeightStr}
										onChange={(e) => {
											const v = e.target.value;
											if (/^\d*\.?\d*$/.test(v)) setManualWeightStr(v);
										}}
										onBlur={() => {
											const n = parseFloat(manualWeightStr);
											setManualWeightStr(
												isNaN(n) || manualWeightStr === ""
													? "0.0"
													: Math.max(0, n).toFixed(1),
											);
										}}
										className={`text-2xl font-bold bg-transparent border-b focus:outline-none w-20 text-center ${
											overEncumbered
												? "text-red-400 border-red-700/50 focus:border-red-400"
												: "text-amber-200 border-amber-700/50 focus:border-amber-400"
										}`}
									/>
									<span className="text-sm text-amber-600">lb</span>
								</div>
							)}
						</div>
						<div className="text-amber-800/40 text-xl">|</div>
						<div className="text-center">
							<p className="text-[10px] uppercase tracking-widest text-amber-600 mb-0.5">
								Capacidad máx.
							</p>
							<div className="flex items-baseline gap-1 justify-center">
								<input
									type="number"
									min={0}
									value={maxCarryWeight}
									onChange={(e) =>
										setMaxCarryWeight(
											Math.max(0, parseFloat(e.target.value) || 0),
										)
									}
									className="text-2xl font-bold text-amber-200 bg-transparent border-b border-amber-700/50 focus:border-amber-400 focus:outline-none w-20 text-center"
								/>
								<span className="text-sm text-amber-600">lb</span>
							</div>
							{mountCapacity > 0 && (
								<p className="text-[10px] text-amber-500/80 mt-0.5">
									+{mountCapacity} lb montura →{" "}
									<span className="text-amber-300">
										{effectiveMax} lb total
									</span>
								</p>
							)}
						</div>
						{effectiveMax > 0 && (
							<div className="flex-1 min-w-[120px]">
								<div className="h-2 bg-amber-950 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full transition-all duration-300 ${overEncumbered ? "bg-red-600" : weightPct > 80 ? "bg-yellow-500" : "bg-amber-500"}`}
										style={{ width: `${weightPct}%` }}
									/>
								</div>
								<p
									className={`text-[10px] text-right mt-0.5 ${overEncumbered ? "text-red-400" : "text-amber-700"}`}
								>
									{overEncumbered
										? "¡Sobrecargado!"
										: `${Math.round(weightPct)}% cargado`}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* ════════════════════════════════════════════════════════════
				    EQUIPO EQUIPADO – Paperdoll con silueta
				════════════════════════════════════════════════════════════ */}
				<section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
					<h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
						<Shirt className="w-5 h-5" /> Equipo equipado
					</h2>
					<div className="relative mx-auto" style={{ width: 480, height: 600 }}>
						<img
							src="/bg-inventary.png"
							alt="Personaje"
							className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none select-none"
						/>
						{/* Gradiente oscuro para mejorar contraste de los slots */}
						<div
							className="absolute inset-0 rounded-xl pointer-events-none"
							style={{
								background:
									"linear-gradient(to bottom, rgba(20,8,2,0.18) 0%, rgba(20,8,2,0.08) 50%, rgba(20,8,2,0.32) 100%)",
							}}
						/>
						{EQUIPMENT_SLOTS.map((slot) => (
							<EquipSlot
								key={slot.key}
								slot={slot}
								item={inventory.equipped[slot.key]}
								onClear={() => clearSlot(slot.key)}
								onOpen={() => setOpenSlot(slot.key)}
							/>
						))}
					</div>
					<p className="text-xs text-amber-700/50 text-center mt-3">
						Haz clic en un slot para buscar y equipar un objeto
					</p>
				</section>
				{openSlot &&
					(() => {
						const slot = EQUIPMENT_SLOTS.find((s) => s.key === openSlot);
						if (!slot) return null;
						return (
							<SlotPickerModal
								slotLabel={slot.label}
								slotKey={slot.key}
								allItems={compendiumItems}
								onEquip={(name, weight, srdIndex, tags, capacity) =>
									equipSlot(openSlot!, name, weight, srdIndex, tags, capacity)
								}
								onClose={() => setOpenSlot(null)}
							/>
						);
					})()}

				{/* ════════════════════════════════════════════════════════════
				    POCIONES + PERGAMINOS (al mismo nivel)
				════════════════════════════════════════════════════════════ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
						<h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
							<FlaskConical className="w-5 h-5" /> Pociones
						</h2>
						<p className="text-xs text-amber-600/70 mb-3 italic">
							Pociones y brebajes mágicos
						</p>
						<ConsumableSection
							items={inventory.potions}
							rowColor="bg-amber-900/25 border-amber-800/35"
							allItems={compendiumItems}
							categoryFilter={FILTER_POTIONS}
							inputPlaceholder="Busca pociones…"
							onSelect={(name, weight, srdIndex, tags, srdEdition) =>
addConsumable("potions", name, weight, srdIndex, tags, srdEdition)
}
							onChangeQty={(id, d) => changeQty("potions", id, d)}
							onRemove={(id) => removeItem("potions", id)}
						/>
					</section>

					<section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
						<h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
							<ScrollText className="w-5 h-5" /> Pergaminos
						</h2>
						<p className="text-xs text-amber-600/70 mb-3 italic">
							Pergaminos de conjuros y recetas
						</p>
						<ConsumableSection
							items={inventory.scrolls}
							rowColor="bg-amber-900/25 border-amber-800/35"
							allItems={compendiumItems}
							categoryFilter={FILTER_SCROLLS}
							inputPlaceholder="Busca pergaminos…"
							onSelect={(name, weight, srdIndex, tags, srdEdition) =>
addConsumable("scrolls", name, weight, srdIndex, tags, srdEdition)
}
							onChangeQty={(id, d) => changeQty("scrolls", id, d)}
							onRemove={(id) => removeItem("scrolls", id)}
						/>
					</section>
				</div>

				{/* ════════════════════════════════════════════════════════════
				    BOLSA – ancho completo, dos columnas, con peso
				════════════════════════════════════════════════════════════ */}
				<section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
					<div className="flex items-baseline gap-3 mb-1">
						<h2 className="text-xl font-semibold text-amber-300 flex items-center gap-2">
							<Package className="w-5 h-5" /> Inventario
						</h2>
						<span className="text-xs text-amber-600">
							{inventory.bag.reduce((s, i) => s + i.quantity, 0)} objetos
						</span>
					</div>
					<p className="text-xs text-amber-700/60 mb-3 italic">
						Todos los objetos: equipables no equipados, herramientas,
						consumibles, etc.
					</p>
					<BagSection
						items={inventory.bag}
						allItems={compendiumItems}
						onSelect={addBagItem}
						onChangeQty={(id, d) => changeQty("bag", id, d)}
						onRemove={(id) => removeItem("bag", id)}
					/>
				</section>

				{/* ════════════════════════════════════════════════════════════
				    MUNICIÓN + MONEDERO (al mismo nivel)
				════════════════════════════════════════════════════════════ */}
				<section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
					<h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
						<Target className="w-5 h-5" /> Munición
					</h2>
					<p className="text-xs text-amber-600/70 mb-3 italic">
						Flechas, virotes, dagas arrojadizas…
					</p>
					<ConsumableSection
						items={inventory.ammo}
						rowColor="bg-amber-900/25 border-amber-800/35"
						allItems={compendiumItems}
						categoryFilter={FILTER_AMMO}
						inputPlaceholder="Busca munición…"
						onSelect={(name, weight, srdIndex, tags, srdEdition) =>
							addConsumable("ammo", name, weight, srdIndex, tags, srdEdition)
						}
						onChangeQty={(id, d) => changeQty("ammo", id, d)}
						onRemove={(id) => removeItem("ammo", id)}
					/>
				</section>

				{/* Monedero – ancho reducido y centrado */}
				<section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5 mx-auto w-full max-w-md">
					<h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
						<Coins className="w-5 h-5" /> Monedero
					</h2>
					<div className="grid grid-cols-5 gap-2">
						{CURRENCY_LABELS.map(({ key, label, color }) => (
							<div
								key={key}
								className="flex flex-col items-center gap-1 rounded-lg border border-amber-800/30 bg-black/20 p-2"
							>
								<span
									className={`text-[10px] font-semibold ${color} text-center`}
								>
									{label}
								</span>
								<input
									type="number"
									min={0}
									value={inventory.currency[key]}
									onChange={(e) => setCurrency(key, e.target.value)}
									className="w-full text-center bg-transparent border-b border-amber-800/40 text-amber-100 text-lg font-bold focus:outline-none focus:border-amber-500"
								/>
								<span
									className={`text-[9px] uppercase tracking-wider ${color}`}
								>
									{key}
								</span>
							</div>
						))}
					</div>
				</section>

				{/* ── Footer guardar ────────────────────────────────────────── */}
				<div className="pt-2 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
					{!user ? (
						<p className="text-sm text-amber-600 flex items-center gap-2">
							<UserPlus className="w-4 h-4" />
							<span>
								<Link
									to={routes.register}
									className="underline hover:text-amber-400"
								>
									Crea una cuenta
								</Link>{" "}
								para guardar tu inventario vinculado a un personaje.
							</span>
						</p>
					) : !linkedCharId ? (
						<p className="text-sm text-amber-600">
							Vincula un personaje arriba para poder guardar.
						</p>
					) : saveStatus === "saved" ? (
						<p className="text-sm text-green-400 flex items-center gap-2">
							<CheckCircle2 className="w-4 h-4" /> Guardado correctamente en{" "}
							<strong>{linkedCharName}</strong>.
						</p>
					) : saveStatus === "error" ? (
						<p className="text-sm text-red-400 flex items-center gap-2">
							<AlertCircle className="w-4 h-4" /> Error al guardar. Inténtalo de
							nuevo.
						</p>
					) : (
						<p className="text-sm text-amber-700">
							Los cambios no se guardan automáticamente.
						</p>
					)}
					<Button
						onClick={handleSave}
						disabled={saveStatus === "saving" || (!!user && !linkedCharId)}
						className="bg-amber-700 hover:bg-amber-600 text-white gap-2 disabled:opacity-60"
					>
						{saveStatus === "saving" && (
							<Loader2 className="w-4 h-4 animate-spin" />
						)}
						{saveStatus === "saved" && (
							<CheckCircle2 className="w-4 h-4 text-green-300" />
						)}
						{saveStatus === "error" && (
							<AlertCircle className="w-4 h-4 text-red-300" />
						)}
						{saveStatus === "idle" &&
							(user ? (
								<Save className="w-4 h-4" />
							) : (
								<LogIn className="w-4 h-4" />
							))}
						{saveStatus === "saving"
							? "Guardando…"
							: saveStatus === "saved"
								? "¡Guardado!"
								: saveStatus === "error"
									? "Error al guardar"
									: !user
										? "Inicia sesión para guardar"
										: !linkedCharId
											? "Elige un personaje"
											: "Guardar"}
					</Button>
				</div>
			</div>
		</>
	);
};

export default InventarioScene;
