import { queryKeys } from "@/lib/queryKeys";
import { enrollmentService } from "@/services/enrollment.service";
import { useQuery } from "@tanstack/react-query";

export function useMyEnrollmentQuery(courseId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.enrollments.me(courseId),
    queryFn: async () => {
      const response = await enrollmentService.getMyEnrollment(courseId);
      return response.data.result;
    },
    enabled: Boolean(courseId) && enabled,
    retry: false,
  });
}
