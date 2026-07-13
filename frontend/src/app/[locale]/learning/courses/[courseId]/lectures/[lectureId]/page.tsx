"use client";

import { CourseLectureSidebar } from "@/components/courseDetail/CourseLectureSidebar";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourseCurriculumQuery,
  useCourseEnrollmentStatusQuery,
  useCourseQuery,
  useLectureQuery,
} from "@/hooks/queries/useCourseQueries";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const canOpenLecture = (
  lecture?: CourseCurriculumLecture,
  enrollmentStatus?: CourseEnrollmentStatusResponse,
) => {
  if (!lecture) return false;
  if (lecture.status === "LOCKED") return false;
  return Boolean(enrollmentStatus?.enrolled || lecture.status === "FREE_PREVIEW");
};

const StudentLecturePage = () => {
  const locale = useLocale();
  const t = useTranslations("StudentLecturePage");
  const params = useParams<{ courseId: string; lectureId: string }>();
  const courseId = params.courseId;
  const lectureId = params.lectureId;
  const { isLoggedIn, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const courseQuery = useCourseQuery(courseId);
  const curriculumQuery = useCourseCurriculumQuery(courseId);
  const enrollmentStatusQuery = useCourseEnrollmentStatusQuery(courseId, isLoggedIn);
  const curriculum = curriculumQuery.data;

  const sidebarSections = useMemo(
    () =>
      sortByDisplayOrder(curriculum?.sections ?? []).map((section) => ({
        ...section,
        lectures: sortByDisplayOrder(section.lectures),
      })),
    [curriculum?.sections],
  );

  const flatLectures = useMemo(
    () =>
      sidebarSections.flatMap((section) =>
        section.lectures.map((lecture) => ({ section, lecture })),
      ),
    [sidebarSections],
  );

  const currentIndex = flatLectures.findIndex(
    (item) => item.lecture.id === lectureId,
  );
  const currentItem = currentIndex >= 0 ? flatLectures[currentIndex] : undefined;
  const previousItem = findNavigableItem(flatLectures, currentIndex, -1);
  const nextItem = findNavigableItem(flatLectures, currentIndex, 1);
  const enrollmentStatus = enrollmentStatusQuery.data;
  const allowed = canOpenLecture(currentItem?.lecture, enrollmentStatus);
  const lectureQuery = useLectureQuery(allowed ? lectureId : "");
  const lecture = lectureQuery.data;
  const displayLecture = lecture ?? currentItem?.lecture;

  if (!isLoggedIn) {
    return <LearningState title={t("auth.signInTitle")} subtitle={t("auth.signInSubtitle")} />;
  }

  if (user?.role !== UserRole.STUDENT) {
    return (
      <LearningState
        title={t("auth.studentOnlyTitle")}
        subtitle={t("auth.studentOnlySubtitle")}
      />
    );
  }

  const loading =
    courseQuery.isLoading ||
    curriculumQuery.isLoading ||
    enrollmentStatusQuery.isLoading ||
    (allowed && lectureQuery.isLoading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="h-160 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
          <div className="h-160 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        </div>
      </div>
    );
  }

  if (
    courseQuery.isError ||
    curriculumQuery.isError ||
    enrollmentStatusQuery.isError ||
    (allowed && lectureQuery.isError)
  ) {
    return (
      <LearningState
        title={t("error.title")}
        subtitle={t("error.subtitle")}
        action={
          <Button
            type="button"
            className="mx-auto mt-4 !text-white"
            onClick={() => {
              courseQuery.refetch();
              curriculumQuery.refetch();
              enrollmentStatusQuery.refetch();
              lectureQuery.refetch();
            }}
          >
            {t("error.retry")}
          </Button>
        }
      />
    );
  }

  if (!courseQuery.data || !currentItem || !displayLecture) {
    return (
      <LearningState
        title={t("notFound.title")}
        subtitle={t("notFound.subtitle")}
        action={
          <Button asChild variant="outline" className="mx-auto mt-4">
            <Link href={`/${locale}/learning`}>
              <ArrowLeft className="h-4 w-4" />
              {t("backToLearning")}
            </Link>
          </Button>
        }
      />
    );
  }

  if (!allowed) {
    return (
      <LearningState
        title={t("locked.title")}
        subtitle={t("locked.subtitle")}
        action={
          <Button asChild className="mx-auto mt-4 !text-white">
            <Link href={`/${locale}/courses/${courseId}`}>
              <Lock className="h-4 w-4" />
              {t("locked.viewCourse")}
            </Link>
          </Button>
        }
      />
    );
  }

  const course = courseQuery.data;
  const attachments = lecture?.attachments ?? [];

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/${locale}/learning`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("backToLearning")}
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-950 dark:text-text">
              {displayLecture.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {course.title}
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
            {t("learningMode")}
          </div>
        </div>

        <div
          className={cn(
            "grid gap-4 lg:items-start",
            sidebarCollapsed
              ? "lg:grid-cols-[minmax(0,1fr)_64px]"
              : "lg:grid-cols-[minmax(0,1fr)_300px]",
          )}
        >
          <main className="min-w-0 space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {currentItem.section.displayOrder}. {currentItem.section.title}
                </span>
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-bg dark:text-muted">
                  {displayLecture.contentType.replace("_", " ")}
                </span>
              </div>
              <LectureContent lecture={lecture} fallbackLecture={displayLecture} />
            </section>

            {attachments.length > 0 && displayLecture.contentType !== "FILE" ? (
              <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
                <h2 className="text-sm font-bold text-gray-950 dark:text-text">
                  {t("resources")}
                </h2>
                <ResourceLinks attachments={attachments} />
              </section>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline" disabled={!previousItem}>
                <Link
                  href={
                    previousItem
                      ? `/${locale}/learning/courses/${courseId}/lectures/${previousItem.lecture.id}`
                      : "#"
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Link>
              </Button>
              <Button asChild variant="outline" disabled={!nextItem}>
                <Link
                  href={
                    nextItem
                      ? `/${locale}/learning/courses/${courseId}/lectures/${nextItem.lecture.id}`
                      : "#"
                  }
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </main>

          <CourseLectureSidebar
            sections={sidebarSections}
            activeLectureId={lectureId}
            totalLectures={flatLectures.length}
            collapsed={sidebarCollapsed}
            labels={{
              title: t("curriculum"),
              lectures: t("lectures"),
              empty: t("emptyCurriculum"),
              collapse: t("collapseSidebar"),
              expand: t("expandSidebar"),
            }}
            buildLectureHref={(targetLectureId) =>
              `/${locale}/learning/courses/${courseId}/lectures/${targetLectureId}`
            }
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
      </div>
    </div>
  );
};

const LectureContent = ({
  lecture,
  fallbackLecture,
}: {
  lecture?: LectureResponse;
  fallbackLecture: LectureResponse | CourseCurriculumLecture;
}) => {
  const t = useTranslations("StudentLecturePage");
  const contentType = fallbackLecture.contentType;

  if (contentType === "ARTICLE") {
    return (
      <MarkdownRenderer
        content={lecture?.textContent}
        emptyText={t("articleEmpty")}
      />
    );
  }

  if (contentType === "VIDEO") {
    if (!lecture?.videoUrl) return <EmptyMessage message={t("videoEmpty")} />;

    return (
      <video
        className="aspect-video w-full rounded-lg bg-gray-950"
        controls
        poster={lecture.videoThumbnailUrl || undefined}
        src={lecture.videoUrl}
      />
    );
  }

  if (contentType === "FILE") {
    const attachments = lecture?.attachments ?? [];
    return attachments.length ? (
      <ResourceLinks attachments={attachments} />
    ) : (
      <EmptyMessage message={t("fileEmpty")} />
    );
  }

  if (contentType === "EXTERNAL_LINK") {
    return lecture?.externalUrl ? (
      <a
        href={lecture.externalUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
      >
        {t("openExternal")}
        <ExternalLink className="h-4 w-4" />
      </a>
    ) : (
      <EmptyMessage message={t("externalEmpty")} />
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-border">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-5 w-5" />
      </div>
      <h2 className="mt-3 text-lg font-bold text-gray-950 dark:text-text">
        {lecture?.quiz?.title ?? fallbackLecture.title}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-muted">
        {t("quizComingSoon")}
      </p>
    </div>
  );
};

const ResourceLinks = ({ attachments }: { attachments: string[] }) => {
  const t = useTranslations("StudentLecturePage");

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <a
          key={attachment}
          href={attachment}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-border dark:text-muted"
        >
          <span className="min-w-0 truncate">{getResourceName(attachment)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
            {t("openResource")}
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </a>
      ))}
    </div>
  );
};

const EmptyMessage = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
    {message}
  </div>
);

const LearningState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) => (
  <div className="min-h-screen bg-gray-50 px-4 py-20 text-center dark:bg-bg">
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 dark:border-border dark:bg-surface">
      <h1 className="text-xl font-bold text-gray-950 dark:text-text">{title}</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-muted">{subtitle}</p>
      {action}
    </div>
  </div>
);

const findNavigableItem = (
  items: Array<{ section: CourseCurriculumSection; lecture: CourseCurriculumLecture }>,
  startIndex: number,
  direction: 1 | -1,
) => {
  if (startIndex < 0) return undefined;

  for (
    let index = startIndex + direction;
    index >= 0 && index < items.length;
    index += direction
  ) {
    if (items[index].lecture.status !== "LOCKED") return items[index];
  }

  return undefined;
};

const getResourceName = (value: string) => {
  try {
    const url = new URL(value);
    const lastSegment = url.pathname.split("/").filter(Boolean).at(-1);
    return decodeURIComponent(lastSegment || url.hostname);
  } catch {
    return value;
  }
};

const sortByDisplayOrder = <T extends { displayOrder?: number | null }>(
  items: T[],
) =>
  [...items].sort(
    (first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
  );

export default StudentLecturePage;
