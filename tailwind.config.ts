import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          DEFAULT: "#f6f2ec",
          200: "#e7dfd5",
        },
        ink: {
          900: "#111111",
          800: "#1d1d1d",
          700: "#2e2e2e",
          600: "#4a4a4a",
          500: "#6a6a6a",
          400: "#8a8a8a",
          200: "#d4d4d4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
