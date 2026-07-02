import ErrorPageView from "@/components/errors/ErrorPageView";
import type { ErrorLocale } from "@/components/errors/errorPageContent";

const UnauthorizedPage = async ({
  params,
}: {
  params: Promise<{ locale: ErrorLocale }>;
}) => {
  const { locale } = await params;
  return <ErrorPageView statusCode={401} locale={locale} />;
};

export default UnauthorizedPage;

