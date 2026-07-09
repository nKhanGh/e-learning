"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourseCurriculumQuery,
  useCourseQuery,
} from "@/hooks/queries/useCourseQueries";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  FileText,
  ListChecks,
  PlayCircle,
  Plus,
  Settings2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";

const checklistItems = [
  "basicInfo",
  "thumbnail",
  "sections",
  "lectures",
  "pricing",
] as const;

const CourseStudioPage = () => {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const t = useTranslations("InstructorCourseStudioPage");
  const { isLoggedIn, user } = useAuth();
  const courseQuery = useCourseQuery(courseId);
  const curriculumQuery = useCourseCurriculumQuery(courseId);
  const course = courseQuery.data;
  const curriculum = curriculumQuery.data;
  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.INSTRUCTOR && course?.instructor?.id === user.id);

  const checklist = {
    basicInfo: Boolean(course?.title && course.description && course.category?.id),
    thumbnail: Boolean(course?.thumbnailUrl),
    sections: (curriculum?.totalSections ?? course?.totalSections ?? 0) > 0,
    lectures: (curriculum?.totalLectures ?? course?.totalLectures ?? 0) > 0,
    pricing: Boolean(course?.isFree || Number(course?.price ?? 0) > 0),
  };

  const completedChecklist = Object.values(checklist).filter(Boolean).length;

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

  if (!canEdit) {
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
              href={`/${locale}/instructor/courses`}
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
            <Button asChild variant="outline">
              <Link href={`/${locale}/instructor/courses/${course.id}/edit`}>
                <Settings2 className="h-4 w-4" />
                {t("quickEdit")}
              </Link>
            </Button>
            <Button className="!text-white">
              <ListChecks className="h-4 w-4" />
              {t("submitReview")}
            </Button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <p className="text-xs text-gray-500 dark:text-muted">
              {t("metrics.sections")}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {curriculum?.totalSections ?? course.totalSections ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <p className="text-xs text-gray-500 dark:text-muted">
              {t("metrics.lectures")}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {curriculum?.totalLectures ?? course.totalLectures ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <p className="text-xs text-gray-500 dark:text-muted">
              {t("metrics.duration")}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {curriculum?.totalDurationMinutes ?? course.durationMinutes ?? 0}m
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
            <p className="text-xs text-gray-500 dark:text-muted">
              {t("metrics.checklist")}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {completedChecklist}/{checklistItems.length}
            </p>
          </div>
        </div>

        <Tabs defaultValue="sections" className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
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

          <TabsContent value="sections" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-950 dark:text-text">
                {t("sections.title")}
              </h2>
              <Button size="sm" className="text-white!">
                <Plus className="h-4 w-4" />
                {t("sections.add")}
              </Button>
            </div>
            {curriculum?.sections?.length ? (
              <div className="space-y-2">
                {curriculum.sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-border"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                          {section.lectures.length} {t("sections.lectures")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {t("actions.manage")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStudioState
                icon={<BookOpen className="h-5 w-5" />}
                title={t("sections.emptyTitle")}
                subtitle={t("sections.emptySubtitle")}
              />
            )}
          </TabsContent>

          <TabsContent value="lectures">
            <EmptyStudioState
              icon={<PlayCircle className="h-5 w-5" />}
              title={t("lectures.title")}
              subtitle={t("lectures.subtitle")}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <EmptyStudioState
              icon={<FileQuestion className="h-5 w-5" />}
              title={t("quiz.title")}
              subtitle={t("quiz.subtitle")}
            />
          </TabsContent>

          <TabsContent value="resources">
            <EmptyStudioState
              icon={<FileText className="h-5 w-5" />}
              title={t("resources.title")}
              subtitle={t("resources.subtitle")}
            />
          </TabsContent>

          <TabsContent value="checklist" className="space-y-2">
            {checklistItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-border"
              >
                <CheckCircle2
                  className={`h-4 w-4 ${
                    checklist[item] ? "text-emerald-500" : "text-gray-300"
                  }`}
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-text">
                  {t(`checklist.${item}`)}
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const EmptyStudioState = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center dark:border-border">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <h3 className="mt-4 text-base font-bold text-gray-950 dark:text-text">
      {title}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-muted">
      {subtitle}
    </p>
  </div>
);

export default CourseStudioPage;
