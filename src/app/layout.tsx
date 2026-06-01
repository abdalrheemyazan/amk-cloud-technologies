import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AMK Cloud Technologies",
  description: "פתרונות ענן ותמיכה חכמה לעסקים",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

import GlobalBackground from "@/components/layout/GlobalBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-heebo bg-[#F8FAFC] text-[#0F172A] antialiased min-h-screen selection:bg-blue-500/10`}>
        <SessionProvider>
          <GlobalBackground />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
