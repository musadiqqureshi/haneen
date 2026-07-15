"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (productId: string, size: string, color: string) => void;
  updateQty: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const sameLine = (a: CartItem, productId: string, size: string, color: string) =>
  a.productId === productId && a.size === size && a.color === color;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, item.size, item.color),
          );
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.size, item.color)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { isOpen: true, items: [...state.items, item] };
        }),
      remove: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, size, color)),
        })),
      updateQty: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              sameLine(i, productId, size, color)
                ? { ...i, quantity: Math.max(1, quantity) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "haneen-cart" },
  ),
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
