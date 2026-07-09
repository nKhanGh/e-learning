"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateCourseSectionMutation,
  useCourseCurriculumQuery,
  useCourseQuery,
  useCourseSectionsQuery,
  useDeleteCourseSectionMutation,
  useUpdateCourseSectionMutation,
} from "@/hooks/queries/useCourseQueries";
import { UserRole } from "@/types/enums/UserRole.enum";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  FileText,
  ListChecks,
  Loader2,
  Pencil,
  PlayCircle,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

const checklistItems = [
  "basicInfo",
  "thumbnail",
  "sections",
  "lectures",
  "pricing",
] as const;

type SectionForm = {
  title: string;
  description: string;
  displayOrder: string;
  durationMinutes: string;
  isPublished: boolean;
};

type StudioSection = CourseSectionResponse & {
  lectures: CourseCurriculumLecture[];
};

const initialSectionForm: SectionForm = {
  title: "",
  description: "",
  displayOrder: "1",
  durationMinutes: "0",
  isPublished: true,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const toSectionForm = (
  section: CourseSectionResponse | null,
  fallbackOrder: number,
): SectionForm => {
  if (!section) {
    return {
      ...initialSectionForm,
      displayOrder: String(fallbackOrder),
    };
  }

  return {
    title: section.title ?? "",
    description: section.description ?? "",
    displayOrder: String(section.displayOrder ?? fallbackOrder),
    durationMinutes: String(section.durationMinutes ?? 0),
    isPublished: section.isPublished ?? true,
  };
};

const CourseStudioPage = () => {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const t = useTranslations("InstructorCourseStudioPage");
  const { isLoggedIn, user } = useAuth();
  const courseQuery = useCourseQuery(courseId);
  const curriculumQuery = useCourseCurriculumQuery(courseId);
  const courseSectionsQuery = useCourseSectionsQuery(courseId);
  const createSectionMutation = useCreateCourseSectionMutation(courseId);
  const updateSectionMutation = useUpdateCourseSectionMutation(courseId);
  const deleteSectionMutation = useDeleteCourseSectionMutation(courseId);
  const course = courseQuery.data;
  const curriculum = curriculumQuery.data;
  const curriculumSections = curriculum?.sections ?? [];
  const sections = useMemo<StudioSection[]>(() => {
    const sourceSections = courseSectionsQuery.data ?? curriculumSections;

    return sourceSections.map((section) => {
      const curriculumSection = curriculumSections.find(
        (item) => item.id === section.id,
      );

      return {
        ...section,
        isPublished: section.isPublished ?? true,
        lectures:
          curriculumSection?.lectures ??
          ("lectures" in section ? section.lectures : []),
      };
    });
  }, [courseSectionsQuery.data, curriculumSections]);
  const nextSectionOrder =
    Math.max(0, ...sections.map((section) => section.displayOrder ?? 0)) + 1;
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<CourseSectionResponse | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm>(
    toSectionForm(null, nextSectionOrder),
  );
  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.INSTRUCTOR && course?.instructor?.id === user.id);
  const sectionSaving =
    createSectionMutation.isPending || updateSectionMutation.isPending;

  const checklist = {
    basicInfo: Boolean(course?.title && course.description && course.category?.id),
    thumbnail: Boolean(course?.thumbnailUrl),
    sections: (curriculum?.totalSections ?? course?.totalSections ?? 0) > 0,
    lectures: (curriculum?.totalLectures ?? course?.totalLectures ?? 0) > 0,
    pricing: Boolean(course?.isFree || Number(course?.price ?? 0) > 0),
  };

  const completedChecklist = Object.values(checklist).filter(Boolean).length;

  const openCreateSectionDialog = () => {
    setEditingSection(null);
    setSectionForm(toSectionForm(null, nextSectionOrder));
    setSectionDialogOpen(true);
  };

  const openEditSectionDialog = (section: CourseSectionResponse) => {
    setEditingSection(section);
    setSectionForm(toSectionForm(section, nextSectionOrder));
    setSectionDialogOpen(true);
  };

  const handleSectionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = sectionForm.title.trim();
    if (!title) {
      toast.error(t("sections.validationTitle"));
      return;
    }

    const displayOrder = Math.max(
      1,
      Number(sectionForm.displayOrder) || nextSectionOrder,
    );
    const durationMinutes = Math.max(
      0,
      Number(sectionForm.durationMinutes) || 0,
    );
    const request = {
      title,
      description: sectionForm.description.trim(),
      displayOrder,
      durationMinutes,
      isPublished: sectionForm.isPublished,
    };

    try {
      if (editingSection) {
        await updateSectionMutation.mutateAsync({
          sectionId: editingSection.id,
          request,
        });
        toast.success(t("sections.updated"));
      } else {
        await createSectionMutation.mutateAsync(request);
        toast.success(t("sections.created"));
      }

      setSectionDialogOpen(false);
      setEditingSection(null);
    } catch (error) {
      toast.error(getErrorMessage(error, t("sections.failed")));
    }
  };

  const handleDeleteSection = async (section: CourseSectionResponse) => {
    if (!globalThis.confirm(t("sections.deleteConfirm"))) return;

    try {
      await deleteSectionMutation.mutateAsync(section.id);
      toast.success(t("sections.deleted"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("sections.deleteFailed")));
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
              <Button
                type="button"
                size="sm"
                className="!text-white"
                onClick={openCreateSectionDialog}
              >
                <Plus className="h-4 w-4" />
                {t("sections.add")}
              </Button>
            </div>
            {courseSectionsQuery.isLoading || curriculumQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
                  />
                ))}
              </div>
            ) : sections.length ? (
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-border"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary">
                          {t("sections.order", {
                            order: section.displayOrder ?? 0,
                          })}
                          <span className="mx-2 text-gray-300">.</span>
                          <span
                            className={
                              section.isPublished
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {section.isPublished
                              ? t("sections.published")
                              : t("sections.unpublished")}
                          </span>
                        </p>
                        <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                          {section.title}
                        </h3>
                        {section.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-muted">
                            {section.description}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                          {section.lectures.length} {t("sections.lectures")}
                          <span className="mx-2">.</span>
                          <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                          {section.durationMinutes ?? 0}m
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSectionDialog(section)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("sections.edit")}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="!text-white"
                          disabled={deleteSectionMutation.isPending}
                          onClick={() => handleDeleteSection(section)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("sections.delete")}
                        </Button>
                      </div>
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

        <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSection
                  ? t("sections.editTitle")
                  : t("sections.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("sections.dialogDescription")}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSectionSubmit}>
              <div className="space-y-2">
                <Label htmlFor="section-title">{t("sections.fields.title")}</Label>
                <Input
                  id="section-title"
                  value={sectionForm.title}
                  placeholder={t("sections.placeholders.title")}
                  onChange={(event) =>
                    setSectionForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-description">
                  {t("sections.fields.description")}
                </Label>
                <Textarea
                  id="section-description"
                  value={sectionForm.description}
                  placeholder={t("sections.placeholders.description")}
                  onChange={(event) =>
                    setSectionForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="section-order">
                    {t("sections.fields.displayOrder")}
                  </Label>
                  <Input
                    id="section-order"
                    type="number"
                    min={1}
                    value={sectionForm.displayOrder}
                    onChange={(event) =>
                      setSectionForm((current) => ({
                        ...current,
                        displayOrder: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section-duration">
                    {t("sections.fields.duration")}
                  </Label>
                  <Input
                    id="section-duration"
                    type="number"
                    min={0}
                    value={sectionForm.durationMinutes}
                    onChange={(event) =>
                      setSectionForm((current) => ({
                        ...current,
                        durationMinutes: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-border">
                <div>
                  <Label htmlFor="section-published">
                    {t("sections.fields.published")}
                  </Label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                    {t("sections.publishedHint")}
                  </p>
                </div>
                <Switch
                  id="section-published"
                  checked={sectionForm.isPublished}
                  onCheckedChange={(checked) =>
                    setSectionForm((current) => ({
                      ...current,
                      isPublished: checked,
                    }))
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSectionDialogOpen(false)}
                >
                  {t("sections.cancel")}
                </Button>
                <Button type="submit" className="!text-white" disabled={sectionSaving}>
                  {sectionSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {editingSection ? t("sections.save") : t("sections.create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const EmptyStudioState = ({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
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
