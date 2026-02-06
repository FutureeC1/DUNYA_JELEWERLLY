import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productSlug: string;
  title: string;
  priceUZS: number;
  qty: number;
  selectedSize: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productSlug: string, selectedSize: number) => void;
  updateQty: (productSlug: string, selectedSize: number, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (entry) =>
              entry.productSlug === item.productSlug &&
              entry.selectedSize === item.selectedSize
          );
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.productSlug === item.productSlug &&
                entry.selectedSize === item.selectedSize
                  ? { ...entry, qty: entry.qty + item.qty }
                  : entry
              )
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productSlug, selectedSize) =>
        set((state) => ({
          items: state.items.filter(
            (entry) =>
              entry.productSlug !== productSlug ||
              entry.selectedSize !== selectedSize
          )
        })),
      updateQty: (productSlug, selectedSize, qty) =>
        set((state) => ({
          items: state.items.map((entry) =>
            entry.productSlug === productSlug &&
            entry.selectedSize === selectedSize
              ? { ...entry, qty: Math.max(1, qty) }
              : entry
          )
        })),
      clear: () => set({ items: [] })
    }),
    { name: "dunya-cart" }
  )
);
