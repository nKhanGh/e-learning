"use client";

import { faArrowRight, faBolt, faClock, faGraduationCap, faMedal, faStar, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale } from "next-intl";
import Link from "next/link";

type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";



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

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        />
      ))}
    </div>
  );
}

const CourseCard = ({ course }: { course: CourseResponse }) => {
  const locale = useLocale();

  const COURSE_EMOJIS: Record<string, string> = {
  dev: "💻", design: "🎨", business: "📊", photo: "📸", music: "🎵", lang: "🌐",
};

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
    BEGINNER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    INTERMEDIATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ADVANCED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    ALL_LEVELS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };
  return map[level];
};

  const getCategoryEmoji = (categoryId: string): string => {
  return COURSE_EMOJIS[categoryId] ?? "📚";
};
  const emoji = getCategoryEmoji(course.category.id);
  
  return (
    <Link
      href={`/${locale}/courses/${course.id}`}
      className="group bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl flex-shrink-0">
        <span>{emoji}</span>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {course.isBestseller && (
            <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faMedal} className="w-2.5 h-2.5" /> Bestseller
            </span>
          )}
          {course.isNew && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faBolt} className="w-2.5 h-2.5" /> New
            </span>
          )}
          {course.isFree && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">Free</span>
          )}
        </div>
        {course.hasCertificate && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 dark:bg-surface/90 rounded-full flex items-center justify-center" title="Certificate available">
            <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getLevelColor(course.level)}`}>
            {getLevelLabel(course.level)}
          </span>
          <span className="text-xs text-gray-500 dark:text-muted flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
            {formatDuration(course.durationMinutes)}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-text mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 dark:text-muted mb-3">
          {course.instructor.firstName} {course.instructor.lastName}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900 dark:text-text text-sm">{course.averageRating.toFixed(1)}</span>
          <StarRating rating={course.averageRating} />
          <span className="text-xs text-gray-500 dark:text-muted">({course.totalReviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-muted">
          <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
          <span>{course.totalStudents.toLocaleString()} students</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-border">
          <div>
            {course.isFree ? (
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-900 dark:text-text">${course.price}</span>
                <span className="text-sm text-gray-400 dark:text-muted line-through ml-2">${course.originalPrice}</span>
              </>
            )}
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;