import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  X,
  Upload,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Move,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  createBattleMap,
  getBattleMap,
} from "@/core/api/battle-map.service";

interface MapState {
  image: string | null;
  imageName: string;
  gridSize: number;
  gridColor: string;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
}

// Funciones helper para conversión de colores
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const rgbaToHex = (rgba: string): string => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#ffffff";
  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
};

const getAlphaFromRgba = (rgba: string): number => {
  const match = rgba.match(/rgba?\([^,]+,[^,]+,[^,]+,?\s*([\d.]+)?\)/);
  return match && match[1] ? parseFloat(match[1]) : 1;
};

export const MapaBatallaScene = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [mapState, setMapState] = useState<MapState>({
    image: null,
    imageName: "",
    gridSize: 50,
    gridColor: "rgba(255, 255, 255, 0.3)",
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: true,
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  // Cargar mapa si viene un ID en la URL
  useEffect(() => {
    const loadMapId = searchParams.get("id");
    if (loadMapId && isAuthenticated) {
      loadExistingMap(loadMapId);
    }
  }, [searchParams, isAuthenticated]);

  const loadExistingMap = async (id: string) => {
    setIsLoadingImage(true);
    try {
      const { map } = await getBattleMap(id);
      setMapState({
        image: map.image_data,
        imageName: map.name,
        gridSize: map.grid_size,
        gridColor: map.grid_color || "rgba(255, 255, 255, 0.3)",
        zoom: 1,
        panX: 0,
        panY: 0,
        showGrid: true,
      });
    } catch (error) {
      console.error("Error al cargar mapa:", error);
      alert("No se pudo cargar el mapa");
    }
  };

  // Cargar y renderizar imagen
  useEffect(() => {
    if (mapState.image) {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setIsLoadingImage(false);
      };
      img.src = mapState.image;
    }
  }, [mapState.image]);

  // Renderizar canvas cuando cambia el estado
  useEffect(() => {
    if (imageObj && canvasRef.current) {
      renderCanvas();
    }
  }, [imageObj, mapState.gridSize, mapState.gridColor, mapState.zoom, mapState.panX, mapState.panY, mapState.showGrid]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageObj) return;

    const container = containerRef.current;
    if (!container) return;

    // Ajustar tamaño del canvas al contenedor
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Limpiar canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calcular dimensiones de imagen con zoom
    const scaledWidth = imageObj.width * mapState.zoom;
    const scaledHeight = imageObj.height * mapState.zoom;

    // Centrar imagen si es más pequeña que el canvas
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Aplicar pan
    const finalX = offsetX + mapState.panX;
    const finalY = offsetY + mapState.panY;

    // Dibujar imagen
    ctx.drawImage(imageObj, finalX, finalY, scaledWidth, scaledHeight);

    // Dibujar cuadrícula si está activada
    if (mapState.showGrid) {
      drawGrid(ctx, finalX, finalY, scaledWidth, scaledHeight);
    }
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const gridSize = mapState.gridSize * mapState.zoom;
    
    ctx.strokeStyle = mapState.gridColor;
    ctx.lineWidth = 1;

    // Líneas verticales
    for (let i = 0; i <= width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + height);
      ctx.stroke();
    }

    // Líneas horizontales
    for (let i = 0; i <= height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, y + i);
      ctx.lineTo(x + width, y + i);
      ctx.stroke();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar que es una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setIsLoadingImage(true);
      setMapState((prev) => ({
        ...prev,
        image: event.target?.result as string,
        imageName: file.name,
        zoom: 1,
        panX: 0,
        panY: 0,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleZoomIn = () => {
    setMapState((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 5) }));
  };

  const handleZoomOut = () => {
    setMapState((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.1) }));
  };

  const handleResetView = () => {
    setMapState((prev) => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapState.panX, y: e.clientY - mapState.panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    setMapState((prev) => ({
      ...prev,
      panX: e.clientX - dragStart.x,
      panY: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom + delta)),
    }));
  };

  const handleSaveMap = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para guardar mapas");
      return;
    }

    if (!mapState.image) {
      alert("No hay ningún mapa cargado");
      return;
    }

    const mapName = prompt("Nombre del mapa:", mapState.imageName || "Mi Mapa");
    if (!mapName) return;

    setIsSaving(true);
    try {
      await createBattleMap({
        name: mapName,
        image_data: mapState.image,
        grid_size: mapState.gridSize,
        grid_color: mapState.gridColor,
      });
      alert("Mapa guardado correctamente");
      setMapState((prev) => ({ ...prev, imageName: mapName }));
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(error instanceof Error ? error.message : "Error al guardar el mapa");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex">
      {/* Loading image overlay */}
      {isLoadingImage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Cargando imagen...</p>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Guardando mapa...</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-80 bg-card border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Mapa de Batalla</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              title="Salir"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cargar imagen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cargar Mapa
              </CardTitle>
              <CardDescription>
                {mapState.imageName || "Selecciona una imagen"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar Imagen
              </Button>
            </CardContent>
          </Card>

          {/* Controles de cuadrícula */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Cuadrícula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showGrid"
                  checked={mapState.showGrid}
                  onChange={(e) =>
                    setMapState((prev) => ({ ...prev, showGrid: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="showGrid">Mostrar cuadrícula</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gridSize">Tamaño: {mapState.gridSize}px</Label>
                </div>
                <Slider
                  id="gridSize"
                  min={20}
                  max={200}
                  step={10}
                  value={[mapState.gridSize]}
                  onValueChange={(value: number[]) =>
                    setMapState((prev) => ({ ...prev, gridSize: value[0] }))
                  }
                  disabled={!mapState.showGrid}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gridColor">Color de cuadrícula</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="gridColor"
                    value={rgbaToHex(mapState.gridColor)}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const rgba = hexToRgba(hex, getAlphaFromRgba(mapState.gridColor));
                      setMapState((prev) => ({ ...prev, gridColor: rgba }));
                    }}
                    className="h-14 w-14 rounded cursor-pointer border-2 border-border flex-shrink-0"
                    style={{ minWidth: '3.5rem', minHeight: '3.5rem' }}
                    disabled={!mapState.showGrid}
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={getAlphaFromRgba(mapState.gridColor)}
                      onChange={(e) => {
                        const alpha = parseFloat(e.target.value);
                        const hex = rgbaToHex(mapState.gridColor);
                        const rgba = hexToRgba(hex, alpha);
                        setMapState((prev) => ({ ...prev, gridColor: rgba }));
                      }}
                      className="w-full"
                      disabled={!mapState.showGrid}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Opacidad</span>
                      <span>{Math.round(getAlphaFromRgba(mapState.gridColor) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controles de zoom */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ZoomIn className="h-5 w-5" />
                Vista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Zoom: {Math.round(mapState.zoom * 100)}%</Label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleZoomOut}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!mapState.image}
                >
                  <ZoomOut className="mr-2 h-4 w-4" />
                  Alejar
                </Button>
                <Button
                  onClick={handleZoomIn}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!mapState.image}
                >
                  <ZoomIn className="mr-2 h-4 w-4" />
                  Acercar
                </Button>
              </div>

              <Button
                onClick={handleResetView}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!mapState.image}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restablecer Vista
              </Button>

              <div className="text-sm text-muted-foreground">
                <Move className="inline h-4 w-4 mr-1" />
                Arrastra para desplazar
              </div>
            </CardContent>
          </Card>

          {/* Guardar mapa */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSaveMap}
                  className="w-full"
                  disabled={!mapState.image || isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Guardando..." : "Guardar Mapa"}
                </Button>
              </CardContent>
            </Card>
          )}

          {!isAuthenticated && (
            <Card className="border-amber-600/20 bg-amber-600/10">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Inicia sesión para guardar tus mapas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </aside>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative bg-background">
        {!mapState.image ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                Carga una imagen para comenzar
              </p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="absolute inset-0 cursor-move"
          />
        )}
      </div>
    </div>
  );
};
