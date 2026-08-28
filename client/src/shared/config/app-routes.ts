/**
 * Реестр всех клиентских маршрутов приложения
 */
export const AppRoutes = {
  home: "/",
  contacts: "/#contacts",
  services: "/#services",
} as const;

export type TAppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];
