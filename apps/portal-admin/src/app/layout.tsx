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
  title: "BroGlow Admin Portal - Manage Your Skincare Platform",
  description: "Admin portal for BroGlow - Manage users, products, content, analytics, and platform operations. Complete administrative control for the AI-powered men's skincare platform.",
  keywords: "admin portal, BroGlow admin, platform management, user management, content management, analytics dashboard",
  openGraph: {
    title: "BroGlow Admin Portal",
    description: "Complete administrative control for the BroGlow skincare platform. Manage users, content, and operations.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: '/broglow-logo.png',
        width: 1200,
        height: 630,
        alt: 'BroGlow Admin Portal'
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BroGlow Admin Portal",
    description: "Complete administrative control for the BroGlow skincare platform. Manage users, content, and operations.",
    images: ['/broglow-logo.png']
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
                  variant="admin"
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
