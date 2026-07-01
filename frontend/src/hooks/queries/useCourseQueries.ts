import { defaultCourseSearchRequest } from "@/lib/courseSearch";
import { queryKeys } from "@/lib/queryKeys";
import { courseCategoryService } from "@/services/courseCategory.service";
import { courseService } from "@/services/course.service";
import { useQuery } from "@tanstack/react-query";

export function useCourseSearchQuery(
  request: CourseSearchRequest,
  page: number,
  size: number,
) {
  return useQuery({
    queryKey: queryKeys.courses.search(request, page, size),
    queryFn: async () => {
      const response = await courseService.searchCourses({ request, page, size });
      return response.data.result;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useFeaturedCoursesQuery(size = 6) {
  return useCourseSearchQuery(defaultCourseSearchRequest, 0, size);
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
