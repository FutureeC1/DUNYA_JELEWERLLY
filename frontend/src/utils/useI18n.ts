import ru from "../i18n/ru";
import uz from "../i18n/uz";
import { useUiStore } from "../store/uiStore";

export type Messages = typeof ru;

const messages = { ru, uz };

export const useI18n = () => {
  const locale = useUiStore((state) => state.locale);
  return messages[locale];
};
