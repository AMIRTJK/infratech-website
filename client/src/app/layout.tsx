import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers, cookies } from "next/headers";
import { detectServerLanguage } from "@shared/config/i18n";
import "@shared/styles/globals.css";


export const metadata: Metadata = {
  title: "INFRATECH — IT Solutions & Infrastructure",
  description:
    "Проектирование и разработка цифровых решений, дата-центры, IT-поддержка и аналитика для вашего бизнеса.",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const initialLang = detectServerLanguage(headerStore, cookieStore);

  return (
    <html lang={initialLang} data-lang={initialLang}>
      <body className="bg-[#080808] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
