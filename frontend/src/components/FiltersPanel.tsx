import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../utils/useI18n";

const MATERIALS = ["gold", "silver", "platinum"] as const;
type MaterialKey = (typeof MATERIALS)[number];

const STONE_TYPES = ["diamond", "ruby", "emerald", "sapphire", "none"] as const;
type StoneTypeKey = (typeof STONE_TYPES)[number];

const SIZES = ["16", "17", "18", "19", "20", "21", "22"] as const;
type SizeKey = (typeof SIZES)[number];

const STYLES = ["classic", "modern", "vintage"] as const;
type StyleKey = (typeof STYLES)[number];

type Filters = {
  material: "" | MaterialKey;
  stoneType: "" | StoneTypeKey;
  size: "" | SizeKey;
  priceRange: [number, number];
  style: "" | StyleKey;
  inStock: boolean;
};

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

export default function FiltersPanel({ filters, onFiltersChange, onReset }: FiltersPanelProps) {
  const t = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePriceRangeChange = (index: 0 | 1, value: string) => {
    const n = Number.parseInt(value, 10);
    const newPriceRange: [number, number] = [...filters.priceRange];
    newPriceRange[index] = Number.isFinite(n) ? n : 0;

    onFiltersChange({
      ...filters,
      priceRange: newPriceRange,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4 text-left"
        type="button"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t.catalog.filters.title}
        </h3>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-slate-500">
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6">
              {/* Material Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.catalog.filters.material}
                </label>
                <select
                  value={filters.material}
                  onChange={(e) => handleFilterChange("material", (e.target.value as Filters["material"]) ?? "")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {MATERIALS.map((material) => (
                    <option key={material} value={material}>
                      {t.catalog.filters.materials[material]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stone Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.catalog.filters.stoneType}
                </label>
                <select
                  value={filters.stoneType}
                  onChange={(e) => handleFilterChange("stoneType", (e.target.value as Filters["stoneType"]) ?? "")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {STONE_TYPES.map((stone) => (
                    <option key={stone} value={stone}>
                      {t.catalog.filters.stoneTypes[stone]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.catalog.filters.size}
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange("size", (e.target.value as Filters["size"]) ?? "")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {SIZES.map((size) => (
                    <option key={size} value={size}>
                      {t.catalog.filters.sizes[size]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.catalog.filters.priceRange}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder={t.catalog.filters.minPrice}
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    placeholder={t.catalog.filters.maxPrice}
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Style Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.catalog.filters.style}
                </label>
                <select
                  value={filters.style}
                  onChange={(e) => handleFilterChange("style", (e.target.value as Filters["style"]) ?? "")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {STYLES.map((style) => (
                    <option key={style} value={style}>
                      {t.catalog.filters.styles[style]}
                    </option>
                  ))}
                </select>
              </div>

              {/* In Stock Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400 dark:border-slate-600 dark:bg-slate-900"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  {t.catalog.filters.inStockOnly}
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={onReset}
                type="button"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t.catalog.filters.reset}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}