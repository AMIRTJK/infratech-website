import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * Правило слоёв FSD (AGENTS.md §4): импорт разрешён только вниз.
 * app -> views -> widgets -> features -> entities -> shared
 */
const layerRule = (layer, forbidden) => ({
  files: [`src/${layer}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: forbidden.map((alias) => ({
          group: [`${alias}/*`, alias],
          message: `Импорт вверх по слоям запрещён: ${layer} не может зависеть от ${alias}.`,
        })),
      },
    ],
  },
});

const eslintConfig = [
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"] },

  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },

  layerRule("shared", ["@app", "@views", "@widgets", "@features", "@entities"]),
  layerRule("entities", ["@app", "@views", "@widgets", "@features"]),
  layerRule("features", ["@app", "@views", "@widgets"]),
  layerRule("widgets", ["@app", "@views"]),
  layerRule("views", ["@app"]),
];

export default eslintConfig;
