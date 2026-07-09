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

interface CourseCreationRequest {
  categoryId: string;
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
  lastUpdatedContent: Date;
  hasCertificate: boolean;
  hasQuizzes: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  tagNames: string[];
}

interface CourseSearchRequest {
  keyword: string;
  categoryId: string[];
  level: CourseLevel | null;
  minPrice: number | null;
  maxPrice: number | null;
  minAverageRating: number | null;
  maxAverageRating: number | null;
  isFree: boolean | null;
  hasQuiz: boolean | null;
  tagNames: string[];
  page: number;
  size: number;
  sortBy: CourseSortOption;
}

type CourseStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED"
  | "REJECTED";

type CourseSortOption =
  | "RELEVANCE"
  | "NEWEST"
  | "RATING"
  | "POPULARITY"
  | "PRICE_ASC"
  | "PRICE_DESC";

interface CourseSearchCourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  categoryId: string;
  categoryName: string;
  level: CourseLevel;
  language: string;
  price: number;
  originalPrice: number | null;
  isFree: boolean;
  hasQuizzes: boolean;
  hasCertificate: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  averageRating: number;
  totalReviews: number;
  totalEnrollments: number;
  durationMinutes: number;
  totalLectures: number;
  instructorId: string;
  instructorName: string;
  tagNames: string[];
  searchScore?: number;
  highlights?: Record<string, string[]>;
}

interface CourseSearchPageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface CourseSearchPage {
  courses: CourseSearchCourseItem[];
  meta: CourseSearchPageMeta;
  facets?: {
    categories?: { key: string; docCount: number }[];
    levels?: { key: string; docCount: number }[];
    tagNames?: { key: string; docCount: number }[];
    priceStats?: { min: number; max: number; avg: number };
  };
  searchInfo?: {
    tookMs: number;
    fromCache: boolean;
    spellSuggestion?: string;
    traceId?: string;
  };
}

type CourseSearchApiResponse =
  | CourseSearchPage
  | ApiResponse<CourseSearchPage>
  | LegacyCourseSearchPage
  | ApiResponse<LegacyCourseSearchPage>;

type LegacyCourseSearchPage = PageResponse<CourseResponse | CourseSearchCourseItem> & {
  page?: number;
  size?: number;
};

type LearningItemStatus = "FREE_PREVIEW" | "AVAILABLE" | "LOCKED" | "COMPLETED";
type CourseAccessStatus = "FREE" | "ENROLLED" | "LOCKED" | "COMPLETED" | "AVAILABLE";

interface CourseCurriculumQuiz {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  totalQuestions: number;
  completed: boolean;
  status: LearningItemStatus;
}

interface CourseCurriculumLecture {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  displayOrder: number;
  durationMinutes: number;
  videoDurationSeconds: number | null;
  preview: boolean;
  downloadable: boolean;
  completed: boolean;
  status: LearningItemStatus;
  quiz: CourseCurriculumQuiz | null;
}

interface CourseCurriculumSection {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  durationMinutes: number;
  isPublished?: boolean;
  lectures: CourseCurriculumLecture[];
}

interface CourseSectionRequest {
  courseId: string;
  title: string;
  description: string;
  displayOrder: number;
  durationMinutes: number;
  isPublished: boolean;
}

interface CourseSectionResponse {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  durationMinutes: number;
  isPublished: boolean;
}

interface CourseCurriculumResponse {
  courseId: string;
  totalSections: number;
  totalLectures: number;
  totalDurationMinutes: number;
  sections: CourseCurriculumSection[];
}

interface CourseEnrollmentStatusResponse {
  courseId: string;
  authenticated: boolean;
  free: boolean;
  enrolled: boolean;
  locked: boolean;
  completed: boolean;
  courseAccessStatus: CourseAccessStatus;
  enrollmentStatus: EnrollmentStatus | null;
  progressPercentage: number;
  completedLectures: number;
  totalLectures: number;
  enrolledAt: Date | null;
  completedAt: Date | null;
  completedLectureIds: string[];
}

interface CourseUpdateRequest {
  categoryId: string;
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
  lastUpdatedContent: Date;
  hasCertificate: boolean;
  hasQuizzes: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  tagNames: string[];
}
