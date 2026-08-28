# infratech-website

Публичный сайт организации: информационный сайт с рассказом об организации, её деятельности, услугах и контактами, с формой обратной связи.

Репозиторий состоит из двух **независимых** приложений:

| Директория | Что это | Стек | Порт |
|---|---|---|---|
| [`client/`](client) | Frontend | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 | 3000 |
| [`server/`](server) | Backend | Node.js 22+ · TypeScript · Fastify · SQLite · Nodemailer | 4000 |

Части общаются только по HTTP через API `/api/v1/*`. Frontend-кода в `server` нет, backend-кода в `client` — тоже.

## Статус

Подготовлены архитектура, структура директорий, конфигурация и команды запуска; зависимости установлены. **Код приложения ещё не написан**: страниц, компонентов, эндпоинтов, схемы базы и бизнес-логики пока нет.

Обе части содержат по технической заглушке, без которой dev-серверы не стартуют, — они заменяются на этапе разработки:

- `client/src/app/layout.tsx` и `client/src/app/page.tsx` — корневой layout и пустая главная;
- `server/src/app/main.ts` — запуск Fastify и `GET /health`.

Следующий этап начинается по отдельной постановке задачи.

## Запуск

Требуется Node 22 LTS (см. `.nvmrc`).

Один раз — установка зависимостей и файлы окружения (корневой `npm install` ставит зависимости и в `client`, и в `server`):

```bash
npm install
```

```bash
cp client/.env.example client/.env.local && cp server/.env.example server/.env
```

Дальше — обе части одной командой из корня:

```bash
npm run dev
```

Поднимутся оба процесса в одном терминале: frontend на http://localhost:3000, backend на http://localhost:4000. Вывод помечен префиксами `client` и `server`, `Ctrl+C` останавливает оба.

Каждую часть по-прежнему можно запускать отдельно, в своём терминале — так логи не перемешиваются:

```bash
cd client
npm run dev
```

```bash
cd server
npm run dev
```

| Команда в корне | Что делает |
|---|---|
| `npm run dev` | Dev-серверы обеих частей |
| `npm run build` | Сборка обеих частей |
| `npm run start` | Запуск прод-сборок обеих частей |
| `npm run typecheck` / `npm run lint` / `npm run format` | Проверки в обеих частях |
| `npm run install:all` | Переустановка зависимостей `client` и `server` |

Полный список команд каждой части — в [`client/README.md`](client/README.md) и [`server/README.md`](server/README.md).

> Корневой `package.json` — только оркестрация. Зависимости приложения в корень не ставятся: пакеты фронтенда живут в `client`, бэкенда — в `server`.

## Документация

| Файл | О чём |
|---|---|
| [`AGENTS.md`](AGENTS.md) | **Правила разработки. Единственный источник правил** — читать перед началом работы |
| [`PERFORMANCE.md`](PERFORMANCE.md) | Оптимизация производительности **frontend** (`client`) |
| [`server/PERFORMANCE.md`](server/PERFORMANCE.md) | Оптимизация производительности **backend** (`server`) |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Архитектура: структура, взаимодействие частей, конфигурация |
| [`docs/DEPENDENCIES.md`](docs/DEPENDENCIES.md) | Разбор зависимостей: что выбрано, что отклонено и почему |
| [`docs/plans/`](docs/plans) | Дизайн-документы отдельных задач |

[`CLAUDE.md`](CLAUDE.md) и [`GEMINI.md`](GEMINI.md) — указатели на `AGENTS.md` для AI-агентов; правила в них не дублируются.
