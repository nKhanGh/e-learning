import { queryKeys } from "@/lib/queryKeys";
import { enrollmentService } from "@/services/enrollment.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useEnrollCourseMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await enrollmentService.enroll(courseId);
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.me(courseId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.enrollmentStatus(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.curriculum(courseId),
      });
    },
  });
}
