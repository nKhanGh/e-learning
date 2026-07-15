"use client";

import { getCourseThumbnailSrc } from "@/lib/courseThumbnail";
import {
  faArrowRight,
  faBolt,
  faClock,
  faGraduationCap,
  faMedal,
  faStar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale } from "next-intl";
import Link from "next/link";

type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type CourseCardCourse = CourseResponse | CourseSearchCourseItem;

interface CourseTagResponse {
  id: string;
  name: string;
}

interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CourseCategoryResponse {
  id: string;
  name: string;
  description: string;
  parent: CourseCategoryResponse | null;
  children: CourseCategoryResponse[];
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

interface CourseResponse {
  id: string;
  instructor: UserResponse;
  category: CourseCategoryResponse;
  title: string;
  slug: string;
  description: string;
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  thumbnailUrl: string;
  promotionalVideoUrl: string;
  price: number;
  originalPrice: number;
  currency: string;
  isFree: boolean;
  level: CourseLevel;
  language: string;
  hasCaptions: boolean;
  durationMinutes: number;
  status: CourseStatus;
  publishedAt: Date;
  lastUpdatedContent: Date;
  hasCertificate: boolean;
  hasQuizzes: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  totalEnrollments: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
  totalLectures: number;
  totalSections: number;
  totalVideoLengthMinutes: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  tags: CourseTagResponse[];
}

const CourseCard = ({ course }: { course: CourseCardCourse }) => {
  const locale = useLocale();
  const instructorName =
    "instructor" in course
      ? `${course.instructor.firstName} ${course.instructor.lastName}`
      : course.instructorName;
  const totalStudents =
    "totalStudents" in course ? course.totalStudents : course.totalEnrollments;
  const isNew = "isNew" in course ? course.isNew : false;
  const thumbnailSrc = getCourseThumbnailSrc(course.thumbnailUrl);

  return (
    <Link
      href={`/${locale}/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-border dark:bg-surface"
    >
      <div className="relative h-40 shrink-0 bg-gray-100 dark:bg-border">
        <img
          src={thumbnailSrc}
          alt={course.title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = "/default-course-background.png";
          }}
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {course.isBestseller && (
            <span className="flex items-center gap-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-xs font-bold text-yellow-900">
              <FontAwesomeIcon icon={faMedal} className="h-2 w-2" />
              Bestseller
            </span>
          )}
          {isNew && (
            <span className="flex items-center gap-1 rounded-full bg-green-500 px-1.5 py-0.5 text-xs font-bold text-white">
              <FontAwesomeIcon icon={faBolt} className="h-2 w-2" />
              New
            </span>
          )}
          {course.isFree && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-white">
              Free
            </span>
          )}
        </div>
        {course.hasCertificate && (
          <div
            className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 dark:bg-surface/90"
            title="Certificate available"
          >
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="h-3 w-3 text-primary"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-semibold ${getLevelColor(
              course.level,
            )}`}
          >
            {getLevelLabel(course.level)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-muted">
            <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
            {formatDuration(course.durationMinutes)}
          </span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary dark:text-text">
          {course.title}
        </h3>

        <p className="mb-2.5 text-xs text-gray-500 dark:text-muted">
          {instructorName}
        </p>

        <div className="mb-2.5 flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-900 dark:text-text">
            {course.averageRating.toFixed(1)}
          </span>
          <StarRating rating={course.averageRating} />
          <span className="text-xs text-gray-500 dark:text-muted">
            ({course.totalReviews.toLocaleString()})
          </span>
        </div>

        <div className="mb-3.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted">
          <FontAwesomeIcon icon={faUsers} className="h-2.5 w-2.5" />
          <span>{totalStudents.toLocaleString()} students</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3.5 dark:border-border">
          <div>
            {course.isFree ? (
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            ) : (
              <>
                <span className="text-lg font-bold text-gray-900 dark:text-text">
                  ${course.price}
                </span>
                {course.originalPrice ? (
                  <span className="ml-1.5 text-xs text-gray-400 line-through dark:text-muted">
                    ${course.originalPrice}
                  </span>
                ) : null}
              </>
            )}
          </div>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`h-2.5 w-2.5 ${
          i <= Math.round(rating)
            ? "text-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ))}
  </div>
);

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  return `${h}h`;
};

const getLevelLabel = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    ALL_LEVELS: "All Levels",
  };
  return map[level];
};

const getLevelColor = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = {
    BEGINNER:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    INTERMEDIATE:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ADVANCED:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    ALL_LEVELS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };
  return map[level];
};

export default CourseCard;
