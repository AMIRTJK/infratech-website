// Технический минимум для запуска dev-сервера: Next требует корневой layout.
// Шрифты, токены темы, провайдеры и разметка появятся на этапе разработки frontend.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "infratech-website",
  description: "Сайт организации",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
