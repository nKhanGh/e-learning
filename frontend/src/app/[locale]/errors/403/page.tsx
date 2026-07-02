import ErrorPageView from "@/components/errors/ErrorPageView";
import type { ErrorLocale } from "@/components/errors/errorPageContent";

const ForbiddenPage = async ({
  params,
}: {
  params: Promise<{ locale: ErrorLocale }>;
}) => {
  const { locale } = await params;
  return <ErrorPageView statusCode={403} locale={locale} />;
};

export default ForbiddenPage;

