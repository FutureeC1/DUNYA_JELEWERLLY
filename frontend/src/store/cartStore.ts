import { create } from 'zustand';
import { persist, createJSONStorage, StateCreator } from 'zustand/middleware';

export interface CartItem {
  productSlug: string;
  title: string;
  imageUrl: string;
  price: number;
  priceUZS: number;
  selectedSize: number;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: any, size: number) => void;
  removeFromCart: (productSlug: string, size: number) => void;
  updateQuantity: (productSlug: string, size: number, qty: number) => void;
  removeItem: (productSlug: string, size: number) => void;
  updateQty: (productSlug: string, size: number, qty: number) => void;
  clear: () => void;
  getTotal: () => number;
}

const storeCreator: StateCreator<CartStore> = (set, get) => ({
      items: [],
      
      addToCart: (product: any, size: number) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item: CartItem) => item.productSlug === product.slug && item.selectedSize === size
        );
        
        if (existingItem) {
          set({
            items: currentItems.map((item: CartItem) =>
              item.productSlug === product.slug && item.selectedSize === size
                ? { ...item, qty: item.qty + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...currentItems, {
              productSlug: product.slug,
              title: product.title,
              imageUrl: product.image_urls?.[0] || '',
              price: product.price_uzs,
              priceUZS: product.price_uzs,
              selectedSize: size,
              qty: 1
            }]
          });
        }
      },
      
      removeFromCart: (productSlug: string, size: number) => {
        set((state: any) => ({
          items: state.items.filter(
            (item: CartItem) => !(item.productSlug === productSlug && item.selectedSize === size)
          )
        }));
      },
      
      updateQuantity: (productSlug: string, size: number, qty: number) => {
        if (qty <= 0) {
          get().removeFromCart(productSlug, size);
          return;
        }
        
        set((state: any) => ({
          items: state.items.map((item: CartItem) =>
            item.productSlug === productSlug && item.selectedSize === size
              ? { ...item, qty }
              : item
          )
        }));
      },
      
      clear: () => set({ items: [] }),
      
      removeItem: (productSlug: string, size: number) => {
        get().removeFromCart(productSlug, size);
      },
      
      updateQty: (productSlug: string, size: number, qty: number) => {
        get().updateQuantity(productSlug, size, qty);
      },
      
      getTotal: () => {
        return get().items.reduce((total: number, item: CartItem) => total + (item.price * item.qty), 0);
      }
});

export const useCartStore = create<CartStore>()(
  persist(storeCreator, {
    name: 'cart-storage',
    storage: createJSONStorage(() => localStorage),
  })
);
