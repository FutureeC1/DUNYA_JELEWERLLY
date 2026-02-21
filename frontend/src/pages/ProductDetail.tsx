import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCartStore, CartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useToastStore } from "../store/toastStore";
import { Product, fetchProductsWithRetry, fetchProductWithCache } from "../utils/api";
import { useI18n } from "../utils/useI18n";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((state: CartStore) => state.addToCart);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const toast = useToastStore();
  const t = useI18n();

  useEffect(() => {
    if (!slug) return;
    
    // Load current product
    fetchProductWithCache(slug).then((r) => {
      setProduct(r.product);
      
      // Load related products
      fetchProductsWithRetry().then((result) => {
        const related = result.data
          .filter((p: Product) => p.id !== r.product.id && p.category === r.product.category)
          .slice(0, 4);
        setRelatedProducts(related);
      });
    });
  }, [slug]);

  if (!product) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-800">
        {t.catalog.empty}
      </div>
    );
  }

  const handleAdd = () => {
    if (!selectedSize) {
      toast.push(t.toast.selectSize, "error");
      return;
    }
    for (let i = 0; i < qty; i++) {
      addItem(product, selectedSize);
    }
    toast.push(t.toast.added, "success");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.push("Удалено из избранного", "success");
    } else {
      addToWishlist(product);
      toast.push("Добавлено в избранное", "success");
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: t.nav.catalog, path: "/catalog" },
          { label: product.category || "Кольца", path: "/catalog" },
          { label: product.title }
        ]}
      />
      
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-hidden rounded-[32px] border border-slate-200/60 bg-slate-100 dark:border-slate-800">
          <img
            src={product.image_urls[0]}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {product.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {(product.sizes ?? product.sizes ?? []).length > 0 ? t.product.inStock : t.product.outOfStock}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-brand-600">
            {product.price_uzs.toLocaleString("ru-RU")} UZS
          </p>
          <button
            onClick={handleWishlistToggle}
            className={`p-3 rounded-full border transition-colors ${
              isInWishlist(product.id)
                ? "border-red-500 bg-red-50 text-red-500 dark:border-red-400 dark:bg-red-950 dark:text-red-400"
                : "border-slate-200 bg-white text-slate-400 hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900"
            }`}
            title={isInWishlist(product.id) ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <svg className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t.product.selectSize}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(product.sizes ?? product.sizes ?? []).map((rawSize: any) => {
              // Strict parsing logic
              let size: number | null = null;

              if (typeof rawSize === 'number') {
                size = rawSize;
              } else if (typeof rawSize === 'string') {
                // Try replacing comma with dot (18,5 -> 18.5)
                const normalized = rawSize.replace(',', '.');
                const parsed = parseFloat(normalized);
                if (!isNaN(parsed)) size = parsed;
              } else if (typeof rawSize === 'object' && rawSize !== null) {
                // Try to find a 'size' property
                if ('size' in rawSize) {
                  const s = rawSize.size;
                  if (typeof s === 'number') size = s;
                  else if (typeof s === 'string') {
                    const parsed = parseFloat(s.replace(',', '.'));
                    if (!isNaN(parsed)) size = parsed;
                  }
                }
              }

              if (size === null) return null; // Skip invalid sizes

              return (
                <button
                  key={size}
                  onClick={() => {
                    console.log("Selected size (number):", size);
                    setSelectedSize(size!);
                  }}
                  className={`rounded-full border px-4 py-1 text-sm transition ${selectedSize === size

                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-200 text-slate-600 hover:border-brand-400 dark:border-slate-800 dark:text-slate-200"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-800">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-sm">
              -
            </button>
            <span className="text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="text-sm">
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-full bg-brand-600 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white shadow-soft"
          >
            {t.product.addToCart}
          </button>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t.product.description}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{product.description}</p>
        </div>
      </motion.div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Похожие товары
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ProductCard product={relatedProduct} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
