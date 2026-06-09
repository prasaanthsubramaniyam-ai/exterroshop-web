/**
 * Design tokens — single source of truth for colors, spacing, typography.
 * Mirrors the mobile app's theme system for cross-platform consistency.
 */

export const colors = {
  primary: "#FF2F01",
  primaryHover: "#E32A01",
  primarySoft: "#FFF1ED",
  background: "#FFFFFF",
  surface: "#F8F8F8",
  textPrimary: "#1C1C1C",
  textSecondary: "#7A7A7A",
  textTertiary: "#A8A8A8",
  border: "#EAEAEA",
  borderStrong: "#D4D4D4",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  favoriteActive: "#FF2F01",
  favoriteInactive: "#7A7A7A",
} as const;

export const radius = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  full: "9999px",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  base: "16px",
  lg: "20px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
  "4xl": "64px",
} as const;

export const shadow = {
  sm: "0 1px 3px 0 rgba(28, 28, 28, 0.06), 0 1px 2px -1px rgba(28, 28, 28, 0.04)",
  card: "0 2px 8px -2px rgba(28, 28, 28, 0.06), 0 1px 3px -1px rgba(28, 28, 28, 0.04)",
  cardHover:
    "0 16px 36px -8px rgba(255, 47, 1, 0.12), 0 8px 16px -8px rgba(28, 28, 28, 0.06)",
} as const;

export type ThemeColors = typeof colors;
