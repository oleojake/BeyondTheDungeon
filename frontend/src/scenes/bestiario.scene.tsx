import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertCircle, BookOpen, Skull } from "lucide-react";
import { fetchBestiary, type Monster } from "@/core/api/backend.service";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const BestiarioScene = () => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadMonsters();
  }, []);

  const loadMonsters = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchBestiary();
      // Mapear los campos de stats al objeto principal
      const mapped = (data.characters || []).map((monster) => {
        const stats = monster.stats || {};
        return {
          ...monster,
          ...stats,
          // Normalizar challenge_rating y armor_class
          challenge_rating: monster.challenge_rating ?? monster.cr_level ?? stats.challenge_rating,
          armor_class: Array.isArray(stats.armor_class) ? stats.armor_class[0]?.value : stats.armor_class,
          hit_points: stats.hit_points,
          alignment: stats.alignment,
          size: stats.size,
          type: stats.type || monster.type,
        };
      });
      setMonsters(mapped);
    } catch (err) {
      console.error("Error al cargar bestiario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el bestiario. Verifica que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMonsters = monsters.filter((monster) =>
    monster.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex items-center gap-3 mb-2">
          <Skull className="h-8 w-8 text-amber-200" />
          <h1 className="text-3xl font-extrabold text-amber-50">
            Compendio del Bestiario
          </h1>
        </div>
        <p className="mt-2 text-sm text-amber-100/90">
          Consulta las estadísticas de criaturas y monstruos para tus aventuras.
        </p>
      </section>

      {/* Search Bar */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar criatura por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-lighter border-dark-border text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          <p className="text-sm text-gray-400">Cargando bestiario...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive" className="bg-red-950/50 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && monsters.length === 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <BookOpen className="h-16 w-16 text-gray-500" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No hay criaturas disponibles
                </h3>
                <p className="text-sm text-gray-400">
                  El bestiario está vacío. Asegúrate de que la base de datos esté poblada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!loading && !error && monsters.length > 0 && filteredMonsters.length === 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <Search className="h-16 w-16 text-gray-500" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-sm text-gray-400">
                  No hay criaturas que coincidan con "{searchTerm}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monsters Grid */}
      {!loading && !error && filteredMonsters.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {filteredMonsters.length} {filteredMonsters.length === 1 ? "criatura encontrada" : "criaturas encontradas"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMonsters.map((monster) => (
              <Link 
                key={monster.id}
                to={`/bestiario/${monster.id}`}
                className="block transition-transform hover:scale-[1.02]"
              >
                <Card
                  className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-pointer group h-full"
                >
                  <CardHeader>
                    { (monster.image || monster.image_url) && (
                      <div className="w-full flex justify-center mb-2">
                        <img
                          src={
                            (monster.image || monster.image_url || "").startsWith("/api/")
                              ? `${BACKEND_URL}${monster.image || monster.image_url}`
                              : monster.image || monster.image_url
                          }
                          alt={monster.name}
                          className="h-28 object-contain rounded-md shadow-md bg-stone-900"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-amber-100 group-hover:text-amber-300 transition-colors truncate">
                          {monster.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-xs mt-1">
                          {monster.size && monster.type && (
                            <span>{monster.size} {monster.type}</span>
                          )}
                        </CardDescription>
                      </div>
                      {monster.challenge_rating !== undefined && (
                        <Badge
                          variant="outline"
                          className="bg-amber-950/50 border-amber-600/50 text-amber-300 shrink-0"
                        >
                          CR {monster.challenge_rating}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {monster.alignment && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Alineamiento:</span>
                        <span className="text-gray-200">{monster.alignment}</span>
                      </div>
                    )}
                    
                    {monster.armor_class !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Clase de Armadura:</span>
                        <span className="text-gray-200 font-semibold">{monster.armor_class}</span>
                      </div>
                    )}
                    
                    {monster.hit_points !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Puntos de Golpe:</span>
                        <span className="text-gray-200 font-semibold">{monster.hit_points}</span>
                      </div>
                    )}

                    {!monster.alignment && !monster.armor_class && !monster.hit_points && (
                      <p className="text-xs text-gray-500 italic">
                        Sin datos adicionales disponibles
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BestiarioScene;
