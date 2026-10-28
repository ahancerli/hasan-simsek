import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        // Orijinal sitenin sarı/antrasit inşaat teması (#fdc236)
        brand: { DEFAULT: "#fdc236", 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fdc236", 500: "#f5a60b", 600: "#d98206", 700: "#b45f09" },
        ink: { DEFAULT: "#1b1d21", 800: "#24272c", 700: "#2e3238", 600: "#4a4f57", 500: "#6b7280", 300: "#cfd3d9", 100: "#f3f4f6" },
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "var(--font-heebo)", "sans-serif"],
      },
      boxShadow: { card: "0 10px 30px -12px rgba(0,0,0,.25)" },
      keyframes: { kenburns: { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.08)" } } },
    },
  },
  plugins: [typography],
};
export default config;
