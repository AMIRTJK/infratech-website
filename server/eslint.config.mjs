import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "data/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      // Логи идут через структурный логгер Fastify (pino), а не через console — см. server/PERFORMANCE.md §10.
      "no-console": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },

  {
    // Слой доступа к данным — единственное место, где допустим SQL (AGENTS.md §6).
    files: ["src/**/*.controller.ts", "src/**/*.service.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["better-sqlite3", "**/db/**"],
              message: "Доступ к базе — только из *.repository.ts.",
            },
            {
              group: ["nodemailer"],
              message: "Отправка писем — только через модуль mail/.",
            },
          ],
        },
      ],
    },
  },
);
