import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { useUiStore } from "../store/uiStore";
import { submitOrder } from "../utils/api";
import { useI18n } from "../utils/useI18n";

export default function Checkout() {
  const { items, clear } = useCartStore();
  const { locale, theme } = useUiStore();
  const toast = useToastStore();
  const t = useI18n();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    comment: "",
    telegramUsername: ""
  });
  const [status, setStatus] = useState<"idle" | "sent" | "queued" | "failed">("idle");

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-800">
        {t.cart.empty}
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.push(t.toast.formError, "error");
      return;
    }
    const result = await submitOrder({
      customer_name: form.name,
      phone: form.phone,
      address: form.address,
      comment: form.comment,
      telegram_username: form.telegramUsername,
      items: items.map((item) => ({
        product_slug: item.productSlug,
        size: item.selectedSize,
        qty: item.qty
      })),
      meta: { locale, theme }
    });
    if (result.ok) {
      setStatus("sent");
      clear();
    } else if (result.queued) {
      setStatus("queued");
      clear();
    } else {
      toast.push(t.toast.orderError, "error");
    }
  };

  if (status !== "idle") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200/60 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900"
      >
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">
          {status === "queued" ? t.checkout.orderQueued : t.checkout.success}
        </p>
        {status === "sent" && (
          <p className="mt-4 text-slate-500 dark:text-slate-400">{t.checkout.successSubtitle}</p>
        )}
        {status === "failed" && (
          <p className="mt-4 text-sm text-amber-500">{t.checkout.telegramFailed}</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          {t.checkout.title}
        </h1>
        <div className="grid gap-4">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={t.checkout.name}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          />
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder={t.checkout.phone}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          />
          <input
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder={t.checkout.address}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          />
          <input
            value={form.telegramUsername}
            onChange={(event) => setForm({ ...form, telegramUsername: event.target.value })}
            placeholder="Telegram username (без @)"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          />
          <textarea
            value={form.comment}
            onChange={(event) => setForm({ ...form, comment: event.target.value })}
            placeholder={t.checkout.comment}
            className="min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="rounded-full bg-brand-600 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white shadow-soft"
        >
          {t.checkout.placeOrder}
        </button>
      </div>
      <div className="space-y-4 rounded-3xl border border-slate-200/60 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t.cart.title}
        </h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.productSlug}-${item.selectedSize}`} className="flex items-center gap-3">
              <img src={item.imageUrl} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {item.selectedSize} • {item.qty}x
                </p>
              </div>
              <p className="text-sm font-semibold text-brand-600">
                {(item.priceUZS * item.qty).toLocaleString("ru-RU")} UZS
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
