export type AppRouteKey = "root" | "onboarding" | "lobby" | "social" | "history";

export const routePathMap: Record<AppRouteKey, string> = {
  root: "/",
  onboarding: "/onboarding",
  lobby: "/lobby",
  social: "/social",
  history: "/history",
};

export const routeLabelMap: Record<AppRouteKey, string> = {
  root: "Screen Selector",
  onboarding: "Onboarding",
  lobby: "Virtual Office Lobby",
  social: "Social Hub",
  history: "Company History Board",
};

export const previousStepRouteMap: Record<AppRouteKey, AppRouteKey> = {
  root: "root",
  onboarding: "root",
  lobby: "onboarding",
  social: "lobby",
  history: "lobby",
};

const pathToRouteEntries = Object.entries(routePathMap).map(([key, path]) => [path, key as AppRouteKey]);

export function routeKeyFromPath(pathname: string): AppRouteKey | null {
  const exact = pathToRouteEntries.find(([path]) => path === pathname);
  if (exact) {
    return exact[1];
  }

  // Handle nested paths if needed in the future.
  const nested = pathToRouteEntries.find(([path]) => path !== "/" && pathname.startsWith(path));
  return nested ? nested[1] : null;
}
