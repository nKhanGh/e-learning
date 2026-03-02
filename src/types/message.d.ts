interface CourseRecommendationDto{
  courseId: string;
  title: string;
  category: string,
  level: CourseLevel;
  thumbnailUrl: string;
  originalPrice: number;
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

interface MessageSendRequest {
  conversationId: string;
  parentId?: string | null;
  content: string;
}