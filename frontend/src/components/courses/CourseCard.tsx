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
          className={`w-2.5 h-2.5 ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
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
      className="group bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl flex-shrink-0">
        <span>{emoji}</span>
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {course.isBestseller && (
            <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faMedal} className="w-2 h-2" /> Bestseller
            </span>
          )}
          {course.isNew && (
            <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faBolt} className="w-2 h-2" /> New
            </span>
          )}
          {course.isFree && (
            <span className="px-1.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">Free</span>
          )}
        </div>
        {course.hasCertificate && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-white/90 dark:bg-surface/90 rounded-full flex items-center justify-center" title="Certificate available">
            <FontAwesomeIcon icon={faGraduationCap} className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${getLevelColor(course.level)}`}>
            {getLevelLabel(course.level)}
          </span>
          <span className="text-xs text-gray-500 dark:text-muted flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5" />
            {formatDuration(course.durationMinutes)}
          </span>
        </div>

        <h3 className="text-sm font-bold text-gray-900 dark:text-text mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 dark:text-muted mb-2.5">
          {course.instructor.firstName} {course.instructor.lastName}
        </p>

        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="font-bold text-gray-900 dark:text-text text-xs">{course.averageRating.toFixed(1)}</span>
          <StarRating rating={course.averageRating} />
          <span className="text-xs text-gray-500 dark:text-muted">({course.totalReviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3.5 text-xs text-gray-500 dark:text-muted">
          <FontAwesomeIcon icon={faUsers} className="w-2.5 h-2.5" />
          <span>{course.totalStudents.toLocaleString()} students</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-gray-100 dark:border-border">
          <div>
            {course.isFree ? (
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              <>
                <span className="text-lg font-bold text-gray-900 dark:text-text">${course.price}</span>
                <span className="text-xs text-gray-400 dark:text-muted line-through ml-1.5">${course.originalPrice}</span>
              </>
            )}
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;