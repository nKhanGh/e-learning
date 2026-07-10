"use client";

import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
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
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Pencil,
  PlayCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LectureDialog } from "../../../components/LectureDialog";
import { getErrorMessage } from "../../../components/studioUtils";

type CurriculumLectureItem = {
  section: CourseCurriculumSection;
  lecture: CourseCurriculumLecture;
};

const getLectureMinutes = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return 0;

  const seconds =
    lecture.videoDurationSeconds ??
    ("durationMinutes" in lecture ? lecture.durationMinutes * 60 : 0);

  return Math.max(0, Math.round(seconds / 60));
};

const getLecturePreview = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return false;
  return "isPreview" in lecture ? lecture.isPreview : lecture.preview;
};

const getLectureDownloadable = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return false;
  return "isDownloadable" in lecture
    ? lecture.isDownloadable
    : lecture.downloadable;
};

const getLecturePublished = (
  lecture?: LectureResponse | CourseCurriculumLecture | null,
) => {
  if (!lecture) return false;
  return "isPublished" in lecture ? lecture.isPublished : lecture.status !== "LOCKED";
};

const getResourceName = (url: string) => {
  const cleanUrl = url.split("?")[0] ?? url;
  const name = cleanUrl.split("/").filter(Boolean).pop();
  return name || url;
};

const isExternalUrl = (value?: string | null) =>
  Boolean(value?.startsWith("http://") || value?.startsWith("https://"));

const contentIcons: Record<LectureContentType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  FILE: Download,
  EXTERNAL_LINK: ExternalLink,
};

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
  const ContentIcon = contentIcons[contentType];
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
            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    {section ? (
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-semibold text-gray-600 dark:bg-bg dark:text-muted">
                        {t("preview.section", {
                          order: section.displayOrder,
                          title: section.title,
                        })}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
                      <ContentIcon className="h-3.5 w-3.5" />
                      {t(`lectures.contentTypes.${contentType}`)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-950 dark:text-text">
                    {displayLecture.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-muted">
                    {displayLecture.description || t("preview.noDescription")}
                  </p>
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2 text-xs md:w-64">
                  <PreviewMeta
                    icon={<Clock3 className="h-3.5 w-3.5" />}
                    label={t("preview.duration")}
                    value={t("preview.minutes", {
                      count: getLectureMinutes(displayLecture),
                    })}
                  />
                  <PreviewMeta
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    label={t("preview.status")}
                    value={
                      getLecturePublished(displayLecture)
                        ? t("lectures.published")
                        : t("lectures.unpublished")
                    }
                  />
                  <PreviewMeta
                    icon={<PlayCircle className="h-3.5 w-3.5" />}
                    label={t("preview.freePreview")}
                    value={
                      getLecturePreview(displayLecture)
                        ? t("preview.yes")
                        : t("preview.no")
                    }
                  />
                  <PreviewMeta
                    icon={<Download className="h-3.5 w-3.5" />}
                    label={t("preview.downloadable")}
                    value={
                      getLectureDownloadable(displayLecture)
                        ? t("preview.yes")
                        : t("preview.no")
                    }
                  />
                </div>
              </div>
            </section>

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

const LecturePreviewContent = ({
  lecture,
  contentType,
  quiz,
  attachments,
}: {
  lecture?: LectureResponse;
  contentType: LectureContentType;
  quiz: QuizResponse | CourseCurriculumQuiz | null;
  attachments: string[];
}) => {
  const t = useTranslations("InstructorCourseStudioPage");

  if (contentType === "ARTICLE") {
    return (
      <MarkdownRenderer
        content={lecture?.textContent}
        emptyText={t("preview.articleEmpty")}
      />
    );
  }

  if (contentType === "VIDEO") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-950 dark:text-text">
          {t("preview.videoTitle")}
        </h3>
        {lecture?.videoUrl ? (
          <>
            <video
              className="aspect-video w-full rounded-lg bg-gray-950"
              controls
              poster={lecture.videoThumbnailUrl || undefined}
              src={lecture.videoUrl}
            />
            {isExternalUrl(lecture.videoUrl) ? (
              <a
                href={lecture.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                {t("preview.openExternal")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </>
        ) : (
          <EmptyContentMessage message={t("preview.videoEmpty")} />
        )}
      </div>
    );
  }

  if (contentType === "FILE") {
    return (
      <div>
        <h3 className="text-sm font-bold text-gray-950 dark:text-text">
          {t("preview.fileTitle")}
        </h3>
        {attachments.length ? (
          <ResourceList attachments={attachments} />
        ) : (
          <EmptyContentMessage message={t("preview.fileEmpty")} />
        )}
      </div>
    );
  }

  if (contentType === "EXTERNAL_LINK") {
    return (
      <div>
        <h3 className="text-sm font-bold text-gray-950 dark:text-text">
          {t("preview.externalTitle")}
        </h3>
        {lecture?.externalUrl ? (
          <a
            href={lecture.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            {t("preview.openExternal")}
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <EmptyContentMessage message={t("preview.externalEmpty")} />
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-950 dark:text-text">
        {t("preview.quizTitle")}
      </h3>
      {quiz ? (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-bg">
          <p className="text-base font-bold text-gray-950 dark:text-text">
            {quiz.title}
          </p>
          {quiz.description ? (
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {quiz.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-muted">
            <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
              {quiz.totalQuestions} {t("preview.questions")}
            </span>
            <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
              {quiz.timeLimitMinutes
                ? t("preview.minutes", { count: quiz.timeLimitMinutes })
                : t("preview.unlimited")}
            </span>
          </div>
        </div>
      ) : (
        <EmptyContentMessage message={t("preview.quizEmpty")} />
      )}
    </div>
  );
};

const ResourceList = ({ attachments }: { attachments: string[] }) => {
  const t = useTranslations("InstructorCourseStudioPage");

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
            {t("preview.openResource")}
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </a>
      ))}
    </div>
  );
};

const PreviewMeta = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-border dark:bg-bg">
    <p className="flex items-center gap-1 text-gray-400">
      {icon}
      {label}
    </p>
    <p className="mt-1 font-bold text-gray-900 dark:text-text">{value}</p>
  </div>
);

const EmptyContentMessage = ({ message }: { message: string }) => (
  <div className="mt-3 rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-border dark:text-muted">
    {message}
  </div>
);

const PreviewState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) => (
  <div className="min-h-[70vh] bg-gray-50 px-2 py-4 dark:bg-bg">
    <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
      <h1 className="text-xl font-bold text-gray-900 dark:text-text">{title}</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-muted">{subtitle}</p>
      {action}
    </div>
  </div>
);

export default InstructorLecturePreviewPage;
