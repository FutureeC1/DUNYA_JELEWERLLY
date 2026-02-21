import { Link } from "react-router-dom";
import { Product } from "../utils/api";
import { useI18n } from "../utils/useI18n";
import { useCartStore, CartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { useWishlistStore } from "../store/wishlistStore";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const t = useI18n();
  const toast = useToastStore();
  const addToCart = useCartStore((s: CartStore) => s.addToCart);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const image = product.image_urls?.[0] || "/placeholder.jpg";
  const price = product.price_uzs ?? 0;

  // Унифицируем размеры: иногда number/string/объект
  const rawSizes = (product.sizes ?? product.available_sizes ?? []) as unknown[];
  const sizes: number[] = rawSizes
    .map((x) => {
      if (typeof x === "number") return x;
      if (typeof x === "string") {
        const n = parseFloat(x.replace(",", "."));
        return Number.isFinite(n) ? n : null;
      }
      if (typeof x === "object" && x !== null && "size" in x) {
        const v = (x as any).size;
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const n = parseFloat(v.replace(",", "."));
          return Number.isFinite(n) ? n : null;
        }
      }
      return null;
    })
    .filter((n): n is number => n !== null);

  const inStock = sizes.length > 0;

  const handleAddOne = () => {
    // Если нет размеров — не даём добавить (иначе у вас ломается cartStore)
    if (!inStock) {
      toast.push(t.product.outOfStock, "error");
      return;
    }
    // Берём первый доступный размер как дефолт (иначе пользователь не сможет добавить из карточки)
    addToCart(product, sizes[0]);
    toast.push(t.toast.added, "success");
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.push(t.product.removeFromWishlist ?? "Удалено из избранного", "success");
    } else {
      addToWishlist(product);
      toast.push(t.product.addToWishlist ?? "Добавлено в избранное", "success");
    }
  };

  return (
    <div className="group rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          <img
            src={image}
            alt={product.title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <div className="mt-4 space-y-1">
          <div className="text-sm text-slate-500">{product.category ?? ""}</div>
          <div className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
            {product.title}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-brand-600">
              {price.toLocaleString("ru-RU")} UZS
            </div>

            <div className={`text-xs ${inStock ? "text-emerald-600" : "text-slate-400"}`}>
              {inStock ? t.product.inStock : t.product.outOfStock}
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddOne}
          className="flex-1 rounded-full bg-brand-600 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={!inStock}
        >
          {t.product.addToCart}
        </button>

        <button
          type="button"
          onClick={toggleWishlist}
          className={`rounded-full border px-3 py-2 text-sm transition-colors ${
            isInWishlist(product.id)
              ? "border-red-500 bg-red-50 text-red-500 dark:border-red-400 dark:bg-red-950 dark:text-red-400"
              : "border-slate-200 bg-white text-slate-400 hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900"
          }`}
          title={
            isInWishlist(product.id)
              ? t.product.removeFromWishlist ?? "Удалить из избранного"
              : t.product.addToWishlist ?? "Добавить в избранное"
          }
        >
          ❤
        </button>
      </div>
    </div>
  );
}