"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMyLearningQuery } from "@/hooks/queries/useEnrollmentQueries";
import { UserRole } from "@/types/enums/UserRole.enum";
import { BookOpen, CalendarClock, GraduationCap, PlayCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const DEFAULT_COURSE_THUMBNAIL = "/default-course-background.png";

const formatDate = (
  value: Date | string | null | undefined,
  locale: string,
  fallback: string,
) => {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getProgress = (enrollment: EnrollmentResponse) =>
  Math.max(0, Math.min(100, Number(enrollment.progressPercentage ?? 0)));

const MyLearningPage = () => {
  const locale = useLocale();
  const t = useTranslations("MyLearningPage");
  const { isLoggedIn, user } = useAuth();
  const canLoad = isLoggedIn && user?.role === UserRole.STUDENT;
  const learningQuery = useMyLearningQuery(canLoad);
  const enrollments = learningQuery.data ?? [];

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-950 dark:text-text">
          {t("auth.signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.signInSubtitle")}
        </p>
      </div>
    );
  }

  if (user?.role !== UserRole.STUDENT) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-950 dark:text-text">
          {t("auth.studentOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.studentOnlySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950 dark:text-text">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-muted">
            {t("subtitle")}
          </p>
        </div>

        {learningQuery.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
              />
            ))}
          </div>
        ) : learningQuery.isError ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center dark:border-border dark:bg-surface">
            <h2 className="text-lg font-bold text-gray-950 dark:text-text">
              {t("error.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-muted">
              {t("error.subtitle")}
            </p>
            <Button
              type="button"
              onClick={() => learningQuery.refetch()}
              className="mt-4 !text-white"
            >
              {t("error.retry")}
            </Button>
          </div>
        ) : enrollments.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = getProgress(enrollment);

              return (
                <article
                  key={`${enrollment.id.userId}-${enrollment.id.courseId}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-border dark:bg-surface"
                >
                  <div className="h-40 bg-gray-100 dark:bg-border">
                    <img
                      src={course.thumbnailUrl || DEFAULT_COURSE_THUMBNAIL}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_COURSE_THUMBNAIL;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h2 className="line-clamp-2 text-base font-bold text-gray-950 dark:text-text">
                      {course.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-muted">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {course.instructor
                          ? `${course.instructor.firstName ?? ""} ${course.instructor.lastName ?? ""}`.trim()
                          : t("unknownInstructor")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(enrollment.lastAccessedAt, locale, t("neverOpened"))}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                          {t("progress")}
                        </span>
                        <span className="font-bold text-primary">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-bg">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-muted">
                        <BookOpen className="h-3.5 w-3.5" />
                        {enrollment.completedLectures ?? 0} {t("completedLectures")}
                      </span>
                      <Button asChild size="sm" className="!text-white">
                        <Link href={`/${locale}/courses/${course.id}`}>
                          <PlayCircle className="h-4 w-4" />
                          {t("continue")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center dark:border-border dark:bg-surface">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-950 dark:text-text">
              {t("empty.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-muted">
              {t("empty.subtitle")}
            </p>
            <Button asChild className="mt-4 !text-white">
              <Link href={`/${locale}/courses`}>{t("empty.browse")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearningPage;
