import { getSeoConfig } from "@config/seo";

export function getCanonicalBaseUrl(): string {
  return getSeoConfig().baseUrl.replace(/\/$/, "");
}

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = getCanonicalBaseUrl();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${baseUrl}${normalizedPath}`;
}
