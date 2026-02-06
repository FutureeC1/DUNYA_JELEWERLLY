import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Product, fetchProducts } from "../utils/api";
import { useI18n } from "../utils/useI18n";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const t = useI18n();

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  return (
    <div className="space-y-20">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-500">
            Silver rings
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-500">
            {t.hero.subtitle}
          </p>
          <Link
            to="/catalog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white shadow-soft"
          >
            {t.hero.cta}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-slate-200/60 bg-[url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center p-10 text-white shadow-soft"
        >
          <div className="space-y-4 rounded-3xl bg-black/50 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-200">
              Dunya Jewellery
            </p>
            <h2 className="text-2xl font-semibold">925 Silver Collection</h2>
            <p className="text-sm text-slate-100">
              Luxury minimal aesthetics crafted for everyday elegance.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t.benefits.title}
          </h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-500">
            {t.benefits.items.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {products.slice(0, 2).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </section>

      <section className="space-y-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t.newArrivals}
          </h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
