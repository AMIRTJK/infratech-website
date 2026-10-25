import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type TDatabase = Database.Database;

/** Одно подключение на процесс; WAL позволяет читать базу (выгрузка заявок), пока сервер пишет. */
export const openDatabase = (filePath: string): TDatabase => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  return db;
};
