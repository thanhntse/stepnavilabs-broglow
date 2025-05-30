import { apiConfig } from "@/config/api";
import { ImageProvider } from "@/context/image-context";
import { LanguageProvider } from "@/context/language-context";
import { UserProvider } from "@/context/profile-context";
import type { Metadata } from "next";
import "./globals.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-green/theme.css";
import { RouteGuard } from "./(auth)/components/route-guard";

export const metadata: Metadata = {
  title: apiConfig.appName,
  description: "Hausto AI Content Generator",
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
              <RouteGuard>{children}</RouteGuard>
            </ImageProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
