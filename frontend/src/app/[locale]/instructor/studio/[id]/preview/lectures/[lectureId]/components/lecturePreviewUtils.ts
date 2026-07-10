export type CurriculumLectureItem = {
  section: CourseCurriculumSection;
  lecture: CourseCurriculumLecture;
};

export const getLectureMinutes = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return 0;

  const seconds =
    lecture.videoDurationSeconds ??
    ("durationMinutes" in lecture ? lecture.durationMinutes * 60 : 0);

  return Math.max(0, Math.round(seconds / 60));
};

export const getLecturePreview = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return false;
  return "isPreview" in lecture ? lecture.isPreview : lecture.preview;
};

export const getLectureDownloadable = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return false;
  return "isDownloadable" in lecture
    ? lecture.isDownloadable
    : lecture.downloadable;
};

export const getLecturePublished = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return false;
  return "isPublished" in lecture ? lecture.isPublished : lecture.status !== "LOCKED";
};

export const getResourceName = (url: string) => {
  const cleanUrl = url.split("?")[0] ?? url;
  const name = cleanUrl.split("/").filter(Boolean).pop();
  return name || url;
};

export const isExternalUrl = (value?: string | null) =>
  Boolean(value?.startsWith("http://") || value?.startsWith("https://"));

export const isFullQuizResponse = (
  quiz: QuizResponse | CourseCurriculumQuiz | null,
): quiz is QuizResponse => Boolean(quiz && "questions" in quiz);
