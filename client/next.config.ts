import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

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
