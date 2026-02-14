import { locales } from "./src/i18n/request";
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  
  locales: locales,

  defaultLocale: "en",

  localeDetection: true,
  localePrefix: "always",
});

export const config = {
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
