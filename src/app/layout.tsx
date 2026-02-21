import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import UpdateBanner from "@/components/common/UpdateBanner";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F59E0B",
};

export const metadata: Metadata = {
  title: "감사일기",
  description: "매일 감사한 일을 기록하는 일기장",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "감사일기",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <UpdateBanner />
        {children}
      </body>
    </html>
  );
}
