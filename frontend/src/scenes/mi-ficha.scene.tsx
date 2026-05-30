import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryManager } from "@/pods/partida/components/inventory/InventoryManager";
import type { CompendiumItem } from "@/pods/partida/components/inventory/types";
import {
  fetchCharacterSheet,
  fetchCharacterSheetById,
  createCharacterSheet,
  updateCharacterSheet,
  uploadCharacterAvatar
} from "@/core/api/character-sheet.service";
import type {
  Character,
  CharacterFormData,
  CharacterStats,
  CharacterClass
} from "@/interfaces/character";
import { defaultCharacterStats } from "@/interfaces/character";
import { DND_RACES, DND_CLASSES, DND_BACKGROUNDS, DND_SKILLS, DND_ABILITIES, DND_PROFICIENCIES } from "@/constants/dnd5e";
import { switchRoutes } from "@/router/routes";
import { Loader2, Save, User, Sword, Heart, Shield, Scroll, Package, Plus, X, Info, UserCircle, Camera } from "lucide-react";
import { useAuth } from "@/core/auth/useAuth";
import { ProfileTabs } from "@/components/profile-tabs";
import { useTranslation } from "@/i18n";

export const MiFichaScene = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const characterId = searchParams.get("id");
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const ts = t.characterSheet;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string>("");
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [classes, setClasses] = useState<CharacterClass[]>([{ name: "", level: 1 }]);
  const [background, setBackground] = useState("");
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<CharacterStats>(defaultCharacterStats);
  
  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Textos largos
  const [inventory, setInventory] = useState("");
  const [spellsKnown, setSpellsKnown] = useState("");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");

  // Compendium items for autocomplete
  const [compendiumItems, setCompendiumItems] = useState<CompendiumItem[]>([]);

  const isMulticlass = classes.length > 1;

  // Determina si una raza es pequeña
  const isSmallRace = (raceStr: string): boolean => {
    const smallRaces = ["Enano", "Gnomo", "Mediano"];
    return smallRaces.some(r => raceStr.includes(r));
  };

  // Calcula la capacidad máxima de peso basada en fuerza y tamaño
  const calculateMaxCarryWeight = (strength: number, raceStr: string): number => {
    const multiplier = isSmallRace(raceStr) ? 15 : 15; // 15 para todos (30 para gigantes, no soportados base)
    return strength * multiplier;
  };

  // Recalcular peso máximo cuando cambian fuerza o raza (pero no si fue editado manualmente)
  useEffect(() => {
    // Si el usuario no ha editado manualmente, recalculamos
    const calculatedWeight = calculateMaxCarryWeight(stats.strength || 10, race);
    if (stats.max_carry_weight === calculatedWeight || !stats.max_carry_weight) {
      setStats({
        ...stats,
        max_carry_weight: calculatedWeight,
      });
    }
  }, [stats.strength, race]);

  // Fetch compendium items for autocomplete
  useEffect(() => {
    const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    fetch(`${API_URL}/api/compendium-items`)
      .then((r) => r.json())
      .then(({ items }) => {
        if (Array.isArray(items)) setCompendiumItems(items as CompendiumItem[]);
      })
      .catch(() => {
        /* silently ignore – dropdown will show empty */
      });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Guest mode: no character to load, just show empty form
      setLoading(false);
      return;
    }
    loadCharacter();
  }, [characterId, user, authLoading]);

  const loadCharacter = async () => {
    try {
      setLoading(true);
      const response = characterId 
        ? await fetchCharacterSheetById(characterId)
        : await fetchCharacterSheet();
      
      if (response.character) {
        const char = response.character;
        setCharacter(char);
        setName(char.name);
        setRace(char.race);
        setClasses(char.classes && char.classes.length > 0 ? char.classes : [{ name: "", level: 1 }]);
        setBackground(char.background);
        setExperiencePoints(char.experience_points || 0);
        setIsPublic(char.is_public);
        setStats(char.stats);
        setInventory(char.inventory || "");
        setSpellsKnown(char.spells_known || "");
        setEquipment(char.equipment || "");
        setNotes(char.notes || "");
        setAvatarUrl(char.avatar_url || undefined);
        setAvatarPreview(char.avatar_url || undefined);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      window.open(switchRoutes.login, "_blank");
      return;
    }
    try {
      setSaving(true);
      setError("");

      const formData: CharacterFormData = {
        name,
        race,
        classes,
        background,
        experience_points: experiencePoints,
        stats,
        inventory,
        spells_known: spellsKnown,
        equipment,
        notes,
        is_public: isPublic,
        avatar_url: avatarUrl,
      };

      if (character?.id) {
        // Upload avatar if a new file was selected
        if (avatarFile) {
          setUploadingAvatar(true);
          const url = await uploadCharacterAvatar(user.id, character.id, avatarFile);
          setAvatarUrl(url);
          formData.avatar_url = url;
          setUploadingAvatar(false);
        }
        await updateCharacterSheet(character.id, formData);
        alert(ts.savedOk);
      } else {
        const created = await createCharacterSheet(formData);
        // Upload avatar for newly created character
        if (avatarFile && created.character?.id) {
          setUploadingAvatar(true);
          const url = await uploadCharacterAvatar(user.id, created.character.id, avatarFile);
          setAvatarUrl(url);
          await updateCharacterSheet(created.character.id, { ...formData, avatar_url: url });
          setUploadingAvatar(false);
        }
        alert(ts.createdOk);
      }

      // Redirigir a Mis Fichas después de un breve delay
      setTimeout(() => {
        navigate(switchRoutes.fichas);
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Funciones para gestionar clases
  const addClass = () => {
    setClasses([...classes, { name: "", level: 1 }]);
  };

  const removeClass = (index: number) => {
    if (classes.length > 1) {
      setClasses(classes.filter((_, i) => i !== index));
    }
  };

  const updateClass = (index: number, field: keyof CharacterClass, value: string | number) => {
    const newClasses = [...classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setClasses(newClasses);
  };

  const toggleMulticlass = (checked: boolean) => {
    if (checked && classes.length === 1) {
      addClass();
    } else if (!checked && classes.length > 1) {
      setClasses([classes[0]]);
    }
  };

  const updateStat = <K extends keyof CharacterStats>(key: K, value: CharacterStats[K]) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  const updateSkill = (skill: keyof CharacterStats["skills"], value: boolean) => {
    setStats(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value }
    }));
  };

  const updateSavingThrow = (attr: keyof CharacterStats["saving_throws"], value: boolean) => {
    // Contar cuántas tiradas de salvación están activas
    const currentCount = Object.values(stats.saving_throws).filter(Boolean).length;
    
    // Si se intenta activar y ya hay 2, no permitir
    if (value && currentCount >= 2) {
      return;
    }
    
    setStats(prev => ({
      ...prev,
      saving_throws: { ...prev.saving_throws, [attr]: value }
    }));
  };

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {user && <ProfileTabs />}
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserCircle className="h-8 w-8 text-amber-200" />
              <h1 className="text-3xl font-bold text-amber-50">{ts.pageTitle}</h1>
            </div>
            <p className="text-sm text-amber-100/90">
              {ts.pageSubtitle}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || uploadingAvatar || !user}
            className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
          >
            {uploadingAvatar ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo imagen...
              </>
            ) : saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ts.saving}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {user ? ts.saveSheet : ts.loginToSave}
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Banner invitados */}
      {!user && !authLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-300 mb-4">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {ts.guestBanner}{" "}
            <Link to={switchRoutes.login} className="underline hover:text-amber-100">{ts.guestLogin}</Link>{" "}
            {ts.guestOr}{" "}
            <Link to={switchRoutes.register} className="underline hover:text-amber-100">{ts.guestRegister}</Link>.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="info" className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none sm:min-w-0">
            <User className="mr-2 h-4 w-4" />
            {ts.tabInfo}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none sm:min-w-0">
            <Sword className="mr-2 h-4 w-4" />
            {ts.tabStats}
          </TabsTrigger>
          <TabsTrigger value="combat" className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none sm:min-w-0">
            <Shield className="mr-2 h-4 w-4" />
            {ts.tabCombat}
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none sm:min-w-0">
            <Heart className="mr-2 h-4 w-4" />
            {ts.tabSkills}
          </TabsTrigger>
          <TabsTrigger value="inventario" className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none sm:min-w-0">
            <Package className="mr-2 h-4 w-4" />
            {ts.tabInventory}
          </TabsTrigger>
        </TabsList>

        {/* TAB: INFORMACIÓN BÁSICA */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{ts.infoTitle}</CardTitle>
              <CardDescription>{ts.infoDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Avatar upload */}
              {user && (
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dark-border bg-dark-card flex items-center justify-center shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="avatar-upload" className="text-sm font-medium">Foto del personaje</Label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="avatar-upload"
                        className="flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded-md border border-dark-border bg-dark-card hover:bg-dark-border transition-colors text-gray-300"
                      >
                        <Camera className="w-4 h-4" />
                        {avatarPreview ? "Cambiar foto" : "Subir foto"}
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => { setAvatarPreview(undefined); setAvatarFile(null); setAvatarUrl(undefined); }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">JPG, PNG o WEBP. Máx 2 MB.</p>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          setError("La imagen no puede superar 2 MB");
                          return;
                        }
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{ts.fieldName}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={ts.fieldNamePlaceholder}
                  />
                </div>
                <div>
                  <Label htmlFor="race">{ts.fieldRace}</Label>
                  <Select value={race} onValueChange={setRace}>
                    <SelectTrigger id="race">
                      <SelectValue placeholder={ts.fieldRacePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {DND_RACES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sistema de Clases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{ts.fieldClassLevel}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiclass"
                      checked={isMulticlass}
                      onCheckedChange={toggleMulticlass}
                    />
                    <Label htmlFor="multiclass" className="text-sm font-normal">{ts.fieldMulticlass}</Label>
                  </div>
                </div>

                {classes.map((cls, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`class-${index}`}>{ts.fieldClass} {index + 1}</Label>
                      <Select 
                        value={cls.name} 
                        onValueChange={(value) => updateClass(index, "name", value)}
                      >
                        <SelectTrigger id={`class-${index}`}>
                          <SelectValue placeholder={ts.fieldClassPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {DND_CLASSES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label htmlFor={`level-${index}`}>{ts.fieldLevel}</Label>
                      <Input
                        id={`level-${index}`}
                        type="number"
                        min="1"
                        max="20"
                        value={cls.level}
                        onChange={(e) => updateClass(index, "level", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {isMulticlass && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeClass(index)}
                        disabled={classes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {isMulticlass && classes.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addClass}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {ts.addClassBtn}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background">{ts.fieldBackground}</Label>
                  <Select value={background} onValueChange={setBackground}>
                    <SelectTrigger id="background">
                      <SelectValue placeholder={ts.fieldBackgroundPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {DND_BACKGROUNDS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="xp">{ts.fieldXP}</Label>
                  <Input
                    id="xp"
                    type="number"
                    min="0"
                    value={experiencePoints}
                    onChange={(e) => setExperiencePoints(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="public">{ts.fieldPublic}</Label>
              </div>

              <div className="space-y-2">
                <Label>{ts.fieldPersonality}</Label>
                <Textarea
                  value={stats.personality_traits}
                  onChange={(e) => updateStat("personality_traits", e.target.value)}
                  placeholder={ts.fieldPersonalityPlaceholder}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{ts.fieldIdeals}</Label>
                  <Textarea
                    value={stats.ideals}
                    onChange={(e) => updateStat("ideals", e.target.value)}
                    placeholder={ts.fieldIdealsPlaceholder}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>{ts.fieldBonds}</Label>
                  <Textarea
                    value={stats.bonds}
                    onChange={(e) => updateStat("bonds", e.target.value)}
                    placeholder={ts.fieldBondsPlaceholder}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>{ts.fieldFlaws}</Label>
                  <Textarea
                    value={stats.flaws}
                    onChange={(e) => updateStat("flaws", e.target.value)}
                    placeholder={ts.fieldFlawsPlaceholder}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{ts.fieldLanguages}</Label>
                  <Input
                    value={stats.languages}
                    onChange={(e) => updateStat("languages", e.target.value)}
                    placeholder={ts.fieldLanguagesPlaceholder}
                  />
                </div>
                <div>
                  <Label>{ts.fieldProficiencies}</Label>
                  <div className="space-y-2">
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !stats.proficiencies.includes(value)) {
                          updateStat("proficiencies", [...stats.proficiencies, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={ts.fieldProficienciesPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {DND_PROFICIENCIES.map((prof) => (
                          <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {stats.proficiencies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {stats.proficiencies.map((prof) => (
                          <Badge key={prof} variant="secondary" className="gap-1">
                            {prof}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                updateStat(
                                  "proficiencies",
                                  stats.proficiencies.filter((p) => p !== prof)
                                );
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ESTADÍSTICAS */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{ts.statsTitle}</CardTitle>
              <CardDescription>{ts.statsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((attr) => {
                  const value = stats[attr];
                  const modifier = calculateModifier(value);
                  return (
                    <Card key={attr}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm uppercase">{DND_ABILITIES[attr]}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Input
                          type="number"
                          min="8"
                          max="20"
                          value={value}
                          onChange={(e) => {
                            const newValue = Math.min(20, Math.max(8, parseInt(e.target.value) || 10));
                            updateStat(attr, newValue);
                            // Auto-calcular iniciativa cuando cambie destreza
                            if (attr === "dexterity") {
                              const newInitiative = calculateModifier(newValue);
                              updateStat("initiative", newInitiative);
                            }
                          }}
                          className="text-center text-2xl font-bold"
                        />
                        <div className="text-center text-muted-foreground">
                          {ts.modifier}: {modifier >= 0 ? "+" : ""}{modifier}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6">
                <Label>{ts.proficiencyBonus}</Label>
                <Input
                  type="number"
                  min="2"
                  max="6"
                  value={stats.proficiency_bonus}
                  onChange={(e) => {
                    const newValue = Math.min(6, Math.max(2, parseInt(e.target.value) || 2));
                    updateStat("proficiency_bonus", newValue);
                  }}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground mt-1">{ts.proficiencyBonusRange}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{ts.savingThrowsTitle}</CardTitle>
              <CardDescription>{ts.savingThrowsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((attr) => (
                  <div key={attr} className="flex items-center space-x-2">
                    <Checkbox
                      id={`save-${attr}`}
                      checked={stats.saving_throws[attr]}
                      onCheckedChange={(checked) => updateSavingThrow(attr, checked as boolean)}
                    />
                    <Label htmlFor={`save-${attr}`}>{DND_ABILITIES[attr]}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: COMBATE */}
        <TabsContent value="combat" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{ts.hpTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{ts.hpMax}</Label>
                  <Input
                    type="number"
                    value={stats.max_hp}
                    onChange={(e) => updateStat("max_hp", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{ts.hpCurrent}</Label>
                  <Input
                    type="number"
                    value={stats.current_hp}
                    onChange={(e) => updateStat("current_hp", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{ts.hpTemp}</Label>
                  <Input
                    type="number"
                    value={stats.temp_hp}
                    onChange={(e) => updateStat("temp_hp", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{ts.hitDice}</Label>
                  <Input
                    value={stats.hit_dice}
                    onChange={(e) => updateStat("hit_dice", e.target.value)}
                    placeholder={ts.hitDicePlaceholder}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{ts.defenseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{ts.armorClass}</Label>
                  <Input
                    type="number"
                    value={stats.armor_class}
                    onChange={(e) => updateStat("armor_class", parseInt(e.target.value) || 10)}
                  />
                </div>
                <div>
                  <Label>{ts.initiative}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ts.initiativeBase} +{calculateModifier(stats.dexterity)} {ts.initiativeDex}
                  </p>
                  <Input
                    type="number"
                    value={stats.initiative}
                    onChange={(e) => updateStat("initiative", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{ts.speed}</Label>
                  <Input
                    type="number"
                    value={stats.speed}
                    onChange={(e) => updateStat("speed", parseInt(e.target.value) || 30)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{ts.deathSavesTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{ts.deathSuccesses}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={stats.death_saves.successes}
                    onChange={(e) => updateStat("death_saves", {
                      ...stats.death_saves,
                      successes: Math.min(3, Math.max(0, parseInt(e.target.value) || 0))
                    })}
                  />
                </div>
                <div>
                  <Label>{ts.deathFailures}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={stats.death_saves.failures}
                    onChange={(e) => updateStat("death_saves", {
                      ...stats.death_saves,
                      failures: Math.min(3, Math.max(0, parseInt(e.target.value) || 0))
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: HABILIDADES */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{ts.skillsTitle}</CardTitle>
              <CardDescription>{ts.skillsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.keys(stats.skills).map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={stats.skills[skill as keyof typeof stats.skills]}
                      onCheckedChange={(checked) => updateSkill(skill as keyof typeof stats.skills, checked as boolean)}
                    />
                    <Label htmlFor={`skill-${skill}`}>
                      {DND_SKILLS[skill as keyof typeof DND_SKILLS]}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{ts.featuresTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={stats.features_traits}
                onChange={(e) => updateStat("features_traits", e.target.value)}
                placeholder={ts.featuresPlaceholder}
                rows={8}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: INVENTARIO */}
        <TabsContent value="inventario" className="space-y-4">
          <InventoryManager
            inventory={inventory}
            onInventoryChange={setInventory}
            compendiumItems={compendiumItems}
            showNotes={true}
            notes={notes}
            onNotesChange={setNotes}
            maxCarryWeight={stats.max_carry_weight}
            autoMaxCarryWeight={calculateMaxCarryWeight(stats.strength || 10, race)}
            onMaxCarryWeightChange={(val) => setStats({...stats, max_carry_weight: val})}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MiFichaScene;

