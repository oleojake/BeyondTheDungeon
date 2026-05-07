import {
  HardHat,
  Gem,
  Shirt,
  Wind,
  Grab,
  Sword,
  Swords,
  Footprints,
  Circle,
  HelpCircle,
} from "lucide-react";
import type { InventoryState } from "../types";

export const EQUIPMENT_SLOTS = [
  { key: "helmet", label: "Casco", icon: HardHat, col: 2, row: 1 },
  { key: "amulet", label: "Colgante", icon: Gem, col: 1, row: 2 },
  { key: "armor", label: "Armadura", icon: Shirt, col: 2, row: 2 },
  { key: "cloak", label: "Capa", icon: Wind, col: 3, row: 2 },
  { key: "gloves", label: "Guantes", icon: Grab, col: 1, row: 3 },
  { key: "mainhand", label: "Arma principal", icon: Sword, col: 2, row: 3 },
  { key: "offhand", label: "Arma sec. / Escudo", icon: Swords, col: 3, row: 3 },
  { key: "ring1", label: "Anillo izq.", icon: Circle, col: 1, row: 4 },
  { key: "belt", label: "Cinturón", icon: HelpCircle, col: 2, row: 4 },
  { key: "ring2", label: "Anillo der.", icon: Circle, col: 3, row: 4 },
  { key: "boots", label: "Botas", icon: Footprints, col: 2, row: 5 },
  { key: "mount", label: "Montura", icon: HelpCircle, col: 3, row: 5 },
] as const;

export const emptyInventory: InventoryState = {
  equipped: Object.fromEntries(EQUIPMENT_SLOTS.map((s) => [s.key, null])),
  potions: [],
  scrolls: [],
  ammo: [],
  bag: [],
  currency: { pp: 0, po: 0, pe: 0, pa: 0, pc: 0 },
};
