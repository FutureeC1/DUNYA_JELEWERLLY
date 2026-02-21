import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../utils/api';

export interface ComparisonStore {
  items: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: number) => void;
  isInComparison: (productId: number) => boolean;
  clearComparison: () => void;
  maxItems: number;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,
      
      addToComparison: (product: Product) => {
        set((state: ComparisonStore) => {
          const exists = state.items.some(item => item.id === product.id);
          if (exists) return state;
          
          if (state.items.length >= state.maxItems) {
            // Remove oldest item if max reached
            const newItems = [...state.items.slice(1), product];
            return { items: newItems };
          }
          
          return {
            items: [...state.items, product]
          };
        });
      },
      
      removeFromComparison: (productId: number) => {
        set((state: ComparisonStore) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      
      isInComparison: (productId: number) => {
        return get().items.some(item => item.id === productId);
      },
      
      clearComparison: () => {
        set((state: ComparisonStore) => ({ items: [] }));
      }
    }),
    {
      name: 'comparison-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
