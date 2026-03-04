import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  fetchCharacterSheet, 
  createCharacterSheet, 
  updateCharacterSheet 
} from "@/core/api/character-sheet.service";
import type { 
  Character, 
  CharacterFormData, 
  CharacterStats
} from "@/interfaces/character";
import { defaultCharacterStats } from "@/interfaces/character";
import { Loader2, Save, User, Sword, Heart, Shield, Scroll, Package, StickyNote } from "lucide-react";

export const MiFichaScene = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string>("");
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [background, setBackground] = useState("");
  const [alignment, setAlignment] = useState("Neutral");
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<CharacterStats>(defaultCharacterStats);
  
  // Textos largos
  const [inventory, setInventory] = useState("");
  const [spellsKnown, setSpellsKnown] = useState("");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = async () => {
    try {
      setLoading(true);
      const response = await fetchCharacterSheet();
      
      if (response.character) {
        const char = response.character;
        setCharacter(char);
        setName(char.name);
        setRace(char.race);
        setClassLevel(char.class_level);
        setBackground(char.background);
        setAlignment(char.alignment || "Neutral");
        setExperiencePoints(char.experience_points || 0);
        setIsPublic(char.is_public);
        setStats(char.stats);
        setInventory(char.inventory || "");
        setSpellsKnown(char.spells_known || "");
        setEquipment(char.equipment || "");
        setNotes(char.notes || "");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const formData: CharacterFormData = {
        name,
        race,
        class_level: classLevel,
        background,
        alignment,
        experience_points: experiencePoints,
        stats,
        inventory,
        spells_known: spellsKnown,
        equipment,
        notes,
        is_public: isPublic,
      };

      if (character?.id) {
        await updateCharacterSheet(character.id, formData);
      } else {
        await createCharacterSheet(formData);
      }

      await loadCharacter();
      alert("¡Ficha guardada correctamente!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Ficha de Personaje</h1>
          <p className="text-muted-foreground">
            Ficha de D&D 5ª Edición
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Ficha
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info">
            <User className="mr-2 h-4 w-4" />
            Info
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Sword className="mr-2 h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="combat">
            <Shield className="mr-2 h-4 w-4" />
            Combate
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Heart className="mr-2 h-4 w-4" />
            Habilidades
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Package className="mr-2 h-4 w-4" />
            Equipo
          </TabsTrigger>
          <TabsTrigger value="spells">
            <Scroll className="mr-2 h-4 w-4" />
            Hechizos
          </TabsTrigger>
        </TabsList>

        {/* TAB: INFORMACIÓN BÁSICA */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos generales del personaje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Personaje</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Thorin Escudo de Roble"
                  />
                </div>
                <div>
                  <Label htmlFor="race">Raza</Label>
                  <Input
                    id="race"
                    value={race}
                    onChange={(e) => setRace(e.target.value)}
                    placeholder="Ej: Enano de las Montañas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Clase y Nivel</Label>
                  <Input
                    id="class"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    placeholder="Ej: Guerrero 5"
                  />
                </div>
                <div>
                  <Label htmlFor="background">Trasfondo</Label>
                  <Input
                    id="background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="Ej: Soldado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alignment">Alineamiento</Label>
                  <Input
                    id="alignment"
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    placeholder="Ej: Legal Bueno"
                  />
                </div>
                <div>
                  <Label htmlFor="xp">Puntos de Experiencia</Label>
                  <Input
                    id="xp"
                    type="number"
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
                <Label htmlFor="public">Hacer ficha pública</Label>
              </div>

              <div className="space-y-2">
                <Label>Rasgos de Personalidad</Label>
                <Textarea
                  value={stats.personality_traits}
                  onChange={(e) => updateStat("personality_traits", e.target.value)}
                  placeholder="Describe los rasgos de personalidad..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ideales</Label>
                  <Textarea
                    value={stats.ideals}
                    onChange={(e) => updateStat("ideals", e.target.value)}
                    placeholder="Ideales del personaje..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Vínculos</Label>
                  <Textarea
                    value={stats.bonds}
                    onChange={(e) => updateStat("bonds", e.target.value)}
                    placeholder="Vínculos..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Defectos</Label>
                  <Textarea
                    value={stats.flaws}
                    onChange={(e) => updateStat("flaws", e.target.value)}
                    placeholder="Defectos..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Idiomas</Label>
                  <Input
                    value={stats.languages}
                    onChange={(e) => updateStat("languages", e.target.value)}
                    placeholder="Común, Enano, Élfico..."
                  />
                </div>
                <div>
                  <Label>Competencias</Label>
                  <Input
                    value={stats.proficiencies}
                    onChange={(e) => updateStat("proficiencies", e.target.value)}
                    placeholder="Armas marciales, armaduras pesadas..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ESTADÍSTICAS */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atributos</CardTitle>
              <CardDescription>Puntuaciones de características</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((attr) => {
                  const value = stats[attr];
                  const modifier = calculateModifier(value);
                  return (
                    <Card key={attr}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm uppercase">{attr}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => updateStat(attr, parseInt(e.target.value) || 10)}
                          className="text-center text-2xl font-bold"
                        />
                        <div className="text-center text-muted-foreground">
                          Modificador: {modifier >= 0 ? "+" : ""}{modifier}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6">
                <Label>Bonificador de Competencia</Label>
                <Input
                  type="number"
                  value={stats.proficiency_bonus}
                  onChange={(e) => updateStat("proficiency_bonus", parseInt(e.target.value) || 2)}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiradas de Salvación</CardTitle>
              <CardDescription>Marca las competencias</CardDescription>
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
                    <Label htmlFor={`save-${attr}`} className="capitalize">{attr}</Label>
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
                <CardTitle>Puntos de Vida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>HP Máximos</Label>
                  <Input
                    type="number"
                    value={stats.max_hp}
                    onChange={(e) => updateStat("max_hp", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>HP Actuales</Label>
                  <Input
                    type="number"
                    value={stats.current_hp}
                    onChange={(e) => updateStat("current_hp", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>HP Temporales</Label>
                  <Input
                    type="number"
                    value={stats.temp_hp}
                    onChange={(e) => updateStat("temp_hp", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Dados de Golpe</Label>
                  <Input
                    value={stats.hit_dice}
                    onChange={(e) => updateStat("hit_dice", e.target.value)}
                    placeholder="Ej: 5d8"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defensa y Movimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Clase de Armadura (CA)</Label>
                  <Input
                    type="number"
                    value={stats.armor_class}
                    onChange={(e) => updateStat("armor_class", parseInt(e.target.value) || 10)}
                  />
                </div>
                <div>
                  <Label>Iniciativa</Label>
                  <Input
                    type="number"
                    value={stats.initiative}
                    onChange={(e) => updateStat("initiative", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Velocidad (pies)</Label>
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
              <CardTitle>Tiradas de Salvación contra la Muerte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Éxitos</Label>
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
                  <Label>Fallos</Label>
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
              <CardTitle>Habilidades (Skills)</CardTitle>
              <CardDescription>Marca las habilidades en las que eres competente</CardDescription>
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
                    <Label htmlFor={`skill-${skill}`} className="capitalize">
                      {skill.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rasgos y Características</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={stats.features_traits}
                onChange={(e) => updateStat("features_traits", e.target.value)}
                placeholder="Describe los rasgos de raza, clase, trasfondo, dotes..."
                rows={8}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: EQUIPO */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipo</CardTitle>
              <CardDescription>Armas, armaduras y herramientas</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Lista tu equipo, armas, armaduras..."
                rows={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
              <CardDescription>Objetos y posesiones</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                placeholder="Lista tus objetos, monedas, tesoros..."
                rows={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: HECHIZOS */}
        <TabsContent value="spells" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hechizos Conocidos</CardTitle>
              <CardDescription>Lista de hechizos preparados y conocidos</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={spellsKnown}
                onChange={(e) => setSpellsKnown(e.target.value)}
                placeholder="Lista tus hechizos por nivel..."
                rows={15}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas generales, historia del personaje, objetivos..."
                rows={10}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MiFichaScene;

