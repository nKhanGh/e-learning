"use client";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCourseSectionMutation,
  useDeleteCourseSectionMutation,
  useUpdateCourseSectionMutation,
} from "@/hooks/queries/useCourseQueries";
import { BookOpen, Clock3, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { EmptyStudioState } from "./EmptyStudioState";
import { getErrorMessage } from "./studioUtils";
import type { StudioSection } from "./types";

type SectionForm = {
  title: string;
  description: string;
  displayOrder: string;
  durationMinutes: string;
  isPublished: boolean;
};

type SectionsTabProps = {
  courseId: string;
  sections: StudioSection[];
  isLoading: boolean;
  readOnly?: boolean;
};

const initialSectionForm: SectionForm = {
  title: "",
  description: "",
  displayOrder: "1",
  durationMinutes: "0",
  isPublished: true,
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

export const SectionsTab = ({
  courseId,
  sections,
  isLoading,
  readOnly = false,
}: SectionsTabProps) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const createSectionMutation = useCreateCourseSectionMutation(courseId);
  const updateSectionMutation = useUpdateCourseSectionMutation(courseId);
  const deleteSectionMutation = useDeleteCourseSectionMutation(courseId);
  const nextSectionOrder =
    Math.max(0, ...sections.map((section) => section.displayOrder ?? 0)) + 1;
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<CourseSectionResponse | null>(null);
  const [deletingSection, setDeletingSection] =
    useState<CourseSectionResponse | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm>(
    toSectionForm(null, nextSectionOrder),
  );
  const sectionSaving =
    createSectionMutation.isPending || updateSectionMutation.isPending;

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
    try {
      await deleteSectionMutation.mutateAsync(section.id);
      toast.success(t("sections.deleted"));
      setDeletingSection(null);
    } catch (error) {
      toast.error(getErrorMessage(error, t("sections.deleteFailed")));
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-950 dark:text-text">
            {t("sections.title")}
          </h2>
          {!readOnly ? (
            <Button
              type="button"
              size="sm"
              className="!text-white"
              onClick={openCreateSectionDialog}
            >
              <Plus className="h-4 w-4" />
              {t("sections.add")}
            </Button>
          ) : null}
        </div>

        {isLoading ? (
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
                  {!readOnly ? (
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
                        onClick={() => setDeletingSection(section)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("sections.delete")}
                      </Button>
                    </div>
                  ) : null}
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
      </div>

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

      <ConfirmDeleteDialog
        open={Boolean(deletingSection)}
        title={t("sections.deleteConfirm")}
        description={t("deleteDialog.description")}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        isPending={deleteSectionMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingSection(null);
        }}
        onConfirm={() => {
          if (deletingSection) void handleDeleteSection(deletingSection);
        }}
      />
    </>
  );
};
