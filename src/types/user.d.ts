interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  lockedUntil: Date | null;
  profile: UserProfileResponse | null;
  instructor: InstructorResponse | null;
}

interface UserProfileResponse {
  avatarUrl: string | null;
  bio: string | null;
  headline: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  githubUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
  notificationEmail: boolean | null;
  notificationPush: boolean | null;
}

interface InstructorResponse {
  tagline: string | null;
  about: string | null;
  teachingExperience: string | null;
  credentials: string | null;
  specializations: string[] | null;
  videoIntroUrl: string | null;
  verificationStatus: VerificationStatus | null;
  verificationDocuments: string[] | null;
  verifiedAt: Date | null;
  verifiedBy: number | null;
  totalStudents: number | null;
  totalCourses: number | null;
  totalReviews: number | null;
  averageRating: number | null;
  totalEarnings: number | null;
  payoutMethod: string | null;
  payoutDetails: string[] | null;
  commissionRate: number | null;
  featured: boolean | null;
}
