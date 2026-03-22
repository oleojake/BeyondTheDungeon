import type { CompendiumItem } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getItemTags(stats: Record<string, any>): string[] {
  const tags: string[] = [];
  if (stats.cost?.quantity && stats.cost.unit)
    tags.push(`${stats.cost.quantity} ${stats.cost.unit}`);
  if (stats.damage?.damage_dice) {
    const dtype = stats.damage.damage_type?.name ?? "";
    tags.push(`${stats.damage.damage_dice} ${dtype}`.trim());
  }
  if (stats.two_handed_damage?.damage_dice)
    tags.push(`(${stats.two_handed_damage.damage_dice})`);
  if (stats.armor_class?.base) {
    const dex = stats.armor_class.dex_bonus ? "+Des" : "";
    tags.push(`CA ${stats.armor_class.base}${dex}`);
  }
  if (
    stats.weapon_range === "Melee" &&
    stats.range?.normal &&
    stats.range.normal > 5
  )
    tags.push(`Alcance ${stats.range.normal} ft`);
  if (stats.throw_range?.normal)
    tags.push(
      `Lanzado ${stats.throw_range.normal}/${stats.throw_range.long ?? "?"} ft`,
    );
  if (stats.weapon_range === "Ranged" && stats.range?.normal)
    tags.push(`${stats.range.normal}/${stats.range.long ?? "?"} ft`);
  if (stats.rarity?.name && stats.rarity.name !== "None")
    tags.push(stats.rarity.name);
  if (stats.weapon_category) tags.push(stats.weapon_category);
  if (stats.armor_category) tags.push(stats.armor_category);
  if (stats.stealth_disadvantage) tags.push("Sigilo DesV");
  if (stats.capacity) tags.push(`Cap. ${stats.capacity}`);
  const skipProps = new Set(["monk", "special"]);
  (stats.properties ?? []).forEach((p: { index: string; name: string }) => {
    if (!skipProps.has(p.index)) tags.push(p.name);
  });
  return tags;
}
