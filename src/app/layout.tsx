import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codeforces Practice Tracker | Gamified Learning",
  description: "Track your Codeforces practice with XP, levels, achievements, and daily streaks. A gamified approach to competitive programming mastery.",
  keywords: ["Codeforces", "Competitive Programming", "Gamification", "XP", "Achievements", "Practice Tracker", "Algorithm"],
  authors: [{ name: "CF Practice Tracker" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Codeforces Practice Tracker",
    description: "Gamified competitive programming practice tracker",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white min-h-screen`}
      >
        {children}
        <Analytics/>
        <Toaster />
      </body>
    </html>
  );
}
