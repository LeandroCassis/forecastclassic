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
      // You can add more font families here, but ensure they align with the Spotify aesthetic.
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#121212", // Dark gray for background, very close to Spotify's
        foreground: "#FFFFFF", // White for text
        table: {
          header: "#212121", // Slightly darker gray for table headers
          row: "#181818", // Darker gray for table rows
          altRow: "#181818",// Darker gray for alternate table rows
          border: "#333333" // Dark gray for borders
        },
        // Spotify's primary green color. This could be adjusted based on your specific needs.
        primary: {
          DEFAULT: "#1DB954",
          foreground: "#FFFFFF", // White for text
        },
        secondary: {
          DEFAULT: "#121212", // A very dark gray, almost black.
          foreground: "#FFFFFF",
        },
        // Adjust these colors as needed based on your specific design choices.
        // They should be chosen to create a good contrast with the dark theme.
        destructive: {
          DEFAULT: "#DA3333",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1E1E1E", // Darker gray for muted text or components
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#1DB954",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#212121", // Darker gray for popovers
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#121212", // Dark gray for cards
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Keyframes and animations aligned with Spotify's aesthetic.
      // The keyframes and animations are for elements like accordion.
      // Spotify might use slightly different animation styles, so tweak these to match.
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
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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