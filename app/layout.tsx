import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UFCU — It all starts with u",
  description:
    "Open an account with University Federal Credit Union. Six steps, about six minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
