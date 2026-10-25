// Выгрузка заявок в CSV для Excel: node dist/app/export-requests.js <путь к файлу>.
// Нужна, пока почта не настроена или сервер не может достучаться до SMTP, — заявки видны только в базе.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "../config/config.js";
import { openDatabase, runMigrations } from "../db/index.js";
import { contactRequestsToCsv, createContactsRepository } from "../modules/contacts/index.js";

const PREVIEW_COUNT = 5;

const outputPath = path.resolve(process.argv[2] ?? "requests.csv");
const config = loadConfig();
const db = openDatabase(config.databasePath);
runMigrations(db);
const requests = createContactsRepository(db).listAll();
db.close();

writeFileSync(outputPath, contactRequestsToCsv(requests), "utf8");

const preview = requests
  .slice(0, PREVIEW_COUNT)
  .map(
    (request) =>
      `  #${request.id}  ${new Date(request.createdAt).toLocaleString("ru-RU")}  ${request.name}  ${request.email}`,
  )
  .join("\n");

process.stdout.write(
  `Всего заявок: ${requests.length}\n` +
    (preview ? `Последние:\n${preview}\n` : "") +
    `Таблица для Excel: ${outputPath}\n`,
);
