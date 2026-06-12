"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Star,
  ClipboardList,
  BarChart3,
  Target,
  HeartHandshake,
  GraduationCap,
  Dumbbell,
  Cake,
  Lightbulb,
  UsersRound,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

interface EngagementModule {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tint: string;        // icon bg/text colour classes
  live: boolean;       // false = "Coming soon", card disabled
}

const MODULES: EngagementModule[] = [
  {
    title: "Sports & Events",
    description: "Tournaments, registrations, results and gallery",
    href: "/dashboard/sports",
    icon: Trophy,
    tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    live: true,
  },
  {
    title: "Celebrations",
    description: "Birthdays, work anniversaries and wishes",
    href: "/dashboard/engagement/celebrations",
    icon: Cake,
    tint: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    live: true,
  },
  {
    title: "Rewards & Recognition",
    description: "Peer kudos, badges and leaderboards",
    href: "/dashboard/engagement/recognition",
    icon: Star,
    tint: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    live: true,
  },
  {
    title: "Polls",
    description: "Quick one-question pulse checks",
    href: "/dashboard/engagement/polls",
    icon: BarChart3,
    tint: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    live: true,
  },
  {
    title: "Surveys",
    description: "Multi-question feedback and results",
    href: "/dashboard/engagement/surveys",
    icon: ClipboardList,
    tint: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    live: true,
  },
  {
    title: "Challenges",
    description: "Time-boxed goals with leaderboards",
    href: "/dashboard/engagement/challenges",
    icon: Target,
    tint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    live: true,
  },
  {
    title: "CSR Activities",
    description: "Volunteer drives and impact tracking",
    href: "/dashboard/engagement/csr",
    icon: HeartHandshake,
    tint: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    live: true,
  },
  {
    title: "Learning Events",
    description: "Workshops, webinars and materials",
    href: "/dashboard/engagement/learning",
    icon: GraduationCap,
    tint: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    live: true,
  },
  {
    title: "Wellness Programs",
    description: "Fitness and mental-health programs",
    href: "/dashboard/engagement/wellness",
    icon: Dumbbell,
    tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    live: true,
  },
  {
    title: "Suggestions & Ideas",
    description: "Idea box with upvotes and status",
    href: "/dashboard/engagement/ideas",
    icon: Lightbulb,
    tint: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    live: true,
  },
  {
    title: "Clubs & Communities",
    description: "Interest groups and club feeds",
    href: "/dashboard/engagement/clubs",
    icon: UsersRound,
    tint: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    live: false,
  },
];

export function EngagementHubView() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Engagement"
        description="Build culture: recognition, events, wellbeing and community."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const card = (
            <div
              className={
                "group h-full rounded-2xl border border-border bg-card p-5 transition-all " +
                (m.live
                  ? "hover:border-primary/40 hover:shadow-md"
                  : "opacity-60")
              }
            >
              <div className="flex items-start justify-between">
                <div className={"flex size-11 items-center justify-center rounded-xl " + m.tint}>
                  <Icon className="size-5" />
                </div>
                {m.live ? (
                  <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Soon
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            </div>
          );

          return m.live ? (
            <Link key={m.href} href={m.href}>
              {card}
            </Link>
          ) : (
            <div key={m.href} aria-disabled className="cursor-not-allowed">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
