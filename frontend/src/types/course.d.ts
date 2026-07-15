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
type LectureContentType = "VIDEO" | "ARTICLE" | "QUIZ" | "FILE" | "EXTERNAL_LINK";

interface CourseCurriculumQuiz {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  totalQuestions: number;
  completed: boolean;
  status: LearningItemStatus;
}

interface QuizQuestionResponse {
  id: string;
  questionText: string;
  explanation: string | null;
  points: number;
  displayOrder: number;
  options: string[];
  correctAnswers: string[];
  imageUrl: string | null;
  videoUrl: string | null;
}

interface QuizQuestionRequest {
  quizId: string;
  questionText: string;
  explanation: string;
  points: number;
  options: string[];
  correctAnswers: string[];
  imageUrl: string;
  videoUrl: string;
}

interface QuizQuestionUpdateRequest {
  questionText: string;
  explanation: string;
  points: number;
  displayOrder: number;
  options: string[];
  correctAnswers: string[];
  imageUrl: string;
  videoUrl: string;
}

type QuizQuestionImportMode = "APPEND" | "REPLACE";

interface QuizQuestionImportItem {
  questionText: string;
  explanation?: string;
  points?: number;
  options: string[];
  correctAnswers: string[];
}

interface QuizQuestionImportRequest {
  quizId: string;
  mode: QuizQuestionImportMode;
  questions: QuizQuestionImportItem[];
}

interface QuizQuestionImportError {
  index: number | null;
  message: string;
}

interface QuizQuestionImportResponse {
  importedCount: number;
  skippedCount: number;
  errors: QuizQuestionImportError[];
  questions: QuizQuestionResponse[];
}

interface QuizRequest {
  lectureId: string;
  title: string;
  description: string;
  instructions: string;
  timeLimitMinutes: number | null;
  passingScore: number;
  maxAttempts: number | null;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  showAnswersAfterSubmission: boolean;
  totalPoints: number;
  isPublished: boolean;
}

interface QuizUpdateRequest {
  title: string;
  description: string;
  instructions: string;
  timeLimitMinutes: number | null;
  passingScore: number;
  maxAttempts: number | null;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  showAnswersAfterSubmission: boolean;
  totalPoints: number;
  isPublished: boolean;
}

interface QuizResponse extends QuizUpdateRequest {
  id: string;
  totalQuestions: number;
  questions: QuizQuestionResponse[];
}

interface QuizAnswerRequest {
  questionId: string;
  answers: string[];
}

interface QuizSubmitRequest {
  answers: QuizAnswerRequest[];
}

type QuizAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

interface QuizAttemptId {
  userId: string;
  quizId: string;
  attemptNumber: number;
}

interface QuizAttemptResponse {
  id: QuizAttemptId;
  attemptNumber: number;
  startedAt: string;
  quiz: QuizResponse;
  user: UserResponse;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  status: QuizAttemptStatus;
}

interface QuizAttemptAnswerResponse {
  questionId: string;
  answers: string[];
}

interface QuizAttemptQuestionReviewResponse {
  questionId: string;
  questionText: string;
  points: number;
  displayOrder: number;
  options: string[];
  selectedAnswers: string[];
  score: number;
  correct: boolean | null;
  correctAnswers: string[];
  explanation: string | null;
}

interface QuizAttemptReviewResponse {
  attempt: QuizAttemptResponse;
  showCorrectAnswers: boolean;
  questions: QuizAttemptQuestionReviewResponse[];
}

interface CourseCurriculumLecture {
  id: string;
  title: string;
  description: string | null;
  contentType: LectureContentType;
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

interface LectureRequest {
  sectionId: string;
  title: string;
  description: string;
  contentType: LectureContentType;
  textContent: string;
  videoUrl: string;
  videoDurationSeconds: number;
  videoThumbnailUrl: string;
  videoQuality: string;
  hasCaptions: boolean;
  captionUrl: string;
  attachments: string[];
  externalUrl: string;
  isPreview: boolean;
  isDownloadable: boolean;
  isPublished: boolean;
}

interface LectureUpdateRequest {
  title: string;
  description: string;
  contentType: LectureContentType;
  textContent: string;
  videoUrl: string;
  videoDurationSeconds: number;
  videoThumbnailUrl: string;
  videoQuality: string;
  hasCaptions: boolean;
  captionUrl: string;
  attachments: string[];
  externalUrl: string;
  isPreview: boolean;
  isDownloadable: boolean;
  displayOrder: number;
  isPublished: boolean;
}

interface LectureResponse extends LectureUpdateRequest {
  id: string;
  section: CourseSectionResponse;
  quiz: QuizResponse | CourseCurriculumQuiz | null;
}

interface LectureProgressId {
  userId: string;
  lectureId: string;
}

interface LectureProgressResponse {
  id: LectureProgressId;
  user: UserResponse;
  lecture: LectureResponse;
  progressPercentage: number;
  lastWatchedPositionSeconds: number | null;
  totalWatchTimeSeconds: number | null;
  completed: boolean;
  completedAt: string | null;
  firstWatchedAt: string | null;
  lastWatchedAt: string | null;
  viewCount: number;
  bookmarked: boolean;
  notes: string | null;
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

type CoursePublishChecklistStatus = "PASSED" | "FAILED" | "WARNING";

interface CoursePublishChecklistItem {
  key: string;
  status: CoursePublishChecklistStatus;
  message: string;
  targetType:
    | "COURSE_BASIC_INFO"
    | "SECTIONS"
    | "SECTION"
    | "LECTURES"
    | "LECTURE"
    | "LECTURE_PREVIEW"
    | "QUIZ";
  targetId: string;
}

interface CoursePublishChecklistGroup {
  key: string;
  label: string;
  items: CoursePublishChecklistItem[];
}

interface CoursePublishChecklistResponse {
  courseId: string;
  ready: boolean;
  groups: CoursePublishChecklistGroup[];
}

type AdminCourseReviewSortOption =
  | "SUBMITTED_DESC"
  | "SUBMITTED_ASC"
  | "UPDATED_DESC"
  | "UPDATED_ASC"
  | "TITLE_ASC"
  | "TITLE_DESC";

type CourseReviewAction = "SUBMITTED" | "RESUBMITTED" | "APPROVED" | "REJECTED";

interface AdminCourseReviewFilters {
  page: number;
  size: number;
  keyword: string;
  status: "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  categoryId: string;
  instructor: string;
  sortBy: AdminCourseReviewSortOption;
}

interface AdminCourseReviewItemResponse {
  id: string;
  title: string;
  instructor: UserResponse | null;
  category: CourseCategoryResponse | null;
  status: CourseStatus;
  totalSections: number;
  totalLectures: number;
  totalQuizzes: number;
  checklistReady: boolean;
  checklistPassed: number;
  checklistTotal: number;
  submittedAt: string | null;
  updatedAt: string | null;
}

interface CourseReviewHistoryResponse {
  id: string;
  courseId: string;
  reviewer: UserResponse | null;
  action: CourseReviewAction;
  fromStatus: CourseStatus | null;
  toStatus: CourseStatus;
  reason: string | null;
  createdAt: string;
}

interface AdminCourseReviewDetailResponse {
  course: CourseResponse;
  checklist: CoursePublishChecklistResponse;
  curriculum: CourseCurriculumResponse;
  reviewHistory: CourseReviewHistoryResponse[];
}

interface CourseRejectRequest {
  reason: string;
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
