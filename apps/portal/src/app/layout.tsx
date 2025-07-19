import { ImageProvider } from "@/context/image-context";
import { LanguageProvider } from "@/context/language-context";
import { UserProvider } from "@/context/profile-context";
import type { Metadata } from "next";
import "./globals.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { RouteGuard } from "./(auth)/components/route-guard";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "BroGlow - AI-Powered Men's Skincare | Level Up Your Skin Game",
  description: "Revolutionary AI skincare app designed specifically for men. Get personalized skin analysis, smart product recommendations, and track your progress. Transform your skin with science-backed routines that actually work.",
  keywords: "men's skincare, AI skin analysis, skincare app, male grooming, personalized skincare, skin tracking, men's beauty",
  openGraph: {
    title: "BroGlow - AI-Powered Men's Skincare",
    description: "Revolutionary AI skincare designed specifically for men. Scan, track, and transform your skin with personalized recommendations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BroGlow - AI-Powered Men's Skincare",
    description: "Revolutionary AI skincare designed specifically for men. Scan, track, and transform your skin with personalized recommendations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="custom-scrollbar">
        <UserProvider>
          <LanguageProvider>
            <ImageProvider>
              <RouteGuard>
                <Header
                  variant="default"
                  logoSrc="/broglow-logo.png"
                />
                {children}
              </RouteGuard>
            </ImageProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
