import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Боевой сервер без доступа в интернет: сборка кладёт в .next/standalone только нужные для
  // запуска файлы и зависимости, и эту папку целиком переносят на сервер (docs/DEPLOY.md).
  output: "standalone",

  // В репозитории несколько package-lock.json (корень-оркестратор, client, server).
  // Без явного корня Next выбирает корневой lock-файл и предупреждает об этом на каждом старте.
  // Скрипты всегда запускают Next из client — эта директория и есть корень приложения.
  outputFileTracingRoot: process.cwd(),

  // Строгий режим типов и линта на сборке: регресс должен падать здесь, а не на проде.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  images: {
    // AVIF первым: он тяжелее кодируется, но заметно легче отдаётся (см. PERFORMANCE.md §11).
    formats: ["image/avif", "image/webp"],
    // Внешние источники изображений добавляются сюда явным списком, когда появятся.
    remotePatterns: [],
  },

  experimental: {
    // Точечные импорты вместо барелей — иконки не должны попадать в бандл целиком.
    optimizePackageImports: ["lucide-react"],
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
