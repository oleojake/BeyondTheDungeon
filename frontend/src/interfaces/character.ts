// Interfaz para la ficha de personaje de D&D 5e

export type CharacterClass = {
  name: string;
  level: number;
};

export type CharacterStats = {
  // Atributos básicos
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  // Puntos de vida
  max_hp: number;
  current_hp: number;
  temp_hp: number;

  // Defensa y movimiento
  armor_class: number;
  initiative: number;
  speed: number;

  // Competencias y bonificadores
  proficiency_bonus: number;
  
  // Salvaciones
  saving_throws: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
  };

  // Habilidades (skills)
  skills: {
    acrobatics: boolean;
    animal_handling: boolean;
    arcana: boolean;
    athletics: boolean;
    deception: boolean;
    history: boolean;
    insight: boolean;
    intimidation: boolean;
    investigation: boolean;
    medicine: boolean;
    nature: boolean;
    perception: boolean;
    performance: boolean;
    persuasion: boolean;
    religion: boolean;
    sleight_of_hand: boolean;
    stealth: boolean;
    survival: boolean;
  };

  // Información adicional
  hit_dice: string; // Ej: "1d8"
  death_saves: {
    successes: number;
    failures: number;
  };

  // Rasgos de personalidad
  personality_traits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // Otros
  languages: string;
  proficiencies: string[]; // Array de competencias seleccionadas
  features_traits: string;

  // Carga y peso
  max_carry_weight: number; // Capacidad máxima de carga (en libras)
}

export type Character = {
  id?: string;
  user_id?: string;
  campaign_id?: string | null;
  name: string;
  race: string;
  classes: CharacterClass[]; // Array para soportar multiclase
  background: string;
  experience_points: number;
  stats: CharacterStats;
  inventory: string; // Campo de texto libre
  spells_known: string; // Campo de texto libre
  equipment: string; // Campo de texto libre
  notes: string; // Campo de texto libre
  is_npc: boolean;
  is_public: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type CharacterFormData = {
  name: string;
  race: string;
  classes: CharacterClass[];
  background: string;
  experience_points: number;
  stats: CharacterStats;
  inventory: string;
  spells_known: string;
  equipment: string;
  notes: string;
  is_public: boolean;
  avatar_url?: string;
}

// Valores por defecto para un nuevo personaje
export const defaultCharacterStats: CharacterStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  max_hp: 10,
  current_hp: 10,
  temp_hp: 0,
  armor_class: 10,
  initiative: 0,
  speed: 30,
  proficiency_bonus: 2,
  saving_throws: {
    strength: false,
    dexterity: false,
    constitution: false,
    intelligence: false,
    wisdom: false,
    charisma: false,
  },
  skills: {
    acrobatics: false,
    animal_handling: false,
    arcana: false,
    athletics: false,
    deception: false,
    history: false,
    insight: false,
    intimidation: false,
    investigation: false,
    medicine: false,
    nature: false,
    perception: false,
    performance: false,
    persuasion: false,
    religion: false,
    sleight_of_hand: false,
    stealth: false,
    survival: false,
  },
  hit_dice: "1d8",
  death_saves: {
    successes: 0,
    failures: 0,
  },
  personality_traits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  languages: "",
  proficiencies: [],
  features_traits: "",
  max_carry_weight: 150, // Default para Medium creature con STR 10
};

export const defaultCharacter: Partial<Character> = {
  name: "",
  race: "",
  classes: [{ name: "", level: 1 }],
  background: "",
  experience_points: 0,
  stats: defaultCharacterStats,
  inventory: "",
  spells_known: "",
  equipment: "",
  notes: "",
  is_npc: false,
  is_public: false,
};
