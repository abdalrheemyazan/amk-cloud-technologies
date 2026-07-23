import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { ACCESSIBILITY_BOOTSTRAP_SCRIPT } from "@/lib/accessibility-settings";

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
import AccessibilityWidget from "@/components/accessibility/AccessibilityWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${heebo.variable} font-heebo bg-[#F8FAFC] text-[#0F172A] antialiased min-h-screen selection:bg-blue-500/10`}>
        <Script
          id="amk-accessibility-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_BOOTSTRAP_SCRIPT }}
        />
        <SessionProvider>
          <AccessibilityWidget>
            <GlobalBackground />
            {children}
          </AccessibilityWidget>
        </SessionProvider>
      </body>
    </html>
  );
}
