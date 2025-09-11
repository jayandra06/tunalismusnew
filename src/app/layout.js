import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import NextAuthSessionProvider from "@/components/providers/session-provider";
import { Toaster } from "sonner";
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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-M89CJD2F');
            `,
          }}
        />
      </head>
      <body className={`${bricolage.className} antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-M89CJD2F"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
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
            <Toaster position="top-right" richColors />
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
