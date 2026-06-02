import type { Metadata } from "next";
import { Bungee, Oxanium } from "next/font/google";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const oxanium = Oxanium({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Meme Ninja · Cursor Madrid Hack #3",
  description: "Corta memes con tus manos — LibreYOLO pose + Canvas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bungee.variable} ${oxanium.variable} h-full`}>
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}
