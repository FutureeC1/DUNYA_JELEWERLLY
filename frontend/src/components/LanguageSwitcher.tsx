import { useUiStore } from '../store/uiStore';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useUiStore();
  
  return (
    <div className="flex gap-2 p-2">
      <button
        onClick={() => setLocale('uz')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          locale === 'uz' 
            ? 'bg-luxury-600 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🇺🇿 O'zbek
      </button>
      <button
        onClick={() => setLocale('ru')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          locale === 'ru' 
            ? 'bg-luxury-600 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🇷🇺 Русский
      </button>
    </div>
  );
}
