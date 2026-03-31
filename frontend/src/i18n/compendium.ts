import i18n from "./config";
import type { TFunction } from "i18next";

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const translateEnumValue = (
  t: TFunction,
  prefix: string,
  value: string | null | undefined,
) => {
  if (!value) return value ?? "";
  const key = `${prefix}.${normalizeKey(value)}`;
  return i18n.exists(key) ? (t(key) as string) : value;
};

export const translateEnumList = (
  t: TFunction,
  prefix: string,
  values: (string | null | undefined)[] | null | undefined,
) => {
  if (!values || values.length === 0) return values ?? [];
  return values.map((value) =>
    value ? translateEnumValue(t, prefix, value) : value,
  ) as string[];
};

export const translateCompendiumText = (
  t: TFunction,
  key: string,
  fallback: string | null | undefined,
) => {
  if (!fallback) return fallback ?? "";
  return i18n.exists(key) ? (t(key) as string) : fallback;
};

export const translateCompendiumArray = (
  t: TFunction,
  key: string,
  fallback: string[] | null | undefined,
) => {
  if (!fallback || fallback.length === 0) return fallback ?? [];
  if (!i18n.exists(key)) return fallback;
  const value = t(key, { returnObjects: true }) as unknown;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return fallback;
};

export const translateCompendiumName = (
  t: TFunction,
  compendiumType: "bestiary" | "spells" | "items",
  id: string,
  fallback: string,
) => translateCompendiumText(t, `compendiumData.${compendiumType}.${id}.name`, fallback);

export const translateCompendiumDescription = (
  t: TFunction,
  compendiumType: "bestiary" | "spells" | "items",
  id: string,
  fallback: string | null | undefined,
) => translateCompendiumText(t, `compendiumData.${compendiumType}.${id}.desc`, fallback);

export const translateCompendiumDescriptionArray = (
  t: TFunction,
  compendiumType: "spells" | "items",
  id: string,
  fallback: string[] | null | undefined,
  field: "desc" | "higher_level" = "desc",
) =>
  translateCompendiumArray(
    t,
    `compendiumData.${compendiumType}.${id}.${field}`,
    fallback,
  );

export const translateCompendiumNamedEntry = (
  t: TFunction,
  baseKey: string,
  entryName: string | null | undefined,
  fallbackDesc: string | null | undefined,
) => {
  if (!entryName) {
    return { name: entryName ?? "", desc: fallbackDesc ?? "" };
  }
  const entryKey = normalizeKey(entryName);
  const nameKey = `${baseKey}.${entryKey}.name`;
  const descKey = `${baseKey}.${entryKey}.desc`;

  return {
    name: i18n.exists(nameKey) ? (t(nameKey) as string) : entryName,
    desc: fallbackDesc
      ? i18n.exists(descKey)
        ? (t(descKey) as string)
        : fallbackDesc
      : "",
  };
};
