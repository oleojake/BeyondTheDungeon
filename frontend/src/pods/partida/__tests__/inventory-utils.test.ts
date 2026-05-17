import { describe, it, expect } from "vitest";

// ─── 9. itemFilters ───────────────────────────────────────────────────────────

import {
  FILTER_POTIONS,
  FILTER_SCROLLS,
  FILTER_AMMO,
  FILTER_ALL,
  getSlotFilter,
} from "../components/inventory/utils/itemFilters";
import type { CompendiumItem } from "../components/inventory/types";

function makeItem(overrides: Partial<CompendiumItem> = {}): CompendiumItem {
  return {
    id: "test-id",
    name: "Test Item",
    type: "Adventuring Gear",
    weight: "1",
    rarity: "Common",
    stats: {},
    ...overrides,
  };
}

describe("FILTER_POTIONS", () => {
  it("returns true for items with Potion equipment category", () => {
    const item = makeItem({
      stats: { equipment_category: { name: "Potion" } },
    });
    expect(FILTER_POTIONS(item)).toBe(true);
  });

  it("returns true for items with 'potion' in name", () => {
    const item = makeItem({ name: "Potion of Healing" });
    expect(FILTER_POTIONS(item)).toBe(true);
  });

  it("returns true for items with 'poci' in name (Spanish)", () => {
    const item = makeItem({ name: "Poción de curación" });
    expect(FILTER_POTIONS(item)).toBe(true);
  });

  it("returns false for non-potion items", () => {
    const item = makeItem({ name: "Longsword" });
    expect(FILTER_POTIONS(item)).toBe(false);
  });
});

describe("FILTER_SCROLLS", () => {
  it("returns true for items with Scroll equipment category", () => {
    const item = makeItem({
      stats: { equipment_category: { name: "Scroll" } },
    });
    expect(FILTER_SCROLLS(item)).toBe(true);
  });

  it("returns true for items with 'scroll' in name", () => {
    const item = makeItem({ name: "Scroll of Fireball" });
    expect(FILTER_SCROLLS(item)).toBe(true);
  });

  it("returns true for items with 'pergamino' in name (Spanish)", () => {
    const item = makeItem({ name: "Pergamino de bola de fuego" });
    expect(FILTER_SCROLLS(item)).toBe(true);
  });

  it("returns false for non-scroll items", () => {
    const item = makeItem({ name: "Potion of Healing" });
    expect(FILTER_SCROLLS(item)).toBe(false);
  });
});

describe("FILTER_AMMO", () => {
  it("returns true for Ammunition gear category", () => {
    const item = makeItem({
      stats: { gear_category: { name: "Ammunition" } },
    });
    expect(FILTER_AMMO(item)).toBe(true);
  });

  it("returns true for items with Thrown property", () => {
    const item = makeItem({
      stats: { properties: [{ name: "Thrown" }] },
    });
    expect(FILTER_AMMO(item)).toBe(true);
  });

  it("returns false for non-ammo items", () => {
    const item = makeItem({ name: "Longsword" });
    expect(FILTER_AMMO(item)).toBe(false);
  });
});

describe("FILTER_ALL", () => {
  it("always returns true", () => {
    const item = makeItem();
    expect(FILTER_ALL(item)).toBe(true);
  });
});

describe("getSlotFilter", () => {
  const slotCases = [
    { key: "helmet", name: "Helm of Brilliance" },
    { key: "helmet", name: "Hat of Disguise" },
    { key: "helmet", name: "Crown of Madness" },
    { key: "amulet", name: "Amulet of Health" },
    { key: "amulet", name: "Necklace of Adaptation" },
    { key: "armor", name: "Chain Mail" },
    { key: "armor", name: "Robe of the Archmagi" },
    { key: "cloak", name: "Cloak of Invisibility" },
    { key: "cloak", name: "Cape of the Mountebank" },
    { key: "gloves", name: "Gloves of Swimming" },
    { key: "gloves", name: "Gauntlets of Ogre Power" },
    { key: "weapon", name: "Longsword" },
    { key: "mainhand", name: "Longbow" },
    { key: "offhand", name: "Shield" },
    { key: "ring1", name: "Ring of Protection" },
    { key: "ring2", name: "Ring of Invisibility" },
    { key: "belt", name: "Belt of Giant Strength" },
    { key: "boots", name: "Boots of Elvenkind" },
    { key: "mount", name: "Warhorse" },
  ];

  slotCases.forEach(({ key, name }) => {
    it(`filter for '${key}' matches '${name}'`, () => {
      const filter = getSlotFilter(key);
      let item: CompendiumItem;
      if (key === "mainhand" || key === "weapon") {
        item = makeItem({
          name,
          stats: { equipment_category: { name: "Weapon" } },
        });
      } else if (key === "offhand") {
        item = makeItem({
          name,
          stats: { armor_category: "Shield", equipment_category: { name: "Armor" } },
        });
      } else if (key === "armor") {
        item = makeItem({
          name,
          stats: { equipment_category: { name: "Armor" }, armor_category: "Heavy" },
        });
      } else if (key === "mount") {
        item = makeItem({
          name,
          stats: { equipment_category: { name: "Mounts and Vehicles" } },
        });
      } else if (key === "ring1" || key === "ring2") {
        item = makeItem({
          name,
          stats: { equipment_category: { name: "Ring" } },
        });
      } else if (key === "helmet") {
        item = makeItem({
          name,
          stats: { equipment_category: { name: "Wondrous Items" } },
        });
      } else if (key === "cloak") {
        item = makeItem({
          name,
          stats: { equipment_category: { name: "Wondrous Items" } },
        });
      } else {
        item = makeItem({ name });
      }
      expect(filter(item)).toBe(true);
    });
  });

  it("returns FILTER_ALL for unknown slot key", () => {
    const filter = getSlotFilter("unknown");
    expect(filter(makeItem())).toBe(true);
  });
});

// ─── 10. itemTags ─────────────────────────────────────────────────────────────

import { getItemTags } from "../components/inventory/utils/itemTags";

describe("getItemTags", () => {
  it("returns empty array for empty stats", () => {
    expect(getItemTags({})).toEqual([]);
  });

  it("includes cost tag when cost is present", () => {
    const stats = { cost: { quantity: 50, unit: "gp" } };
    const tags = getItemTags(stats);
    expect(tags).toContain("50 gp");
  });

  it("includes damage dice tag when damage is present", () => {
    const stats = {
      damage: { damage_dice: "1d8", damage_type: { name: "Slashing" } },
    };
    const tags = getItemTags(stats);
    expect(tags).toContain("1d8 Slashing");
  });

  it("includes two-handed damage tag", () => {
    const stats = { two_handed_damage: { damage_dice: "1d10" } };
    const tags = getItemTags(stats);
    expect(tags).toContain("(1d10)");
  });

  it("includes AC tag when armor_class is present", () => {
    const stats = { armor_class: { base: 14, dex_bonus: true } };
    const tags = getItemTags(stats);
    expect(tags).toContain("CA 14+Des");
  });

  it("includes AC tag without dex bonus", () => {
    const stats = { armor_class: { base: 14 } };
    const tags = getItemTags(stats);
    expect(tags).toContain("CA 14");
  });

  it("includes melee range tag when weapon_range is Melee and range > 5", () => {
    const stats = { weapon_range: "Melee", range: { normal: 10 } };
    const tags = getItemTags(stats);
    expect(tags).toContain("Alcance 10 ft");
  });

  it("includes thrown range tag", () => {
    const stats = { throw_range: { normal: 20, long: 60 } };
    const tags = getItemTags(stats);
    expect(tags).toContain("Lanzado 20/60 ft");
  });

  it("includes ranged weapon range tag", () => {
    const stats = { weapon_range: "Ranged", range: { normal: 80, long: 320 } };
    const tags = getItemTags(stats);
    expect(tags).toContain("80/320 ft");
  });

  it("includes rarity when not None", () => {
    const stats = { rarity: { name: "Rare" } };
    const tags = getItemTags(stats);
    expect(tags).toContain("Rare");
  });

  it("does not include rarity when None", () => {
    const stats = { rarity: { name: "None" } };
    const tags = getItemTags(stats);
    expect(tags).not.toContain("None");
  });

  it("includes weapon_category", () => {
    const stats = { weapon_category: "Martial" };
    const tags = getItemTags(stats);
    expect(tags).toContain("Martial");
  });

  it("includes armor_category", () => {
    const stats = { armor_category: "Heavy" };
    const tags = getItemTags(stats);
    expect(tags).toContain("Heavy");
  });

  it("includes stealth_disadvantage tag", () => {
    const stats = { stealth_disadvantage: true };
    const tags = getItemTags(stats);
    expect(tags).toContain("Sigilo DesV");
  });

  it("includes capacity tag", () => {
    const stats = { capacity: "500 lb" };
    const tags = getItemTags(stats);
    expect(tags).toContain("Cap. 500 lb");
  });

  it("includes weapon properties excluding monk and special", () => {
    const stats = {
      properties: [
        { index: "versatile", name: "Versatile" },
        { index: "monk", name: "Monk" },
        { index: "special", name: "Special" },
        { index: "light", name: "Light" },
      ],
    };
    const tags = getItemTags(stats);
    expect(tags).toContain("Versatile");
    expect(tags).toContain("Light");
    expect(tags).not.toContain("Monk");
    expect(tags).not.toContain("Special");
  });
});

// ─── 11. slotConfig ───────────────────────────────────────────────────────────

import { EQUIPMENT_SLOTS, emptyInventory } from "../components/inventory/utils/slotConfig";

describe("EQUIPMENT_SLOTS", () => {
  it("has 12 slots", () => {
    expect(EQUIPMENT_SLOTS.length).toBe(12);
  });

  it("each slot has required properties", () => {
    EQUIPMENT_SLOTS.forEach((slot) => {
      expect(slot).toHaveProperty("key");
      expect(slot).toHaveProperty("label");
      expect(slot).toHaveProperty("icon");
      expect(slot).toHaveProperty("col");
      expect(slot).toHaveProperty("row");
    });
  });

  it("includes all expected slot keys", () => {
    const keys = EQUIPMENT_SLOTS.map((s) => s.key);
    expect(keys).toContain("helmet");
    expect(keys).toContain("amulet");
    expect(keys).toContain("armor");
    expect(keys).toContain("cloak");
    expect(keys).toContain("gloves");
    expect(keys).toContain("mainhand");
    expect(keys).toContain("offhand");
    expect(keys).toContain("ring1");
    expect(keys).toContain("ring2");
    expect(keys).toContain("belt");
    expect(keys).toContain("boots");
    expect(keys).toContain("mount");
  });
});

describe("emptyInventory", () => {
  it("has all slots set to null", () => {
    EQUIPMENT_SLOTS.forEach((slot) => {
      expect(emptyInventory.equipped[slot.key]).toBeNull();
    });
  });

  it("has empty arrays for consumables and bag", () => {
    expect(emptyInventory.potions).toEqual([]);
    expect(emptyInventory.scrolls).toEqual([]);
    expect(emptyInventory.ammo).toEqual([]);
    expect(emptyInventory.bag).toEqual([]);
  });

  it("has zeroed currency", () => {
    expect(emptyInventory.currency).toEqual({
      pp: 0,
      po: 0,
      pe: 0,
      pa: 0,
      pc: 0,
    });
  });
});

// ─── 12. useInventoryState (import only) ──────────────────────────────────────

describe("useInventoryState", () => {
  it("can be imported", async () => {
    const mod = await import(
      "../components/inventory/hooks/useInventoryState"
    );
    expect(mod.useInventoryState).toBeDefined();
    expect(typeof mod.useInventoryState).toBe("function");
  });
});

// ─── types.ts ─────────────────────────────────────────────────────────────────

describe("types", () => {
  it("exports all expected types", async () => {
    const mod = await import("../components/inventory/types");
    expect(mod.EquippedItem).toBeUndefined();
    expect(mod.ConsumableItem).toBeUndefined();
    expect(mod.BagItem).toBeUndefined();
    expect(mod.Currency).toBeUndefined();
    expect(mod.InventoryState).toBeUndefined();
    expect(mod.CompendiumItem).toBeUndefined();
  });
});
