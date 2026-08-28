export const ApiRoutes = {
  // Тестовые маршруты
  test: {
    ping: "/api/v1/test/ping",
    echo: "/api/v1/test/echo",
  },
  // Маршруты формы связи
  contacts: {
    sendEmail: "/api/v1/contacts",
    bookMeeting: "/api/v1/meetings",
  },
} as const;
