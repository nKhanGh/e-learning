"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourseCurriculumQuery,
  useCoursePublishChecklistQuery,
  useCourseQuery,
  useCourseReviewHistoryQuery,
  useCourseSectionsQuery,
  useSubmitCourseForReviewMutation,
} from "@/hooks/queries/useCourseQueries";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  FileQuestion,
  FileText,
  ListChecks,
  PlayCircle,
  Settings2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { ChecklistTab } from "./components/ChecklistTab";
import { LecturesTab } from "./components/LecturesTab";
import { QuizTab } from "./components/QuizTab";
import { ResourcesTab } from "./components/ResourcesTab";
import { SectionsTab } from "./components/SectionsTab";
import { getErrorMessage } from "./components/studioUtils";
import { type StudioSection } from "./components/types";

type CourseStudioMode = "instructor" | "admin";

export const CourseStudioContent = ({
  mode = "instructor",
}: {
  mode?: CourseStudioMode;
}) => {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const t = useTranslations("InstructorCourseStudioPage");
  const { isLoggedIn, user } = useAuth();
  const courseQuery = useCourseQuery(courseId);
  const curriculumQuery = useCourseCurriculumQuery(courseId);
  const courseSectionsQuery = useCourseSectionsQuery(courseId);
  const publishChecklistQuery = useCoursePublishChecklistQuery(courseId);
  const submitForReviewMutation = useSubmitCourseForReviewMutation(courseId);
  const course = courseQuery.data;
  const curriculum = curriculumQuery.data;
  const publishChecklist = publishChecklistQuery.data;
  const curriculumSections = curriculum?.sections ?? [];
  const sections = useMemo<StudioSection[]>(() => {
    const sourceSections: Array<CourseSectionResponse | CourseCurriculumSection> =
      courseSectionsQuery.data ?? curriculumSections;

    return sortByDisplayOrder(sourceSections).map((section) => {
      const curriculumSection = curriculumSections.find(
        (item) => item.id === section.id,
      );

      return {
        ...section,
        isPublished: section.isPublished ?? true,
        lectures: sortByDisplayOrder(
          curriculumSection?.lectures ??
            ("lectures" in section ? section.lectures : []),
        ),
      };
    });
  }, [courseSectionsQuery.data, curriculumSections]);
  const isAdminMode = mode === "admin";
  const studioBasePath = `/${locale}/${isAdminMode ? "admin" : "instructor"}/studio/${courseId}`;
  const canAccess = isAdminMode
    ? user?.role === UserRole.ADMIN
    : user?.role === UserRole.INSTRUCTOR && course?.instructor?.id === user.id;
  const reviewHistoryQuery = useCourseReviewHistoryQuery(
    courseId,
    Boolean(canAccess && !isAdminMode && course?.status === "REJECTED"),
  );
  const latestRejectedReview = useMemo(
    () => reviewHistoryQuery.data?.find((item) => item.action === "REJECTED"),
    [reviewHistoryQuery.data],
  );

  const checklistItems =
    publishChecklist?.groups.flatMap((group) => group.items) ?? [];
  const completedChecklist = checklistItems.filter(
    (item) => item.status === "PASSED",
  ).length;
  const totalChecklist = checklistItems.length;
  const isReviewLocked =
    course?.status === "PENDING_REVIEW" || course?.status === "PUBLISHED";
  const submitReviewLabel =
    course?.status === "PENDING_REVIEW"
      ? t("submittedForReview")
      : course?.status === "PUBLISHED"
        ? t("publishedStatus")
        : t("submitReview");

  const handleSubmitForReview = async () => {
    if (isReviewLocked) return;

    try {
      await submitForReviewMutation.mutateAsync();
      toast.success(t("checklist.submitted"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("checklist.submitFailed")));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.signInSubtitle")}
        </p>
      </div>
    );
  }

  if (courseQuery.isLoading) {
    return (
      <div className="grid gap-4 p-4">
        <div className="h-28 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-96 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  if (courseQuery.isError || !course) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("error.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("error.subtitle")}
        </p>
        <Button
          type="button"
          onClick={() => courseQuery.refetch()}
          className="mx-auto mt-4 !text-white"
        >
          {t("error.retry")}
        </Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.ownerOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.ownerOnlySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={
                isAdminMode
                  ? `/${locale}/admin/course-reviews/${courseId}`
                  : `/${locale}/instructor/courses`
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("back")}
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-950 dark:text-text">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {course.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isAdminMode ? (
              <>
                <Button asChild variant="outline">
                  <Link href={`/${locale}/instructor/courses/${course.id}/edit`}>
                    <Settings2 className="h-4 w-4" />
                    {t("quickEdit")}
                  </Link>
                </Button>
                <Button
                  className="!text-white"
                  disabled={
                    isReviewLocked ||
                    !publishChecklist?.ready ||
                    submitForReviewMutation.isPending
                  }
                  onClick={handleSubmitForReview}
                >
                  <ListChecks className="h-4 w-4" />
                  {submitReviewLabel}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <StudioMetric label={t("metrics.sections")}>
            {curriculum?.totalSections ?? course.totalSections ?? 0}
          </StudioMetric>
          <StudioMetric label={t("metrics.lectures")}>
            {curriculum?.totalLectures ?? course.totalLectures ?? 0}
          </StudioMetric>
          <StudioMetric label={t("metrics.duration")}>
            {curriculum?.totalDurationMinutes ?? course.durationMinutes ?? 0}m
          </StudioMetric>
          <StudioMetric label={t("metrics.checklist")}>
            {completedChecklist}/{totalChecklist}
          </StudioMetric>
        </div>

        {course.status === "REJECTED" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold">
                    {t("reviewFeedback.title")}
                  </h2>
                  <p className="mt-1 text-sm">
                    {latestRejectedReview?.reason ||
                      t("reviewFeedback.noReason")}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${locale}/instructor/courses/${course.id}/edit`}>
                  {t("reviewFeedback.editCourse")}
                </Link>
              </Button>
            </div>
          </div>
        )}

        <Tabs
          defaultValue="sections"
          className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface"
        >
          <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-gray-100 dark:bg-bg">
            <TabsTrigger value="sections">
              <BookOpen className="h-4 w-4" />
              {t("tabs.sections")}
            </TabsTrigger>
            <TabsTrigger value="lectures">
              <PlayCircle className="h-4 w-4" />
              {t("tabs.lectures")}
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <FileQuestion className="h-4 w-4" />
              {t("tabs.quiz")}
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileText className="h-4 w-4" />
              {t("tabs.resources")}
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <ListChecks className="h-4 w-4" />
              {t("tabs.checklist")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <SectionsTab
              courseId={courseId}
              sections={sections}
              isLoading={courseSectionsQuery.isLoading || curriculumQuery.isLoading}
              readOnly={isAdminMode}
            />
          </TabsContent>
          <TabsContent value="lectures">
            <LecturesTab
              courseId={courseId}
              sections={sections}
              readOnly={isAdminMode}
              previewBasePath={studioBasePath}
            />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizTab
              courseId={courseId}
              sections={sections}
              previewBasePath={studioBasePath}
            />
          </TabsContent>
          <TabsContent value="resources">
            <ResourcesTab
              courseId={courseId}
              sections={sections}
              readOnly={isAdminMode}
            />
          </TabsContent>
          <TabsContent value="checklist">
            <ChecklistTab
              courseId={courseId}
              courseStatus={course.status}
              checklist={publishChecklist}
              isLoading={publishChecklistQuery.isLoading}
              isSubmitting={submitForReviewMutation.isPending}
              readOnly={isAdminMode}
              studioBasePath={studioBasePath}
              onRetry={() => publishChecklistQuery.refetch()}
              onSubmit={handleSubmitForReview}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const CourseStudioPage = () => <CourseStudioContent mode="instructor" />;

const StudioMetric = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
    <p className="text-xs text-gray-500 dark:text-muted">{label}</p>
    <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
      {children}
    </p>
  </div>
);

export default CourseStudioPage;

const sortByDisplayOrder = <T extends { displayOrder?: number | null }>(
  items: T[],
) =>
  [...items].sort(
    (first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
  );
