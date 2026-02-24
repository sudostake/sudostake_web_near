"use client";

export type NavRoute = {
  id: "home" | "dashboard" | "discover" | "docs" | "login";
  label: string;
  href: string;
  prefixes: string[];
};

export const PUBLIC_NAV_ROUTES: NavRoute[] = [
  { id: "home", label: "Home", href: "/", prefixes: ["/"] },
  { id: "discover", label: "Discover", href: "/discover", prefixes: ["/discover"] },
  { id: "docs", label: "Docs", href: "/docs", prefixes: ["/docs"] },
  { id: "login", label: "Login", href: "/login", prefixes: ["/login"] },
];

export const AUTH_NAV_ROUTES: NavRoute[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", prefixes: ["/dashboard"] },
  { id: "discover", label: "Discover", href: "/discover", prefixes: ["/discover"] },
  { id: "docs", label: "Docs", href: "/docs", prefixes: ["/docs"] },
];

export const FOOTER_ROUTES: NavRoute[] = [
  { id: "home", label: "Home", href: "/", prefixes: ["/"] },
  { id: "dashboard", label: "Dashboard", href: "/dashboard", prefixes: ["/dashboard"] },
  { id: "discover", label: "Discover", href: "/discover", prefixes: ["/discover"] },
  { id: "docs", label: "Docs", href: "/docs", prefixes: ["/docs"] },
];

export function isRouteActive(pathname: string, route: NavRoute): boolean {
  return route.prefixes.some((prefix) => {
    if (prefix === "/") return pathname === "/";
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}
