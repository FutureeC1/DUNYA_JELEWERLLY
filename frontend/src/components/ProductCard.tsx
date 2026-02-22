import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Product } from "../utils/api";

interface ProductCardProps {
  product: Product;
  onCompare?: (product: Product) => void;
  isComparing?: boolean;
}

export default function ProductCard({ product, onCompare, isComparing = false }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm transition dark:border-slate-800/70 dark:bg-slate-900"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={product.image_urls[0]}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">
              {product.title}
            </h3>
            {onCompare && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onCompare(product);
                }}
                className={`ml-2 p-2 rounded-full border transition-colors ${
                  isComparing
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-200 bg-white text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:border-slate-700 dark:bg-slate-800"
                }`}
                title={isComparing ? "Убрать из сравнения" : "Добавить к сравнению"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-brand-600">
            <span>{product.price_uzs.toLocaleString("ru-RU")} UZS</span>
            <span className="text-xs uppercase tracking-[0.2em]">View</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
