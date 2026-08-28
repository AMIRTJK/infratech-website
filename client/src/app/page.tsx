// Заглушка корневого маршрута, чтобы dev-сервер отдавал страницу, а не ошибку.
// Заменяется на этапе разработки frontend.
export default function HomePage() {
  return <main>Проект в разработке.</main>;
}
