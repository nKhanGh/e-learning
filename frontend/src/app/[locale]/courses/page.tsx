"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSearch,
  faSliders,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CourseCard from "@/components/courses/CourseCard";
import CourseSidebar from "@/components/courses/CourseSidebar";
import Pagination from "@/components/ui/pagination";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import {
  useCourseCategoriesQuery,
  useCourseSearchQuery,
} from "@/hooks/queries/useCourseQueries";
import { defaultCourseSearchRequest } from "@/lib/courseSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { isAxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 9;

const SORT_OPTIONS: { value: CourseSortOption; label: string }[] = [
  { value: "RELEVANCE", label: "Most relevant" },
  { value: "POPULARITY", label: "Popular" },
  { value: "RATING", label: "Highest rated" },
  { value: "NEWEST", label: "Newest" },
  { value: "PRICE_ASC", label: "Price: low to high" },
  { value: "PRICE_DESC", label: "Price: high to low" },
];

const getLevelLabel = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    ALL_LEVELS: "All Levels",
  };
  return map[level];
};

const parseNumber = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getCourseSearchErrorMessage = (error: unknown) => {
  console.log(error);
  if (!isAxiosError(error)) {
    return "Please try again in a moment.";
  }

  const status = error.response?.status;
  const responseData = error.response?.data as
    | { message?: string; error?: string }
    | string
    | undefined;
  const backendMessage =
    typeof responseData === "string"
      ? responseData
      : responseData?.message || responseData?.error;

  if (status) {
    return backendMessage
      ? `${status}: ${backendMessage}`
      : `${status}: ${error.message}`;
  }

  return error.message || "Please try again in a moment.";
};

const parseBoolean = (value: string | null) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

const parseSearchParams = (
  searchParams: Pick<URLSearchParams, "get">,
): CourseSearchRequest => {
  const categories = searchParams.get("category");
  const level = searchParams.get("level") as CourseLevel | null;
  const sortBy = searchParams.get("sort") as CourseSortOption | null;
  const page = Number(searchParams.get("page") ?? 0);

  return {
    ...defaultCourseSearchRequest,
    keyword: searchParams.get("q") ?? "",
    categoryId: categories ? categories.split(",").filter(Boolean) : [],
    level:
      level && Object.values(CourseLevel).includes(level) ? level : null,
    minPrice: parseNumber(searchParams.get("minPrice")),
    maxPrice: parseNumber(searchParams.get("maxPrice")),
    minAverageRating: parseNumber(searchParams.get("minRating")),
    maxAverageRating: parseNumber(searchParams.get("maxRating")),
    isFree: parseBoolean(searchParams.get("free")),
    hasQuiz: parseBoolean(searchParams.get("quiz")),
    page: Number.isFinite(page) && page > 0 ? page : 0,
    size: PAGE_SIZE,
    sortBy:
      sortBy && SORT_OPTIONS.some((option) => option.value === sortBy)
        ? sortBy
        : "RELEVANCE",
  };
};

const buildSearchParams = (request: CourseSearchRequest) => {
  const params = new URLSearchParams();

  if (request.keyword.trim()) params.set("q", request.keyword.trim());
  if (request.categoryId.length) params.set("category", request.categoryId.join(","));
  if (request.level) params.set("level", request.level);
  if (request.minPrice !== null) params.set("minPrice", String(request.minPrice));
  if (request.maxPrice !== null) params.set("maxPrice", String(request.maxPrice));
  if (request.minAverageRating !== null) {
    params.set("minRating", String(request.minAverageRating));
  }
  if (request.maxAverageRating !== null) {
    params.set("maxRating", String(request.maxAverageRating));
  }
  if (request.isFree !== null) params.set("free", String(request.isFree));
  if (request.hasQuiz !== null) params.set("quiz", String(request.hasQuiz));
  if (request.sortBy !== "RELEVANCE") params.set("sort", request.sortBy);
  if (request.page > 0) params.set("page", String(request.page));

  return params.toString();
};

const CourseGridSkeleton = () => (
  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
    {Array.from({ length: PAGE_SIZE }).map((_, index) => (
      <div
        key={index}
        className="h-[360px] rounded-xl border border-gray-200 bg-white dark:border-border dark:bg-surface"
      >
        <div className="h-40 animate-pulse bg-gray-100 dark:bg-border" />
        <div className="space-y-3 p-4">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-border" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-border" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-border" />
          <div className="h-3 w-28 animate-pulse rounded bg-gray-100 dark:bg-border" />
          <div className="mt-6 h-8 w-full animate-pulse rounded bg-gray-100 dark:bg-border" />
        </div>
      </div>
    ))}
  </div>
);

const CoursesPage = () => {
  const t = useTranslations("CoursesPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<CourseSearchRequest>(() =>
    parseSearchParams(searchParams),
  );

  const debouncedKeyword = useDebounce(filters.keyword, 500);
  const request = useMemo(
    () => ({ ...filters, keyword: debouncedKeyword.trim(), size: PAGE_SIZE }),
    [debouncedKeyword, filters],
  );

  const coursesQuery = useCourseSearchQuery(request);
  const categoriesQuery = useCourseCategoriesQuery();

  useEffect(() => {
    const nextParams = buildSearchParams(request);
    const nextUrl = nextParams ? `${pathname}?${nextParams}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, request, router]);

  const updateFilters: React.Dispatch<React.SetStateAction<CourseSearchRequest>> = (
    next,
  ) => {
    setFilters((current) => {
      const value =
        typeof next === "function"
          ? (next as (previous: CourseSearchRequest) => CourseSearchRequest)(current)
          : next;
      return { ...value, page: 0, size: PAGE_SIZE };
    });
  };

  const setPage: React.Dispatch<React.SetStateAction<number>> = (next) => {
    setFilters((current) => ({
      ...current,
      page:
        typeof next === "function"
          ? (next as (previous: number) => number)(current.page)
          : next,
    }));
  };

  const clearFilters = () => {
    setFilters({ ...defaultCourseSearchRequest, page: 0, size: PAGE_SIZE });
  };

  const toggleCategory = (id: string) => {
    updateFilters((current) => ({
      ...current,
      categoryId: current.categoryId.includes(id)
        ? current.categoryId.filter((categoryId) => categoryId !== id)
        : [...current.categoryId, id],
    }));
  };

  const courses = coursesQuery.data?.courses ?? [];
  const meta = coursesQuery.data?.meta;
  const totalItems = meta?.totalElements ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const courseCategories = categoriesQuery.data ?? [];
  const isInitialLoading = coursesQuery.isLoading && !coursesQuery.data;
  const isBackgroundFetching = coursesQuery.isFetching && Boolean(coursesQuery.data);
  const courseErrorMessage = getCourseSearchErrorMessage(coursesQuery.error);

  const activeFilterCount =
    filters.categoryId.length +
    (filters.level ? 1 : 0) +
    (filters.isFree !== null ? 1 : 0) +
    (filters.hasQuiz !== null ? 1 : 0) +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.minAverageRating !== null || filters.maxAverageRating !== null ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg">
      <div className="bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-bg dark:via-surface dark:to-bg border-b border-gray-200 dark:border-border">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-text mb-1.5">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-muted mb-7 max-w-xl">
            {t("subtitle")}
          </p>

          <div className="flex flex-col gap-3.5 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-2xl">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              />
              <Input
                type="text"
                value={filters.keyword}
                onChange={(event) =>
                  updateFilters((current) => ({
                    ...current,
                    keyword: event.target.value,
                  }))
                }
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-3.5 py-3 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg text-gray-900 dark:text-text placeholder-gray-400 dark:placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
              {filters.keyword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateFilters((current) => ({ ...current, keyword: "" }))
                  }
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                updateFilters((current) => ({
                  ...current,
                  sortBy: value as CourseSortOption,
                }))
              }
            >
              <SelectTrigger className="h-12 w-full rounded-lg md:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-7">
        <div className="flex gap-7">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-border p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faSliders}
                    className="w-3.5 h-3.5 text-primary"
                  />
                  <span className="font-bold text-gray-900 dark:text-text">
                    {t("filter.title")}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="px-1 min-w-5 text-center py-0.5 bg-primary text-white text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 px-2 text-primary hover:text-primary/80"
                  >
                    {t("filter.clear")}
                  </Button>
                )}
              </div>
              <CourseSidebar
                filters={filters}
                setFilters={updateFilters}
                courseCategories={courseCategories}
                onApplyFilters={() => coursesQuery.refetch()}
                loading={coursesQuery.isFetching || categoriesQuery.isFetching}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-3.5 flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-md text-xs font-medium text-gray-700 dark:text-muted hover:border-primary transition-colors"
              >
                <FontAwesomeIcon icon={faFilter} className="w-3 h-3" />
                {t("filter.title")}
                {activeFilterCount > 0 && (
                  <span className="px-1 min-w-5 text-center py-0.5 bg-primary text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filters.categoryId.map((id) => {
                    const category = courseCategories.find((item) => item.id === id);
                    return category ? (
                      <span
                        key={id}
                        className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {category.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCategory(id)}
                          className="h-4 w-4"
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />
                        </Button>
                      </span>
                    ) : null;
                  })}
                  {filters.level && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {getLevelLabel(filters.level)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateFilters((current) => ({ ...current, level: null }))
                        }
                        className="h-4 w-4"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />
                      </Button>
                    </span>
                  )}
                  {filters.isFree !== null && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {filters.isFree ? t("filter.free") : t("filter.paid")}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateFilters((current) => ({ ...current, isFree: null }))
                        }
                        className="h-4 w-4"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />
                      </Button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {isBackgroundFetching && (
              <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                Updating results...
              </div>
            )}

            {isInitialLoading ? (
              <CourseGridSkeleton />
            ) : coursesQuery.isError ? (
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-14 text-center dark:border-border dark:bg-surface">
                <h3 className="text-lg font-bold text-gray-900 dark:text-text mb-1.5">
                  Failed to load courses
                </h3>
                <p className="mb-5 text-sm text-gray-600 dark:text-muted">
                  {courseErrorMessage}
                </p>
                <Button
                  type="button"
                  onClick={() => coursesQuery.refetch()}
                  className="!text-white"
                >
                  Try again
                </Button>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-14 text-center dark:border-border dark:bg-surface">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-text mb-1.5">
                  {t("noResults.title")}
                </h3>
                <p className="text-gray-600 dark:text-muted mb-5">
                  {t("noResults.subtitle")}
                </p>
                <Button
                  type="button"
                  onClick={clearFilters}
                  className="!text-white"
                >
                  {t("noResults.clear")}
                </Button>
              </div>
            )}

            <div className="w-full mt-5">
              <Pagination
                items={courses}
                totalItems={totalItems}
                totalPages={totalPages}
                page={filters.page}
                setPage={setPage}
                name={t("resultsCount")}
                disabled={coursesQuery.isFetching}
              />
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-surface shadow-2xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-900 dark:text-text">
                  {t("filter.title")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="w-4 h-4 text-gray-500"
                  />
                </Button>
              </div>
              <CourseSidebar
                filters={filters}
                setFilters={updateFilters}
                courseCategories={courseCategories}
                onApplyFilters={() => {
                  coursesQuery.refetch();
                  setSidebarOpen(false);
                }}
                loading={coursesQuery.isFetching || categoriesQuery.isFetching}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
