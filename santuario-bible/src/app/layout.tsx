import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  title: "Santuario · Biblia",
  description: "Lectura diaria de las Escrituras, íntegra y verificada.",
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
