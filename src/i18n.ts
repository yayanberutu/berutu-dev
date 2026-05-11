export const SUPPORTED_LOCALES = ["en", "id"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALIZED_EXACT_PATHS = new Set(["/", "/about", "/services", "/contact", "/blog", "/work"]);
const LOCALIZED_PREFIXES = ["/blog/", "/work/"];

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function detectLocaleFromPath(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return null;
  return isLocale(first) ? first : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  if (isLocale(parts[0])) {
    const rest = parts.slice(1);
    return rest.length ? `/${rest.join("/")}` : "/";
  }
  return pathname;
}

export function localizePath(path: string, locale: Locale): string {
  const hasLocalizedPrefix = LOCALIZED_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (!LOCALIZED_EXACT_PATHS.has(path) && !hasLocalizedPrefix) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function getLanguageSwitchPath(pathname: string, target: Locale): string {
  const stripped = stripLocaleFromPath(pathname);
  return localizePath(stripped, target);
}
