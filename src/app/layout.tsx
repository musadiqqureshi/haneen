import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { PageLoader } from "@/components/layout/page-loader";
import { FloatingParticles } from "@/components/layout/floating-particles";
import { StoreChrome } from "@/components/layout/store-chrome";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://haneengrace.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Haneen Grace — Luxury Pret • Modest Wear",
    template: "%s | Haneen Grace",
  },
  description:
    "Haneen Grace — timeless luxury pret and modest wear. Elegant Pakistani fashion crafted for the modern woman. Shop new arrivals, festive collections and everyday luxury.",
  keywords: [
    "Haneen Grace",
    "luxury pret",
    "modest wear",
    "Pakistani fashion",
    "designer wear",
    "festive collection",
    "modest luxury",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Haneen Grace",
    title: "Haneen Grace — Luxury Pret • Modest Wear",
    description:
      "Timeless luxury pret and modest wear. Elegant Pakistani fashion crafted for the modern woman.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haneen Grace — Luxury Pret • Modest Wear",
    description:
      "Timeless luxury pret and modest wear. Elegant Pakistani fashion crafted for the modern woman.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink antialiased">
        <StoreChrome>
          <PageLoader />
          <FloatingParticles />
          <AnnouncementBar />
          <Header />
        </StoreChrome>
        <main className="relative z-10 flex-1">{children}</main>
        <StoreChrome>
          <Footer />
        </StoreChrome>
      </body>
    </html>
  );
}
