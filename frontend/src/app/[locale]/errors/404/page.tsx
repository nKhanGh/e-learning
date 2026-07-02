import ErrorPageView from "@/components/errors/ErrorPageView";
import type { ErrorLocale } from "@/components/errors/errorPageContent";

const NotFoundErrorPage = async ({
  params,
}: {
  params: Promise<{ locale: ErrorLocale }>;
}) => {
  const { locale } = await params;
  return <ErrorPageView statusCode={404} locale={locale} />;
};

export default NotFoundErrorPage;

