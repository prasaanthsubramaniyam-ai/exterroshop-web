import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { STORAGE_KEYS } from "@/constants";

/**
 * Root entry — redirect server-side based on auth cookie.
 * Eliminates client flash and is far faster than a useEffect redirect.
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STORAGE_KEYS.ACCESS_TOKEN);
  redirect(token ? "/dashboard" : "/login");
}
