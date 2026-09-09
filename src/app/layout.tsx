import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { ScreenAssistantBot } from "@/components/shared/screen-assistant-bot";

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "MediKiosk — AI Clinical Intake Platform | Ministry of Ayush",
  description: "Next-generation multimodal clinical intake and medical document digitization station for the All India Institute of Ayurveda (AIIA) and national hospital OPDs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediKiosk"
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FBFDFD] text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
        <ServiceWorkerRegister />
        <main className="flex-1 flex flex-col">{children}</main>
        <ScreenAssistantBot />
      </body>
    </html>
  );
}
