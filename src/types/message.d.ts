interface CourseRecommendationDto{
  courseId: string;
  similarityScore: number;
  reason: string;
}

interface MessageResponse {
  createdAt: Instant;
  id: string;
  conversationId: string;
  parent: MessageResponse | null;
  sender: UserResponse;
  content: string;
  courseRecommendations: CourseRecommendationDto[];
}