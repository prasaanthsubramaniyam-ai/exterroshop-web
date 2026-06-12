/**
 * Tint slugs used by clubs.color. Keeps a single source-of-truth mapping
 * between the backend's color slug and the Tailwind classes the UI uses.
 */
export const CLUB_COLORS = [
  { slug: "blue",   tint: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { slug: "green",  tint: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { slug: "red",    tint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  { slug: "amber",  tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { slug: "indigo", tint: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { slug: "purple", tint: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { slug: "pink",   tint: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  { slug: "teal",   tint: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
] as const;

export function clubTint(color: string): string {
  return CLUB_COLORS.find((c) => c.slug === color)?.tint ?? CLUB_COLORS[0].tint;
}

export const SUGGESTED_ICONS = ["🎯", "💡", "🎨", "📚", "🏃", "🎸", "🍳", "♟️", "🎮", "🌱", "📷", "🧘", "🍿", "✈️", "🎤", "🎲"];
