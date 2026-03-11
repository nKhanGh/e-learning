"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faTimes,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import CourseCard from "@/components/courses/CourseCard";
import { courseService } from "@/services/course.service";
import CourseSidebar from "@/components/courses/CourseSidebar";
import Pagination from "@/components/ui/pagination";
import { courseCategoryService } from "@/services/courseCategory.service";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import Loading from "@/components/ui/Loading";

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
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [applyFilter, setApplyFilter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState<
    CourseCategoryResponse[]
  >([]);
  const [filters, setFilters] = useState<CourseSearchRequest>({
    keyword: "",
    categoryId: [],
    level: "",
    minPrice: null,
    maxPrice: null,
    minAverageRating: null,
    maxAverageRating: null,
    isFree: null,
    hasQuiz: null,
    tagNames: [],
  });

  const size = 9;

  const fetchCourses = async () => {
    if (loading) return;
    if (applyFilter) {
      setPage(0);
      setApplyFilter(false);
    }
    try {
      setLoading(true);
      const response = await courseService.searchCourses({
        request: filters,
        page,
        size,
      });
      console.log(response);
      setCourses(response.data.result.items);
      setTotalItems(response.data.result.totalElements);
      setTotalPages(response.data.result.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, applyFilter]);

  useEffect(() => {
    const fetchCourseCategories = async () => {
      try {
        const response = await courseCategoryService.getAllCategories();
        console.log("Fetched course categories:", response);
        setCourseCategories(response.data.result);
      } catch (error) {
        console.error("Failed to fetch course categories:", error);
      }
    };
    fetchCourseCategories();
  }, []);

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
    setFilters({
      keyword: "",
      categoryId: [],
      level: "",
      minPrice: null,
      maxPrice: null,
      minAverageRating: null,
      maxAverageRating: null,
      isFree: null,
      hasQuiz: null,
      tagNames: [],
    });
    setApplyFilter(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-text mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-muted mb-8 max-w-2xl">
            {t("subtitle")}
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative min-w-2xl">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-text placeholder-gray-400 dark:placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
              {filters.keyword && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, keyword: "" }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setApplyFilter(true)}
              className="px-6 py-3 bg-primary text-white min-w-14 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              {loading ? <Loading size="smd" color="blue" /> :
                t("search")
              }

            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar — Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-border p-5 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faSliders}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-bold text-gray-900 dark:text-text">
                    {t("filter.title")}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
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
                setApplyFilters={setApplyFilter}
                loading={loading}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="gap-2 mb-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg text-sm font-medium text-gray-700 dark:text-muted hover:border-primary transition-colors"
              >
                <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5" />
                {t("filter.title")}
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filters.categoryId.map((id) => {
                      const cat = courseCategories.find((c) => c.id === id);
                      return cat ? (
                        <span
                          key={id}
                          className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {cat.name}
                          <button onClick={() => toggleCategory(id)}>
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="w-3 h-3"
                            />
                          </button>
                        </span>
                      ) : null;
                    })}
                    {filters.level && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {getLevelLabel(filters.level as CourseLevel)}
                        <button
                          onClick={() =>
                            setFilters((f) => ({ ...f, level: "" }))
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.isFree !== null && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {filters.isFree ? t("filter.free") : t("filter.paid")}
                        <button
                          onClick={() =>
                            setFilters((f) => ({ ...f, isFree: null }))
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
            </div>

            {/* Grid */}
            {courses.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
                {courses?.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-text mb-2">
                  {t("noResults.title")}
                </h3>
                <p className="text-gray-600 dark:text-muted mb-6">
                  {t("noResults.subtitle")}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {t("noResults.clear")}
                </button>
              </div>
            )}
            <div className="w-full mt-4">
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
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-surface shadow-2xl overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-gray-900 dark:text-text">
                  {t("filter.title")}
                </span>
                <button onClick={() => setSidebarOpen(false)}>
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="w-5 h-5 text-gray-500"
                  />
                </button>
              </div>
              <CourseSidebar
                filters={filters}
                setFilters={setFilters}
                courseCategories={courseCategories}
                setApplyFilters={setApplyFilter}
                loading={loading}
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-semibold"
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
