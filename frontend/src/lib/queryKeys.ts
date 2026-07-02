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
    my: (page: number, size: number) => ["courses", "my", page, size] as const,
    curriculum: (courseId: string) => ["courses", "curriculum", courseId] as const,
    enrollmentStatus: (courseId: string) =>
      ["courses", "enrollment-status", courseId] as const,
    featured: (size: number) => ["courses", "featured", size] as const,
  },
  courseCategories: {
    all: ["course-categories"] as const,
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
