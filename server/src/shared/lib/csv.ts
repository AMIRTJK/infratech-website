// Точка с запятой — разделитель, который Excel с русской локалью открывает по столбцам без мастера импорта.
const CSV_SEPARATOR = ";";
// BOM нужен Excel, чтобы распознать UTF-8 и не показать кириллицу «кракозябрами».
const UTF8_BOM = "﻿";

const escapeCell = (value: string | number | null): string => {
  const text = value == null ? "" : String(value);
  return /[";\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/** Собирает CSV для Excel: заголовок + строки, CRLF между строками. */
export const toCsv = (headers: string[], rows: (string | number | null)[][]): string =>
  UTF8_BOM +
  [headers, ...rows].map((row) => row.map(escapeCell).join(CSV_SEPARATOR)).join("\r\n") +
  "\r\n";
