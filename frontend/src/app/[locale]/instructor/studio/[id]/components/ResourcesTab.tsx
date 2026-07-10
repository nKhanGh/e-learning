"use client";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLectureQuery,
  useUpdateLectureMutation,
} from "@/hooks/queries/useCourseQueries";
import {
  Download,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyStudioState } from "./EmptyStudioState";
import { getErrorMessage } from "./studioUtils";
import { ToggleRow } from "./ToggleRow";
import type { StudioSection } from "./types";

type ResourcesTabProps = {
  courseId: string;
  sections: StudioSection[];
};

const toLectureUpdateRequest = (
  lecture: LectureResponse,
  attachments: string[],
  isDownloadable: boolean,
): LectureUpdateRequest => ({
  title: lecture.title ?? "",
  description: lecture.description ?? "",
  contentType: lecture.contentType ?? "VIDEO",
  textContent: lecture.textContent ?? "",
  videoUrl: lecture.videoUrl ?? "",
  videoDurationSeconds: lecture.videoDurationSeconds ?? 0,
  videoThumbnailUrl: lecture.videoThumbnailUrl ?? "",
  videoQuality: lecture.videoQuality ?? "",
  hasCaptions: lecture.hasCaptions ?? false,
  captionUrl: lecture.captionUrl ?? "",
  attachments,
  externalUrl: lecture.externalUrl ?? "",
  isPreview: lecture.isPreview ?? false,
  isDownloadable,
  displayOrder: lecture.displayOrder ?? 1,
  isPublished: lecture.isPublished ?? true,
});

const normalizeResources = (resources: string[]) =>
  resources.map((resource) => resource.trim()).filter(Boolean);

const isExternalUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const getResourceName = (url: string) => {
  const cleanUrl = url.split("?")[0] ?? url;
  const name = cleanUrl.split("/").filter(Boolean).pop();
  return name || url;
};

export const ResourcesTab = ({ courseId, sections }: ResourcesTabProps) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const selectedSection = sections.find(
    (section) => section.id === selectedSectionId,
  );
  const lectures = selectedSection?.lectures ?? [];
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const lectureQuery = useLectureQuery(selectedLectureId);
  const lecture = lectureQuery.data;
  const updateLectureMutation = useUpdateLectureMutation(courseId, selectedSectionId);
  const [resources, setResources] = useState<string[]>([]);
  const [savedResources, setSavedResources] = useState<string[]>([]);
  const [downloadable, setDownloadable] = useState(false);
  const [savedDownloadable, setSavedDownloadable] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(
    null,
  );
  const [deletingResourceIndex, setDeletingResourceIndex] = useState<number | null>(
    null,
  );
  const [resourceDraft, setResourceDraft] = useState("");

  useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
      setSelectedSectionId(sections[0].id);
      return;
    }

    if (
      selectedSectionId &&
      sections.length > 0 &&
      !sections.some((section) => section.id === selectedSectionId)
    ) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  useEffect(() => {
    if (!selectedLectureId && lectures.length > 0) {
      setSelectedLectureId(lectures[0].id);
      return;
    }

    if (
      selectedLectureId &&
      lectures.length > 0 &&
      !lectures.some((lectureItem) => lectureItem.id === selectedLectureId)
    ) {
      setSelectedLectureId(lectures[0].id);
    }

    if (lectures.length === 0 && selectedLectureId) {
      setSelectedLectureId("");
    }
  }, [lectures, selectedLectureId]);

  useEffect(() => {
    if (!lecture) {
      setResources([]);
      setSavedResources([]);
      setDownloadable(false);
      setSavedDownloadable(false);
      setEditingResourceIndex(null);
      setResourceDraft("");
      return;
    }

    const nextResources = normalizeResources(lecture.attachments ?? []);
    const nextDownloadable = lecture.isDownloadable ?? false;

    setResources(nextResources);
    setSavedResources(nextResources);
    setDownloadable(nextDownloadable);
    setSavedDownloadable(nextDownloadable);
    setEditingResourceIndex(null);
    setResourceDraft("");
  }, [lecture]);

  const cleanedResources = useMemo(
    () => normalizeResources(resources),
    [resources],
  );
  const resourceCount = cleanedResources.length;
  const resourcesChanged =
    JSON.stringify(cleanedResources) !== JSON.stringify(savedResources);
  const downloadableChanged = savedDownloadable !== downloadable;
  const hasDirtyChanges = Boolean(lecture) && (resourcesChanged || downloadableChanged);
  const isAddingResource = editingResourceIndex === -1;
  const isEditingResource = editingResourceIndex !== null;

  const resetDraft = () => {
    setEditingResourceIndex(null);
    setResourceDraft("");
  };

  const openAddResourceForm = () => {
    setEditingResourceIndex(-1);
    setResourceDraft("");
  };

  const openEditResourceForm = (index: number) => {
    setEditingResourceIndex(index);
    setResourceDraft(resources[index] ?? "");
  };

  const submitResourceDraft = async () => {
    const nextResource = resourceDraft.trim();

    if (!nextResource) {
      toast.error(t("resources.urlRequired"));
      return;
    }

    const previousResources = resources;

    if (editingResourceIndex === -1) {
      const nextResources = normalizeResources([...resources, nextResource]);
      setResources(nextResources);
      const didSave = await saveResourceState(nextResources, downloadable);
      if (!didSave) {
        setResources(previousResources);
      }
      return;
    }

    if (editingResourceIndex !== null) {
      const nextResources = normalizeResources(
        resources.map((resource, index) =>
          index === editingResourceIndex ? nextResource : resource,
        ),
      );
      setResources(nextResources);
      const didSave = await saveResourceState(nextResources, downloadable);
      if (!didSave) {
        setResources(previousResources);
      }
    }
  };

  const removeResource = async (index: number) => {
    const previousResources = resources;
    const nextResources = normalizeResources(
      resources.filter((_, resourceIndex) => resourceIndex !== index),
    );
    setResources(nextResources);
    const didSave = await saveResourceState(nextResources, downloadable, {
      closeDraft: editingResourceIndex === index,
    });
    if (!didSave) {
      setResources(previousResources);
    }
    return didSave;
  };

  const handleConfirmRemoveResource = async () => {
    if (deletingResourceIndex === null) return;

    const didSave = await removeResource(deletingResourceIndex);
    if (didSave) {
      setDeletingResourceIndex(null);
    }
  };

  const discardChanges = () => {
    setResources(savedResources);
    setDownloadable(savedDownloadable);
    resetDraft();
  };

  const saveResourceState = async (
    nextResources: string[],
    nextDownloadable: boolean,
    options: { closeDraft?: boolean } = {},
  ) => {
    if (!lecture) {
      toast.error(t("resources.selectLectureFirst"));
      return false;
    }

    try {
      await updateLectureMutation.mutateAsync({
        lectureId: lecture.id,
        request: toLectureUpdateRequest(lecture, nextResources, nextDownloadable),
      });
      setResources(nextResources);
      setSavedResources(nextResources);
      setDownloadable(nextDownloadable);
      setSavedDownloadable(nextDownloadable);
      if (options.closeDraft ?? true) {
        resetDraft();
      }
      toast.success(t("resources.saved"));
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, t("resources.failed")));
      return false;
    }
  };

  const handleSaveResources = async () => {
    await saveResourceState(cleanedResources, downloadable);
  };

  if (!sections.length) {
    return (
      <EmptyStudioState
        icon={<FileText className="h-5 w-5" />}
        title={t("resources.noSectionTitle")}
        subtitle={t("resources.noSectionSubtitle")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("resources.sectionLabel")}</Label>
          <Select
            value={selectedSectionId}
            onValueChange={setSelectedSectionId}
            disabled={!sections.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("resources.sectionPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.displayOrder}. {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("resources.lectureLabel")}</Label>
          <Select
            value={selectedLectureId}
            onValueChange={setSelectedLectureId}
            disabled={!lectures.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("resources.lecturePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {lectures.map((lectureItem) => (
                <SelectItem key={lectureItem.id} value={lectureItem.id}>
                  {lectureItem.displayOrder}. {lectureItem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!lectures.length ? (
        <EmptyStudioState
          icon={<FileText className="h-5 w-5" />}
          title={t("resources.noLectureTitle")}
          subtitle={t("resources.noLectureSubtitle")}
        />
      ) : lectureQuery.isLoading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
          <div className="h-56 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        </div>
      ) : lecture ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-border">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                  {t("resources.title")}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                  {t("resources.subtitle")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isEditingResource || updateLectureMutation.isPending}
                onClick={openAddResourceForm}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("resources.add")}
              </Button>
            </div>

            {isAddingResource ? (
              <ResourceDraftForm
                title={t("resources.addResourceTitle")}
                value={resourceDraft}
                submitLabel={t("resources.addDraft")}
                onChange={setResourceDraft}
                onCancel={resetDraft}
                onSubmit={submitResourceDraft}
                isSaving={updateLectureMutation.isPending}
              />
            ) : null}

            {resourceCount ? (
              <div className="space-y-2">
                {cleanedResources.map((resource, index) =>
                  editingResourceIndex === index ? (
                    <ResourceDraftForm
                      key={`${resource}-${index}-editor`}
                      title={t("resources.editResourceTitle")}
                      value={resourceDraft}
                      submitLabel={t("resources.saveDraft")}
                      onChange={setResourceDraft}
                      onCancel={resetDraft}
                      onSubmit={submitResourceDraft}
                      isSaving={updateLectureMutation.isPending}
                    />
                  ) : (
                    <ResourceItem
                      key={`${resource}-${index}`}
                      resource={resource}
                      onEdit={() => openEditResourceForm(index)}
                      onRemove={() => setDeletingResourceIndex(index)}
                      isSaving={updateLectureMutation.isPending}
                    />
                  ),
                )}
              </div>
            ) : isAddingResource ? null : (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-border">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Link2 className="h-5 w-5" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-gray-950 dark:text-text">
                  {t("resources.emptyTitle")}
                </h4>
                <p className="mx-auto mt-1 max-w-md text-xs text-gray-500 dark:text-muted">
                  {t("resources.emptySubtitle")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={openAddResourceForm}
                  disabled={updateLectureMutation.isPending}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("resources.add")}
                </Button>
              </div>
            )}

            <ToggleRow
              label={t("resources.downloadable")}
              hint={t("resources.downloadableHint")}
              checked={downloadable}
              onCheckedChange={setDownloadable}
            />

            {hasDirtyChanges ? (
              <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-primary">
                  {t("resources.unsavedChanges")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={discardChanges}>
                    {t("resources.discard")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-white!"
                    disabled={updateLectureMutation.isPending}
                    onClick={handleSaveResources}
                  >
                    {updateLectureMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {t("resources.save")}
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-border">
            <div>
              <p className="text-xs font-semibold text-primary">
                {selectedSection?.title}
              </p>
              <h3 className="mt-1 text-sm font-bold text-gray-950 dark:text-text">
                {lecture.title}
              </h3>
              {lecture.description ? (
                <p className="mt-1 line-clamp-3 text-xs text-gray-500 dark:text-muted">
                  {lecture.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2 text-xs text-gray-600 dark:text-muted">
              <ResourceSummary label={t("resources.contentType")}>
                {t(`lectures.contentTypes.${lecture.contentType}`)}
              </ResourceSummary>
              <ResourceSummary label={t("resources.totalResources")}>
                {resourceCount}
              </ResourceSummary>
              <ResourceSummary label={t("resources.downloadable")}>
                {downloadable ? t("preview.yes") : t("preview.no")}
              </ResourceSummary>
            </div>

            <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500 dark:border-border dark:text-muted">
              <Link2 className="mb-2 h-4 w-4 text-primary" />
              {t("resources.hint")}
            </div>
          </aside>
        </div>
      ) : (
        <EmptyStudioState
          icon={<FileText className="h-5 w-5" />}
          title={t("resources.loadFailedTitle")}
          subtitle={t("resources.loadFailedSubtitle")}
        />
      )}
      <ConfirmDeleteDialog
        open={deletingResourceIndex !== null}
        title={t("resources.deleteConfirm")}
        description={t("deleteDialog.description")}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        isPending={updateLectureMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingResourceIndex(null);
        }}
        onConfirm={() => {
          void handleConfirmRemoveResource();
        }}
      />
    </div>
  );
};

const ResourceDraftForm = ({
  title,
  value,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
  isSaving,
}: {
  title: string;
  value: string;
  submitLabel: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSaving: boolean;
}) => {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-border dark:bg-bg">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-gray-950 dark:text-text">{title}</h4>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={value}
          placeholder={t("resources.resourcePlaceholder")}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t("resources.cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          className="text-white!"
          onClick={onSubmit}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

const ResourceItem = ({
  resource,
  onEdit,
  onRemove,
  isSaving,
}: {
  resource: string;
  onEdit: () => void;
  onRemove: () => void;
  isSaving: boolean;
}) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const canOpen = isExternalUrl(resource);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-border">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Link2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-950 dark:text-text">
            {getResourceName(resource)}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-muted">
            {resource}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild={canOpen}
          disabled={!canOpen}
        >
          {canOpen ? (
            <a href={resource} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              {t("resources.open")}
            </a>
          ) : (
            <span>
              <ExternalLink className="h-3.5 w-3.5" />
              {t("resources.open")}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={isSaving}
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("resources.edit")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="text-white!"
          onClick={onRemove}
          disabled={isSaving}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("resources.remove")}
        </Button>
      </div>
    </div>
  );
};

const ResourceSummary = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-border dark:bg-bg">
    <p className="text-gray-400">{label}</p>
    <p className="mt-1 font-bold text-gray-950 dark:text-text">{children}</p>
  </div>
);
