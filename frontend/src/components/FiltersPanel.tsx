import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../utils/useI18n";

interface FiltersPanelProps {
  filters: {
    material: string;
    stoneType: string;
    size: string;
    priceRange: [number, number];
    style: string;
    inStock: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export default function FiltersPanel({ filters, onFiltersChange, onReset }: FiltersPanelProps) {
  const t = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  const materials = ["gold", "silver", "platinum"];
  const stoneTypes = ["diamond", "ruby", "emerald", "sapphire", "none"];
  const sizes = ["16", "17", "18", "19", "20", "21", "22"];
  const styles = ["classic", "modern", "vintage"];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const newPriceRange: [number, number] = [...filters.priceRange];
    newPriceRange[index] = parseInt(value) || 0;
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
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t.catalog.filters.title}
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-500"
        >
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
                  onChange={(e) => handleFilterChange("material", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {materials.map((material) => (
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
                  onChange={(e) => handleFilterChange("stoneType", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {stoneTypes.map((stone) => (
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
                  onChange={(e) => handleFilterChange("size", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {sizes.map((size) => (
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
                  onChange={(e) => handleFilterChange("style", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{t.catalog.filters.all}</option>
                  {styles.map((style) => (
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
                <label
                  htmlFor="inStock"
                  className="ml-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  {t.catalog.filters.inStockOnly}
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={onReset}
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
