# server — backend сайта организации

Node.js 22+ · TypeScript 5.9 (strict) · Fastify · SQLite (better-sqlite3) · Nodemailer.

Здесь лежит **только backend**: публичное REST API, работа с базой и отправка писем. Frontend — в [`../client`](../client), и он общается с этой частью исключительно по HTTP.

## Запуск

```bash
npm install
cp .env.example .env      # и подставить значения
npm run dev               # http://localhost:4000
```

Frontend в этом случае запускается **отдельно, в своём терминале** (`cd ../client && npm run dev`).

Обе части сразу поднимает команда из корня репозитория:

```bash
npm run dev
```

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер с перезапуском (`tsx watch`) на порту 4000 |
| `npm run build` | Компиляция TypeScript в `dist/` |
| `npm run start` | Запуск собранного приложения |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Тесты на встроенном раннере Node |
| `npm run db:migrate` | Применение SQL-миграций |

## Структура

```
src/
  app/            — бутстрап: main.ts (точка входа), сборка сервера,
                    регистрация плагинов и модулей, graceful shutdown
  config/         — чтение и валидация переменных окружения, типизированный config
  modules/        — доменные модули API, по одному на ресурс:
                    <module>.routes.ts     — маршруты и схемы
                    <module>.controller.ts — разбор запроса и формирование ответа
                    <module>.service.ts    — бизнес-логика без знания о HTTP
                    <module>.repository.ts — доступ к SQLite, единственное место с SQL
                    <module>.schema.ts     — zod-схемы и типы контракта
                    index.ts               — публичный API модуля (плагин Fastify)
  db/             — подключение к SQLite, применение миграций, seed
    migrations/   — нумерованные SQL-миграции (001_init.sql, …), только вперёд
  mail/           — транспорт Nodemailer и отправка писем
    templates/    — шаблоны писем
  middlewares/    — общие плагины и хуки: обработка ошибок, rate limit, CORS,
                    логирование, request-id
  shared/         — утилиты, общие типы, константы, доменные ошибки
  types/          — общие типы приложения и расширения типов Fastify
data/             — файл базы SQLite (в git не попадает, попадают только миграции)
tests/            — тесты
```

## Соглашения

- **Контракт API:** `/api/v1/<resource>`, единый конверт ответа `{ success, message, data }` (см. [`../AGENTS.md`](../AGENTS.md) §10).
- **Слои внутри модуля:** route → controller → service → repository. Обратные зависимости запрещены; SQL живёт только в репозитории, отправка писем — только в `mail/`. Часть этих ограничений проверяется ESLint.
- **Проект на ESM** (`"type": "module"`, `moduleResolution: NodeNext`). Относительные импорты пишутся **с расширением `.js`**, даже если файл — `.ts`: `import { config } from "../config/config.js"`. Это требование Node к ESM, а не опечатка.
- **Псевдонимы путей на сервере не используются** — они требуют дополнительного резолвера в рантайме. Внутри модуля пути относительные, между модулями — от корня `src`.
- **Секреты — только из окружения.** Новая переменная одновременно добавляется в `.env.example` и в схему валидации `config/`.

## Перед разработкой

1. [`../AGENTS.md`](../AGENTS.md) — правила разработки, обязательны.
2. [`PERFORMANCE.md`](PERFORMANCE.md) — производительность backend, обязательна.
3. [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — общая архитектура проекта.

## Заметки

- `src/app/main.ts` — техническая заглушка: поднимает Fastify и отвечает на `GET /health`. Сборка сервера, плагины, модули, SQLite и почта появятся на этапе разработки backend. Скрипты `test` и `db:migrate` рассчитаны на описанную выше структуру и заработают, как только появятся соответствующие файлы.
- `better-sqlite3` — нативный модуль с готовыми сборками под LTS-версии Node. Рекомендуемая версия для разработки — **Node 22 LTS** (`.nvmrc` в корне): на самых свежих нестабильных версиях Node готовой сборки может не оказаться, и установка потребует компилятора.
