interface EnrollmentId {
  userId: string;
  courseId: string;
}

interface EnrollmentResponse {
  id: EnrollmentId;
  user: UserResponse;
  course: CourseResponse;
  enrolledAt: Date;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedLectures: number;
  totalWatchTimeMinutes: number;
  lastAccessedAt: Date;
  completedAt: Date;
  certificateIssued: boolean;
  certificateIssuedAt: Date;
  paymentAmount: number;
  refundRequested: boolean;
  refundRequestedAt: Date;
  refunded: boolean;
  refundedAt: Date;
}