import { useI18n } from "../utils/useI18n";

export default function Footer() {
  const t = useI18n();

  return (
    <footer className="border-t border-slate-200/60 py-10 text-center text-sm text-slate-500 dark:border-slate-800/70">
      {t.footer}
    </footer>
  );
}
