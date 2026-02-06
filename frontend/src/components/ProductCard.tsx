import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Product } from "../utils/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {product.title}
          </h3>
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
