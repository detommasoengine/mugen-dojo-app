import type { Metadata } from "next";
import { Zen_Old_Mincho, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Display — mincho di radice giapponese, usato con misura
const zenMincho = Zen_Old_Mincho({
  variable: "--font-zen-mincho",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Body — umanista, buon supporto diacritici italiani
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Dati/Monte Ore — ledger di precisione
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "MugenDojo · Amministrazione",
  description: "Pannello di gestione del Dojo di Aikido",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${zenMincho.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
