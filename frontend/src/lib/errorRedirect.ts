const SUPPORTED_LOCALES = ["en", "vi"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
type ErrorStatusCode = 401 | 403 | 404 | 500;

const ERROR_STATUS_CODES = [401, 403, 404, 500] as const;

const resolveErrorStatusCode = (status?: number): ErrorStatusCode | null => {
  if (!status) return null;
  if (status >= 500) return 500;
  if (ERROR_STATUS_CODES.includes(status as ErrorStatusCode)) {
    return status as ErrorStatusCode;
  }

  return null;
};

const getLocaleFromPathname = (pathname: string): SupportedLocale => {
  const segment = pathname.split("/").find(Boolean);
  return SUPPORTED_LOCALES.includes(segment as SupportedLocale)
    ? (segment as SupportedLocale)
    : "en";
};

const isErrorPagePath = (pathname: string) =>
  /^\/(en|vi)\/errors\/(401|403|404|500)\/?$/.test(pathname);

export const redirectToErrorPage = (status?: number) => {
  if (globalThis.window === undefined) return;

  const statusCode = resolveErrorStatusCode(status);
  if (!statusCode) return;

  const { pathname } = globalThis.location;
  if (isErrorPagePath(pathname)) return;

  const locale = getLocaleFromPathname(pathname);
  const targetPath = `/${locale}/errors/${statusCode}`;
  if (pathname === targetPath) return;

  globalThis.location.assign(targetPath);
};

