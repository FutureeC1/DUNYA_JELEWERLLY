# Улучшения UX для Dunya Jewellery

## 🛒 Корзина в localStorage
```typescript
// cartStore.ts - добавить сохранение в localStorage
import { persist } from 'zustand/middleware';

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (product, size) => { /* ... */ },
      removeFromCart: (productId, size) => { /* ... */ },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

## 🌐 Переключатель языка
```typescript
// LanguageSwitcher.tsx
import { useUiStore } from '../store/uiStore';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useUiStore();
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLocale('uz')}
        className={`px-3 py-1 rounded ${locale === 'uz' ? 'bg-luxury-600 text-white' : 'bg-gray-200'}`}
      >
        O'zbek
      </button>
      <button
        onClick={() => setLocale('ru')}
        className={`px-3 py-1 rounded ${locale === 'ru' ? 'bg-luxury-600 text-white' : 'bg-gray-200'}`}
      >
        Русский
      </button>
    </div>
  );
}
```

## ⏳ Скелетоны и спиннеры
```typescript
// ProductSkeleton.tsx
export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-600"></div>
    </div>
  );
}
```

## 🔔 Улучшенные уведомления
```typescript
// toastStore.ts - добавить типы уведомлений
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Автоматическое удаление
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 3000);
  },
  remove: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));
```

## 🎯 Куда добавить:
1. **Header.tsx** - компонент LanguageSwitcher
2. **ProductCard.tsx** - скелетон во время загрузки
3. **CartStore.ts** - persist middleware
4. **Checkout.tsx** - лучшие сообщения об ошибках
5. **Loading.tsx** - красивый спиннер
