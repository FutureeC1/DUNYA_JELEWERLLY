import { Link } from "react-router-dom";
import { useI18n } from "../utils/useI18n";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useI18n();

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
      {/* Home */}
      <Link
        to="/"
        className="hover:text-brand-500 transition-colors flex items-center"
      >
        <span className="mr-1">🏠</span>
        {t.breadcrumbs.home}
      </Link>

      {/* Separator */}
      <span className="text-slate-400">/</span>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-brand-500 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
          
          {/* Add separator if not last item */}
          {index < items.length - 1 && (
            <span className="ml-2 text-slate-400">/</span>
          )}
        </div>
      ))}
    </nav>
  );
}
