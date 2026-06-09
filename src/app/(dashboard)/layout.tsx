import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { AuthGate } from "./AuthGate";
import { CmsProvider } from "@/context/CmsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CmsProvider>
      <AuthGate>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
            <AnnouncementBar />
            <Header />
            <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-8">
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
          <BottomNav />
        </div>
      </AuthGate>
    </CmsProvider>
  );
}
