import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        // Brand — DEFAULT uses a CSS-variable so CMS / Theme Editor changes
        // propagate at runtime without a rebuild.  Opacity modifiers like
        // bg-primary/10 work because Tailwind substitutes <alpha-value>.
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          50: "#FFF1ED",
          100: "#FFD9CC",
          200: "#FFB199",
          300: "#FF8866",
          400: "#FF5933",
          500: "#FF2F01",
          600: "#CC2501",
          700: "#991C01",
          800: "#661301",
          900: "#330901",
          foreground: "#FFFFFF",
        },
        // Surface
        background: "#FFFFFF",
        surface: "#F8F8F8",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1C1C",
        },
        // Text
        foreground: "#1C1C1C",
        muted: {
          DEFAULT: "#F8F8F8",
          foreground: "#7A7A7A",
        },
        // Border
        border: "#EAEAEA",
        input: "#EAEAEA",
        ring: "#FF2F01",
        // Semantic
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        // Accent
        accent: {
          DEFAULT: "#F8F8F8",
          foreground: "#1C1C1C",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1C1C",
        },
        secondary: {
          DEFAULT: "#F8F8F8",
          foreground: "#1C1C1C",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Custom type scale for product app
        "display-2xl": ["72px", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-xl": ["60px", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["36px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["30px", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "700" }],
        "display-xs": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "12px",
        xs: "8px",
        xl: "24px",
        "2xl": "28px",
        "3xl": "32px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(28, 28, 28, 0.04)",
        sm: "0 1px 3px 0 rgba(28, 28, 28, 0.06), 0 1px 2px -1px rgba(28, 28, 28, 0.04)",
        DEFAULT: "0 4px 12px -2px rgba(28, 28, 28, 0.06), 0 2px 4px -2px rgba(28, 28, 28, 0.04)",
        md: "0 8px 24px -4px rgba(28, 28, 28, 0.08), 0 4px 8px -4px rgba(28, 28, 28, 0.04)",
        lg: "0 16px 32px -8px rgba(28, 28, 28, 0.1), 0 6px 12px -6px rgba(28, 28, 28, 0.04)",
        xl: "0 24px 48px -12px rgba(28, 28, 28, 0.12)",
        // These reference CSS variables so CMS edits apply immediately.
        card: "var(--shadow-card)",
        "card-hover": "0 16px 36px -8px rgba(255, 47, 1, 0.12), 0 8px 16px -8px rgba(28, 28, 28, 0.06)",
        primary: "var(--shadow-primary)",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
