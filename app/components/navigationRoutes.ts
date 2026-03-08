export type RouteId = "home" | "dashboard" | "discover" | "docs" | "login";

export type NavRoute = {
  id: RouteId;
  label: string;
  href: string;
  prefixes: string[];
};

export const APP_ROUTES: Record<RouteId, NavRoute> = {
  home: { id: "home", label: "Home", href: "/", prefixes: ["/"] },
  dashboard: { id: "dashboard", label: "Dashboard", href: "/dashboard", prefixes: ["/dashboard"] },
  discover: { id: "discover", label: "Discover", href: "/discover", prefixes: ["/discover"] },
  docs: { id: "docs", label: "Docs", href: "/docs", prefixes: ["/docs"] },
  login: { id: "login", label: "Login", href: "/login", prefixes: ["/login"] },
};

export const PUBLIC_NAV_ROUTES: NavRoute[] = [
  APP_ROUTES.home,
  APP_ROUTES.discover,
  APP_ROUTES.docs,
];

export const AUTH_NAV_ROUTES: NavRoute[] = [
  APP_ROUTES.dashboard,
  APP_ROUTES.discover,
  APP_ROUTES.docs,
];

export const FOOTER_ROUTES: NavRoute[] = [
  APP_ROUTES.home,
  APP_ROUTES.dashboard,
  APP_ROUTES.discover,
  APP_ROUTES.docs,
];

export function buildVaultHref(vaultId: string, from?: string | null): string {
  const pathname = `/dashboard/vault/${encodeURIComponent(vaultId)}`;
  const safeFrom = sanitizeReturnHref(from);

  if (!safeFrom) return pathname;

  const params = new URLSearchParams({ from: safeFrom });
  return `${pathname}?${params.toString()}`;
}

export function sanitizeReturnHref(href?: string | null): string | null {
  if (!href || !href.startsWith("/") || href.startsWith("//")) return null;
  if (href.startsWith("/dashboard/vault/")) return null;
  return href;
}

export function isRouteActive(pathname: string, route: NavRoute): boolean {
  return route.prefixes.some((prefix) => {
    if (prefix === "/") return pathname === "/";
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function getBrandRoute(isSignedIn: boolean): NavRoute {
  return isSignedIn ? APP_ROUTES.dashboard : APP_ROUTES.home;
}
