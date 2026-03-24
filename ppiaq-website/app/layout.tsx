import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
})();

export const metadata: Metadata = {
  title: "PPIA Queensland",
  description: "Indonesian Student Association in Australia - Queensland Chapter",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "PPIA Queensland",
    description: "Indonesian Student Association in Australia - Queensland Chapter",
    url: "/",
    siteName: "PPIA Queensland",
    images: [
      {
        url: "/images/PPIAQ_logo.png",
        width: 1044,
        height: 1080,
        alt: "PPIA Queensland Logo",
      },
    ],
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPIA Queensland",
    description: "Indonesian Student Association in Australia - Queensland Chapter",
    images: ["/images/PPIAQ_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
