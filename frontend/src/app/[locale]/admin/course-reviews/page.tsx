"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminCourseReviewsQuery,
  useCourseCategoriesQuery,
} from "@/hooks/queries/useCourseQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

const reviewStatuses: AdminCourseReviewFilters["status"][] = [
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
];

const statusStyles: Record<AdminCourseReviewFilters["status"], string> = {
  PENDING_REVIEW:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  PUBLISHED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

const sortOptions: AdminCourseReviewSortOption[] = [
  "SUBMITTED_DESC",
  "SUBMITTED_ASC",
  "UPDATED_DESC",
  "UPDATED_ASC",
  "TITLE_ASC",
  "TITLE_DESC",
];

const formatDate = (
  value: string | null | undefined,
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

const getInstructorName = (instructor: UserResponse | null) => {
  if (!instructor) return "";
  return `${instructor.firstName ?? ""} ${instructor.lastName ?? ""}`.trim()
    || instructor.email;
};

const CourseReviewsPage = () => {
  const locale = useLocale();
  const t = useTranslations("AdminCourseReviewsPage");
  const statusT = useTranslations("CourseStatus");
  const { isLoggedIn, user } = useAuth();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [instructor, setInstructor] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [status, setStatus] =
    useState<AdminCourseReviewFilters["status"]>("PENDING_REVIEW");
  const [sortBy, setSortBy] =
    useState<AdminCourseReviewSortOption>("SUBMITTED_DESC");
  const debouncedKeyword = useDebounce(keyword, 350);
  const debouncedInstructor = useDebounce(instructor, 350);
  const categoriesQuery = useCourseCategoriesQuery();

  const filters = useMemo<AdminCourseReviewFilters>(
    () => ({
      page,
      size: PAGE_SIZE,
      keyword: debouncedKeyword.trim(),
      status,
      categoryId: categoryId === "ALL" ? "" : categoryId,
      instructor: debouncedInstructor.trim(),
      sortBy,
    }),
    [categoryId, debouncedInstructor, debouncedKeyword, page, sortBy, status],
  );

  const canReviewCourses = isLoggedIn && user?.role === UserRole.ADMIN;
  const reviewsQuery = useAdminCourseReviewsQuery(filters, canReviewCourses);
  const courses = reviewsQuery.data?.items ?? [];
  const totalPages = reviewsQuery.data?.totalPages ?? 0;
  const totalElements = reviewsQuery.data?.totalElements ?? 0;
  const counts = reviewsQuery.data?.statusCounts ?? {};

  const resetPage = () => setPage(0);

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

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-950 dark:text-text">
          {t("auth.adminOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.adminOnlySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
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
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm dark:border-border dark:bg-surface">
            {reviewStatuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setStatus(item);
                  resetPage();
                }}
                className={`inline-flex h-9 min-w-28 items-center justify-between gap-2 rounded-md px-3 text-xs font-semibold transition-colors ${
                  status === item
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="truncate">{statusT(item)}</span>
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    status === item
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {counts[item] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white dark:border-border dark:bg-surface">
          <div className="border-b border-gray-200 p-3 dark:border-border">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    resetPage();
                  }}
                  placeholder={t("filters.keyword")}
                  className="h-9 pl-9"
                />
              </div>
              <Input
                value={instructor}
                onChange={(event) => {
                  setInstructor(event.target.value);
                  resetPage();
                }}
                placeholder={t("filters.instructor")}
                className="h-9"
              />
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value);
                  resetPage();
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("filters.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("filters.allCategories")}</SelectItem>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as AdminCourseReviewSortOption);
                  resetPage();
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("filters.sort")} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`sort.${option}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {reviewsQuery.isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-md bg-gray-100 dark:bg-border"
                />
              ))}
            </div>
          ) : reviewsQuery.isError ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-bold text-gray-950 dark:text-text">
                {t("error.title")}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-muted">
                {t("error.subtitle")}
              </p>
              <Button
                type="button"
                onClick={() => reviewsQuery.refetch()}
                size="sm"
                className="mx-auto mt-4 !text-white"
              >
                {t("error.retry")}
              </Button>
            </div>
          ) : courses.length ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 text-xs text-gray-500 dark:border-border dark:text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t("columns.course")}</th>
                      <th className="px-4 py-3 font-semibold">{t("columns.instructor")}</th>
                      <th className="px-4 py-3 font-semibold">{t("columns.category")}</th>
                      <th className="px-4 py-3 font-semibold">{t("columns.status")}</th>
                      <th className="px-4 py-3 font-semibold">{t("columns.content")}</th>
                      <th className="px-4 py-3 font-semibold">{t("columns.date")}</th>
                      <th className="px-4 py-3 font-semibold">{t("columns.checklist")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("columns.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-border">
                    {courses.map((course) => (
                      <tr
                        key={course.id}
                        className="text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900/40"
                      >
                        <td className="max-w-xs px-4 py-3">
                          <p className="truncate font-semibold text-gray-950 dark:text-text">
                            {course.title}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="truncate">{getInstructorName(course.instructor)}</p>
                        </td>
                        <td className="px-4 py-3">
                          {course.category?.name ?? t("unknown")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusStyles[course.status as AdminCourseReviewFilters["status"]]}`}
                          >
                            {statusT(course.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="whitespace-nowrap text-xs">
                            {t("contentCounts", {
                              sections: course.totalSections,
                              lectures: course.totalLectures,
                              quizzes: course.totalQuizzes,
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs">
                            <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(
                              course.submittedAt || course.updatedAt,
                              locale,
                              t("unknown"),
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
                              course.checklistReady
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {course.checklistPassed}/{course.checklistTotal}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild size="sm" className="!text-white">
                            <Link href={`/${locale}/admin/course-reviews/${course.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                              {t("actions.review")}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-3 lg:hidden">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-bg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-gray-950 dark:text-text">
                          {course.title}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                          {getInstructorName(course.instructor)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusStyles[course.status as AdminCourseReviewFilters["status"]]}`}
                      >
                        {statusT(course.status)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-muted">
                      <p>{course.category?.name ?? t("unknown")}</p>
                      <p>
                        {t("contentCounts", {
                          sections: course.totalSections,
                          lectures: course.totalLectures,
                          quizzes: course.totalQuizzes,
                        })}
                      </p>
                      <p>
                        {formatDate(
                          course.submittedAt || course.updatedAt,
                          locale,
                          t("unknown"),
                        )}
                      </p>
                      <p>
                        {t("checklistRatio", {
                          passed: course.checklistPassed,
                          total: course.checklistTotal,
                        })}
                      </p>
                    </div>
                    <Button asChild size="sm" className="mt-3 w-full !text-white">
                      <Link href={`/${locale}/admin/course-reviews/${course.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        {t("actions.review")}
                      </Link>
                    </Button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-950 dark:text-text">
                {t("empty.title")}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-muted">
                {t("empty.subtitle")}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-gray-200 p-3 text-sm dark:border-border sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-muted">
              <Filter className="h-3.5 w-3.5" />
              {t("pagination.summary", {
                total: totalElements,
                page: page + 1,
                totalPages: Math.max(totalPages, 1),
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

export default CourseReviewsPage;
