import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#121212",
        foreground: "#FFFFFF",
        table: {
          header: "#212121",
          row: "#181818",
          altRow: "#181818",
          border: "#333333"
        },
        primary: {
          DEFAULT: "#1DB954",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#121212",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DA3333",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1E1E1E",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#1DB954",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#212121",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#121212",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;