import { redirect } from "next/navigation";
import { locales } from "@/i18n/request";

const MissingPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const targetLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : "en";

  redirect(`/${targetLocale}/errors/404`);
};

export default MissingPage;

