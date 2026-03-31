import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchSpellById, type Spell } from "@/core/api/backend.service";
import {
  translateCompendiumDescriptionArray,
  translateCompendiumName,
  translateCompendiumText,
  translateEnumValue,
} from "@/i18n/compendium";

export const HechizosDetalleScene = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
          : t("compendium.spells.error")
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
      <div className="container mx-auto p-6 flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="text-sm text-gray-400">{t("compendium.spells.loadingSingle")}</p>
      </div>
    );
  }

  if (error || !spell) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button onClick={() => navigate("/hechizos")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("compendium.spells.backToList")}
        </Button>
        <Alert variant="destructive" className="bg-red-950/50 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error || t("compendium.spells.notFound")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const translatedName = translateCompendiumName(
    t,
    "spells",
    spell.id,
    spell.name,
  );
  const translatedDesc = translateCompendiumDescriptionArray(
    t,
    "spells",
    spell.id,
    spell.desc,
  );
  const translatedHigherLevel = translateCompendiumDescriptionArray(
    t,
    "spells",
    spell.id,
    spell.higher_level,
    "higher_level",
  );
  const translatedMaterial = translateCompendiumText(
    t,
    `compendiumData.spells.${spell.id}.material`,
    spell.material,
  );
  const translatedSchool = spell.school
    ? translateEnumValue(
        t,
        "dnd.magicSchools",
        typeof spell.school === "object" ? spell.school.name : spell.school,
      )
    : "";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button onClick={() => navigate("/hechizos")} variant="outline" className="gap-2 border-amber-600/30 text-amber-200 hover:bg-amber-950/30 hover:text-amber-100">
        <ArrowLeft className="h-4 w-4" />
        {t("compendium.spells.backToList")}
      </Button>

      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-amber-200" />
          <h1 className="text-3xl font-extrabold text-amber-50">{translatedName}</h1>
          <Badge className={`${getLevelColor(spell.level || 0)} text-white text-lg px-3 py-1`}>
            {spell.level === 0
              ? t("compendium.spells.cantrip")
              : t("compendium.spells.levelFull", { level: spell.level })}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {spell.school && (
            <Badge className={`${getSchoolColor(spell.school)} text-white`}>
              {translatedSchool ||
                (typeof spell.school === "object" ? spell.school.name : spell.school)}
            </Badge>
          )}
          {spell.concentration && (
            <Badge variant="outline" className="bg-purple-950/50 border-purple-600/50 text-purple-300">
              {t("compendium.spells.concentration")}
            </Badge>
          )}
          {spell.ritual && (
            <Badge variant="outline" className="bg-cyan-950/50 border-cyan-600/50 text-cyan-300">
              {t("compendium.spells.ritual")}
            </Badge>
          )}
        </div>
      </section>

      {/* Basic Info */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-amber-100">{t("compendium.spells.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spell.casting_time && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">{t("compendium.spells.castingTime")}</span>
              <span className="text-lg font-semibold text-amber-200">{spell.casting_time}</span>
            </div>
          )}
          {spell.range && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">{t("compendium.spells.range")}</span>
              <span className="text-lg font-semibold text-amber-200">{spell.range}</span>
            </div>
          )}
          {spell.components && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">{t("compendium.spells.components")}</span>
              <span className="text-lg font-semibold text-amber-200">
                {Array.isArray(spell.components) 
                  ? spell.components.join(', ') 
                  : typeof spell.components === 'string'
                  ? spell.components
                  : t("common.notAvailable")}
              </span>
              {translatedMaterial && (
                <span className="text-sm text-gray-400 mt-1">{translatedMaterial}</span>
              )}
            </div>
          )}
          {spell.duration && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">{t("compendium.spells.duration")}</span>
              <span className="text-lg font-semibold text-amber-200">{spell.duration}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {translatedDesc.length > 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">{t("compendium.spells.description")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {translatedDesc.map((paragraph, idx) => (
              <p key={idx} className="text-sm text-gray-300 leading-relaxed">{paragraph}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* At Higher Levels */}
      {translatedHigherLevel.length > 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">{t("compendium.spells.higherLevels")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {translatedHigherLevel.map((text, idx) => (
              <p key={idx} className="text-sm text-gray-300">{text}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Damage/Healing */}
      {(spell.damage || spell.heal_at_slot_level) && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">
              {spell.damage ? t("compendium.spells.damage") : t("compendium.spells.healing")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spell.damage && spell.damage.damage_at_slot_level && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  {t("compendium.spells.damageType")}: {translateEnumValue(
                    t,
                    "dnd.damageTypes",
                    spell.damage.damage_type?.name || "",
                  ) || t("common.notAvailable")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(spell.damage.damage_at_slot_level).map(([level, dice]) => (
                    <div key={level} className="flex flex-col p-2 bg-dark-lighter rounded">
                      <span className="text-xs text-gray-400">{t("compendium.spells.levelFull", { level })}</span>
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
                    <span className="text-xs text-gray-400">{t("compendium.spells.levelFull", { level })}</span>
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
            <CardTitle className="text-amber-100">{t("compendium.spells.areaOfEffect")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              {t("compendium.spells.areaOfEffectValue", {
                type: translateEnumValue(
                  t,
                  "dnd.areaEffects",
                  spell.area_of_effect.type,
                ),
                size: spell.area_of_effect.size,
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Classes */}
      {spell.classes && spell.classes.length > 0 && (
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-amber-100">{t("compendium.spells.classes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {spell.classes.map((cls: any, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-amber-950/30 border-amber-600/30 text-amber-300">
                  {translateEnumValue(
                    t,
                    "dnd.classes",
                    cls.name || cls,
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HechizosDetalleScene;
