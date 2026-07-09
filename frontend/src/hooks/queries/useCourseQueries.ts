import { defaultCourseSearchRequest } from "@/lib/courseSearch";
import { queryKeys } from "@/lib/queryKeys";
import { courseCategoryService } from "@/services/courseCategory.service";
import { courseService } from "@/services/course.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
