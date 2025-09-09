import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import NextAuthSessionProvider from "@/components/providers/session-provider";
import Script from "next/script";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Tunalismus – Learn Languages the Human Way",
  description:
    "Tunalismus is a modern, kind, and real-life-focused space to learn languages – guided by Sema in Hyderabad, India. Discover courage, culture, and connection.",
  keywords: [
    "Tunalismus",
    "Language Learning",
    "German Teacher",
    "Turkish Teacher",
    "English Teacher",
    "Hyderabad",
    "Sema",
    "Learn German",
    "Learn Turkish",
    "Learn English",
  ],
  author: "Sema – Founder of Tunalismus",
  openGraph: {
    title: "Tunalismus – Learn Languages the Human Way",
    description:
      "A space for learning languages in a way that feels human, personal, and real. Created by Sema, a multilingual connector and educator.",
    url: "https://tunalismus.vercel.app",
    siteName: "Tunalismus",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tunalismus – Learn Languages the Human Way",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  metadataBase: "https://tunalismus.vercel.app"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.className} antialiased`} suppressHydrationWarning>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <NextAuthSessionProvider>
            {children}
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
