import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import FiltersPanel from "../components/FiltersPanel";
import { Product, fetchProductsWithRetry, loadCache } from "../utils/api";
import { useI18n } from "../utils/useI18n";

const MATERIALS = ["gold", "silver", "platinum"] as const;
type MaterialKey = typeof MATERIALS[number];

const STONE_TYPES = ["diamond", "ruby", "emerald", "sapphire", "none"] as const;
type StoneTypeKey = typeof STONE_TYPES[number];

const SIZES = ["16", "17", "18", "19", "20", "21", "22"] as const;
type SizeKey = typeof SIZES[number];

const STYLES = ["classic", "modern", "vintage"] as const;
type StyleKey = typeof STYLES[number];

type Filters = {
  material: "" | MaterialKey;
  stoneType: "" | StoneTypeKey;
  size: "" | SizeKey;
  priceRange: [number, number];
  style: "" | StyleKey;
  inStock: boolean;
};

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>(() => loadCache());
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState<Filters>({
    material: "",
    stoneType: "",
    size: "",
    priceRange: [0, 10000000],
    style: "",
    inStock: false,
  });
  const t = useI18n();

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const result = await fetchProductsWithRetry();
      if (!cancelled) {
        setProducts(result.data);
        setError(result.error ?? null);
        setStale(!!result.error && result.data.length > 0);
      }
    }

    refresh();
    const id = setInterval(refresh, 60_000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const filtered = useMemo(() => {
    let base = products.filter((product) =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );

    // Apply filters
    if (filters.material) {
      base = base.filter(product => 
        product.category?.toLowerCase().includes(filters.material)
      );
    }

    if (filters.stoneType) {
      base = base.filter(product => 
        product.description?.toLowerCase().includes(filters.stoneType)
      );
    }

    if (filters.size) {
      base = base.filter(product => 
        product.sizes?.some((size: any) => 
          typeof size === 'number' ? size.toString() === filters.size : 
          typeof size === 'string' ? size.replace(',', '.') === filters.size :
          size?.size?.toString() === filters.size
        )
      );
    }

    base = base.filter(product => 
      product.price_uzs >= filters.priceRange[0] && 
      product.price_uzs <= filters.priceRange[1]
    );

    if (filters.inStock) {
      base = base.filter(product => 
        (product.sizes ?? []).length > 0
      );
    }

    return [...base].sort((a, b) => {
      if (sort === "priceAsc") return a.price_uzs - b.price_uzs;
      if (sort === "priceDesc") return b.price_uzs - a.price_uzs;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, query, sort, filters]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      material: "",
      stoneType: "",
      size: "",
      priceRange: [0, 10000000],
      style: "",
      inStock: false,
    });
  };

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

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Filters Sidebar */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <FiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid */}
        <div className="space-y-8">
          {(error || stale) && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {error}
              {stale && (
                <p className="mt-1 text-xs opacity-90">{t.catalog.dataStale}</p>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-800">
              {products.length === 0 ? t.catalog.empty : "Товары не найдены по вашему запросу"}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ProductCard 
                    product={product} 
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
