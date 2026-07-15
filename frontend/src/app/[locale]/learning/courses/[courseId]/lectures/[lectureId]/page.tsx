"use client";

import { CourseLectureSidebar } from "@/components/courseDetail/CourseLectureSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCompleteLectureMutation,
  useCourseCurriculumQuery,
  useCourseEnrollmentStatusQuery,
  useCourseQuery,
  useCourseLectureProgressQuery,
  useCreateLectureProgressMutation,
  usePublicLectureQuery,
} from "@/hooks/queries/useCourseQueries";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LecturePreviewContent } from "../../../../../instructor/studio/[id]/preview/lectures/[lectureId]/components/LecturePreviewContent";
import { ResourceList } from "../../../../../instructor/studio/[id]/preview/lectures/[lectureId]/components/ResourceList";
import { StudentQuizContent } from "./components/StudentQuizContent";

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
  const openedProgressLecturesRef = useRef<Set<string>>(new Set());
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
  const lectureQuery = usePublicLectureQuery(allowed ? lectureId : "");
  const progressQuery = useCourseLectureProgressQuery(
    courseId,
    Boolean(enrollmentStatus?.enrolled),
  );
  const createProgressMutation = useCreateLectureProgressMutation(
    courseId,
    lectureId,
  );
  const completeLectureMutation = useCompleteLectureMutation(courseId, lectureId);
  const lecture = lectureQuery.data;
  const displayLecture = lecture ?? currentItem?.lecture;
  const currentProgress = progressQuery.data?.find(
    (progress) => progress.id.lectureId === lectureId,
  );
  const completed = Boolean(currentProgress?.completed || currentItem?.lecture.completed);

  useEffect(() => {
    if (!allowed || !enrollmentStatus?.enrolled) return;
    if (progressQuery.isLoading || currentProgress) return;
    if (createProgressMutation.isPending) return;
    if (openedProgressLecturesRef.current.has(lectureId)) return;

    openedProgressLecturesRef.current.add(lectureId);
    createProgressMutation.mutate(undefined, {
      onError: () => {
        toast.error(t("progress.openFailed"));
      },
    });
  }, [
    allowed,
    createProgressMutation,
    currentProgress,
    enrollmentStatus?.enrolled,
    lectureId,
    progressQuery.isLoading,
    t,
  ]);

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
    (Boolean(enrollmentStatus?.enrolled) && progressQuery.isLoading) ||
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
    (Boolean(enrollmentStatus?.enrolled) && progressQuery.isError) ||
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
              progressQuery.refetch();
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
  const handleMarkComplete = async () => {
    if (!enrollmentStatus?.enrolled || completed) return;

    try {
      if (!currentProgress) {
        await createProgressMutation.mutateAsync();
      }
      await completeLectureMutation.mutateAsync();
      toast.success(t("progress.completedToast"));
    } catch {
      toast.error(t("progress.completeFailed"));
    }
  };

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
          {enrollmentStatus?.enrolled ? (
            <Button
              type="button"
              size="sm"
              variant={completed ? "outline" : "default"}
              disabled={
                completed ||
                createProgressMutation.isPending ||
                completeLectureMutation.isPending
              }
              className={completed ? "" : "!text-white"}
              onClick={handleMarkComplete}
            >
              <CheckCircle2 className="h-4 w-4" />
              {completed
                ? t("progress.completed")
                : completeLectureMutation.isPending
                  ? t("progress.saving")
                  : t("progress.markComplete")}
            </Button>
          ) : null}
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
              {displayLecture.contentType === "QUIZ" ? (
                <StudentQuizContent
                  lectureId={lectureId}
                  fallbackQuiz={lecture?.quiz ?? currentItem.lecture.quiz ?? null}
                  canAttempt={Boolean(enrollmentStatus?.enrolled)}
                />
              ) : (
                <LecturePreviewContent
                  courseId={courseId}
                  sectionId={currentItem.section.id}
                  lectureTitle={displayLecture.title}
                  lecture={lecture}
                  contentType={displayLecture.contentType}
                  quiz={lecture?.quiz ?? currentItem.lecture.quiz ?? null}
                  attachments={attachments}
                  readOnly
                  publicAccess
                />
              )}
            </section>
            {attachments.length > 0 && displayLecture.contentType !== "FILE" ? (
              <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
                <h2 className="text-lg font-bold text-gray-950 dark:text-text">
                  {t("resources")}
                </h2>
                <ResourceList attachments={attachments} />
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

const sortByDisplayOrder = <T extends { displayOrder?: number | null }>(
  items: T[],
) =>
  [...items].sort(
    (first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
  );

export default StudentLecturePage;
