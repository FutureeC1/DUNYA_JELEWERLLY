import { Link } from "react-router-dom";
import { useI18n } from "../utils/useI18n";

export default function NotFound() {
  const t = useI18n();

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-500 dark:border-slate-800">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t.notFound.title}
      </h1>
      <Link
        to="/"
        className="rounded-full bg-brand-600 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white shadow-soft"
      >
        {t.notFound.back}
      </Link>
    </div>
  );
}
