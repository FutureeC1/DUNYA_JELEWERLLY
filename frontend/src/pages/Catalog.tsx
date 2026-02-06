import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { Product, fetchProductsWithRetry, loadCache } from "../utils/api";
import { useI18n } from "../utils/useI18n";

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>(() => loadCache());
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const t = useI18n();

  useEffect(() => {
    let cancelled = false;
    
    async function refresh() {
      setError(null);
      const result = await fetchProductsWithRetry();
      if (!cancelled) {
        setProducts(result.data);
        setError(result.error);
      }
    }
    
    refresh();
    const id = setInterval(refresh, 60_000); // обновлять раз в минуту
    
    return () => { 
      cancelled = true; 
      clearInterval(id); 
    };
  }, []);

  const filtered = useMemo(() => {
    const base = products.filter((product) =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );
    return [...base].sort((a, b) => {
      if (sort === "priceAsc") return a.price_uzs - b.price_uzs;
      if (sort === "priceDesc") return b.price_uzs - a.price_uzs;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, query, sort]);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-500">
            Dunya Jewellery
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {t.catalog.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.catalog.search}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="newest">{t.catalog.sortOptions.newest}</option>
            <option value="priceAsc">{t.catalog.sortOptions.priceAsc}</option>
            <option value="priceDesc">{t.catalog.sortOptions.priceDesc}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-800">
          {products.length === 0 ? t.catalog.empty : "Товары не найдены по вашему запросу"}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
