import "./globals.css";
import type { Metadata } from "next";
import BottomTabs from "@/components/BottomTabs";

export const metadata: Metadata = {
  title: "LSA Wisconsin - Tournament of Champions",
  description: "Tournament companion app for LSA Wisconsin - Tournament of Champions",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-splatter">
        <div className="mx-auto w-full max-w-md min-h-dvh px-4 pt-4 pb-24">
          {children}
        </div>
        <BottomTabs />
      </body>
    </html>
  );
}
