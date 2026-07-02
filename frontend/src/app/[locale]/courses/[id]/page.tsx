"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faBolt,
  faCheck,
  faClosedCaptioning,
  faGraduationCap,
  faLanguage,
  faListCheck,
  faMedal,
  faStar,
  faTag,
  faUserTie,
  faUsers,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import SectionAccordion from "@/components/courseDetail/SectionAcordion";
import PurchaseCard from "@/components/courseDetail/PurchaseCard";
import {
  useCourseCurriculumQuery,
  useCourseEnrollmentStatusQuery,
  useCourseQuery,
} from "@/hooks/queries/useCourseQueries";
import { useEnrollCourseMutation } from "@/hooks/queries/useEnrollmentQueries";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";

const getLevelLabel = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    ALL_LEVELS: "All Levels",
  };
  return map[level];
};

const formatDuration = (minutes: number): string => {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const cls =
    size === "lg" ? "w-4 h-4" : size === "md" ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`${cls} ${
            i <= Math.round(rating)
              ? "text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
};

const CourseDetailSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-bg">
    <div className="bg-gray-900 dark:bg-surface">
      <div className="mx-auto max-w-6xl px-3.5 py-10 sm:px-5 lg:px-7">
        <div className="max-w-2xl space-y-4">
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-full animate-pulse rounded bg-white/10" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
    <div className="mx-auto grid max-w-6xl gap-9 px-3.5 py-9 sm:px-5 lg:grid-cols-[1fr_380px] lg:px-7">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-border dark:bg-surface"
          />
        ))}
      </div>
      <div className="hidden h-96 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-border dark:bg-surface lg:block" />
    </div>
  </div>
);

const CourseDetailPage = () => {
  const t = useTranslations("CourseDetailPage");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const courseQuery = useCourseQuery(id);
  const curriculumQuery = useCourseCurriculumQuery(id);
  const enrollmentStatusQuery = useCourseEnrollmentStatusQuery(id);
  const enrollMutation = useEnrollCourseMutation(id);

  useEffect(() => {
    if (!courseQuery.isError) return;
    const status = isAxiosError(courseQuery.error)
      ? courseQuery.error.response?.status
      : undefined;
    if (status === 400 || status === 404) {
      router.replace(`/${locale}/errors/404`);
    }
  }, [courseQuery.error, courseQuery.isError, locale, router]);

  if (courseQuery.isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <div className="min-h-[60vh] bg-white px-4 py-20 text-center dark:bg-bg">
        <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-text">
          Could not load this course
        </h1>
        <p className="mb-5 text-sm text-gray-600 dark:text-muted">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => courseQuery.refetch()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  const course = courseQuery.data;
  const curriculum = curriculumQuery.data;
  const enrollmentStatus = enrollmentStatusQuery.data;
  const originalPrice = Number(course.originalPrice ?? 0);
  const price = Number(course.price ?? 0);
  const discount =
    originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  const totalSections = curriculum?.totalSections ?? course.totalSections;
  const totalLectures = curriculum?.totalLectures ?? course.totalLectures;
  const totalDuration =
    curriculum?.totalDurationMinutes ?? course.totalVideoLengthMinutes;
  const instructorInitials = `${course.instructor.firstName?.[0] ?? ""}${
    course.instructor.lastName?.[0] ?? ""
  }`;

  return (
    <div className="min-h-screen bg-white dark:bg-bg">
      <div className="bg-gray-900 dark:bg-surface text-white">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 pt-5 pb-7">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t("breadcrumb.home")}
            </Link>
            <span>/</span>
            <Link
              href={`/${locale}/courses`}
              className="hover:text-white transition-colors"
            >
              {t("breadcrumb.courses")}
            </Link>
            <span>/</span>
            <span className="text-gray-300">{course.category.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_380px] gap-7 items-start">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {course.isBestseller && (
                  <span className="px-2.5 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                    <FontAwesomeIcon icon={faMedal} className="w-2.5 h-2.5" />
                    Bestseller
                  </span>
                )}
                {course.isNew && (
                  <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <FontAwesomeIcon icon={faBolt} className="w-2.5 h-2.5" />
                    New
                  </span>
                )}
                {enrollmentStatus?.courseAccessStatus && (
                  <span className="px-2.5 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                    {enrollmentStatus.courseAccessStatus.toLowerCase()}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                  {course.category.name}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3.5 leading-tight">
                {course.title}
              </h1>

              <p className="text-gray-300 mb-5 text-sm leading-relaxed max-w-xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 font-bold text-base">
                    {Number(course.averageRating ?? 0).toFixed(1)}
                  </span>
                  <StarRating rating={Number(course.averageRating ?? 0)} size="md" />
                  <span className="text-gray-400 text-xs">
                    ({course.totalReviews.toLocaleString()} {t("reviews")})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                  <span>
                    {course.totalStudents.toLocaleString()} {t("students")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                  {instructorInitials}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t("createdBy")}</p>
                  <p className="text-primary font-medium text-xs">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faGraduationCap} className="w-3 h-3" />
                  {getLevelLabel(course.level)}
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                  {formatDuration(course.durationMinutes)} {t("totalHours")}
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faLanguage} className="w-3 h-3" />
                  {course.language}
                </span>
                {course.hasCaptions && (
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClosedCaptioning} className="w-3 h-3" />
                    CC
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-surface border-b border-gray-200 dark:border-border shadow-md px-3.5 py-2.5 flex items-center justify-between">
        <div>
          {course.isFree ? (
            <span className="text-lg font-bold text-emerald-600">Free</span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900 dark:text-text">
                ${course.price}
              </span>
              {course.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${course.originalPrice}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {enrollmentStatus?.courseAccessStatus?.toLowerCase() ?? "loading"}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-9">
        <div className="mb-7 lg:hidden">
          <PurchaseCard
            course={course}
            discount={discount}
            enrollmentStatus={enrollmentStatus}
            enrolling={enrollMutation.isPending}
            onEnroll={() => enrollMutation.mutate()}
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-9">
          <div className="space-y-9">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-4 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faListCheck} className="w-4 h-4 text-primary" />
                {t("whatYouLearn")}
              </h2>
              <div className="bg-gray-50 dark:bg-surface border border-gray-200 dark:border-border rounded-xl p-5 grid sm:grid-cols-2 gap-2.5">
                {(course.whatYouWillLearn ?? []).map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FontAwesomeIcon icon={faCheck} className="w-2 h-2 text-primary" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-muted">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-primary" />
                {t("courseContent")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-muted mb-4">
                {totalSections} {t("sections")} - {totalLectures} {t("lectures")} -{" "}
                {formatDuration(totalDuration)} {t("totalLength")}
              </p>
              {curriculumQuery.isLoading ? (
                <div className="space-y-1.5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-12 animate-pulse rounded-lg border border-gray-200 bg-gray-50 dark:border-border dark:bg-surface"
                    />
                  ))}
                </div>
              ) : curriculumQuery.isError ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center dark:border-border dark:bg-surface">
                  <p className="mb-3 text-sm text-gray-600 dark:text-muted">
                    Could not load course content.
                  </p>
                  <button
                    type="button"
                    onClick={() => curriculumQuery.refetch()}
                    className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-white"
                  >
                    Try again
                  </button>
                </div>
              ) : curriculum?.sections.length ? (
                <div className="space-y-1.5">
                  {curriculum.sections.map((section) => (
                    <SectionAccordion key={section.id} section={section} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-600 dark:border-border dark:bg-surface dark:text-muted">
                  No published curriculum yet.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-3.5">
                {t("requirements")}
              </h2>
              <ul className="space-y-1.5">
                {(course.requirements ?? []).map((requirement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-muted"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-4 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUserTie} className="w-4 h-4 text-primary" />
                {t("instructor")}
              </h2>
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {instructorInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-text">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </h3>
                  <p className="text-primary text-xs mb-2.5">Instructor</p>
                  <div className="flex flex-wrap gap-3.5 text-xs text-gray-600 dark:text-muted mb-2.5">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-400" />
                      {Number(course.averageRating ?? 0).toFixed(1)} Rating
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                      {course.totalStudents.toLocaleString()} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faBookOpen} className="w-3 h-3" />
                      {course.totalLectures} Lectures
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 dark:text-text mb-2.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 text-primary" />
                {t("tags")}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {(course.tags ?? []).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 bg-gray-100 dark:bg-surface text-gray-700 dark:text-muted text-xs rounded-md border border-gray-200 dark:border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20">
              <PurchaseCard
                course={course}
                discount={discount}
                enrollmentStatus={enrollmentStatus}
                enrolling={enrollMutation.isPending}
                onEnroll={() => enrollMutation.mutate()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
