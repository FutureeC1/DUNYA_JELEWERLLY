/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f0ff",
          100: "#cce0ff",
          200: "#99c2ff",
          300: "#66a3ff",
          400: "#3385ff",
          500: "#0066ff", // Primary Blue
          600: "#0052cc",
          700: "#003d99",
          800: "#002966",
          900: "#001433",
          950: "#020410", // Deepest background
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.12)",
      }
    }
  },
  plugins: []
};
