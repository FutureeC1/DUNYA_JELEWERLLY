import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../utils/useI18n";
import { Product } from "../utils/api";

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
}

const FEATURES = [
  "material",
  "stoneType",
  "stoneSize",
  "setting",
  "weight",
  "price",
  "sizes",
] as const;

type FeatureKey = (typeof FEATURES)[number];

export default function ProductComparison({ products, onClose }: ProductComparisonProps) {
  const t = useI18n();
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([]);

  const toggleFeature = (feature: FeatureKey) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const getFeatureValue = (product: Product, feature: FeatureKey): string => {
    switch (feature) {
      case "material":
        return product.category || "N/A";
      case "stoneType":
        return "Diamond";
      case "stoneSize":
        return "1.5 ct";
      case "setting":
        return "Prong";
      case "weight":
        return `${Math.round(product.price_uzs / 100000)}g`;
      case "price":
        return `${product.price_uzs.toLocaleString()} UZS`;
      case "sizes":
        return product.available_sizes?.join(", ") || "N/A";
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t.compare.title} ({products.length} {t.compare.products})
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Feature Selection */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            {t.compare.selectFeatures}
          </h3>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((feature) => (
              <button
                key={feature}
                onClick={() => toggleFeature(feature)}
                type="button"
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFeatures.includes(feature)
                    ? "bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {t.compare.features[feature]}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-y-auto max-h-[calc(90vh-300px)]">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${products.length + 1}, minmax(200px, 1fr))`,
            }}
          >
            {/* Feature Column */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800">
              <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                {t.compare.feature}
              </div>
              {selectedFeatures.map((feature) => (
                <div key={feature} className="py-3 text-sm text-slate-600 dark:text-slate-400">
                  {t.compare.features[feature]}
                </div>
              ))}
            </div>

            {/* Product Columns */}
            {products.map((product) => (
              <div key={product.id} className="p-4 border-l border-slate-200 dark:border-slate-800">
                <div className="mb-4">
                  <img
                    src={product.image_urls?.[0] || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <h3 className="font-medium text-sm text-slate-900 dark:text-white mt-2">
                    {product.title}
                  </h3>
                </div>

                {selectedFeatures.map((feature) => (
                  <div key={feature} className="py-3 text-sm text-slate-600 dark:text-slate-400">
                    {getFeatureValue(product, feature)}
                  </div>
                ))}

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    className="w-full rounded-full bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600 transition-colors"
                  >
                    {t.compare.addToCart}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {t.compare.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <button
            onClick={() => setSelectedFeatures([])}
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {t.compare.clearSelection}
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400">{t.compare.maxProducts}</div>
        </div>
      </motion.div>
    </div>
  );
}