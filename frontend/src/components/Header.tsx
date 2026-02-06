import { NavLink } from "react-router-dom";
import ApiStatusIndicator from "./ApiStatusIndicator";
import { useCartStore } from "../store/cartStore";
import { useUiStore } from "../store/uiStore";
import { useI18n } from "../utils/useI18n";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm uppercase tracking-[0.2em] transition ${isActive ? "text-brand-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
  }`;

export default function Header() {
  const { toggleTheme, theme, toggleLocale, locale } = useUiStore();
  const items = useCartStore((state) => state.items);
  const t = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <NavLink to="/" className="text-lg font-semibold tracking-[0.3em] text-brand-600">
          {t.brand}
        </NavLink>
        <nav className="hidden gap-6 md:flex">
          <NavLink to="/" className={navLinkClass}>
            {t.nav.home}
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            {t.nav.catalog}
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            {t.nav.cart}
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <ApiStatusIndicator />
          <button
            onClick={toggleLocale}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200"
          >
            {locale.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <NavLink
            to="/cart"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200"
          >
            {t.nav.cart} ({items.length})
          </NavLink>
        </div>
      </div>
    </header>
  );
}
