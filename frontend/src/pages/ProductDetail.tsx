import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCartStore, CartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { Product, fetchProductWithCache } from "../utils/api";
import { useI18n } from "../utils/useI18n";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((state: CartStore) => state.addToCart);
  const toast = useToastStore();
  const t = useI18n();

  useEffect(() => {
    if (!slug) return;
    fetchProductWithCache(slug).then((r) => setProduct(r.product));
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

  return (
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
            {(product.available_sizes ?? product.sizes ?? []).length > 0 ? t.product.inStock : t.product.outOfStock}
          </p>
        </div>
        <p className="text-2xl font-semibold text-brand-600">
          {product.price_uzs.toLocaleString("ru-RU")} UZS
        </p>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t.product.selectSize}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(product.available_sizes ?? product.sizes ?? []).map((rawSize: any) => {
              // Normalization: if size is object { size: 40, ... } -> 40, else -> 40
              const size = typeof rawSize === 'object' && rawSize !== null && 'size' in rawSize
                ? rawSize.size
                : rawSize;

              return (
                <button
                  key={String(size)}
                  onClick={() => {
                    console.log("Selected size:", size);
                    setSelectedSize(size);
                  }}
                  className={`rounded-full border px-4 py-1 text-sm transition ${selectedSize === size

                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-200 text-slate-600 hover:border-brand-400 dark:border-slate-800 dark:text-slate-200"
                    }`}
                >
                  {String(size)}
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
  );
}
