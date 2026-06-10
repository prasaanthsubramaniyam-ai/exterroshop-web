"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirects to the combined Registrations page pre-filtered to Volunteers.
 * The combined page lives at /dashboard/sports/hr/participants and handles
 * both Participant and Volunteer tabs with filter, search and export.
 */
export default function VolunteersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/sports/hr/participants?type=VOLUNTEER");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="size-5 animate-spin mr-2" />
      Redirecting…
    </div>
  );
}
