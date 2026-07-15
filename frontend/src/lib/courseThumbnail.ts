export const DEFAULT_COURSE_THUMBNAIL = "/default-course-background.png";

export const getCourseThumbnailSrc = (
  thumbnailUrl: string | null | undefined,
) => {
  const value = String(thumbnailUrl || "").trim();
  if (!value) return DEFAULT_COURSE_THUMBNAIL;

  try {
    const url = new URL(value);
    const googleImageUrl = url.searchParams.get("imgurl");

    if (googleImageUrl) {
      return decodeURIComponent(googleImageUrl);
    }

    return value;
  } catch {
    return value;
  }
};
