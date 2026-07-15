"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMyCoursesQuery } from "@/hooks/queries/useCourseQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { DEFAULT_COURSE_THUMBNAIL, getCourseThumbnailSrc } from "@/lib/courseThumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  BookOpen,
  CalendarClock,
  Eye,
  FilePlus2,
  GraduationCap,
  LayoutDashboard,
  Pencil,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

type StatusFilter = "ALL" | CourseStatus;

const statusFilters: StatusFilter[] = [
  "ALL",
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "UNPUBLISHED",
  "ARCHIVED",
];

const statusStyles: Record<CourseStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PENDING_REVIEW:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  PUBLISHED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  UNPUBLISHED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ARCHIVED:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

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

const formatPrice = (course: CourseResponse, locale: string, freeLabel: string) => {
  if (course.isFree) return freeLabel;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: course.currency || "USD",
    maximumFractionDigits: 0,
  }).format(course.price ?? 0);
};

const MyCoursesPage = () => {
  const locale = useLocale();
  const t = useTranslations("InstructorCoursesPage");
  const statusT = useTranslations("CourseStatus");
  const { isLoggedIn, user } = useAuth();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const statusParam = status === "ALL" ? undefined : status;

  const coursesQuery = useMyCoursesQuery(
    page,
    PAGE_SIZE,
    debouncedKeyword.trim(),
    statusParam,
  );
  const courses = coursesQuery.data?.items ?? [];
  const totalPages = coursesQuery.data?.totalPages ?? 0;
  const totalElements = coursesQuery.data?.totalElements ?? 0;

  const counts = useMemo(() => {
    if (coursesQuery.data?.statusCounts) {
      return coursesQuery.data.statusCounts;
    }

    return courses.reduce<Record<string, number>>(
      (acc, course) => {
        acc.ALL += 1;
        acc[course.status] = (acc[course.status] ?? 0) + 1;
        return acc;
      },
      { ALL: 0 },
    );
  }, [courses]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.signInSubtitle")}
        </p>
      </div>
    );
  }

  if (user?.role !== UserRole.INSTRUCTOR) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.instructorOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.instructorOnlySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-bold text-gray-950 dark:text-text">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {t("subtitle")}
            </p>
          </div>
          <Button asChild size="sm" className="!text-white">
            <Link href={`/${locale}/instructor/courses/new`}>
              <FilePlus2 className="h-4 w-4" />
              {t("createCourse")}
            </Link>
          </Button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("metrics.totalCourses")}
            </div>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {counts.ALL ?? totalElements}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted">
              <Users className="h-4 w-4 text-primary" />
              {t("metrics.students")}
            </div>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {courses.reduce((sum, course) => sum + (course.totalStudents ?? 0), 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted">
              <Star className="h-4 w-4 text-primary" />
              {t("metrics.avgRating")}
            </div>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {courses.length
                ? (
                    courses.reduce(
                      (sum, course) => sum + (course.averageRating ?? 0),
                      0,
                    ) / courses.length
                  ).toFixed(1)
                : "0.0"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              {t("metrics.published")}
            </div>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {counts.PUBLISHED ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white dark:border-border dark:bg-surface">
          <div className="border-b border-gray-200 p-3 dark:border-border">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setPage(0);
                  }}
                  placeholder={t("searchPlaceholder")}
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
                {statusFilters.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={status === item ? "default" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setStatus(item);
                      setPage(0);
                    }}
                    className={`shrink-0 ${
                      status === item
                        ? "!text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {statusT(item)}
                    <span className="ml-1 opacity-70">
                      {counts[item] ?? 0}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {coursesQuery.isLoading ? (
            <div className="grid gap-3 p-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
                />
              ))}
            </div>
          ) : coursesQuery.isError ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-bold text-gray-950 dark:text-text">
                {t("error.title")}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-muted">
                {t("error.subtitle")}
              </p>
              <Button
                type="button"
                onClick={() => coursesQuery.refetch()}
                size="sm"
                className="mx-auto mt-4 !text-white"
              >
                {t("error.retry")}
              </Button>
            </div>
          ) : courses.length ? (
            <div className="grid gap-3 p-3 xl:grid-cols-2">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-border dark:bg-bg md:flex-row"
                >
                  <div className="relative h-40 bg-gray-100 dark:bg-border md:h-auto md:w-48 md:shrink-0">
                    <img
                      src={getCourseThumbnailSrc(course.thumbnailUrl)}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_COURSE_THUMBNAIL;
                      }}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-gray-950 dark:text-text">
                          {course.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-muted">
                          {course.description}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          statusStyles[course.status]
                        }`}
                      >
                        {statusT(course.status)}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-muted sm:grid-cols-4">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-text">
                          {formatPrice(course, locale, t("labels.free"))}
                        </p>
                        <p>{t("labels.price")}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-text">
                          {course.totalStudents ?? course.totalEnrollments ?? 0}
                        </p>
                        <p>{t("labels.students")}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-text">
                          {course.averageRating?.toFixed(1) ?? "0.0"}
                        </p>
                        <p>{t("labels.rating")}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-text">
                          {course.totalLectures ?? 0}
                        </p>
                        <p>{t("labels.lectures")}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="mr-auto inline-flex items-center gap-1 text-xs text-gray-400">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(
                          course.lastUpdatedContent || course.publishedAt,
                          locale,
                          t("labels.notUpdated"),
                        )}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/${locale}/instructor/studio/${course.id}`}>
                          <GraduationCap className="h-3.5 w-3.5" />
                          {t("actions.studio")}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/${locale}/instructor/courses/${course.id}/edit`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("actions.edit")}
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="!text-white">
                        <Link href={`/${locale}/courses/${course.id}?preview=teacher`}>
                          <Eye className="h-3.5 w-3.5" />
                          {t("actions.preview")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-950 dark:text-text">
                {t("empty.title")}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-muted">
                {t("empty.subtitle")}
              </p>
              <Button asChild size="sm" className="mt-4 !text-white">
                <Link href={`/${locale}/instructor/courses/new`}>
                  {t("createCourse")}
                </Link>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 p-3 text-sm dark:border-border">
            <p className="text-xs text-gray-500 dark:text-muted">
              {t("pagination.pageOf", {
                page: page + 1,
                total: Math.max(totalPages, 1),
              })}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
              >
                {t("pagination.previous")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                {t("pagination.next")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
