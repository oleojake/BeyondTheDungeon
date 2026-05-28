// ================================================
// MapaPartida – Battle map canvas + draggable tokens
// ================================================
// Uses HTML5 Canvas for the map image + grid.
// Tokens rendered as absolute-positioned divs over the canvas.
// Token drag: DM can drag all; player can drag their own on their turn.
// DM click on token: shows +HP / -HP / remove controls above the token.
// ================================================

import {
	useRef,
	useEffect,
	useState,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from "react";
import type { LucideProps } from "lucide-react";
import {
	X,
	User,
	Plus,
	Minus,
	Package,
	Sword,
	Shield,
	FlaskConical,
	Gem,
	ScrollText,
	Key,
	Wand2,
} from "lucide-react";

const ITEM_ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
	package: Package,
	sword: Sword,
	shield: Shield,
	flask: FlaskConical,
	gem: Gem,
	scroll: ScrollText,
	key: Key,
	wand: Wand2,
};
import type { SessionToken, CombatState, MapViewState, SessionMember } from "../partida.vm";

export interface MapaPartidaRef {
	getView: () => MapViewState;
}

interface Props {
	mapImageData: string | null;
	mapView: MapViewState;
	tokens: SessionToken[];
	combatState: CombatState | null;
	isDM: boolean;
	currentUserId: string;
	onViewChange: (view: MapViewState) => void;
	onTokenMove: (tokenId: string, x: number, y: number) => void;
	onTokenRemove?: (tokenId: string) => void;
	onTokenHpChange?: (tokenId: string, delta: number) => void;
	onTokenSelect?: (token: SessionToken | null) => void;
	members?: SessionMember[];
}

const GRID_ALPHA_PATTERN = /rgba?\([^,]+,[^,]+,[^,]+,?\s*([\d.]+)?\)/;

function hexToRgba(hex: string, alpha: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaToHex(rgba: string): string {
	const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!m) return "#ffffff";
	return `#${[m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, "0")).join("")}`;
}

function getAlpha(rgba: string): number {
	const m = rgba.match(GRID_ALPHA_PATTERN);
	return m && m[1] ? parseFloat(m[1]) : 1;
}

export const MapaPartida = forwardRef<MapaPartidaRef, Props>(
	(
		{
			mapImageData,
			mapView,
			tokens,
			combatState,
			isDM,
			currentUserId,
			onViewChange,
			onTokenMove,
			onTokenRemove,
			onTokenHpChange,
			onTokenSelect,
			members,
		},
		ref,
	) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const containerRef = useRef<HTMLDivElement>(null);
		const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

		// Which token the DM has selected (shows HP controls)
		const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

		// Map pan state
		const panRef = useRef({ isDragging: false, startX: 0, startY: 0 });

		// Token drag state
		const tokenDragRef = useRef<{
			id: string;
			offsetX: number;
			offsetY: number;
		} | null>(null);

		// Track mousedown position so we can distinguish click from drag
		const dragStartPos = useRef<{ x: number; y: number } | null>(null);

		useImperativeHandle(ref, () => ({
			getView: () => mapView,
		}));

		// Load image
		useEffect(() => {
			if (!mapImageData) return;
			const img = new Image();
			img.onload = () => setImageObj(img);
			img.src = mapImageData;
		}, [mapImageData]);

		// Render canvas
		const renderCanvas = useCallback(() => {
			const canvas = canvasRef.current;
			const container = containerRef.current;
			if (!canvas || !container) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = container.clientWidth;
			canvas.height = container.clientHeight;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const { panX, panY, zoom, gridSize, gridColor, showGrid } = mapView;

			if (imageObj) {
				ctx.save();
				ctx.translate(panX, panY);
				ctx.scale(zoom, zoom);
				ctx.drawImage(imageObj, 0, 0);
				ctx.restore();

				if (showGrid && gridSize > 0) {
					const scaledGrid = gridSize * zoom;
					const offsetX = panX % scaledGrid;
					const offsetY = panY % scaledGrid;

					ctx.strokeStyle = gridColor;
					ctx.lineWidth = 1;
					ctx.beginPath();

					for (let x = offsetX; x < canvas.width; x += scaledGrid) {
						ctx.moveTo(x, 0);
						ctx.lineTo(x, canvas.height);
					}
					for (let y = offsetY; y < canvas.height; y += scaledGrid) {
						ctx.moveTo(0, y);
						ctx.lineTo(canvas.width, y);
					}
					ctx.stroke();
				}
			} else {
				// Empty map placeholder
				ctx.fillStyle = "#1a1a2e";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = "rgba(255,255,255,0.1)";
				ctx.font = "16px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(
					"No hay mapa cargado",
					canvas.width / 2,
					canvas.height / 2,
				);
			}
		}, [imageObj, mapView]);

		useEffect(() => {
			renderCanvas();
		}, [renderCanvas]);

		// ── Map pan (wheel zoom + mouse drag) ─────────────────────────────────
		const handleWheel = (e: React.WheelEvent) => {
			if (!isDM) return; // only DM zooms/pans
			e.preventDefault();
			const delta = e.deltaY > 0 ? 0.9 : 1.1;
			const newZoom = Math.max(0.25, Math.min(3, mapView.zoom * delta));
			onViewChange({ ...mapView, zoom: newZoom });
		};

		const handleMapMouseDown = (e: React.MouseEvent) => {
			// Only pan if not clicking a token
			if (e.button !== 0 || tokenDragRef.current) return;
			if (!isDM) return;
			panRef.current = {
				isDragging: true,
				startX: e.clientX - mapView.panX,
				startY: e.clientY - mapView.panY,
			};
		};

		const handleMapMouseMove = (e: React.MouseEvent) => {
			if (tokenDragRef.current) {
				// Token dragging is handled by the token div's onMouseMove
				return;
			}
			if (panRef.current.isDragging) {
				onViewChange({
					...mapView,
					panX: e.clientX - panRef.current.startX,
					panY: e.clientY - panRef.current.startY,
				});
			}
		};

		const handleMapMouseUp = () => {
			panRef.current.isDragging = false;
		};

		// ── Token drag ────────────────────────────────────────────────────────
		const canDragToken = (token: SessionToken): boolean => {
			if (isDM) return true;
			// Player can only drag their own token on their turn
			if (token.token_type !== "player") return false;
			if (token.user_id !== currentUserId) return false;
			if (!combatState || !combatState.is_active) return false;
			const currentTokenId =
				combatState.initiative_order[combatState.current_turn_index];
			return currentTokenId === token.id;
		};

		const handleTokenMouseDown = (e: React.MouseEvent, token: SessionToken) => {
			// Always record mousedown position for click vs drag detection
			dragStartPos.current = { x: e.clientX, y: e.clientY };
			if (!canDragToken(token)) return;
			e.stopPropagation();
			const rect = containerRef.current!.getBoundingClientRect();
			tokenDragRef.current = {
				id: token.id,
				offsetX: e.clientX - rect.left - token.x,
				offsetY: e.clientY - rect.top - token.y,
			};
		};

		const handleTokenClick = (e: React.MouseEvent, tokenId: string) => {
			if (!isDM) return;
			// If mouse moved more than 5px it was a drag, not a click
			if (dragStartPos.current) {
				const dx = e.clientX - dragStartPos.current.x;
				const dy = e.clientY - dragStartPos.current.y;
				if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
					dragStartPos.current = null;
					return;
				}
			}
			dragStartPos.current = null;
			e.stopPropagation();
			const next = selectedTokenId === tokenId ? null : tokenId;
			setSelectedTokenId(next);
			if (onTokenSelect)
				onTokenSelect(
					next ? (tokens.find((t) => t.id === next) ?? null) : null,
				);
		};

		const handleGlobalMouseMove = useCallback(
			(e: MouseEvent) => {
				if (!tokenDragRef.current) return;
				const rect = containerRef.current?.getBoundingClientRect();
				if (!rect) return;
				const x = e.clientX - rect.left - tokenDragRef.current.offsetX;
				const y = e.clientY - rect.top - tokenDragRef.current.offsetY;
				onTokenMove(tokenDragRef.current.id, x, y);
			},
			[onTokenMove],
		);

		const handleGlobalMouseUp = useCallback(() => {
			tokenDragRef.current = null;
		}, []);

		useEffect(() => {
			window.addEventListener("mousemove", handleGlobalMouseMove);
			window.addEventListener("mouseup", handleGlobalMouseUp);
			return () => {
				window.removeEventListener("mousemove", handleGlobalMouseMove);
				window.removeEventListener("mouseup", handleGlobalMouseUp);
			};
		}, [handleGlobalMouseMove, handleGlobalMouseUp]);

		// ── DM grid controls ──────────────────────────────────────────────────
		const onGridSizeChange = (v: number) =>
			onViewChange({ ...mapView, gridSize: v });
		const onGridColorChange = (hex: string) =>
			onViewChange({
				...mapView,
				gridColor: hexToRgba(hex, getAlpha(mapView.gridColor)),
			});
		const onGridAlphaChange = (v: number) =>
			onViewChange({
				...mapView,
				gridColor: hexToRgba(rgbaToHex(mapView.gridColor), v / 100),
			});
		const onToggleGrid = () =>
			onViewChange({ ...mapView, showGrid: !mapView.showGrid });

		const activeCombatTokenId = combatState?.is_active
			? combatState.initiative_order[combatState.current_turn_index]
			: null;

		const onMapTokens = tokens.filter((t) => t.is_on_map);

		// Height overhead: 22px for DM controls row (above avatar) + 44px for name+HP below
		const CONTROLS_H = 22;
		const BELOW_H = 44;

		return (
			<div
				className="relative flex-1 overflow-hidden"
				ref={containerRef}
				onClick={() => {
					setSelectedTokenId(null);
					onTokenSelect?.(null);
				}}
			>
				{/* Canvas */}
				<canvas
					ref={canvasRef}
					className="absolute inset-0 w-full h-full"
					style={{ cursor: isDM ? "grab" : "default" }}
					onWheel={handleWheel}
					onMouseDown={handleMapMouseDown}
					onMouseMove={handleMapMouseMove}
					onMouseUp={handleMapMouseUp}
				/>

				{/* Token overlays */}
				{onMapTokens.map((token) => {
					const isActive = token.id === activeCombatTokenId;
					const draggable = canDragToken(token);
					const isSelected = isDM && selectedTokenId === token.id;
					// Token size: base = one grid cell, scaled by S/M/L/XL
					const sizeMultiplier =
						token.token_size === "S"
							? 0.6
							: token.token_size === "L"
								? 1.5
								: token.token_size === "XL"
									? 2.0
									: 1.0;
					const tokenSize = Math.max(
						24,
						mapView.gridSize * mapView.zoom * sizeMultiplier,
					);
					// Border colour: custom > type default
					const borderColor =
						token.token_color ??
						(token.token_type === "player"
							? "#3b82f6"
							: token.token_type === "enemy"
								? "#ef4444"
								: "#a855f7");

					return (
						<div
							key={token.id}
							style={{
								position: "absolute",
								// Shift the whole div up by CONTROLS_H so the avatar stays at token.y
								left: token.x,
								top: token.y - CONTROLS_H,
								width: tokenSize,
								height: CONTROLS_H + tokenSize + BELOW_H,
								cursor: draggable ? "grab" : "default",
							}}
							onMouseDown={(e) => handleTokenMouseDown(e, token)}
							onClick={(e) => handleTokenClick(e, token.id)}
						>
							{/* ── DM controls (above avatar, only when selected) ── */}
							<div
								className="flex justify-center items-center gap-1"
								style={{ height: CONTROLS_H }}
								onMouseDown={(e) => e.stopPropagation()}
							>
								{isSelected && (
									<>
										<button
											onClick={(e) => {
												e.stopPropagation();
												onTokenHpChange?.(token.id, -1);
											}}
											className="w-5 h-5 rounded-full bg-red-700 hover:bg-red-500 flex items-center justify-center shadow-md"
											title="Quitar 1 HP"
										>
											<Minus className="w-3 h-3 text-white" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												onTokenHpChange?.(token.id, +1);
											}}
											className="w-5 h-5 rounded-full bg-green-700 hover:bg-green-500 flex items-center justify-center shadow-md"
											title="Añadir 1 HP"
										>
											<Plus className="w-3 h-3 text-white" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												onTokenRemove?.(token.id);
											}}
											className="w-5 h-5 rounded-full bg-gray-600 hover:bg-gray-400 flex items-center justify-center shadow-md"
											title="Quitar del mapa"
										>
											<X className="w-3 h-3 text-white" />
										</button>
									</>
								)}
							</div>

							{/* ── Avatar circle / Spell shape ── */}
							{token.entity_image?.startsWith("shape:") ? (
								(() => {
									const shapeKey = token.entity_image.slice(6);
									const shapeColor = token.token_color ?? "#a855f7";
									const fillColor = hexToRgba(shapeColor, 0.3);
									const glowColor = hexToRgba(shapeColor, 0.5);
									const activeBorder = isActive
										? "2px solid #facc15"
										: `2px solid ${shapeColor}`;
									const baseStyle: React.CSSProperties = {
										boxShadow: `0 0 10px ${glowColor}`,
										...(isSelected
											? { outline: "2px solid white", outlineOffset: "2px" }
											: {}),
									};
									if (shapeKey === "circle")
										return (
											<div
												style={{
													width: tokenSize,
													height: tokenSize,
													borderRadius: "50%",
													backgroundColor: fillColor,
													border: activeBorder,
													...baseStyle,
												}}
											/>
										);
									if (shapeKey === "rect")
										return (
											<div
												style={{
													width: tokenSize,
													height: tokenSize,
													borderRadius: 4,
													backgroundColor: fillColor,
													border: activeBorder,
													...baseStyle,
												}}
											/>
										);
									if (shapeKey === "cone")
										return (
											<div
												style={{
													width: tokenSize,
													height: tokenSize,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													...(isSelected
														? {
																outline: "2px solid white",
																outlineOffset: "2px",
															}
														: {}),
												}}
											>
												<div
													style={{
														width: 0,
														height: 0,
														borderLeft: `${tokenSize / 2}px solid transparent`,
														borderRight: `${tokenSize / 2}px solid transparent`,
														borderBottom: `${tokenSize}px solid ${fillColor}`,
														filter: `drop-shadow(0 0 6px ${glowColor})`,
													}}
												/>
											</div>
										);
									if (shapeKey === "line")
										return (
											<div
												style={{
													width: tokenSize,
													height: tokenSize,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													...(isSelected
														? {
																outline: "2px solid white",
																outlineOffset: "2px",
															}
														: {}),
												}}
											>
												<div
													style={{
														width: Math.max(6, tokenSize * 0.25),
														height: tokenSize,
														borderRadius: 3,
														backgroundColor: fillColor,
														border: activeBorder,
														boxShadow: `0 0 10px ${glowColor}`,
													}}
												/>
											</div>
										);
									return null;
								})()
							) : (
								<div
									className={`rounded-full overflow-hidden flex items-center justify-center bg-gray-800 border-2 ${
										isActive
											? "border-yellow-400 shadow-lg shadow-yellow-400/50"
											: isSelected
												? "border-2 border-white shadow-lg shadow-white/30"
												: "border-2"
									}`}
									style={{
										width: tokenSize,
										height: tokenSize,
										...(isActive ? {} : { borderColor }),
										...(isSelected
											? { outline: "2px solid white", outlineOffset: "2px" }
											: {}),
									}}
								>
									{(() => {
										let displayImage = token.entity_image;
										let displayLabel = token.entity_name;
										
										// Si es jugador, intentar usar los datos de su personaje
										if (token.token_type === "player" && members) {
											const member = members.find(m => m.user_id === token.user_id);
											if (member) {
												displayImage = member.character?.avatar_url || member.profile?.avatar_url || token.entity_image;
												displayLabel = member.character?.name || member.profile?.display_name || token.entity_name;
											}
										}

										if (displayImage) {
											if (displayImage.startsWith("icon:")) {
												const iconKey = displayImage.split(":")[1];
												const Ico = ITEM_ICON_MAP[iconKey] ?? Package;
												return (
													<Ico
														className="text-white drop-shadow-md"
														style={{
															width: tokenSize * 0.6,
															height: tokenSize * 0.6,
														}}
													/>
												);
											}
											return (
												<img
													src={displayImage}
													alt={displayLabel}
													className="w-full h-full object-cover"
												/>
											);
										}
										return (
											<User
												className="text-gray-300"
												style={{
													width: tokenSize * 0.5,
													height: tokenSize * 0.5,
												}}
											/>
										);
									})()}
								</div>
							)}

							{/* ── Name label ── */}
							<div
								className="text-center text-xs text-white font-semibold leading-tight truncate mt-0.5 drop-shadow-sm"
								style={{ maxWidth: tokenSize }}
							>
								{(() => {
									let displayLabel = token.entity_name;
									if (token.token_type === "player" && members) {
										const member = members.find(m => m.user_id === token.user_id);
										if (member) {
											displayLabel = member.character?.name || member.profile?.display_name || token.entity_name;
										}
									}
									return displayLabel;
								})()}
							</div>

							{/* ── HP bar ── */}
							<div className="mt-0.5 px-0.5">
								<div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all"
										style={{
											width: `${token.max_hp > 0 ? Math.round((token.current_hp / token.max_hp) * 100) : 0}%`,
											backgroundColor:
												token.current_hp / token.max_hp > 0.5
													? "#22c55e"
													: token.current_hp / token.max_hp > 0.2
														? "#f59e0b"
														: "#ef4444",
										}}
									/>
								</div>
								<div className="text-center text-xs text-white font-bold leading-tight mt-0.5 drop-shadow-sm">
									{token.current_hp}/{token.max_hp}
								</div>
							</div>
						</div>
					);
				})}

				{/* DM Controls overlay (bottom-left of map) */}
				{isDM && (
					<div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-3 w-64 text-xs">
						<div className="flex items-center justify-between text-gray-300">
							<span>Cuadrícula</span>
							<button
								onClick={onToggleGrid}
								className={`px-2 py-0.5 rounded text-xs ${
									mapView.showGrid
										? "bg-amber-700 text-white"
										: "bg-gray-700 text-gray-400"
								}`}
							>
								{mapView.showGrid ? "ON" : "OFF"}
							</button>
						</div>

						<div className="flex items-center gap-2 text-gray-300">
							<span className="w-16 shrink-0">Tamaño</span>
							<input
								type="range"
								min={20}
								max={200}
								value={mapView.gridSize}
								onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
								className="flex-1 min-w-0 cursor-pointer"
							/>
							<span className="w-8 text-right">{mapView.gridSize}</span>
						</div>

						<div className="flex items-center gap-2 text-gray-300">
							<span className="w-16 shrink-0">Color</span>
							<input
								type="color"
								value={rgbaToHex(mapView.gridColor)}
								onChange={(e) => onGridColorChange(e.target.value)}
								className="w-8 h-6 rounded cursor-pointer"
							/>
						</div>

						<div className="flex items-center gap-2 text-gray-300">
							<span className="w-16 shrink-0">Opacidad</span>
							<input
								type="range"
								min={0}
								max={100}
								value={Math.round(getAlpha(mapView.gridColor) * 100)}
								onChange={(e) => onGridAlphaChange(parseInt(e.target.value))}
								className="flex-1 min-w-0 cursor-pointer"
							/>
						</div>

						<div className="flex items-center gap-1 text-gray-300">
							<span className="w-16 shrink-0">Zoom</span>
							<button
								onClick={() =>
									onViewChange({
										...mapView,
										zoom: Math.max(0.25, mapView.zoom - 0.1),
									})
								}
								className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center"
							>
								-
							</button>
							<span className="flex-1 text-center">
								{Math.round(mapView.zoom * 100)}%
							</span>
							<button
								onClick={() =>
									onViewChange({
										...mapView,
										zoom: Math.min(3, mapView.zoom + 0.1),
									})
								}
								className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center"
							>
								+
							</button>
							<button
								onClick={() =>
									onViewChange({ ...mapView, zoom: 1, panX: 0, panY: 0 })
								}
								className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center"
								title="Reset"
							>
								↺
							</button>
						</div>
					</div>
				)}
			</div>
		);
	},
);

MapaPartida.displayName = "MapaPartida";
