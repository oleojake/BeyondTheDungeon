export interface EquippedItem {
  id: string;
  name: string;
  type: string;
  weight?: number;
  srdIndex?: string;
  tags?: string[];
  capacity?: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  quantity: number;
  srdIndex?: string;
  tags?: string[];
}

export interface BagItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  srdIndex?: string;
  tags?: string[];
}

export interface Currency {
  pp: number;
  po: number;
  pe: number;
  pa: number;
  pc: number;
}

export interface InventoryState {
  equipped: Record<string, EquippedItem | null>;
  potions: ConsumableItem[];
  scrolls: ConsumableItem[];
  ammo: ConsumableItem[];
  bag: BagItem[];
  currency: Currency;
}

export interface CompendiumItem {
  id: string;
  name: string;
  type: string;
  weight: string | null;
  rarity: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: Record<string, any>;
}
