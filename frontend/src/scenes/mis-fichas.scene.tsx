import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2, UserCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listCharacterSheets,
  deleteCharacterSheet,
  type CharacterSheetListItem,
} from "@/core/api/character-sheet.service";
import type { CharacterClass } from "@/interfaces/character";
import { switchRoutes } from "@/router/routes";
import { useAuth } from "@/core/auth/useAuth";
import { ProfileTabs } from "@/components/profile-tabs";
import { useTranslation } from "@/i18n";

export const MisFichasScene = () => {
  return <MisFichasContent />;
};

const MisFichasContent = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const tf = t.fichas;
  const [characters, setCharacters] = useState<CharacterSheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Cargar lista de fichas al montar (solo si logueado)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadCharacters();
  }, [user, authLoading]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listCharacterSheets();
      setCharacters(response.characters);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar las fichas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la ficha de "${name}"?`)) return;

    try {
      setDeleting(id);
      setError("");
      await deleteCharacterSheet(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la ficha");
    } finally {
      setDeleting(null);
    }
  };

  const getClassDisplay = (classes: CharacterClass | CharacterClass[]): string => {
    if (!classes) return tf.noClass;
    if (Array.isArray(classes)) {
      return classes.filter((c) => c.name).map((c) => `${c.name} ${c.level}`).join(" / ");
    }
    if (typeof classes === "object" && classes.name) {
      return `${classes.name} ${classes.level || 1}`;
    }
    return tf.noClass;
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
      {user && <ProfileTabs />}
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserCircle className="h-8 w-8 text-amber-200" />
              <h1 className="text-3xl font-bold text-amber-50">
                {tf.title}
              </h1>
            </div>
            <p className="text-sm text-amber-100/90">
              {tf.subtitle}
            </p>
          </div>
          <Button
            onClick={() => navigate(switchRoutes.fichaNueva)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {tf.createNew}
          </Button>
        </div>
      </section>

      {/* Banner invitados */}
      {!user && !authLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {tf.guestBanner}{" "}
            <Link to={switchRoutes.login} className="underline hover:text-amber-100">{tf.guestLogin}</Link>{" "}
            {tf.guestOr}{" "}
            <Link to={switchRoutes.register} className="underline hover:text-amber-100">{tf.guestRegister}</Link>.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Results count */}
      {!loading && characters.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {characters.length} {characters.length === 1 ? tf.personaje : tf.personajes}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="ml-2 text-gray-400">{tf.loading}</span>
        </div>
      ) : characters.length === 0 ? (
        <Card className="text-center py-12 bg-dark-card border-dark-border">
          <CardContent className="pt-6">
            <UserCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">{tf.noSheets}</h3>
            <p className="text-gray-400 mb-6">
              {tf.noSheetsHint}
            </p>
            <Button
              onClick={() => navigate(switchRoutes.fichaNueva)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {tf.createFirst}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-pointer group"
              onClick={() => navigate(`${switchRoutes.fichaNueva}?id=${character.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-xl text-white">{character.name || tf.noName}</CardTitle>
                <CardDescription className="text-gray-400">
                  {character.race || tf.noRace} • {getClassDisplay(character.classes)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <div>{tf.level} {character.level || 1}</div>
                    <div className="text-xs mt-1">
                      {formatDate(character.created_at)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(character.id, character.name);
                    }}
                    disabled={deleting === character.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    {deleting === character.id ? (
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
