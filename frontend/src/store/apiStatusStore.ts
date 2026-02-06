import { create } from "zustand";
const QUEUE_KEY = "orders_queue_v1";

export interface ApiStatusStore {
  apiOnline: boolean;
  queueLength: number;
  syncQueueLength: () => void;
  setApiOnline: (v: boolean) => void;
}

export const apiStatusStore = create<ApiStatusStore>((set) => ({
  apiOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  queueLength: 0,

  syncQueueLength: () => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      set({ queueLength: Array.isArray(arr) ? arr.length : 0 });
    } catch {
      set({ queueLength: 0 });
    }
  },

  setApiOnline: (v) => set({ apiOnline: v }),
}));

if (typeof window !== "undefined") {
  apiStatusStore.getState().syncQueueLength();
  window.addEventListener("orders-queue-changed", () =>
    apiStatusStore.getState().syncQueueLength()
  );
  window.addEventListener("online", () => apiStatusStore.getState().setApiOnline(true));
  window.addEventListener("offline", () => apiStatusStore.getState().setApiOnline(false));
}
