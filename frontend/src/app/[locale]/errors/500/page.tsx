import ErrorPageView from "@/components/errors/ErrorPageView";
import type { ErrorLocale } from "@/components/errors/errorPageContent";

const ServerErrorPage = async ({
  params,
}: {
  params: Promise<{ locale: ErrorLocale }>;
}) => {
  const { locale } = await params;
  return <ErrorPageView statusCode={500} locale={locale} />;
};

export default ServerErrorPage;

