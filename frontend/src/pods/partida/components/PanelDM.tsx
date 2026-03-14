// ================================================
// PanelDM – Right panel, only visible to the DM
// ================================================
// Shows: campaign chapters/scenes tree, scene entities
// (maps, enemies, npcs, items, spells) with Deploy/Go buttons.
// Has Comenzar/Terminar enfrentamiento and Terminar sesión buttons.
// ================================================

import { useState } from "react";
import {
	ChevronDown,
	ChevronRight,
	Map,
	Sword,
	Package,
	Users,
	Sparkles,
	Play,
	Rocket,
	StopCircle,
	LogOut,
	Eye,
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

interface BattleMap {
	id: string;
	name: string;
	image_data: string;
	grid_size: number;
	grid_color: string;
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
	onDeployEntity: (entity: SceneEntityBasic) => void;
	onStartCombat: () => void;
	onEndCombat: () => void;
	onEndSession: () => void;
}

type EntityTab = "map" | "monster" | "npc" | "item" | "spell";

const ENTITY_TABS: { key: EntityTab; label: string; icon: React.ReactNode }[] =
	[
		{ key: "map", label: "Mapas", icon: <Map className="w-3 h-3" /> },
		{ key: "monster", label: "Enemigos", icon: <Sword className="w-3 h-3" /> },
		{ key: "npc", label: "NPCs", icon: <Users className="w-3 h-3" /> },
		{ key: "item", label: "Objetos", icon: <Package className="w-3 h-3" /> },
		{ key: "spell", label: "Hechizos", icon: <Sparkles className="w-3 h-3" /> },
	];

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
	onStartCombat,
	onEndCombat,
	onEndSession,
}: Props) {
	const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
		new Set()
	);
	const [entityTab, setEntityTab] = useState<EntityTab>("map");
	const [selectedEntity, setSelectedEntity] = useState<SceneEntityBasic | null>(
		null
	);
	const [selectedMapId, setSelectedMapId] = useState<string>("");

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

	const mapEntities = selectedScene?.entities.filter(
		(e) => e.entity_type === "map"
	) ?? [];

	const canDeploy =
		entityTab === "map" ||
		(currentMapId !== null && selectedEntity !== null);

	const handleDeploySelected = () => {
		if (!selectedEntity) return;
		if (entityTab === "map") {
			const mapObj = availableMaps.find((m) => m.id === selectedEntity.entity_id);
			if (mapObj) onDeployMap(mapObj);
		} else {
			onDeployEntity(selectedEntity);
		}
	};

	const handleDeployMap = () => {
		if (!selectedMapId) return;
		const mapObj = availableMaps.find((m) => m.id === selectedMapId);
		if (mapObj) onDeployMap(mapObj);
	};

	return (
		<aside className="w-72 flex flex-col bg-[#120a04] border-l border-amber-900/30 text-sm overflow-hidden shrink-0">
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
					<Select
						value={selectedMapId}
						onValueChange={setSelectedMapId}
					>
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

			{/* ─ Chapters / Scenes tree ─ */}
			<div className="flex-1 overflow-y-auto">
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
										<Badge variant="outline" className="h-4 px-1 ml-0.5 text-[10px]">
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
								<p className="text-xs text-gray-500 italic">Sin entidades de este tipo.</p>
							)}
						</div>

						{/* Deploy / Add to map button */}
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
			</div>
		</aside>
	);
}
