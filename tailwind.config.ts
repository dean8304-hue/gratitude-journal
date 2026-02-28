import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },
        warm: {
          50: "#FFFBF5",
          100: "#FFF7EB",
          200: "#FFEFD6",
          300: "#FFE4BD",
          400: "#FFD699",
          500: "#FFC875",
          600: "#E6A84D",
          700: "#CC8A2E",
          800: "#A66E1A",
          900: "#80540D",
        },
        accent: {
          50: "#FFF5F0",
          100: "#FFEDE5",
          200: "#FFD6C7",
          300: "#FFBFA8",
          400: "#FFA07A",
          500: "#FF7F50",
          600: "#E6663A",
          700: "#CC4D28",
          800: "#A63A1A",
          900: "#802D12",
        },
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-kr)", "Noto Serif KR", "Georgia", "Noto Serif", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
