import { useI18n } from "../utils/useI18n";

const TG_USERNAME = import.meta.env.VITE_TELEGRAM_USERNAME || "dunya_jewellryad";

export default function Footer() {
  const t = useI18n();

  return (
    <footer className="border-t border-slate-200/60 py-10 text-center text-sm text-slate-500 dark:border-slate-800/70">
      <p>{t.footer}</p>
      {TG_USERNAME && (
        <a
          href={`https://t.me/${TG_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-brand-600 hover:underline dark:text-brand-400"
        >
          Telegram: @{TG_USERNAME}
        </a>
      )}
    </footer>
  );
}
