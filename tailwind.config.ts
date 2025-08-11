import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B38E5D", // gold
          gold: "#B38E5D",
          navy: "#19202A",
          cream: "#F4F1EC",
          white: "#FFFFFF",
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
