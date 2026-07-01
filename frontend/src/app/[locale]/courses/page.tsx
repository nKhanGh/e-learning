"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faTimes,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import CourseCard from "@/components/courses/CourseCard";
import CourseSidebar from "@/components/courses/CourseSidebar";
import Pagination from "@/components/ui/pagination";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import Loading from "@/components/ui/Loading";
import {
  useCourseCategoriesQuery,
  useCourseSearchQuery,
} from "@/hooks/queries/useCourseQueries";
import { defaultCourseSearchRequest } from "@/lib/courseSearch";

const getLevelLabel = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    ALL_LEVELS: "All Levels",
  };
  return map[level];
};

const CoursesPage = () => {
  const t = useTranslations("CoursesPage");
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CourseSearchRequest>({
    ...defaultCourseSearchRequest,
  });
  const [submittedFilters, setSubmittedFilters] = useState<CourseSearchRequest>({
    ...defaultCourseSearchRequest,
  });

  const size = 9;
  const coursesQuery = useCourseSearchQuery(submittedFilters, page, size);
  const categoriesQuery = useCourseCategoriesQuery();

  const applyFilters = () => {
    setPage(0);
    setSubmittedFilters(filters);
  };

  const courses = coursesQuery.data?.items ?? [];
  const totalItems = coursesQuery.data?.totalElements ?? 0;
  const totalPages = coursesQuery.data?.totalPages ?? 0;
  const courseCategories = categoriesQuery.data ?? [];
  const loading = coursesQuery.isFetching || categoriesQuery.isFetching;

  const toggleCategory = (id: string) => {
    setFilters((f) => ({
      ...f,
      categoryId: f.categoryId.includes(id)
        ? f.categoryId.filter((c) => c !== id)
        : [...f.categoryId, id],
    }));
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const clearFilters = () => {
    setFilters({ ...defaultCourseSearchRequest });
    setPage(0);
    setSubmittedFilters({ ...defaultCourseSearchRequest });
  };

  const activeFilterCount =
    filters.categoryId.length +
    (filters.level ? 1 : 0) +
    (filters.isFree !== null ? 1 : 0) +
    (filters.hasQuiz !== null ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg">
      {/* Page Header */}
      <div className="bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-bg dark:via-surface dark:to-bg border-b border-gray-200 dark:border-border">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-text mb-1.5">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-muted mb-7 max-w-xl">
            {t("subtitle")}
          </p>

          {/* Search Bar */}
          <div className="flex gap-3.5 items-center">
            <div className="relative min-w-xl">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              />
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-3.5 py-3 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg text-gray-900 dark:text-text placeholder-gray-400 dark:placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
              {filters.keyword && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, keyword: "" }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={applyFilters}
              className="px-5 py-2.5 bg-primary text-white min-w-12 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {loading ? <Loading size="smd" color="blue" /> :
                t("search")
              }

            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-7">
        <div className="flex gap-7">
          {/* Sidebar — Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-border p-4 sticky top-5">
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
                    <span className="px-1 py-0.5 bg-primary text-white text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {t("filter.clear")}
                  </button>
                )}
                
              </div>
              <CourseSidebar
                filters={filters}
                setFilters={setFilters}
                courseCategories={courseCategories}
                onApplyFilters={applyFilters}
                loading={loading}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="gap-1.5 mb-5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-3.5 flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-md text-xs font-medium text-gray-700 dark:text-muted hover:border-primary transition-colors"
              >
                <FontAwesomeIcon icon={faFilter} className="w-3 h-3" />
                {t("filter.title")}
                {activeFilterCount > 0 && (
                  <span className="px-1 py-0.5 bg-primary text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {filters.categoryId.map((id) => {
                      const cat = courseCategories.find((c) => c.id === id);
                      return cat ? (
                        <span
                          key={id}
                          className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {cat.name}
                          <button onClick={() => toggleCategory(id)}>
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="w-2.5 h-2.5"
                            />
                          </button>
                        </span>
                      ) : null;
                    })}
                    {filters.level && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {getLevelLabel(filters.level as CourseLevel)}
                        <button
                          onClick={() =>
                            setFilters((f) => ({ ...f, level: null }))
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {filters.isFree !== null && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {filters.isFree ? t("filter.free") : t("filter.paid")}
                        <button
                          onClick={() =>
                            setFilters((f) => ({ ...f, isFree: null }))
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
            </div>

            {/* Grid */}
            {coursesQuery.isError ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-bold text-gray-900 dark:text-text mb-1.5">
                  Failed to load courses
                </h3>
                <button
                  onClick={() => coursesQuery.refetch()}
                  className="px-5 py-2.5 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                {courses?.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-3.5">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-text mb-1.5">
                  {t("noResults.title")}
                </h3>
                <p className="text-gray-600 dark:text-muted mb-5">
                  {t("noResults.subtitle")}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  {t("noResults.clear")}
                </button>
              </div>
            )}
            <div className="w-full mt-3.5">
              <Pagination
                items={courses}
                totalItems={totalItems}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                name={t("resultsCount")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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
                <button onClick={() => setSidebarOpen(false)}>
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="w-4 h-4 text-gray-500"
                  />
                </button>
              </div>
              <CourseSidebar
                filters={filters}
                setFilters={setFilters}
                courseCategories={courseCategories}
                onApplyFilters={applyFilters}
                loading={loading}
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full mt-5 py-2.5 bg-primary text-white rounded-lg font-semibold"
              >
                {t("filter.apply")} ({courses.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
