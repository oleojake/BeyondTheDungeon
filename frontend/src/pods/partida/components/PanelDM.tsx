// ================================================
// PanelDM – Right panel, only visible to the DM
// ================================================
// Shows: campaign chapters/scenes tree, scene entities
// (maps, enemies, npcs, items, spells) with Deploy/Go buttons.
// Has Comenzar/Terminar enfrentamiento and Terminar sesión buttons.
// ================================================

import { useState, useEffect, useRef } from "react";
import {
	ChevronDown,
	ChevronRight,
	Map,
	Sword,
	Archive,
	Users,
	Sparkles,
	Play,
	Rocket,
	StopCircle,
	LogOut,
	Eye,
	Shield,
	FlaskConical,
	Gem,
	Key,
	Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
	ChapterWithScenes,
	SceneEntityBasic,
	SceneWithEntities,
	SessionToken,
	CombatState,
} from "../partida.vm";
import type { BattleMapListItem } from "@/core/api/battle-map.service";
type BattleMap = BattleMapListItem;
import { User, Search } from "lucide-react";
import { fetchItems, fetchSpells } from "@/core/api/backend.service";
import type { Item, Spell } from "@/core/api/backend.service";

interface BestiaryMonster {
	id: string;
	name: string;
	stats?: { hit_points?: number; [key: string]: unknown };
	[key: string]: unknown;
}

interface Props {
	chapters: ChapterWithScenes[];
	selectedSceneId: string | null;
	currentMapId: string | null;
	availableMaps: BattleMap[];
	tokens: SessionToken[];
	combatState: CombatState | null;
	isSessionActive: boolean;
	onSelectScene: (sceneId: string) => void;
	onGoToScene: (scene: SceneWithEntities) => void;
	onDeployMap: (map: BattleMap) => void;
	onDeployEntity: (entity: SceneEntityBasic, iconKey?: string) => void;
	onChangeTokenIcon: (tokenId: string, iconKey: string) => void;
	onUpdateToken: (
		tokenId: string,
		updates: {
			token_color?: string;
			token_size?: "S" | "M" | "L" | "XL" | null;
		},
	) => void;
	selectedToken: SessionToken | null;
	onStartCombat: () => void;
	onEndCombat: () => void;
	onEndSession: () => void;
}

type EntityTab = "map" | "monster" | "npc" | "item" | "spell";

const ITEM_ICONS = [
	{ key: "chest", label: "Cofre", Icon: Archive },
	{ key: "sword", label: "Espada", Icon: Sword },
	{ key: "shield", label: "Escudo", Icon: Shield },
	{ key: "flask", label: "Poción", Icon: FlaskConical },
	{ key: "gem", label: "Joya", Icon: Gem },
	{ key: "user", label: "Persona", Icon: User },
	{ key: "key", label: "Llave", Icon: Key },
	{ key: "wand", label: "Varita", Icon: Wand2 },
] as const;

const TOKEN_COLORS = [
	{ value: "#3b82f6", label: "Azul" },
	{ value: "#ef4444", label: "Rojo" },
	{ value: "#a855f7", label: "Morado" },
	{ value: "#22c55e", label: "Verde" },
	{ value: "#f59e0b", label: "Ambar" },
	{ value: "#ffffff", label: "Blanco" },
] as const;

const SIZE_OPTIONS = [
	{ value: "S", label: "S" },
	{ value: "M", label: "M" },
	{ value: "L", label: "L" },
	{ value: "XL", label: "XL" },
] as const;

const SPELL_SHAPES = [
	{ key: "circle", label: "Esfera" },
	{ key: "cone", label: "Cono" },
	{ key: "rect", label: "Cubo" },
	{ key: "line", label: "Línea" },
] as const;

const ENTITY_TABS: { key: EntityTab; label: string; icon: React.ReactNode }[] =
	[
		{ key: "map", label: "Mapas", icon: <Map className="w-3 h-3" /> },
		{ key: "monster", label: "Enemigos", icon: <Sword className="w-3 h-3" /> },
		{ key: "npc", label: "NPCs", icon: <Users className="w-3 h-3" /> },
		{ key: "item", label: "Objetos", icon: <Archive className="w-3 h-3" /> },
		{ key: "spell", label: "Hechizos", icon: <Sparkles className="w-3 h-3" /> },
	];

function ShapePreview({
	shapeKey,
	active,
}: {
	shapeKey: string;
	active: boolean;
}) {
	const color = active ? "#c084fc" : "#6b7280";
	if (shapeKey === "circle")
		return (
			<div
				style={{
					width: 14,
					height: 14,
					borderRadius: "50%",
					border: `2px solid ${color}`,
				}}
			/>
		);
	if (shapeKey === "rect")
		return (
			<div
				style={{
					width: 14,
					height: 14,
					borderRadius: 2,
					border: `2px solid ${color}`,
				}}
			/>
		);
	if (shapeKey === "cone")
		return (
			<div
				style={{
					width: 0,
					height: 0,
					borderLeft: "7px solid transparent",
					borderRight: "7px solid transparent",
					borderBottom: `14px solid ${color}`,
				}}
			/>
		);
	if (shapeKey === "line")
		return (
			<div
				style={{
					width: 4,
					height: 14,
					borderRadius: 2,
					backgroundColor: color,
				}}
			/>
		);
	return null;
}

export function PanelDM({
	chapters,
	selectedSceneId,
	currentMapId,
	availableMaps,
	tokens,
	combatState,
	isSessionActive,
	onSelectScene,
	onGoToScene,
	onDeployMap,
	onDeployEntity,
	onChangeTokenIcon,
	onUpdateToken,
	selectedToken,
	onStartCombat,
	onEndCombat,
	onEndSession,
}: Props) {
	const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
		new Set(),
	);
	const [entityTab, setEntityTab] = useState<EntityTab>("map");
	const [selectedEntity, setSelectedEntity] = useState<SceneEntityBasic | null>(
		null,
	);
	const [selectedMapId, setSelectedMapId] = useState<string>("");
	const [selectedItemIcon, setSelectedItemIcon] = useState<string>("package");
	const [selectedSpellShape, setSelectedSpellShape] =
		useState<string>("circle");

	// ── Compendium free-search state ──────────────────────────────────────────
	const [bestiaryOpen, setBestiaryOpen] = useState(false);
	const [compendiumTab, setCompendiumTab] = useState<"monster" | "item" | "spell">("monster");
	const [bestiaryAll, setBestiaryAll] = useState<BestiaryMonster[]>([]);
	const [itemsAll, setItemsAll] = useState<Item[]>([]);
	const [spellsAll, setSpellsAll] = useState<Spell[]>([]);
	const [bestiaryLoading, setBestiaryLoading] = useState(false);
	const [bestiaryQuery, setBestiaryQuery] = useState("");
	const [bestiaryFocused, setBestiaryFocused] = useState(false);
	const [selectedBestiary, setSelectedBestiary] = useState<BestiaryMonster | null>(null);
	const [selectedItem, setSelectedItem] = useState<Item | null>(null);
	const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
	const bestiaryFetched = useRef(false);
	const itemsFetched = useRef(false);
	const spellsFetched = useRef(false);

	useEffect(() => {
		if (!bestiaryOpen) return;
		if (compendiumTab === "monster" && !bestiaryFetched.current) {
			bestiaryFetched.current = true;
			setBestiaryLoading(true);
			const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
			fetch(`${API_URL}/api/compendium-bestiary`)
				.then((r) => r.json())
				.then((data) => {
					const list: BestiaryMonster[] = (data.characters ?? []).map(
						(m: BestiaryMonster) => ({ ...m, id: m.id ?? m.name, name: m.name }),
					);
					setBestiaryAll(list);
				})
				.catch(console.error)
				.finally(() => setBestiaryLoading(false));
		} else if (compendiumTab === "item" && !itemsFetched.current) {
			itemsFetched.current = true;
			setBestiaryLoading(true);
			fetchItems()
				.then((data) => setItemsAll(data.items ?? []))
				.catch(console.error)
				.finally(() => setBestiaryLoading(false));
		} else if (compendiumTab === "spell" && !spellsFetched.current) {
			spellsFetched.current = true;
			setBestiaryLoading(true);
			fetchSpells()
				.then((data) => setSpellsAll(data.spells ?? []))
				.catch(console.error)
				.finally(() => setBestiaryLoading(false));
		}
	}, [bestiaryOpen, compendiumTab]);

	const compendiumAllItems: { id: string; name: string; subtitle?: string }[] = (() => {
		if (compendiumTab === "monster") return bestiaryAll.map((m) => ({ id: String(m.id), name: m.name, subtitle: m.stats?.hit_points ? `${m.stats.hit_points} HP` : undefined }));
		if (compendiumTab === "item") return itemsAll.map((i) => ({ id: i.id, name: i.name }));
		return spellsAll.map((s) => ({ id: s.id, name: s.name, subtitle: `Nv.${s.level}` }));
	})();

	const compendiumFiltered = (() => {
		const q = bestiaryQuery.trim().toLowerCase();
		const list = q.length >= 1
			? compendiumAllItems.filter((m) => m.name.toLowerCase().includes(q))
			: [...compendiumAllItems].sort((a, b) => a.name.localeCompare(b.name));
		return list;
	})();
	const showBestiaryList = bestiaryFocused || bestiaryQuery.trim().length >= 1;

	const selectedCompendiumId = compendiumTab === "monster" ? selectedBestiary?.id : compendiumTab === "item" ? selectedItem?.id : selectedSpell?.id;

	const handleSelectCompendiumItem = (id: string) => {
		if (compendiumTab === "monster") setSelectedBestiary(bestiaryAll.find((m) => String(m.id) === id) ?? null);
		else if (compendiumTab === "item") setSelectedItem(itemsAll.find((i) => i.id === id) ?? null);
		else setSelectedSpell(spellsAll.find((s) => s.id === id) ?? null);
	};

	const handleDeployBestiary = () => {
		if (compendiumTab === "monster") {
			if (!selectedBestiary) return;
			const stats = (selectedBestiary.stats as Record<string, unknown> | undefined) ?? {};
			const hp = (stats.hit_points as number) ?? 10;
			onDeployEntity({
				id: `bestiary:${selectedBestiary.id}`,
				entity_type: "monster",
				entity_id: String(selectedBestiary.id),
				entity_name: selectedBestiary.name,
				entity_data: { ...selectedBestiary, hp, max_hp: hp, stats: { ...stats, hp, max_hp: hp } },
			});
			setSelectedBestiary(null);
		} else if (compendiumTab === "item") {
			if (!selectedItem) return;
			onDeployEntity(
				{
					id: `item:${selectedItem.id}`,
					entity_type: "item",
					entity_id: selectedItem.id,
					entity_name: selectedItem.name,
					entity_data: { ...selectedItem },
				},
				selectedItemIcon,
			);
			setSelectedItem(null);
			setSelectedItemIcon("package");
		} else {
			if (!selectedSpell) return;
			onDeployEntity(
				{
					id: `spell:${selectedSpell.id}`,
					entity_type: "spell",
					entity_id: selectedSpell.id,
					entity_name: selectedSpell.name,
					entity_data: { ...selectedSpell },
				},
				`shape:${selectedSpellShape}`,
			);
			setSelectedSpell(null);
			setSelectedSpellShape("circle");
		}
		setBestiaryQuery("");
	};

	const toggleChapter = (id: string) =>
		setExpandedChapters((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	const selectedScene = chapters
		.flatMap((c) => c.scenes)
		.find((s) => s.id === selectedSceneId);

	const entitiesOfType = (type: EntityTab): SceneEntityBasic[] => {
		if (!selectedScene) return [];
		return selectedScene.entities.filter((e) => e.entity_type === type);
	};

	const mapEntities =
		selectedScene?.entities.filter((e) => e.entity_type === "map") ?? [];

	const canDeploy =
		entityTab === "map" || (currentMapId !== null && selectedEntity !== null);

	const handleDeploySelected = () => {
		if (!selectedEntity) return;
		if (entityTab === "map") {
			const mapObj = availableMaps.find(
				(m) => m.id === selectedEntity.entity_id,
			);
			if (mapObj) onDeployMap(mapObj);
		} else if (entityTab === "item") {
			onDeployEntity(selectedEntity, selectedItemIcon);
			setSelectedEntity(null);
			setSelectedItemIcon("package");
		} else if (entityTab === "spell") {
			onDeployEntity(selectedEntity, `shape:${selectedSpellShape}`);
			setSelectedEntity(null);
			setSelectedSpellShape("circle");
		} else {
			onDeployEntity(selectedEntity);
			setSelectedEntity(null);
		}
	};

	const handleDeployMap = () => {
		if (!selectedMapId) return;
		const mapObj = availableMaps.find((m) => m.id === selectedMapId);
		if (mapObj) onDeployMap(mapObj);
	};

	return (
		<aside className="w-72 h-full flex flex-col bg-[#120a04] border-l border-amber-900/30 text-sm overflow-hidden shrink-0 pt-10">
			{/* ─ Session controls ─ */}
			<div className="p-3 border-b border-amber-900/30 flex flex-col gap-2">
				{combatState?.is_active ? (
					<Button
						size="sm"
						variant="destructive"
						className="w-full"
						onClick={onEndCombat}
					>
						<StopCircle className="w-4 h-4 mr-1" />
						Terminar enfrentamiento
					</Button>
				) : (
					<Button
						size="sm"
						className="w-full bg-red-700 hover:bg-red-600 text-white"
						onClick={onStartCombat}
					>
						<Sword className="w-4 h-4 mr-1" />
						Comenzar enfrentamiento
					</Button>
				)}

				<Button
					size="sm"
					variant="outline"
					className="w-full border-amber-800 text-amber-300 hover:bg-amber-900/20"
					onClick={onEndSession}
				>
					<LogOut className="w-4 h-4 mr-1" />
					Terminar sesión
				</Button>
			</div>

			{/* ─ Map selector (always visible) ─ */}
			<div className="p-3 border-b border-amber-900/30">
				<label className="text-xs text-gray-400 block mb-1">
					Cargar mapa directamente
				</label>
				<div className="flex gap-2">
					<Select value={selectedMapId} onValueChange={setSelectedMapId}>
						<SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 h-7 text-xs flex-1">
							<SelectValue placeholder="Elige mapa..." />
						</SelectTrigger>
						<SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
							{availableMaps.map((m) => (
								<SelectItem key={m.id} value={m.id} className="text-xs">
									{m.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						size="sm"
						disabled={!selectedMapId}
						onClick={handleDeployMap}
						className="bg-amber-700 hover:bg-amber-600 text-white h-7 text-xs"
					>
						<Map className="w-3 h-3 mr-1" />
						Cargar
					</Button>
				</div>
			</div>

			{/* ─ Scrollable content ─ */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="p-3 border-b border-amber-900/30">
					<h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2">
						Historia
					</h3>
					{chapters.length === 0 && (
						<p className="text-xs text-gray-500">Sin capítulos.</p>
					)}
					{chapters.map((chapter) => (
						<div key={chapter.id} className="mb-1">
							<button
								onClick={() => toggleChapter(chapter.id)}
								className="flex items-center gap-1 w-full text-left text-amber-300 hover:text-amber-100 py-1"
							>
								{expandedChapters.has(chapter.id) ? (
									<ChevronDown className="w-3 h-3 shrink-0" />
								) : (
									<ChevronRight className="w-3 h-3 shrink-0" />
								)}
								<span className="text-xs font-medium truncate">
									{chapter.title}
								</span>
							</button>

							{expandedChapters.has(chapter.id) && (
								<div className="ml-4 flex flex-col gap-0.5">
									{chapter.scenes.map((scene) => (
										<button
											key={scene.id}
											onClick={() => onSelectScene(scene.id)}
											className={`text-left px-2 py-1 rounded text-xs flex items-center gap-1 ${
												selectedSceneId === scene.id
													? "bg-amber-800/40 text-amber-200"
													: "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
											}`}
										>
											<Eye className="w-3 h-3 shrink-0" />
											<span className="truncate">{scene.title}</span>
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</div>

				{/* ─ Scene details ─ */}
				{selectedScene && (
					<div className="p-3">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
								{selectedScene.title}
							</h3>
							<Button
								size="sm"
								className="h-6 text-xs bg-purple-700 hover:bg-purple-600 text-white"
								onClick={() => onGoToScene(selectedScene)}
							>
								<Play className="w-2.5 h-2.5 mr-1" />
								Ir
							</Button>
						</div>

						{/* Narration */}
						{selectedScene.narration_text && (
							<div className="text-xs text-gray-300 bg-gray-800/40 rounded p-2 mb-2 max-h-28 overflow-y-auto italic leading-relaxed">
								{selectedScene.narration_text}
							</div>
						)}

						{/* DM Notes */}
						{selectedScene.dm_notes && (
							<div className="text-xs text-amber-200/70 bg-amber-900/20 rounded p-2 mb-3 max-h-24 overflow-y-auto">
								<span className="font-bold text-amber-400">Notas DM: </span>
								{selectedScene.dm_notes}
							</div>
						)}

						{/* Entity tabs */}
						<div className="flex gap-1 mb-2 flex-wrap">
							{ENTITY_TABS.map((tab) => {
								const count = entitiesOfType(tab.key).length;
								if (count === 0) return null;
								return (
									<button
										key={tab.key}
										onClick={() => {
											setEntityTab(tab.key);
											setSelectedEntity(null);
										}}
										className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors ${
											entityTab === tab.key
												? "border-amber-500 bg-amber-900/30 text-amber-300"
												: "border-gray-600 bg-gray-800/30 text-gray-400 hover:border-gray-500"
										}`}
									>
										{tab.icon}
										{tab.label}
										<Badge
											variant="outline"
											className="h-4 px-1 ml-0.5 text-[10px]"
										>
											{count}
										</Badge>
									</button>
								);
							})}
						</div>

						{/* Entity list */}
						<div className="flex flex-col gap-1 max-h-48 overflow-y-auto mb-2">
							{entitiesOfType(entityTab).map((entity) => (
								<button
									key={entity.id}
									onClick={() => setSelectedEntity(entity)}
									className={`text-left px-2 py-1.5 rounded text-xs border transition-colors ${
										selectedEntity?.id === entity.id
											? "border-amber-500 bg-amber-900/20 text-amber-200"
											: "border-gray-700 bg-gray-800/20 text-gray-300 hover:border-gray-600"
									}`}
								>
									{entity.entity_name}
								</button>
							))}
							{entitiesOfType(entityTab).length === 0 && (
								<p className="text-xs text-gray-500 italic">
									Sin entidades de este tipo.
								</p>
							)}
						</div>
						{/* Icon picker — only for items, only before deploying */}
						{entityTab === "item" && selectedEntity && (
							<div className="mb-2">
								<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
									Icono al introducir
								</p>
								<div className="grid grid-cols-4 gap-1">
									{ITEM_ICONS.map(({ key, label, Icon }) => (
										<button
											key={key}
											title={label}
											onClick={() => setSelectedItemIcon(key)}
											className={`flex flex-col items-center gap-0.5 p-1.5 rounded border text-xs transition-colors ${
												selectedItemIcon === key
													? "border-amber-500 bg-amber-900/30 text-amber-300"
													: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
											}`}
										>
											<Icon className="w-3.5 h-3.5" />
											<span className="text-[9px] leading-tight">{label}</span>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Shape picker — only for spells, only before deploying */}
						{entityTab === "spell" && selectedEntity && (
							<div className="mb-2">
								<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
									Forma del área
								</p>
								<div className="grid grid-cols-4 gap-1">
									{SPELL_SHAPES.map(({ key, label }) => (
										<button
											key={key}
											title={label}
											onClick={() => setSelectedSpellShape(key)}
											className={`flex flex-col items-center gap-1 p-1.5 rounded border text-xs transition-colors ${
												selectedSpellShape === key
													? "border-purple-500 bg-purple-900/30 text-purple-300"
													: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
											}`}
										>
											<ShapePreview
												shapeKey={key}
												active={selectedSpellShape === key}
											/>
											<span className="text-[9px] leading-tight">{label}</span>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Deploy button */}
						{selectedEntity && (
							<Button
								size="sm"
								disabled={!canDeploy}
								onClick={handleDeploySelected}
								className="w-full h-7 text-xs bg-green-700 hover:bg-green-600 text-white"
							>
								<Rocket className="w-3 h-3 mr-1" />
								{entityTab === "map" ? "Desplegar mapa" : "Introducir en mapa"}
							</Button>
						)}
					</div>
				)}

				{/* ─ Compendium free-search ─ */}
				<div className="border-t border-amber-900/30">
					<button
						onClick={() => setBestiaryOpen((p) => !p)}
						className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-amber-500 uppercase tracking-wide hover:bg-amber-900/10 transition-colors"
					>
						<span className="flex items-center gap-1">
							<Search className="w-3 h-3" />
							Compendio (búsqueda libre)
						</span>
						{bestiaryOpen ? (
							<ChevronDown className="w-3 h-3" />
						) : (
							<ChevronRight className="w-3 h-3" />
						)}
					</button>

					{bestiaryOpen && (
						<div className="px-3 pb-3 space-y-2">
							{/* Tabs */}
							<div className="flex gap-1">
								{(["monster", "item", "spell"] as const).map((tab) => {
									const labels = { monster: "Monstruos", item: "Objetos", spell: "Hechizos" };
									const icons = {
										monster: <Sword className="w-3 h-3" />,
										item: <Archive className="w-3 h-3" />,
										spell: <Sparkles className="w-3 h-3" />,
									};
									return (
										<button
											key={tab}
											onClick={() => {
												setCompendiumTab(tab);
												setBestiaryQuery("");
												setSelectedBestiary(null);
												setSelectedItem(null);
												setSelectedSpell(null);
											}}
											className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold border transition-colors ${
												compendiumTab === tab
													? "border-amber-500 bg-amber-900/30 text-amber-300"
													: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-500"
											}`}
										>
											{icons[tab]}
											{labels[tab]}
										</button>
									);
								})}
							</div>

							{bestiaryLoading ? (
								<p className="text-xs text-gray-500 italic">Cargando…</p>
							) : (
								<>
									<div className="relative">
										<Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
										<input
											type="text"
											value={bestiaryQuery}
											onChange={(e) => {
												setBestiaryQuery(e.target.value);
												setSelectedBestiary(null);
												setSelectedItem(null);
												setSelectedSpell(null);
											}}
											onFocus={() => setBestiaryFocused(true)}
											onBlur={() => setTimeout(() => setBestiaryFocused(false), 150)}
											placeholder={
												compendiumTab === "monster"
													? "Buscar monstruo…"
													: compendiumTab === "item"
													? "Buscar objeto…"
													: "Buscar hechizo…"
											}
											className="w-full pl-7 pr-2 py-1 rounded bg-gray-800 border border-gray-600 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
										/>
									</div>

									{showBestiaryList && (
										<div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
											{compendiumFiltered.length === 0 && (
												<p className="text-xs text-gray-500 italic">Sin resultados.</p>
											)}
											{compendiumFiltered.slice(0, 50).map((entry) => (
												<button
													key={entry.id}
													onClick={() => handleSelectCompendiumItem(entry.id)}
													className={`text-left px-2 py-1 rounded text-xs border transition-colors ${
														selectedCompendiumId === entry.id
															? "border-amber-500 bg-amber-900/20 text-amber-200"
															: "border-gray-700 bg-gray-800/20 text-gray-300 hover:border-gray-600"
													}`}
												>
													<span className="font-medium">{entry.name}</span>
													{entry.subtitle && (
														<span className="ml-1 text-gray-400">· {entry.subtitle}</span>
													)}
												</button>
											))}
										</div>
									)}

									{/* Icon picker — items */}
									{compendiumTab === "item" && selectedCompendiumId && (
										<div>
											<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
												Icono al introducir
											</p>
											<div className="grid grid-cols-4 gap-1">
												{ITEM_ICONS.map(({ key, label, Icon }) => (
													<button
														key={key}
														title={label}
														onClick={() => setSelectedItemIcon(key)}
														className={`flex flex-col items-center gap-0.5 p-1.5 rounded border text-xs transition-colors ${
															selectedItemIcon === key
																? "border-amber-500 bg-amber-900/30 text-amber-300"
																: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
														}`}
													>
														<Icon className="w-3.5 h-3.5" />
														<span className="text-[9px] leading-tight">{label}</span>
													</button>
												))}
											</div>
										</div>
									)}

									{/* Shape picker — spells */}
									{compendiumTab === "spell" && selectedCompendiumId && (
										<div>
											<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
												Forma del área
											</p>
											<div className="grid grid-cols-4 gap-1">
												{SPELL_SHAPES.map(({ key, label }) => (
													<button
														key={key}
														title={label}
														onClick={() => setSelectedSpellShape(key)}
														className={`flex flex-col items-center gap-1 p-1.5 rounded border text-xs transition-colors ${
															selectedSpellShape === key
																? "border-purple-500 bg-purple-900/30 text-purple-300"
																: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
														}`}
													>
														<ShapePreview shapeKey={key} active={selectedSpellShape === key} />
														<span className="text-[9px] leading-tight">{label}</span>
													</button>
												))}
											</div>
										</div>
									)}

									{selectedCompendiumId && (
										<Button
											size="sm"
											disabled={!currentMapId}
											onClick={handleDeployBestiary}
											className="w-full h-7 text-xs bg-red-700 hover:bg-red-600 text-white"
											title={!currentMapId ? "Primero carga un mapa" : ""}
										>
											<Rocket className="w-3 h-3 mr-1" />
											Introducir{" "}
											{compendiumTab === "monster"
												? selectedBestiary?.name
												: compendiumTab === "item"
												? selectedItem?.name
												: selectedSpell?.name}
										</Button>
									)}
								</>
							)}
						</div>
					)}
				</div>

				{/* ─ Selected token panel ─ */}
				{selectedToken && (
					<div className="border-t border-amber-900/30 p-3 space-y-3">
						<h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide truncate">
							{selectedToken.entity_name}
						</h3>

						{/* Icon picker — only for icon-based tokens */}
						{(selectedToken.entity_image?.startsWith("icon:") ||
							!selectedToken.entity_image) && (
							<div>
								<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
									Icono
								</p>
								<div className="grid grid-cols-4 gap-1">
									{ITEM_ICONS.map(({ key, label, Icon }) => {
										const activeKey = selectedToken.entity_image?.startsWith(
											"icon:",
										)
											? selectedToken.entity_image.slice(5)
											: "package";
										return (
											<button
												key={key}
												title={label}
												onClick={() => onChangeTokenIcon(selectedToken.id, key)}
												className={`flex flex-col items-center gap-0.5 p-1.5 rounded border text-xs transition-colors ${
													activeKey === key
														? "border-amber-500 bg-amber-900/30 text-amber-300"
														: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
												}`}
											>
												<Icon className="w-3.5 h-3.5" />
												<span className="text-[9px] leading-tight">
													{label}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Shape picker — only for shape-based tokens (spells) */}
						{selectedToken.entity_image?.startsWith("shape:") && (
							<div>
								<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
									Forma del área
								</p>
								<div className="grid grid-cols-4 gap-1">
									{SPELL_SHAPES.map(({ key, label }) => {
										const activeKey = selectedToken.entity_image!.slice(6);
										return (
											<button
												key={key}
												title={label}
												onClick={() =>
													onChangeTokenIcon(selectedToken.id, `shape:${key}`)
												}
												className={`flex flex-col items-center gap-1 p-1.5 rounded border text-xs transition-colors ${
													activeKey === key
														? "border-purple-500 bg-purple-900/30 text-purple-300"
														: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
												}`}
											>
												<ShapePreview
													shapeKey={key}
													active={activeKey === key}
												/>
												<span className="text-[9px] leading-tight">
													{label}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Color picker */}
						<div>
							<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
								{selectedToken.entity_image?.startsWith("shape:")
									? "Color de la figura"
									: "Color del círculo"}
							</p>
							<div className="grid grid-cols-6 gap-1">
								{TOKEN_COLORS.map(({ value, label }) => (
									<button
										key={value}
										title={label}
										onClick={() =>
											onUpdateToken(selectedToken.id, { token_color: value })
										}
										className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
										style={{
											backgroundColor: value,
											borderColor:
												selectedToken.token_color === value
													? "white"
													: "transparent",
										}}
									/>
								))}
							</div>
						</div>

						{/* Size selector */}
						<div>
							<p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
								Tamaño
							</p>
							<div className="flex gap-1">
								{SIZE_OPTIONS.map(({ value, label }) => (
									<button
										key={value}
										onClick={() =>
											onUpdateToken(selectedToken.id, { token_size: value })
										}
										className={`flex-1 py-1 rounded border text-xs font-semibold transition-colors ${
											(selectedToken.token_size ?? "M") === value
												? "border-amber-500 bg-amber-900/30 text-amber-300"
												: "border-gray-700 bg-gray-800/20 text-gray-400 hover:border-gray-600"
										}`}
									>
										{label}
									</button>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
			{/* end scrollable */}
		</aside>
	);
}
