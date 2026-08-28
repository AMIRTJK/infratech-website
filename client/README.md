# client — frontend сайта организации

Next.js 15 (App Router) · React 19 · TypeScript 5.9 (strict) · Tailwind CSS 4.

Здесь лежит **только frontend**. Работа с базой, отправка писем и любая серверная логика — в [`../server`](../server). Части общаются по HTTP через API backend.

## Запуск

```bash
npm install
cp .env.example .env.local   # и подставить значения
npm run dev                  # http://localhost:3000
```

Backend в этом случае запускается **отдельно, в своём терминале** (`cd ../server && npm run dev`).

Обе части сразу поднимает команда из корня репозитория:

```bash
npm run dev
```

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер Next на порту 3000 |
| `npm run build` | Прод-сборка (с проверкой типов и линта) |
| `npm run start` | Запуск собранного приложения |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run analyze` | Сборка с анализом бандла (`@next/bundle-analyzer`) |

## Структура

```
src/
  app/          — маршрутизация Next: layout.tsx, page.tsx, loading.tsx, error.tsx,
                  sitemap.ts, robots.ts, метаданные. Файлы роутов тонкие.
    _providers/ — клиентские провайдеры (QueryClientProvider, тема, ErrorBoundary).
                  Подчёркивание делает папку приватной для роутера Next.
  views/        — слой FSD «страницы»: экран целиком (в App Router имя pages занято Next).
  widgets/      — крупные блоки страницы: шапка, футер, hero, секции.
  features/     — пользовательские сценарии: форма обратной связи, поиск, переключатели.
  entities/     — доменные типы и мелкие представления: услуга, новость, сотрудник, проект.
  shared/       — инфраструктура:
    api/        — HTTP-клиент и реестр ApiRoutes
    config/     — конфигурация окружения, AppRoutes, константы сайта
    lib/        — утилиты и хуки общего назначения (cn, форматирование, debounce)
    ui/         — базовые UI-компоненты проекта (кнопка, поле, модалка…)
    types/      — общие типы
    styles/     — globals.css и токены темы
public/         — статические файлы: изображения, favicon, og-картинки
```

Импорт разрешён только вниз по слоям (`app → views → widgets → features → entities → shared`); правило проверяется ESLint (`eslint.config.mjs`). Псевдонимы: `@app/*`, `@views/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`.

## Перед разработкой

1. [`../AGENTS.md`](../AGENTS.md) — правила разработки, обязательны.
2. [`../PERFORMANCE.md`](../PERFORMANCE.md) — производительность frontend, обязательна.
3. [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — общая архитектура проекта.

## Заметки

- `src/app/layout.tsx` и `src/app/page.tsx` — технические заглушки, без корневого layout Next не стартует. Разметки, стилей и компонентов в них нет; заменяются на этапе разработки frontend.
- Turbopack в dev включается флагом (`next dev --turbopack`) — добавляем после проверки на реальном проекте, не по умолчанию.
