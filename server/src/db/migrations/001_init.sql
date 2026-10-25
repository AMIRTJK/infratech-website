-- Заявки с сайта: сообщения и записи на встречу.
-- Заявка сохраняется всегда, письмо — дополнительный канал, поэтому статус отправки хранится рядом.
CREATE TABLE contact_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('message', 'meeting')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  meeting_at TEXT,
  ip TEXT,
  user_agent TEXT,
  mail_status TEXT NOT NULL CHECK (mail_status IN ('pending', 'sent', 'failed', 'disabled')),
  mail_error TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  mailed_at TEXT
);

CREATE INDEX idx_contact_requests_created_at ON contact_requests (created_at);
