import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2, Map, Eye } from "lucide-react";
import { ProfileTabs } from "@/components/profile-tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listBattleMaps,
  deleteBattleMap,
  type BattleMapListItem,
} from "@/core/api/battle-map.service";
import { switchRoutes } from "@/router/routes";
import { useTranslation } from "@/i18n";

export const MisMapasScene = () => {
  return <MisMapasContent />;
};

const MisMapasContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tm = t.maps;
  const [maps, setMaps] = useState<BattleMapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Cargar lista de mapas al montar
  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listBattleMaps();
      setMaps(response.maps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los mapas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el mapa "${name}"?`)) return;

    try {
      setDeleting(id);
      setError("");
      await deleteBattleMap(id);
      setMaps((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar el mapa");
    } finally {
      setDeleting(null);
    }
  };

  const handleViewMap = (id: string) => {
    navigate(`${switchRoutes.mapaBatalla}?id=${id}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <ProfileTabs />
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Map className="h-8 w-8 text-amber-200" />
              <h1 className="text-3xl font-bold text-amber-50">{tm.title}</h1>
            </div>
            <p className="text-sm text-amber-100/90">
              {tm.subtitle}
            </p>
          </div>
          <Button
            onClick={() => navigate(switchRoutes.mapaBatalla)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {tm.newMap}
          </Button>
        </div>
      </section>

      {/* Results count */}
      {!loading && maps.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {maps.length} {maps.length === 1 ? tm.map : tm.maps}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-600/20 bg-red-600/10">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      )}

      {/* Maps List */}
      {!loading && maps.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {tm.noMaps}
            </p>
            <Button
              onClick={() => navigate(switchRoutes.mapaBatalla)}
              variant="outline"
            >
              {tm.createFirst}
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && maps.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Card key={map.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{map.name}</CardTitle>
                    <CardDescription>
                      {tm.grid}: {map.grid_size}px
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>{tm.created}: {formatDate(map.created_at)}</p>
                  {map.updated_at !== map.created_at && (
                    <p>{tm.modified}: {formatDate(map.updated_at)}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewMap(map.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {tm.open}
                  </Button>
                  <Button
                    onClick={() => handleDelete(map.id, map.name)}
                    variant="destructive"
                    size="sm"
                    disabled={deleting === map.id}
                  >
                    {deleting === map.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
