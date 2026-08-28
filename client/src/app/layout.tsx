import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Syncopate, Unbounded } from "next/font/google";
import "@shared/styles/globals.css";

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "INFRATECH — IT Solutions & Infrastructure",
  description:
    "Проектирование и разработка цифровых решений, дата-центры, IT-поддержка и аналитика для вашего бизнеса.",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ru" className={`${syncopate.variable} ${unbounded.variable}`}>
      <body className="bg-[#080808] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
