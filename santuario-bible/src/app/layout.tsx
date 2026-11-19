import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import { UsageTracker } from "@/components/UsageTracker";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Santuario Bíblico · Palabra diaria",
  description: "Lectura diaria de las Escrituras, íntegra y verificada.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "es_CL",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Santuario Bíblico · Palabra diaria" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Santuario" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1917" },
  ],
};

/** Aplica el tema guardado antes del primer pintado para evitar parpadeo día/noche. */
const THEME_BOOT = `try{var s=JSON.parse(localStorage.getItem('santuario_user_state_v1')||'{}');if(s.darkMode)document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <PwaRegistrar />
        <UsageTracker />
        <Analytics />
      </body>
    </html>
  );
}
