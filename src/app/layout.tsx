import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ExterroShop — Internal Marketplace",
    template: "%s · ExterroShop",
  },
  description:
    "ExterroShop is the internal marketplace for Exterro employees — buy, sell and discover items across offices.",
  applicationName: "ExterroShop",
  keywords: ["marketplace", "internal", "Exterro", "employees", "buy", "sell"],
  authors: [{ name: "Exterro" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ExterroShop — Internal Marketplace",
    description: "Buy and sell with your colleagues at Exterro.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF2F01",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
