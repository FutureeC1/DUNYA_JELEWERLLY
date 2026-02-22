import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../utils/useI18n";
import { Product } from "../utils/api";
import { useCartStore } from "../store/cartStore";

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: number) => void;
  onAddToCart: (product: Product) => void;
}

export default function Wishlist({ isOpen, onClose, wishlist, onRemoveFromWishlist, onAddToCart }: WishlistProps) {
  const t = useI18n();
  const addToCart = useCartStore((state) => state.addToCart);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            {t.wishlist.title} ({wishlist.length})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-6">
          {wishlist.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">💝</div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-2">
                {t.wishlist.empty}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {t.wishlist.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1">
              {wishlist.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-slate-200 rounded-lg p-4 dark:border-slate-800"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <img
                      src={product.image_urls?.[0] || "/placeholder.jpg"}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                        {product.title}
                      </h3>
                      <p className="text-brand-500 font-semibold text-sm">
                        {product.price_uzs.toLocaleString()} UZS
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {product.category}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        // Добавляем товар в корзину с первым доступным размером
                        const sizes = product.sizes || product.available_sizes || [];
                        let firstSize = 16; // размер по умолчанию
                        
                        if (Array.isArray(sizes) && sizes.length > 0) {
                          const firstSizeItem = sizes[0];
                          let firstSizeValue = 16;
                          
                          if (typeof firstSizeItem === 'number') {
                            firstSizeValue = firstSizeItem;
                          } else if (typeof firstSizeItem === 'string') {
                            const sizeNumber = parseFloat((firstSizeItem as string).replace(',', '.'));
                            firstSize = isNaN(sizeNumber) ? 16 : sizeNumber;
                          } else if (typeof firstSizeItem === 'object' && firstSizeItem !== null && 'size' in firstSizeItem) {
                            const s = (firstSizeItem as any).size;
                            if (typeof s === 'number') firstSizeValue = s;
                            else if (typeof s === 'string') firstSizeValue = parseFloat(s.replace(/,/g, '.'));
                          }
                        }
                        
                        addToCart(product, firstSize);
                        onAddToCart(product);
                      }}
                      className="flex-1 rounded-full bg-brand-500 px-3 py-2 text-xs text-white hover:bg-brand-600 transition-colors"
                    >
                      {t.wishlist.addToCart}
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {t.wishlist.remove}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.wishlist.totalItems}: {wishlist.length}
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t.wishlist.total}: {wishlist.reduce((sum, product) => sum + product.price_uzs, 0).toLocaleString()} UZS
                </p>
              </div>
              <button
                onClick={() => wishlist.forEach(product => onAddToCart(product))}
                className="rounded-full bg-brand-500 px-6 py-3 text-white hover:bg-brand-600 transition-colors"
              >
                {t.wishlist.addAllToCart}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
