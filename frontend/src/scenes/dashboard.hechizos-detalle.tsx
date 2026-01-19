import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import { fetchSpellById, type Spell } from "@/core/api/backend.service";

export const DashboardHechizosDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSpell(id);
    }
  }, [id]);

  const loadSpell = async (spellId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSpellById(spellId);
      
      // Normalize data: extract stats from the stats field if they exist
      const stats = data.stats || {};
      const normalized = {
        ...data,
        level: stats.level ?? data.level ?? 0,
        school: stats.school || data.school,
        casting_time: stats.casting_time || data.casting_time,
        range: stats.range || data.range,
        components: stats.components || data.components,
        material: stats.material || data.material,
        duration: stats.duration || data.duration,
        concentration: stats.concentration ?? data.concentration,
        ritual: stats.ritual ?? data.ritual,
        desc: stats.desc || data.desc,
        higher_level: stats.higher_level || data.higher_level,
        damage: stats.damage || data.damage,
        dc: stats.dc || data.dc,
        heal_at_slot_level: stats.heal_at_slot_level || data.heal_at_slot_level,
        area_of_effect: stats.area_of_effect || data.area_of_effect,
        classes: stats.classes || data.classes,
        attack_type: stats.attack_type || data.attack_type,
      };
      
      setSpell(normalized);
    } catch (err) {
      console.error("Error al cargar hechizo:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el hechizo. Verifica que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-gray-600", "bg-blue-600", "bg-green-600", "bg-yellow-600", "bg-orange-600",
      "bg-red-600", "bg-purple-600", "bg-pink-600", "bg-indigo-600", "bg-violet-600",
    ];
    return colors[level] || "bg-gray-600";
  };

  const getSchoolColor = (school: any) => {
    if (!school) return "bg-gray-700";
    const name = typeof school === 'object' ? school.name?.toLowerCase() : school.toLowerCase();
    const schoolColors: Record<string, string> = {
      'abjuration': 'bg-blue-700', 'conjuration': 'bg-purple-700', 'divination': 'bg-cyan-700',
      'enchantment': 'bg-pink-700', 'evocation': 'bg-red-700', 'illusion': 'bg-violet-700',
      'necromancy': 'bg-gray-700', 'transmutation': 'bg-green-700',
    };
    return schoolColors[name] || 'bg-gray-700';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="text-sm text-gray-400">Cargando hechizo...</p>
      </div>
    );
  }

  if (error || !spell) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate("/dashboard/hechizos")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Hechizos
        </Button>
        <Alert variant="destructive" className="bg-red-950/50 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error || "Hechizo no encontrado"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => navigate("/dashboard/hechizos")} variant="outline" className="gap-2 border-amber-600/30 text-amber-200 hover:bg-amber-950/30 hover:text-amber-100">
        <ArrowLeft className="h-4 w-4" />
        Volver a Hechizos
      </Button>

      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-amber-200" />
          <h1 className="text-3xl font-extrabold text-amber-50">{spell.name}</h1>
          <Badge className={`${getLevelColor(spell.level || 0)} text-white text-lg px-3 py-1`}>
            {spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {spell.school && (
            <Badge className={`${getSchoolColor(spell.school)} text-white`}>
              {typeof spell.school === 'object' ? spell.school.name : spell.school}
            </Badge>
          )}
          {spell.concentration && (
            <Badge variant="outline" className="bg-purple-950/50 border-purple-600/50 text-purple-300">
              Concentración
            </Badge>
          )}
          {spell.ritual && (
            <Badge variant="outline" className="bg-cyan-950/50 border-cyan-600/50 text-cyan-300">
              Ritual
            </Badge>
          )}
        </div>
      </section>

      {/* Basic Info */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-amber-100">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spell.casting_time && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">Tiempo de Lanzamiento</span>
              <span className="text-lg font-semibold text-amber-200">{spell.casting_time}</span>
            </div>
          )}
          {spell.range && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">Alcance</span>
              <span className="text-lg font-semibold text-amber-200">{spell.range}</span>
            </div>
          )}
          {spell.components && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">Componentes</span>
              <span className="text-lg font-semibold text-amber-200">
                {Array.isArray(spell.components) 
                  ? spell.components.join(', ') 
                  : typeof spell.components === 'string'
                  ? spell.components
                  : 'N/A'}
              </span>
              {spell.material && <span className="text-sm text-gray-400 mt-1">{spell.material}</span>}
            </div>
          )}
          {spell.duration && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">Duración</span>
              <span className="text-lg font-semibold text-amber-200">{spell.duration}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {spell.desc && spell.desc.length > 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">Descripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spell.desc.map((paragraph, idx) => (
              <p key={idx} className="text-sm text-gray-300 leading-relaxed">{paragraph}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* At Higher Levels */}
      {spell.higher_level && spell.higher_level.length > 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">A Niveles Superiores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {spell.higher_level.map((text, idx) => (
              <p key={idx} className="text-sm text-gray-300">{text}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Damage/Healing */}
      {(spell.damage || spell.heal_at_slot_level) && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">{spell.damage ? 'Daño' : 'Curación'}</CardTitle>
          </CardHeader>
          <CardContent>
            {spell.damage && spell.damage.damage_at_slot_level && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Tipo: {spell.damage.damage_type?.name || 'N/A'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(spell.damage.damage_at_slot_level).map(([level, dice]) => (
                    <div key={level} className="flex flex-col p-2 bg-dark-lighter rounded">
                      <span className="text-xs text-gray-400">Nivel {level}</span>
                      <span className="text-amber-200 font-semibold">{dice as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {spell.heal_at_slot_level && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(spell.heal_at_slot_level).map(([level, heal]) => (
                  <div key={level} className="flex flex-col p-2 bg-dark-lighter rounded">
                    <span className="text-xs text-gray-400">Nivel {level}</span>
                    <span className="text-amber-200 font-semibold">{heal as string}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Area of Effect */}
      {spell.area_of_effect && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">Área de Efecto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              {spell.area_of_effect.type} de {spell.area_of_effect.size} pies
            </p>
          </CardContent>
        </Card>
      )}

      {/* Classes */}
      {spell.classes && spell.classes.length > 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">Disponible para Clases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {spell.classes.map((cls: any, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-amber-950/30 border-amber-600/30 text-amber-300">
                  {cls.name || cls}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHechizosDetalle;
