// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    const defaultLocale = "en";
    const messages = (await import(`@/messages/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages,
    };
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
