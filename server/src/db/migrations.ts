import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TDatabase } from "./connection.js";

// Сборка копирует *.sql в dist/db/migrations, поэтому путь вычисляется от текущего файла.
const MIGRATIONS_DIR = fileURLToPath(new URL("./migrations/", import.meta.url));
const MIGRATION_FILE_PATTERN = /^\d{3}_.+\.sql$/;

/** Применяет ещё не применённые миграции одной транзакцией; возвращает их имена. */
export const runMigrations = (db: TDatabase, dir: string = MIGRATIONS_DIR): string[] => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);

  const applied = new Set(db.prepare("SELECT name FROM schema_migrations").pluck().all().map(String));
  const pending = readdirSync(dir)
    .filter((file) => MIGRATION_FILE_PATTERN.test(file) && !applied.has(file))
    .sort();

  const markApplied = db.prepare("INSERT INTO schema_migrations (name) VALUES (?)");
  db.transaction(() => {
    for (const file of pending) {
      db.exec(readFileSync(path.join(dir, file), "utf8"));
      markApplied.run(file);
    }
  })();

  return pending;
};
