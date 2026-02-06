import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { useI18n } from "../utils/useI18n";

export default function Cart() {
  const { items, removeItem, updateQty } = useCartStore();
  const toast = useToastStore();
  const t = useI18n();

  const subtotal = items.reduce((sum, item) => sum + item.priceUZS * item.qty, 0);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-800">
        {t.cart.empty}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        {t.cart.title}
      </h1>
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={`${item.productSlug}-${item.selectedSize}`}
            className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-slate-200/60 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.selectedSize}</p>
                <p className="text-sm font-semibold text-brand-600">
                  {item.priceUZS.toLocaleString("ru-RU")} UZS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-800">
                <button onClick={() => updateQty(item.productSlug, item.selectedSize, item.qty - 1)}>
                  -
                </button>
                <span className="text-sm font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.productSlug, item.selectedSize, item.qty + 1)}>
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  removeItem(item.productSlug, item.selectedSize);
                  toast.push(t.toast.removed, "success");
                }}
                className="text-xs uppercase tracking-[0.2em] text-slate-500 hover:text-red-500"
              >
                {t.cart.remove}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-500">{t.cart.total}</p>
          <p className="text-2xl font-semibold text-brand-600">
            {subtotal.toLocaleString("ru-RU")} UZS
          </p>
        </div>
        <Link
          to="/checkout"
          className="rounded-full bg-brand-600 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white shadow-soft"
        >
          {t.cart.checkout}
        </Link>
      </div>
    </div>
  );
}
