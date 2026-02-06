import { useEffect } from "react";
import { apiStatusStore } from "../store/apiStatusStore";

export default function ApiStatusIndicator() {
  const { apiOnline, queueLength, syncQueueLength } = apiStatusStore();

  useEffect(() => {
    syncQueueLength();
  }, [syncQueueLength]);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${
          apiOnline
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
        }`}
        title={apiOnline ? "API доступен" : "Сеть offline"}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            apiOnline ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        {apiOnline ? "Online" : "Offline"}
      </span>
      {queueLength > 0 && (
        <span
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-100 px-1.5 text-xs font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
          title="Заказов в очереди на отправку"
        >
          {queueLength}
        </span>
      )}
    </div>
  );
}
