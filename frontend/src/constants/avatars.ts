export interface PresetAvatar {
  id: string;
  name: string;
  url: string;
}

// DiceBear adventurer-style avatars — free deterministic SVGs by seed
const BASE = "https://api.dicebear.com/7.x/adventurer/svg";

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "warrior", name: "Guerrero", url: `${BASE}?seed=warrior&backgroundColor=292524` },
  { id: "mage", name: "Mago", url: `${BASE}?seed=archmage&backgroundColor=1c1917` },
  { id: "rogue", name: "Pícaro", url: `${BASE}?seed=shadowblade&backgroundColor=1c1917` },
  { id: "cleric", name: "Clérigo", url: `${BASE}?seed=holycleric&backgroundColor=292524` },
  { id: "ranger", name: "Explorador", url: `${BASE}?seed=forestwalker&backgroundColor=1c1917` },
];
