import type { CompendiumItem } from "../types";

// ─── Filtros por categoría ────────────────────────────────────────────────────

export const FILTER_POTIONS = (item: CompendiumItem) =>
  item.stats?.equipment_category?.name === "Potion" ||
  item.name.toLowerCase().includes("potion") ||
  item.name.toLowerCase().includes("poci");

export const FILTER_SCROLLS = (item: CompendiumItem) =>
  item.stats?.equipment_category?.name === "Scroll" ||
  item.name.toLowerCase().includes("scroll") ||
  item.name.toLowerCase().includes("pergamino");

export const FILTER_AMMO = (item: CompendiumItem) =>
  item.stats?.gear_category?.name === "Ammunition" ||
  (item.stats?.properties ?? []).some(
    (p: { name: string }) => p.name === "Thrown",
  );

export const FILTER_ALL = () => true;

// ─── Filtros por slot de equipo ───────────────────────────────────────────────

function filterHelmet(item: CompendiumItem): boolean {
  const n = item.name.toLowerCase();
  const cat = item.stats?.equipment_category?.name ?? "";
  return (
    (cat === "Wondrous Items" &&
      /helm|hat|cap|crown|tiara|headband/i.test(n)) ||
    /helm|hat|cap|crown|tiara|headband/i.test(n)
  );
}

function filterAmulet(item: CompendiumItem): boolean {
  return /necklace|amulet|pendant|medallion/i.test(item.name);
}

function filterArmor(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  const ac = item.stats?.armor_category ?? "";
  const n = item.name.toLowerCase();
  return (
    (cat === "Armor" && ac !== "Shield") ||
    (cat === "Wondrous Items" && /robe|mantle/i.test(n))
  );
}

function filterCloak(item: CompendiumItem): boolean {
  return /cloak|cape|mantle|robe/i.test(item.name);
}

function filterGloves(item: CompendiumItem): boolean {
  return /gloves|gauntlets|bracers|bracer/i.test(item.name);
}

function filterWeapon(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  return (
    cat === "Weapon" ||
    cat === "Rod" ||
    cat === "Staff" ||
    cat === "Wand" ||
    (cat === "Wondrous Items" &&
      /sword|blade|bow|wand|rod|staff/i.test(item.name))
  );
}

function filterOffhand(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  const ac = item.stats?.armor_category ?? "";
  return (
    cat === "Weapon" ||
    cat === "Rod" ||
    cat === "Staff" ||
    cat === "Wand" ||
    (cat === "Armor" && ac === "Shield") ||
    /shield|buckler/i.test(item.name)
  );
}

function filterRing(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  return cat === "Ring" || /ring/i.test(item.name);
}

function filterBelt(item: CompendiumItem): boolean {
  return /belt|girdle/i.test(item.name);
}

function filterBoots(item: CompendiumItem): boolean {
  return /boots|boot|shoes|slippers|sandals|greaves/i.test(item.name);
}

function filterMount(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  return cat === "Mounts and Vehicles";
}

export function getSlotFilter(slotKey: string): (item: CompendiumItem) => boolean {
  switch (slotKey) {
    case "helmet":
      return filterHelmet;
    case "amulet":
      return filterAmulet;
    case "armor":
      return filterArmor;
    case "cloak":
      return filterCloak;
    case "gloves":
      return filterGloves;
    case "mainhand":
      return filterWeapon;
    case "offhand":
      return filterOffhand;
    case "ring1":
    case "ring2":
      return filterRing;
    case "belt":
      return filterBelt;
    case "boots":
      return filterBoots;
    case "mount":
      return filterMount;
    default:
      return FILTER_ALL;
  }
}
