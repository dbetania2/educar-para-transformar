import { DynamicDocumentTitle } from "@/components/atoms/DynamicDocumentTitle/DynamicDocumentTitle";
import { defaultData } from "@/hooks/useStaticData";
import { EmotionRegistry } from "@/lib/emotion/registry";
import { AppProvider } from "@/lib/Provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: defaultData.site.name,
  description: defaultData.site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <DynamicDocumentTitle />
        <EmotionRegistry>
          <AppProvider>
            {children}
          </AppProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
