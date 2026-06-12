import {
  Target,
  HeartHandshake,
  GraduationCap,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import type { ActivityKind } from "@/services/engagement.service";

export interface KindMeta {
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
  ringTint: string;
  /** Whether this kind tracks hours logged (CSR / Learning) */
  showHours: boolean;
  /** Label override for the "register" CTA */
  registerCta: string;
}

export const KIND_META: Record<ActivityKind, KindMeta> = {
  CHALLENGE: {
    title: "Challenges",
    description: "Time-boxed goals — join, complete, earn points.",
    icon: Target,
    tint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    ringTint: "ring-red-200",
    showHours: false,
    registerCta: "Join challenge",
  },
  CSR: {
    title: "CSR Activities",
    description: "Volunteer drives and community impact.",
    icon: HeartHandshake,
    tint: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    ringTint: "ring-green-200",
    showHours: true,
    registerCta: "Sign up",
  },
  LEARNING: {
    title: "Learning Events",
    description: "Workshops and webinars to grow your skills.",
    icon: GraduationCap,
    tint: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    ringTint: "ring-indigo-200",
    showHours: true,
    registerCta: "Register",
  },
  WELLNESS: {
    title: "Wellness Programs",
    description: "Fitness and mental-health programs.",
    icon: Dumbbell,
    tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    ringTint: "ring-emerald-200",
    showHours: false,
    registerCta: "Enroll",
  },
};
