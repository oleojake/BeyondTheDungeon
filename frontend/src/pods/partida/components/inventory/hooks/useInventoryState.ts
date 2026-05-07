import { useState, useCallback, useEffect } from "react";
import type {
  InventoryState,
  ConsumableItem,
  BagItem,
  EquippedItem,
} from "../types";
import { emptyInventory } from "../utils/slotConfig";

interface UseInventoryStateProps {
  initialInventory: string;
  onInventoryChange?: (inventory: string) => void;
}

export function useInventoryState({
  initialInventory,
  onInventoryChange,
}: UseInventoryStateProps) {
  const [inventory, setInventory] = useState<InventoryState>(() => {
    try {
      if (!initialInventory || initialInventory.trim() === "") {
        return emptyInventory;
      }
      const parsed = JSON.parse(initialInventory);
      return parsed as InventoryState;
    } catch {
      return emptyInventory;
    }
  });

  useEffect(() => {
    if (onInventoryChange) {
      onInventoryChange(JSON.stringify(inventory));
    }
  }, [inventory, onInventoryChange]);

  const equipSlot = useCallback(
    (
      slotKey: string,
      name: string,
      weight?: number,
      srdIndex?: string,
      tags?: string[],
      capacity?: string
    ) => {
      setInventory((prev) => ({
        ...prev,
        equipped: {
          ...prev.equipped,
          [slotKey]: {
            id: crypto.randomUUID(),
            name,
            type: srdIndex ?? "custom",
            weight,
            srdIndex,
            tags,
            capacity,
          } as EquippedItem,
        },
      }));
    },
    []
  );

  const clearSlot = useCallback((slotKey: string) => {
    setInventory((prev) => ({
      ...prev,
      equipped: { ...prev.equipped, [slotKey]: null },
    }));
  }, []);

  const addConsumable = useCallback(
    (
      type: "potions" | "scrolls" | "ammo",
      name: string,
      _weight?: number,
      srdIndex?: string,
      tags?: string[]
    ) => {
      if (!name.trim()) return;
      setInventory((prev) => ({
        ...prev,
        [type]: [
          ...prev[type],
          {
            id: crypto.randomUUID(),
            name: name.trim(),
            quantity: 1,
            srdIndex,
            tags,
          },
        ],
      }));
    },
    []
  );

  const changeQty = useCallback(
    (
      type: "potions" | "scrolls" | "ammo" | "bag",
      id: string,
      delta: number
    ) => {
      setInventory((prev) => ({
        ...prev,
        [type]: (prev[type] as (ConsumableItem | BagItem)[])
          .map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
          )
          .filter((i) => i.quantity > 0),
      }));
    },
    []
  );

  const removeItem = useCallback(
    (type: "potions" | "scrolls" | "ammo" | "bag", id: string) => {
      setInventory((prev) => ({
        ...prev,
        [type]: (prev[type] as (ConsumableItem | BagItem)[]).filter(
          (i) => i.id !== id
        ),
      }));
    },
    []
  );

  const addBagItem = useCallback(
    (
      name: string,
      weight?: number,
      srdIndex?: string,
      tags?: string[]
    ) => {
      if (!name.trim()) return;
      setInventory((prev) => ({
        ...prev,
        bag: [
          ...prev.bag,
          {
            id: crypto.randomUUID(),
            name: name.trim(),
            quantity: 1,
            weight,
            srdIndex,
            tags,
          },
        ],
      }));
    },
    []
  );

  const changeBagItemQty = useCallback((id: string, delta: number) => {
    setInventory((prev) => ({
      ...prev,
      bag: prev.bag
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0),
    }));
  }, []);

  const removeBagItem = useCallback((id: string) => {
    setInventory((prev) => ({
      ...prev,
      bag: prev.bag.filter((i) => i.id !== id),
    }));
  }, []);

  const setCurrency = useCallback(
    (coin: "pp" | "po" | "pe" | "pa" | "pc", value: string) => {
      const num = Math.max(0, parseInt(value) || 0);
      setInventory((prev) => ({
        ...prev,
        currency: { ...prev.currency, [coin]: num },
      }));
    },
    []
  );

  return {
    inventory,
    handlers: {
      equipSlot,
      clearSlot,
      addConsumable,
      changeQty,
      removeItem,
      addBagItem,
      changeBagItemQty,
      removeBagItem,
      setCurrency,
    },
  };
}
