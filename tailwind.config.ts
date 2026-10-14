import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        brand: ["var(--font-playfair)", "serif"],
        heading: ["var(--font-lora)", "serif"],
        sans: ["var(--font-be-vietnam)", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#FFFDF8",  // Trắng ngà (Input, card nổi)
          100: "#F8F0E5", // Be kem chủ đạo (Background chính)
          200: "#EFE0CE", // Be sữa (Khối nội dung, card phụ)
          300: "#E5D0BA",
          400: "#D6BDA5", // Be caramel (Đường viền, họa tiết hoa)
        },
        latte: {
          500: "#B8977E",
          600: "#A68165", // Nâu sữa (Nút bấm CTA, icon tương tác)
          700: "#8E6D54", // Nâu sữa hover
          800: "#725541", // Nâu cacao đậm (Tiêu đề, chữ chính)
          900: "#573E2E",
        },
        rose: {
          50: "#FDF8F6",
          100: "#F8EBE6", // Hồng phấn nhẹ nhàng
          200: "#EED7D0",
        },
        shopee: {
          DEFAULT: "#EE4D2D",
          hover: "#d73211",
          light: "#FFF5F1",
          dark: "#2A1810",
        },
        cyber: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(114, 85, 65, 0.08), 0 2px 6px -1px rgba(114, 85, 65, 0.04)",
        "warm-lg": "0 10px 30px -4px rgba(114, 85, 65, 0.12), 0 4px 12px -2px rgba(114, 85, 65, 0.06)",
        "warm-btn": "0 6px 20px -2px rgba(166, 129, 101, 0.35)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
