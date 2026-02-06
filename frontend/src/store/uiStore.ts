import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type LocaleMode = "ru" | "uz";

interface UiState {
  theme: ThemeMode;
  locale: LocaleMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLocale: (locale: LocaleMode) => void;
  toggleLocale: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "light",
      locale: "ru",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "light" ? "dark" : "light" }),
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "ru" ? "uz" : "ru" })
    }),
    {
      name: "dunya-ui"
    }
  )
);
