"use client";

import { CourseLectureSidebar } from "@/components/courseDetail/CourseLectureSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourseCurriculumQuery,
  useCourseQuery,
  useLectureQuery,
  useUpdateLectureMutation,
} from "@/hooks/queries/useCourseQueries";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/enums/UserRole.enum";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LectureDialog } from "../../../components/LectureDialog";
import { getErrorMessage } from "../../../components/studioUtils";
import { LectureOverviewCard } from "./components/LectureOverviewCard";
import { LecturePreviewContent } from "./components/LecturePreviewContent";
import { PreviewState } from "./components/PreviewState";
import { ResourceList } from "./components/ResourceList";
import type { CurriculumLectureItem } from "./components/lecturePreviewUtils";

const InstructorLecturePreviewPage = () => {
  const locale = useLocale();
  const params = useParams<{ id: string; lectureId: string }>();
  const courseId = params.id;
  const lectureId = params.lectureId;
  const t = useTranslations("InstructorCourseStudioPage");
  const { isLoggedIn, user } = useAuth();
  const courseQuery = useCourseQuery(courseId);
  const curriculumQuery = useCourseCurriculumQuery(courseId);
  const lectureQuery = useLectureQuery(lectureId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const course = courseQuery.data;
  const curriculum = curriculumQuery.data;

  const flatLectures = useMemo<CurriculumLectureItem[]>(() => {
    return (
      curriculum?.sections.flatMap((section) =>
        section.lectures.map((lecture) => ({ section, lecture })),
      ) ?? []
    );
  }, [curriculum?.sections]);

  const currentIndex = flatLectures.findIndex(
    (item) => item.lecture.id === lectureId,
  );
  const currentItem = currentIndex >= 0 ? flatLectures[currentIndex] : undefined;
  const previousItem = currentIndex > 0 ? flatLectures[currentIndex - 1] : undefined;
  const nextItem =
    currentIndex >= 0 && currentIndex < flatLectures.length - 1
      ? flatLectures[currentIndex + 1]
      : undefined;

  const lecture = lectureQuery.data;
  const navigationLecture = currentItem?.lecture;
  const displayLecture = lecture ?? navigationLecture;
  const section = lecture?.section ?? currentItem?.section;
  const contentType = displayLecture?.contentType ?? "ARTICLE";
  const attachments = lecture?.attachments ?? [];
  const quiz = lecture?.quiz ?? navigationLecture?.quiz ?? null;
  const updateLectureMutation = useUpdateLectureMutation(courseId, section?.id ?? "");
  const canPreview =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.INSTRUCTOR && course?.instructor?.id === user.id);

  if (!isLoggedIn) {
    return (
      <PreviewState
        title={t("auth.signInTitle")}
        subtitle={t("auth.signInSubtitle")}
      />
    );
  }

  if (courseQuery.isLoading || curriculumQuery.isLoading || lectureQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[300px_1fr]">
          <div className="h-[640px] animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
          <div className="h-[640px] animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        </div>
      </div>
    );
  }

  if (courseQuery.isError || curriculumQuery.isError || lectureQuery.isError) {
    return (
      <PreviewState
        title={t("preview.errorTitle")}
        subtitle={t("preview.errorSubtitle")}
        action={
          <Button
            type="button"
            className="mx-auto mt-4 !text-white"
            onClick={() => {
              courseQuery.refetch();
              curriculumQuery.refetch();
              lectureQuery.refetch();
            }}
          >
            {t("error.retry")}
          </Button>
        }
      />
    );
  }

  if (!course || !canPreview) {
    return (
      <PreviewState
        title={t("auth.ownerOnlyTitle")}
        subtitle={t("auth.ownerOnlySubtitle")}
      />
    );
  }

  if (!displayLecture) {
    return (
      <PreviewState
        title={t("preview.notFoundTitle")}
        subtitle={t("preview.notFoundSubtitle")}
        action={
          <Button asChild variant="outline" className="mx-auto mt-4">
            <Link href={`/${locale}/instructor/studio/${courseId}`}>
              <ArrowLeft className="h-4 w-4" />
              {t("preview.backToStudio")}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/${locale}/instructor/studio/${courseId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("preview.backToStudio")}
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-950 dark:text-text">
              {t("preview.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {course.title}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!lecture}
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("lectures.edit")}
            </Button>
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
              {t("preview.teacherPreview")}
            </div>
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
            <LectureOverviewCard
              displayLecture={displayLecture}
              section={section}
              contentType={contentType}
            />

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <LecturePreviewContent
                lecture={lecture}
                contentType={contentType}
                quiz={quiz}
                attachments={attachments}
              />
            </section>

            {attachments.length > 0 && contentType !== "FILE" ? (
              <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
                <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                  {t("preview.resources")}
                </h3>
                <ResourceList attachments={attachments} />
              </section>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline" disabled={!previousItem}>
                <Link
                  href={
                    previousItem
                      ? `/${locale}/instructor/studio/${courseId}/preview/lectures/${previousItem.lecture.id}`
                      : "#"
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("preview.previous")}
                </Link>
              </Button>
              <Button asChild variant="outline" disabled={!nextItem}>
                <Link
                  href={
                    nextItem
                      ? `/${locale}/instructor/studio/${courseId}/preview/lectures/${nextItem.lecture.id}`
                      : "#"
                  }
                >
                  {t("preview.next")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </main>

          <CourseLectureSidebar
            sections={curriculum?.sections ?? []}
            activeLectureId={lectureId}
            totalLectures={curriculum?.totalLectures ?? 0}
            collapsed={sidebarCollapsed}
            labels={{
              title: t("preview.curriculum"),
              lectures: t("metrics.lectures"),
              empty: t("preview.emptyCurriculum"),
              collapse: t("preview.collapseSidebar"),
              expand: t("preview.expandSidebar"),
            }}
            buildLectureHref={(targetLectureId) =>
              `/${locale}/instructor/studio/${courseId}/preview/lectures/${targetLectureId}`
            }
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
      </div>
      <LectureDialog
        open={editDialogOpen}
        lecture={lecture ?? null}
        fallbackOrder={lecture?.displayOrder ?? navigationLecture?.displayOrder ?? 1}
        sectionTitle={section?.title}
        saving={updateLectureMutation.isPending}
        onOpenChange={setEditDialogOpen}
        onSubmit={async (payload, submittedLecture) => {
          if (!submittedLecture) return;

          try {
            await updateLectureMutation.mutateAsync({
              lectureId: submittedLecture.id,
              request: payload,
            });
            toast.success(t("lectures.updated"));
            setEditDialogOpen(false);
          } catch (error) {
            toast.error(getErrorMessage(error, t("lectures.failed")));
          }
        }}
      />
    </div>
  );
};

export default InstructorLecturePreviewPage;
