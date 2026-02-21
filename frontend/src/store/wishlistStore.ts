import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../utils/api';

export interface WishlistStore {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToWishlist: (product: Product) => {
        set((state: WishlistStore) => {
          const exists = state.items.some(item => item.id === product.id);
          if (exists) return state;
          
          return {
            items: [...state.items, product]
          };
        });
      },
      
      removeFromWishlist: (productId: number) => {
        set((state: WishlistStore) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      
      isInWishlist: (productId: number) => {
        return get().items.some(item => item.id === productId);
      },
      
      clearWishlist: () => {
        set((state: WishlistStore) => ({ items: [] }));
      }
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
