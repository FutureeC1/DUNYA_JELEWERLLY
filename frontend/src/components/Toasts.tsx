import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useToastStore } from "../store/toastStore";

export default function Toasts() {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => remove(toast.id), 3200)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-2xl px-4 py-3 text-sm shadow-soft ${toast.type === "success"
                ? "bg-brand-600 text-white"
                : "bg-red-500 text-white"
              }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
