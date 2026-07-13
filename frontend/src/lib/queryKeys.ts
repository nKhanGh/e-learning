export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    search: (keyword: string) => ["users", "search", keyword] as const,
  },
  courses: {
    lists: ["courses"] as const,
    search: (request: CourseSearchRequest) =>
      ["courses", "search", request] as const,
    detail: (courseId: string) => ["courses", "detail", courseId] as const,
    my: (
      page: number,
      size: number,
      keyword: string,
      status: CourseStatus | undefined,
    ) => ["courses", "my", page, size, keyword, status] as const,
    curriculum: (courseId: string) => ["courses", "curriculum", courseId] as const,
    publishChecklist: (courseId: string) =>
      ["courses", "publish-checklist", courseId] as const,
    enrollmentStatus: (courseId: string) =>
      ["courses", "enrollment-status", courseId] as const,
    featured: (size: number) => ["courses", "featured", size] as const,
  },
  adminCourseReviews: {
    lists: ["admin", "course-reviews"] as const,
    list: (filters: AdminCourseReviewFilters) =>
      ["admin", "course-reviews", filters] as const,
  },
  courseCategories: {
    all: ["course-categories"] as const,
  },
  courseSections: {
    byCourse: (courseId: string) => ["course-sections", courseId] as const,
  },
  lectures: {
    bySection: (sectionId: string) => ["lectures", "section", sectionId] as const,
    detail: (lectureId: string) => ["lectures", "detail", lectureId] as const,
  },
  quizzes: {
    byLecture: (lectureId: string) => ["quizzes", "lecture", lectureId] as const,
    detail: (quizId: string) => ["quizzes", "detail", quizId] as const,
  },
  quizQuestions: {
    byQuiz: (quizId: string) => ["quiz-questions", "quiz", quizId] as const,
  },
  enrollments: {
    me: (courseId: string) => ["enrollments", "me", courseId] as const,
  },
  conversations: {
    my: ["conversations", "my"] as const,
    search: (keyword: string, isGroup: boolean) =>
      ["conversations", "search", keyword, isGroup] as const,
  },
  messages: {
    byConversation: (conversationId: string, page: number, size: number) =>
      ["messages", conversationId, page, size] as const,
  },
};
