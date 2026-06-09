import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merging — used by all Shadcn primitives */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
