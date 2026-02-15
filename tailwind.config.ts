import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tocBg: "#0B0D10",
      }
    },
  },
  plugins: [],
} satisfies Config;
