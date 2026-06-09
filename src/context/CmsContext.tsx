"use client";

/**
 * CmsContext — loads /cms/public/map once on mount and makes all
 * public CMS key→value pairs available to every component via useCms().
 *
 * Usage:
 *   const { cms, ready } = useCms();
 *   const title = cms("banner.hero.title", "Find what you need");
 */

import * as React from "react";
import { cmsService } from "@/services/cms.service";

/** Parse a 3- or 6-digit hex string into space-separated RGB channels.
 *  Returns null for invalid input.
 *  e.g. "#FF2F01" → "255 47 1"  (the format Tailwind needs for opacity modifiers)
 */
function hexToRgbChannels(hex: string): string | null {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return `${r} ${g} ${b}`;
}

interface CmsCtx {
  /** Get a CMS value by key, with an optional fallback. */
  cms: (key: string, fallback?: string) => string;
  /** true once the initial fetch has completed (success or error). */
  ready: boolean;
  /** Re-fetch from the server (call after admin saves changes). */
  reload: () => Promise<void>;
}

const CmsContext = React.createContext<CmsCtx>({
  cms: (_key, fallback = "") => fallback,
  ready: false,
  reload: async () => {},
});

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = React.useState<Record<string, string>>({});
  const [ready, setReady] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await cmsService.getPublicMap();
      setMap(data);
      // Sync CSS custom properties so every Tailwind class that references
      // a CSS variable picks up CMS changes without a page reload.
      if (typeof document !== "undefined") {
        const set = (prop: string, val: string | undefined) => {
          if (val) document.documentElement.style.setProperty(prop, val);
        };

        // Primary color — also set the RGB channels Tailwind needs for
        // opacity modifiers like bg-primary/10.
        const primaryHex = data["theme.color.primary"];
        if (primaryHex) {
          set("--color-primary", primaryHex);
          const rgb = hexToRgbChannels(primaryHex);
          if (rgb) set("--color-primary-rgb", rgb);
        }
        set("--color-primary-dark",  data["theme.color.primary-dark"]);
        set("--color-primary-light", data["theme.color.primary-light"]);

        // Shadows (Tailwind's shadow-primary and shadow-card reference these vars)
        set("--shadow-primary", data["theme.button-shadow"]);
        set("--shadow-card",    data["theme.card-shadow"]);
      }
    } catch {
      // silently fall back to defaults — app still works
    } finally {
      setReady(true);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const cms = React.useCallback(
    (key: string, fallback = "") => map[key] ?? fallback,
    [map]
  );

  const value = React.useMemo<CmsCtx>(
    () => ({ cms, ready, reload: load }),
    [cms, ready, load]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  return React.useContext(CmsContext);
}
