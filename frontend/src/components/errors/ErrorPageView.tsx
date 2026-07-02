"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useOpenAuth } from "@/contexts/OpenAuthContext";
import {
  errorPageContent,
  type ErrorLocale,
  type ErrorStatusCode,
} from "./errorPageContent";

type ErrorPageViewProps = {
  statusCode: ErrorStatusCode;
  locale?: ErrorLocale;
  onRetry?: () => void;
};

const getLocale = (locale?: string | string[]): ErrorLocale => {
  if (locale === "vi") return "vi";
  return "en";
};

const ErrorPageView = ({
  statusCode,
  locale,
  onRetry,
}: ErrorPageViewProps) => {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const { setOpenLogin } = useOpenAuth();
  const currentLocale = getLocale(locale ?? params.locale);
  const content = errorPageContent[statusCode];
  const homePath = `/${currentLocale}`;

  const handlePrimaryAction = () => {
    if (statusCode === 401) {
      setOpenLogin(true);
      return;
    }

    router.push(homePath);
  };

  const handleSecondaryAction = () => {
    if (statusCode === 500 && onRetry) {
      onRetry();
      return;
    }

    if (globalThis.history.length > 1) {
      router.back();
      return;
    }

    router.push(homePath);
  };

  return (
    <section className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto mb-6 w-full max-w-[320px] sm:max-w-[360px]">
          <Image
            src={content.image}
            alt={content.imageAlt[currentLocale]}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-950 dark:text-text sm:text-3xl">
          {content.title[currentLocale]}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 dark:text-muted">
          {content.description[currentLocale]}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            {content.primaryAction[currentLocale]}
          </button>
          <button
            type="button"
            onClick={handleSecondaryAction}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-border dark:text-text dark:hover:bg-surface"
          >
            {content.secondaryAction[currentLocale]}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ErrorPageView;

