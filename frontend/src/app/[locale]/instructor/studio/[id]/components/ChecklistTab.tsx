"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ComponentType } from "react";

type ChecklistTabProps = {
  courseId: string;
  courseStatus: CourseStatus;
  checklist: CoursePublishChecklistResponse | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  onRetry: () => void;
  onSubmit: () => void;
};

const statusStyles: Record<
  CoursePublishChecklistStatus,
  {
    icon: ComponentType<{ className?: string }>;
    iconClassName: string;
    rowClassName: string;
    labelKey: string;
  }
> = {
  PASSED: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    rowClassName: "border-emerald-100 bg-emerald-50/60 dark:border-emerald-950",
    labelKey: "checklist.status.passed",
  },
  WARNING: {
    icon: AlertTriangle,
    iconClassName: "text-amber-600",
    rowClassName: "border-amber-100 bg-amber-50/60 dark:border-amber-950",
    labelKey: "checklist.status.warning",
  },
  FAILED: {
    icon: XCircle,
    iconClassName: "text-red-600",
    rowClassName: "border-red-100 bg-red-50/60 dark:border-red-950",
    labelKey: "checklist.status.failed",
  },
};

export const ChecklistTab = ({
  courseId,
  courseStatus,
  checklist,
  isLoading,
  isSubmitting,
  onRetry,
  onSubmit,
}: ChecklistTabProps) => {
  const locale = useLocale();
  const t = useTranslations("InstructorCourseStudioPage");
  const isReviewLocked =
    courseStatus === "PENDING_REVIEW" || courseStatus === "PUBLISHED";

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-44 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center dark:border-border">
        <h2 className="text-lg font-bold text-gray-950 dark:text-text">
          {t("checklist.errorTitle")}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("checklist.errorSubtitle")}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          {t("error.retry")}
        </Button>
      </div>
    );
  }

  const failedCount = checklist.groups
    .flatMap((group) => group.items)
    .filter((item) => item.status === "FAILED").length;
  const title =
    courseStatus === "PENDING_REVIEW"
      ? t("checklist.submittedTitle")
      : courseStatus === "PUBLISHED"
        ? t("checklist.publishedTitle")
        : checklist.ready
          ? t("checklist.readyTitle")
          : t("checklist.notReadyTitle");
  const subtitle =
    courseStatus === "PENDING_REVIEW"
      ? t("checklist.submittedSubtitle")
      : courseStatus === "PUBLISHED"
        ? t("checklist.publishedSubtitle")
        : checklist.ready
          ? t("checklist.readySubtitle")
          : t("checklist.notReadySubtitle", { count: failedCount });
  const submitLabel =
    courseStatus === "PENDING_REVIEW"
      ? t("submittedForReview")
      : courseStatus === "PUBLISHED"
        ? t("publishedStatus")
        : t("submitReview");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-border md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-gray-950 dark:text-text">
              {title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-muted">
            {subtitle}
          </p>
        </div>
        {!isReviewLocked ? (
          <Button
            type="button"
            className="!text-white"
            disabled={!checklist.ready || isSubmitting}
            onClick={onSubmit}
          >
            <ListChecks className="h-4 w-4" />
            {submitLabel}
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        {checklist.groups.map((group) => (
          <section
            key={group.key}
            className="rounded-lg border border-gray-200 p-4 dark:border-border"
          >
            <h3 className="text-sm font-bold text-gray-950 dark:text-text">
              {group.label}
            </h3>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => (
                <ChecklistRow
                  key={`${group.key}-${item.key}-${item.targetId}`}
                  item={item}
                  courseId={courseId}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

const ChecklistRow = ({
  item,
  courseId,
  locale,
}: {
  item: CoursePublishChecklistItem;
  courseId: string;
  locale: string;
}) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const statusStyle = statusStyles[item.status];
  const StatusIcon = statusStyle.icon;
  const fixHref = getFixHref(locale, courseId, item);

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between ${statusStyle.rowClassName}`}
    >
      <div className="flex gap-3">
        <StatusIcon className={`mt-0.5 h-4 w-4 shrink-0 ${statusStyle.iconClassName}`} />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-text">
            {item.message}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase text-gray-500 dark:text-muted">
            {t(statusStyle.labelKey)}
          </p>
        </div>
      </div>

      {item.status !== "PASSED" && fixHref ? (
        <Button asChild type="button" variant="outline" size="sm">
          <Link href={fixHref}>{t("checklist.fix")}</Link>
        </Button>
      ) : null}
    </div>
  );
};

const getFixHref = (
  locale: string,
  courseId: string,
  item: CoursePublishChecklistItem,
) => {
  if (item.targetType === "COURSE_BASIC_INFO") {
    return `/${locale}/instructor/courses/${courseId}/edit`;
  }

  if (item.targetType === "LECTURE_PREVIEW") {
    return `/${locale}/instructor/studio/${courseId}/preview/lectures/${item.targetId}`;
  }

  if (
    item.targetType === "SECTIONS" ||
    item.targetType === "SECTION" ||
    item.targetType === "LECTURES" ||
    item.targetType === "LECTURE" ||
    item.targetType === "QUIZ"
  ) {
    return `/${locale}/instructor/studio/${courseId}`;
  }

  return null;
};
