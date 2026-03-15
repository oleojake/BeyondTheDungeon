// ================================================
// Partida Component – Main game screen UI
// ================================================
// Purely presentational: left player panel, center map,
// right DM panel (DM only), top combat order, bottom toolbar,
// and any active overlays.
// ================================================

import type {
	GameSession,
	SessionToken,
	CombatState,
	SessionMember,
	MapViewState,
	ChapterWithScenes,
	SceneEntityBasic,
	SceneWithEntities,
} from "./partida.vm";
import { PanelJugadores } from "./components/PanelJugadores";
import { MapaPartida } from "./components/MapaPartida";
import { PanelDM } from "./components/PanelDM";
import { OrdenCombate } from "./components/OrdenCombate";
import { BarraInferior } from "./components/BarraInferior";
import { DadosOverlay } from "./components/DadosOverlay";
import { FichaOverlay } from "./components/FichaOverlay";
import { DialogoIniciarCombate } from "./components/DialogoIniciarCombate";
import { Loader2 } from "lucide-react";

// Types matching PanelDM expectations
interface BattleMap {
	id: string;
	name: string;
	image_data: string;
	grid_size: number;
	grid_color: string;
}

interface Props {
	campaignId: string;
	campaignTitle: string;
	session: GameSession | null;
	isDM: boolean;
	userId: string;
	members: SessionMember[];
	tokens: SessionToken[];
	combatState: CombatState | null;
	mapImageData: string | null;
	mapView: MapViewState;
	selectedSceneId: string | null;
	chapters: ChapterWithScenes[];
	availableMaps: BattleMap[];
	loading: boolean;
	showDados: boolean;
	fichaTarget: SessionMember | null;
	showCombatDialog: boolean;
	// Callbacks
	onMapViewChange: (view: MapViewState) => void;
	onTokenMove: (tokenId: string, x: number, y: number) => void;
	onTokenRemove?: (tokenId: string) => void;
	onTokenHpChange?: (tokenId: string, delta: number) => void;
	onDeployMap: (map: BattleMap) => void;
	onDeployEntity: (entity: SceneEntityBasic) => void;
	onSelectScene: (sceneId: string) => void;
	onGoToScene: (scene: SceneWithEntities) => void;
	onStartCombat: () => void;
	onConfirmCombat: (participantIds: string[], surprise: "none" | "heroes" | "enemies") => void;
	onEndCombat: () => void;
	onReorderInitiative: (newOrder: string[]) => void;
	onEndTurn: () => void;
	onRemoveFromCombat: (tokenId: string) => void;
	onEndSession: () => void;
	onOpenDados: () => void;
	onCloseDados: () => void;
	onOpenFicha: (member: SessionMember) => void;
	onCloseFicha: () => void;
	onSaveFicha: (memberId: string, characterId: string, updates: Record<string, unknown>) => Promise<void>;
	onCancelCombatDialog: () => void;
}

export function PartidaComponent({
	campaignId,
	campaignTitle,
	session,
	isDM,
	userId,
	members,
	tokens,
	combatState,
	mapImageData,
	mapView,
	selectedSceneId,
	chapters,
	availableMaps,
	loading,
	showDados,
	fichaTarget,
	showCombatDialog,
	onMapViewChange,
	onTokenMove,
	onTokenRemove,
	onTokenHpChange,
	onDeployMap,
	onDeployEntity,
	onSelectScene,
	onGoToScene,
	onStartCombat,
	onConfirmCombat,
	onEndCombat,
	onReorderInitiative,
	onEndTurn,
	onRemoveFromCombat,
	onEndSession,
	onOpenDados,
	onCloseDados,
	onOpenFicha,
	onCloseFicha,
	onSaveFicha,
	onCancelCombatDialog,
}: Props) {
	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[#080408]">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
					<p className="text-amber-300">Cargando partida...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[#080408]">
				<div className="text-center">
					<p className="text-amber-300 text-lg mb-4">
						La sesión aún no ha comenzado.
					</p>
					<p className="text-gray-400 text-sm">
						Espera a que el DM inicie la partida.
					</p>
				</div>
			</div>
		);
	}

	const currentMapId = session.current_map_id;

	return (
		<div
			className="fixed inset-0 flex flex-col bg-[#080408] text-gray-200 overflow-hidden"
			style={{ fontFamily: "sans-serif" }}
		>
			{/* ── Combat initiative bar (only during combat) ── */}
			{combatState?.is_active && (
				<OrdenCombate
					tokens={tokens}
					combatState={combatState}
					isDM={isDM}
					currentUserId={userId}
					onReorder={onReorderInitiative}
					onRemove={onRemoveFromCombat}
					onEndTurn={onEndTurn}
				/>
			)}

			{/* ── Main area: player panel + map + DM panel ── */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left: player avatars */}
				<PanelJugadores
					members={members}
					tokens={tokens}
					isDM={isDM}
					currentUserId={userId}
					onOpenFicha={onOpenFicha}
				/>

				{/* Center: battle map */}
				<MapaPartida
					mapImageData={mapImageData}
					mapView={mapView}
					tokens={tokens}
					combatState={combatState}
					isDM={isDM}
					currentUserId={userId}
					onViewChange={onMapViewChange}
					onTokenMove={onTokenMove}
					onTokenRemove={isDM ? onTokenRemove : undefined}
				onTokenHpChange={isDM ? onTokenHpChange : undefined}
				/>

				{/* Right: DM panel (DM only) */}
				{isDM && (
					<PanelDM
						chapters={chapters}
						selectedSceneId={selectedSceneId}
						currentMapId={currentMapId}
						availableMaps={availableMaps}
						tokens={tokens}
						combatState={combatState}
						isSessionActive={session.status === "active"}
						onSelectScene={onSelectScene}
						onGoToScene={onGoToScene}
						onDeployMap={onDeployMap}
						onDeployEntity={onDeployEntity}
						onStartCombat={onStartCombat}
						onEndCombat={onEndCombat}
						onEndSession={onEndSession}
					/>
				)}
			</div>

			{/* ── Bottom toolbar ── */}
			<BarraInferior
				onOpenDados={onOpenDados}
				campaignTitle={campaignTitle}
			/>

			{/* ── Overlays ── */}
			{showDados && <DadosOverlay onClose={onCloseDados} />}

			{fichaTarget && (
				<FichaOverlay
					member={fichaTarget}
					canEdit={isDM || fichaTarget.user_id === userId}
					onClose={onCloseFicha}
					onSave={onSaveFicha}
				/>
			)}

			{showCombatDialog && (
				<DialogoIniciarCombate
					open={showCombatDialog}
					tokens={tokens}
					onConfirm={onConfirmCombat}
					onCancel={onCancelCombatDialog}
				/>
			)}
		</div>
	);
}
