import { defaultCourseSearchRequest } from "@/lib/courseSearch";
import { queryKeys } from "@/lib/queryKeys";
import { courseCategoryService } from "@/services/courseCategory.service";
import { courseService } from "@/services/course.service";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toSearchCourseItem = (
  item: CourseResponse | CourseSearchCourseItem,
): CourseSearchCourseItem => {
  if ("instructorName" in item) {
    return item;
  }

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    thumbnailUrl: item.thumbnailUrl,
    categoryId: item.category?.id,
    categoryName: item.category?.name,
    level: item.level,
    language: item.language,
    price: item.price,
    originalPrice: item.originalPrice,
    isFree: item.isFree,
    hasQuizzes: item.hasQuizzes,
    hasCertificate: item.hasCertificate,
    isFeatured: item.isFeatured,
    isBestseller: item.isBestseller,
    averageRating: item.averageRating,
    totalReviews: item.totalReviews,
    totalEnrollments: item.totalEnrollments,
    durationMinutes: item.durationMinutes,
    totalLectures: item.totalLectures,
    instructorId: item.instructor?.id,
    instructorName: `${item.instructor?.firstName ?? ""} ${item.instructor?.lastName ?? ""}`.trim(),
    tagNames: item.tags?.map((tag) => tag.name) ?? [],
  };
};

const normalizeCourseSearchPage = (
  response: unknown,
): CourseSearchPage => {
  if (!isRecord(response)) {
    const responsePreview =
      typeof response === "string" ? response.slice(0, 120).trim() : "";
    const isHtml = responsePreview.toLowerCase().startsWith("<!doctype html");

    throw new Error(
      isHtml
        ? "Course search returned the backend login HTML page instead of JSON. Check backend security whitelist for POST /courses/search."
        : "Course search returned an invalid response format.",
    );
  }

  const payload = ("result" in response && response.result
    ? response.result
    : response) as CourseSearchPage | LegacyCourseSearchPage;

  if (!isRecord(payload)) {
    throw new Error("Course search returned an invalid payload format.");
  }

  if ("courses" in payload) {
    return payload as CourseSearchPage;
  }

  const legacyPayload = payload as LegacyCourseSearchPage;
  const items = legacyPayload.items ?? [];
  const page =
    "page" in legacyPayload && typeof legacyPayload.page === "number"
      ? legacyPayload.page
      : legacyPayload.currentPage ?? 0;
  const size =
    "size" in legacyPayload && typeof legacyPayload.size === "number"
      ? legacyPayload.size
      : items.length;

  return {
    courses: items.map(toSearchCourseItem),
    meta: {
      page,
      size,
      totalElements: legacyPayload.totalElements,
      totalPages: legacyPayload.totalPages,
      hasNext: page < legacyPayload.totalPages - 1,
      hasPrevious: page > 0,
    },
  };
};

export function useCourseSearchQuery(
  request: CourseSearchRequest,
) {
  return useQuery({
    queryKey: queryKeys.courses.search(request),
    queryFn: async () => {
      const response = await courseService.searchCourses(request);
      return normalizeCourseSearchPage(response.data);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useFeaturedCoursesQuery(size = 6) {
  return useCourseSearchQuery({ ...defaultCourseSearchRequest, page: 0, size });
}

export function useCourseQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: async () => {
      const response = await courseService.getCourse(courseId);
      return response.data.result;
    },
    enabled: Boolean(courseId),
  });
}

export function useMyCoursesQuery(
  page: number,
  size: number,
  keyword: string,
  status?: CourseStatus,
) {
  return useQuery({
    queryKey: queryKeys.courses.my(page, size, keyword, status),
    queryFn: async () => {
      const response = await courseService.getMyCourses(page, size, keyword, status);
      return response.data.result;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminCourseReviewsQuery(
  filters: AdminCourseReviewFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.adminCourseReviews.list(filters),
    queryFn: async () => {
      const response = await courseService.getAdminCourseReviews(filters);
      return response.data.result;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CourseCreationRequest) => {
      const response = await courseService.createCourse(request);
      return response.data.result;
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists });
      queryClient.setQueryData(queryKeys.courses.detail(course.id), course);
    },
  });
}

export function useUpdateCourseMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CourseUpdateRequest) => {
      const response = await courseService.updateCourse(courseId, request);
      return response.data.result;
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists });
      queryClient.setQueryData(queryKeys.courses.detail(course.id), course);
    },
  });
}

const invalidateCourseStructure = (
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.courses.curriculum(courseId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.courses.detail(courseId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.courseSections.byCourse(courseId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.courses.publishChecklist(courseId),
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists });
};

export function useCourseCurriculumQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.curriculum(courseId),
    queryFn: async () => {
      const response = await courseService.getCurriculum(courseId);
      return response.data.result;
    },
    enabled: Boolean(courseId),
  });
}

export function useCourseSectionsQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courseSections.byCourse(courseId),
    queryFn: async () => {
      const response = await courseService.getCourseSections(courseId);
      return response.data.result;
    },
    enabled: Boolean(courseId),
  });
}

export function useCoursePublishChecklistQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.publishChecklist(courseId),
    queryFn: async () => {
      const response = await courseService.getPublishChecklist(courseId);
      return response.data.result;
    },
    enabled: Boolean(courseId),
  });
}

export function useSubmitCourseForReviewMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await courseService.submitForReview(courseId);
      return response.data.result;
    },
    onSuccess: (course) => {
      queryClient.setQueryData(queryKeys.courses.detail(course.id), course);
      invalidateCourseStructure(queryClient, course.id);
    },
  });
}

export function useCreateCourseSectionMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<CourseSectionRequest, "courseId">) => {
      const response = await courseService.createCourseSection({
        ...request,
        courseId,
      });
      return response.data.result;
    },
    onSuccess: () => {
      invalidateCourseStructure(queryClient, courseId);
    },
  });
}

export function useUpdateCourseSectionMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      request,
    }: {
      sectionId: string;
      request: Omit<CourseSectionRequest, "courseId">;
    }) => {
      const response = await courseService.updateCourseSection(sectionId, {
        ...request,
        courseId,
      });
      return response.data.result;
    },
    onSuccess: () => {
      invalidateCourseStructure(queryClient, courseId);
    },
  });
}

export function useDeleteCourseSectionMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sectionId: string) => {
      await courseService.deleteCourseSection(sectionId);
      return sectionId;
    },
    onSuccess: () => {
      invalidateCourseStructure(queryClient, courseId);
    },
  });
}

export function useLecturesBySectionQuery(sectionId: string) {
  return useQuery({
    queryKey: queryKeys.lectures.bySection(sectionId),
    queryFn: async () => {
      const response = await courseService.getLecturesBySection(sectionId);
      return response.data.result;
    },
    enabled: Boolean(sectionId),
  });
}

export function useLecturesBySectionsQuery(sectionIds: string[]) {
  return useQueries({
    queries: sectionIds.map((sectionId) => ({
      queryKey: queryKeys.lectures.bySection(sectionId),
      queryFn: async () => {
        const response = await courseService.getLecturesBySection(sectionId);
        return response.data.result;
      },
      enabled: Boolean(sectionId),
    })),
  });
}

export function useLectureQuery(lectureId: string) {
  return useQuery({
    queryKey: queryKeys.lectures.detail(lectureId),
    queryFn: async () => {
      const response = await courseService.getLecture(lectureId);
      return response.data.result;
    },
    enabled: Boolean(lectureId),
  });
}

const invalidateLectureStructure = (
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  sectionId: string,
) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.lectures.bySection(sectionId),
  });
  invalidateCourseStructure(queryClient, courseId);
};

export function useCreateLectureMutation(courseId: string, sectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<LectureRequest, "sectionId">) => {
      const response = await courseService.createLecture({
        ...request,
        sectionId,
      });
      return response.data.result;
    },
    onSuccess: () => {
      invalidateLectureStructure(queryClient, courseId, sectionId);
    },
  });
}

export function useUpdateLectureMutation(courseId: string, sectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lectureId,
      request,
    }: {
      lectureId: string;
      request: LectureUpdateRequest;
    }) => {
      const response = await courseService.updateLecture(lectureId, request);
      return response.data.result;
    },
    onSuccess: (lecture) => {
      queryClient.setQueryData(queryKeys.lectures.detail(lecture.id), lecture);
      invalidateLectureStructure(queryClient, courseId, sectionId);
    },
  });
}

export function useDeleteLectureMutation(courseId: string, sectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      await courseService.deleteLecture(lectureId);
      return lectureId;
    },
    onSuccess: (lectureId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.lectures.detail(lectureId),
      });
      invalidateLectureStructure(queryClient, courseId, sectionId);
    },
  });
}

const isQuizNotFoundError = (error: unknown) => {
  if (!isAxiosError(error)) return false;

  const data = error.response?.data as
    | { message?: string; code?: number }
    | undefined;

  return (
    error.response?.status === 400 &&
    (data?.message === "Quiz not found" || data?.code === 400)
  );
};

export function useQuizByLectureQuery(lectureId: string) {
  return useQuery({
    queryKey: queryKeys.quizzes.byLecture(lectureId),
    queryFn: async () => {
      try {
        const response = await courseService.getQuizByLecture(lectureId);
        return response.data.result;
      } catch (error) {
        if (isQuizNotFoundError(error)) {
          return null;
        }

        throw error;
      }
    },
    enabled: Boolean(lectureId),
    retry: false,
  });
}

const invalidateQuizStructure = (
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  lectureId: string,
  sectionId?: string,
  quizId?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.quizzes.byLecture(lectureId),
  });
  if (quizId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(quizId) });
  }
  if (sectionId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.lectures.bySection(sectionId),
    });
  }
  invalidateCourseStructure(queryClient, courseId);
};

export function useCreateQuizMutation(
  courseId: string,
  lectureId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<QuizRequest, "lectureId">) => {
      const response = await courseService.createQuiz({
        ...request,
        lectureId,
      });
      return response.data.result;
    },
    onSuccess: (quiz) => {
      queryClient.setQueryData(queryKeys.quizzes.byLecture(lectureId), quiz);
      queryClient.setQueryData(queryKeys.quizzes.detail(quiz.id), quiz);
      invalidateQuizStructure(
        queryClient,
        courseId,
        lectureId,
        sectionId,
        quiz.id,
      );
    },
  });
}

export function useUpdateQuizMutation(
  courseId: string,
  lectureId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      request,
    }: {
      quizId: string;
      request: QuizUpdateRequest;
    }) => {
      const response = await courseService.updateQuiz(quizId, request);
      return response.data.result;
    },
    onSuccess: (quiz) => {
      queryClient.setQueryData(queryKeys.quizzes.byLecture(lectureId), quiz);
      queryClient.setQueryData(queryKeys.quizzes.detail(quiz.id), quiz);
      invalidateQuizStructure(
        queryClient,
        courseId,
        lectureId,
        sectionId,
        quiz.id,
      );
    },
  });
}

export function useDeleteQuizMutation(
  courseId: string,
  lectureId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      await courseService.deleteQuiz(quizId);
      return quizId;
    },
    onSuccess: (quizId) => {
      queryClient.setQueryData(queryKeys.quizzes.byLecture(lectureId), null);
      queryClient.removeQueries({ queryKey: queryKeys.quizzes.detail(quizId) });
      invalidateQuizStructure(
        queryClient,
        courseId,
        lectureId,
        sectionId,
        quizId,
      );
    },
  });
}

export function useQuizQuestionsQuery(quizId: string) {
  return useQuery({
    queryKey: queryKeys.quizQuestions.byQuiz(quizId),
    queryFn: async () => {
      const response = await courseService.getQuizQuestions(quizId);
      return response.data.result;
    },
    enabled: Boolean(quizId),
  });
}

const invalidateQuizQuestionStructure = (
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  lectureId: string,
  quizId: string,
  sectionId?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.quizQuestions.byQuiz(quizId),
  });
  invalidateQuizStructure(queryClient, courseId, lectureId, sectionId, quizId);
};

export function useCreateQuizQuestionMutation(
  courseId: string,
  lectureId: string,
  quizId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<QuizQuestionRequest, "quizId">) => {
      const response = await courseService.createQuizQuestion({
        ...request,
        quizId,
      });
      return response.data.result;
    },
    onSuccess: () => {
      invalidateQuizQuestionStructure(
        queryClient,
        courseId,
        lectureId,
        quizId,
        sectionId,
      );
    },
  });
}

export function useImportQuizQuestionsMutation(
  courseId: string,
  lectureId: string,
  quizId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<QuizQuestionImportRequest, "quizId">) => {
      const response = await courseService.importQuizQuestions({
        ...request,
        quizId,
      });
      return response.data.result;
    },
    onSuccess: () => {
      invalidateQuizQuestionStructure(
        queryClient,
        courseId,
        lectureId,
        quizId,
        sectionId,
      );
    },
  });
}

export function useUpdateQuizQuestionMutation(
  courseId: string,
  lectureId: string,
  quizId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      request,
    }: {
      questionId: string;
      request: QuizQuestionUpdateRequest;
    }) => {
      const response = await courseService.updateQuizQuestion(
        questionId,
        request,
      );
      return response.data.result;
    },
    onSuccess: () => {
      invalidateQuizQuestionStructure(
        queryClient,
        courseId,
        lectureId,
        quizId,
        sectionId,
      );
    },
  });
}

export function useDeleteQuizQuestionMutation(
  courseId: string,
  lectureId: string,
  quizId: string,
  sectionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      await courseService.deleteQuizQuestion(questionId);
      return questionId;
    },
    onSuccess: () => {
      invalidateQuizQuestionStructure(
        queryClient,
        courseId,
        lectureId,
        quizId,
        sectionId,
      );
    },
  });
}

export function useCourseEnrollmentStatusQuery(courseId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.courses.enrollmentStatus(courseId),
    queryFn: async () => {
      const response = await courseService.getEnrollmentStatus(courseId);
      return response.data.result;
    },
    enabled: Boolean(courseId) && enabled,
    retry: false,
  });
}

export function useCourseCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.courseCategories.all,
    queryFn: async () => {
      const response = await courseCategoryService.getAllCategories();
      return response.data.result;
    },
    staleTime: 10 * 60_000,
  });
}
