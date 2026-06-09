import Cookies from "js-cookie";
import { STORAGE_KEYS } from "@/constants";

/**
 * Token storage — uses HTTP-friendly cookies so middleware on the server side
 * can read them for SSR route protection. SameSite=Lax to prevent CSRF on
 * cross-site GETs while allowing top-level navigations.
 */

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 7,
  sameSite: "lax",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  path: "/",
};

export const tokenStorage = {
  getAccessToken: (): string | undefined =>
    Cookies.get(STORAGE_KEYS.ACCESS_TOKEN),

  getRefreshToken: (): string | undefined =>
    Cookies.get(STORAGE_KEYS.REFRESH_TOKEN),

  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, COOKIE_OPTS);
    Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, COOKIE_OPTS);
  },

  setAccessToken: (accessToken: string) => {
    Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, COOKIE_OPTS);
  },

  clear: () => {
    Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN, { path: "/" });
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN, { path: "/" });
  },
};
