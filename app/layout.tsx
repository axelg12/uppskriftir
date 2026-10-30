import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Inter } from "next/font/google";
import { getFilterGroups, getRecipes } from "@/lib/recipes";
import { Sidebar, SidebarWithParams } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: { default: "Matur · Uppskriftir", template: "%s · Matur" },
  description: "Uppáhalds uppskriftirnar mínar",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const groups = getFilterGroups();
  const total = getRecipes().length;
  return (
    <html lang="is" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body className="font-sans">
        <div className="lg:flex">
          <Suspense fallback={<Sidebar groups={groups} total={total} active={null} />}>
            <SidebarWithParams groups={groups} total={total} />
          </Suspense>
          <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
