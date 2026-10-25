// Ручное применение миграций (npm run db:migrate). Сервер применяет их и сам при старте.
import { loadConfig } from "../config/config.js";
import { openDatabase, runMigrations } from "./index.js";

const config = loadConfig();
const db = openDatabase(config.databasePath);
const applied = runMigrations(db);
db.close();

process.stdout.write(
  applied.length > 0 ? `Применены миграции: ${applied.join(", ")}\n` : "Новых миграций нет\n",
);
