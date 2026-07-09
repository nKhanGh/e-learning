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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateLectureMutation,
  useDeleteLectureMutation,
  useLecturesBySectionQuery,
  useUpdateLectureMutation,
} from "@/hooks/queries/useCourseQueries";
import {
  BookOpen,
  Clock3,
  Loader2,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyStudioState } from "./EmptyStudioState";
import { getErrorMessage } from "./studioUtils";
import { ToggleRow } from "./ToggleRow";
import type { StudioSection } from "./types";

type LectureForm = {
  title: string;
  description: string;
  contentType: LectureContentType;
  textContent: string;
  videoUrl: string;
  videoDurationSeconds: string;
  videoThumbnailUrl: string;
  videoQuality: string;
  hasCaptions: boolean;
  captionUrl: string;
  attachments: string;
  externalUrl: string;
  isPreview: boolean;
  isDownloadable: boolean;
  displayOrder: string;
  isPublished: boolean;
};

type LecturesTabProps = {
  courseId: string;
  sections: StudioSection[];
};

const lectureContentTypes: LectureContentType[] = [
  "VIDEO",
  "ARTICLE",
  "QUIZ",
  "FILE",
  "EXTERNAL_LINK",
];

const initialLectureForm: LectureForm = {
  title: "",
  description: "",
  contentType: "VIDEO",
  textContent: "",
  videoUrl: "",
  videoDurationSeconds: "0",
  videoThumbnailUrl: "",
  videoQuality: "",
  hasCaptions: false,
  captionUrl: "",
  attachments: "",
  externalUrl: "",
  isPreview: false,
  isDownloadable: false,
  displayOrder: "1",
  isPublished: true,
};

const parseAttachments = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const stringifyAttachments = (attachments: string[] | null | undefined) =>
  (attachments ?? []).join("\n");

const toLectureForm = (
  lecture: LectureResponse | null,
  fallbackOrder: number,
): LectureForm => {
  if (!lecture) {
    return {
      ...initialLectureForm,
      displayOrder: String(fallbackOrder),
    };
  }

  return {
    title: lecture.title ?? "",
    description: lecture.description ?? "",
    contentType: lecture.contentType ?? "VIDEO",
    textContent: lecture.textContent ?? "",
    videoUrl: lecture.videoUrl ?? "",
    videoDurationSeconds: String(lecture.videoDurationSeconds ?? 0),
    videoThumbnailUrl: lecture.videoThumbnailUrl ?? "",
    videoQuality: lecture.videoQuality ?? "",
    hasCaptions: lecture.hasCaptions ?? false,
    captionUrl: lecture.captionUrl ?? "",
    attachments: stringifyAttachments(lecture.attachments),
    externalUrl: lecture.externalUrl ?? "",
    isPreview: lecture.isPreview ?? false,
    isDownloadable: lecture.isDownloadable ?? false,
    displayOrder: String(lecture.displayOrder ?? fallbackOrder),
    isPublished: lecture.isPublished ?? true,
  };
};

export const LecturesTab = ({ courseId, sections }: LecturesTabProps) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const selectedSection = sections.find(
    (section) => section.id === selectedSectionId,
  );
  const lecturesQuery = useLecturesBySectionQuery(selectedSectionId);
  const lectures = useMemo<LectureResponse[]>(() => {
    if (lecturesQuery.data) return lecturesQuery.data;
    if (!selectedSection) return [];

    return selectedSection.lectures.map((lecture) => ({
      id: lecture.id,
      section: selectedSection,
      title: lecture.title,
      description: lecture.description ?? "",
      contentType: lecture.contentType,
      textContent: "",
      videoUrl: "",
      videoDurationSeconds:
        lecture.videoDurationSeconds ?? (lecture.durationMinutes ?? 0) * 60,
      videoThumbnailUrl: "",
      videoQuality: "",
      hasCaptions: false,
      captionUrl: "",
      attachments: [],
      externalUrl: "",
      isPreview: lecture.preview,
      isDownloadable: lecture.downloadable,
      displayOrder: lecture.displayOrder,
      isPublished: lecture.status !== "LOCKED",
      quiz: lecture.quiz,
    }));
  }, [lecturesQuery.data, selectedSection]);
  const nextLectureOrder =
    Math.max(0, ...lectures.map((lecture) => lecture.displayOrder ?? 0)) + 1;
  const createLectureMutation = useCreateLectureMutation(
    courseId,
    selectedSectionId,
  );
  const updateLectureMutation = useUpdateLectureMutation(
    courseId,
    selectedSectionId,
  );
  const deleteLectureMutation = useDeleteLectureMutation(
    courseId,
    selectedSectionId,
  );
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<LectureResponse | null>(
    null,
  );
  const [lectureForm, setLectureForm] = useState<LectureForm>(
    toLectureForm(null, nextLectureOrder),
  );
  const lectureSaving =
    createLectureMutation.isPending || updateLectureMutation.isPending;

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

  const openCreateLectureDialog = () => {
    if (!selectedSectionId) {
      toast.error(t("lectures.selectSectionFirst"));
      return;
    }

    setEditingLecture(null);
    setLectureForm(toLectureForm(null, nextLectureOrder));
    setLectureDialogOpen(true);
  };

  const openEditLectureDialog = (lecture: LectureResponse) => {
    setEditingLecture(lecture);
    setLectureForm(toLectureForm(lecture, nextLectureOrder));
    setLectureDialogOpen(true);
  };

  const toLecturePayload = (): LectureUpdateRequest => ({
    title: lectureForm.title.trim(),
    description: lectureForm.description.trim(),
    contentType: lectureForm.contentType,
    textContent: lectureForm.textContent.trim(),
    videoUrl: lectureForm.videoUrl.trim(),
    videoDurationSeconds: Math.max(
      0,
      Number(lectureForm.videoDurationSeconds) || 0,
    ),
    videoThumbnailUrl: lectureForm.videoThumbnailUrl.trim(),
    videoQuality: lectureForm.videoQuality.trim(),
    hasCaptions: lectureForm.hasCaptions,
    captionUrl: lectureForm.captionUrl.trim(),
    attachments: parseAttachments(lectureForm.attachments),
    externalUrl: lectureForm.externalUrl.trim(),
    isPreview: lectureForm.isPreview,
    isDownloadable: lectureForm.isDownloadable,
    displayOrder: Math.max(1, Number(lectureForm.displayOrder) || nextLectureOrder),
    isPublished: lectureForm.isPublished,
  });

  const handleLectureSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSectionId) {
      toast.error(t("lectures.selectSectionFirst"));
      return;
    }

    if (!lectureForm.title.trim()) {
      toast.error(t("lectures.validationTitle"));
      return;
    }

    const payload = toLecturePayload();

    try {
      if (editingLecture) {
        await updateLectureMutation.mutateAsync({
          lectureId: editingLecture.id,
          request: payload,
        });
        toast.success(t("lectures.updated"));
      } else {
        const { displayOrder: _displayOrder, ...createPayload } = payload;
        await createLectureMutation.mutateAsync(createPayload);
        toast.success(t("lectures.created"));
      }

      setLectureDialogOpen(false);
      setEditingLecture(null);
    } catch (error) {
      toast.error(getErrorMessage(error, t("lectures.failed")));
    }
  };

  const handleDeleteLecture = async (lecture: LectureResponse) => {
    if (!globalThis.confirm(t("lectures.deleteConfirm"))) return;

    try {
      await deleteLectureMutation.mutateAsync(lecture.id);
      toast.success(t("lectures.deleted"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("lectures.deleteFailed")));
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-md space-y-2">
            <Label>{t("lectures.sectionLabel")}</Label>
            <Select
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              disabled={!sections.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("lectures.sectionPlaceholder")} />
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
          <Button
            type="button"
            size="sm"
            className="text-white!"
            disabled={!selectedSectionId}
            onClick={openCreateLectureDialog}
          >
            <Plus className="h-4 w-4" />
            {t("lectures.add")}
          </Button>
        </div>

        {sections.length ? lecturesQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
              />
            ))}
          </div>
        ) : lectures.length ? (
          <div className="space-y-2">
            {lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="rounded-lg border border-gray-200 p-3 dark:border-border"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary">
                      {t("lectures.order", {
                        order: lecture.displayOrder ?? 0,
                      })}
                      <span className="mx-2 text-gray-300">.</span>
                      {t(`lectures.contentTypes.${lecture.contentType}`)}
                      <span className="mx-2 text-gray-300">.</span>
                      <span
                        className={
                          lecture.isPublished
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {lecture.isPublished
                          ? t("lectures.published")
                          : t("lectures.unpublished")}
                      </span>
                    </p>
                    <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                      {lecture.title}
                    </h3>
                    {lecture.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-muted">
                        {lecture.description}
                      </p>
                    ) : null}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-muted">
                      <span>
                        <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                        {Math.round((lecture.videoDurationSeconds ?? 0) / 60)}m
                      </span>
                      {lecture.isPreview ? (
                        <span>{t("lectures.preview")}</span>
                      ) : null}
                      {lecture.isDownloadable ? (
                        <span>{t("lectures.downloadable")}</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditLectureDialog(lecture)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t("lectures.edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="!text-white"
                      disabled={deleteLectureMutation.isPending}
                      onClick={() => handleDeleteLecture(lecture)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("lectures.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyStudioState
            icon={<PlayCircle className="h-5 w-5" />}
            title={t("lectures.emptyTitle")}
            subtitle={t("lectures.emptySubtitle")}
          />
        ) : (
          <EmptyStudioState
            icon={<BookOpen className="h-5 w-5" />}
            title={t("lectures.noSectionTitle")}
            subtitle={t("lectures.noSectionSubtitle")}
          />
        )}
      </div>

      <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLecture
                ? t("lectures.editTitle")
                : t("lectures.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {selectedSection
                ? t("lectures.dialogDescription", {
                    section: selectedSection.title,
                  })
                : t("lectures.sectionPlaceholder")}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleLectureSubmit}>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <Label htmlFor="lecture-title">{t("lectures.fields.title")}</Label>
                <Input
                  id="lecture-title"
                  value={lectureForm.title}
                  placeholder={t("lectures.placeholders.title")}
                  onChange={(event) =>
                    setLectureForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("lectures.fields.contentType")}</Label>
                <Select
                  value={lectureForm.contentType}
                  onValueChange={(value) =>
                    setLectureForm((current) => ({
                      ...current,
                      contentType: value as LectureContentType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lectureContentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`lectures.contentTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lecture-description">
                {t("lectures.fields.description")}
              </Label>
              <Textarea
                id="lecture-description"
                value={lectureForm.description}
                placeholder={t("lectures.placeholders.description")}
                onChange={(event) =>
                  setLectureForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lecture-order">
                  {t("lectures.fields.displayOrder")}
                </Label>
                <Input
                  id="lecture-order"
                  type="number"
                  min={1}
                  disabled={!editingLecture}
                  value={lectureForm.displayOrder}
                  onChange={(event) =>
                    setLectureForm((current) => ({
                      ...current,
                      displayOrder: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lecture-duration">
                  {t("lectures.fields.videoDurationSeconds")}
                </Label>
                <Input
                  id="lecture-duration"
                  type="number"
                  min={0}
                  value={lectureForm.videoDurationSeconds}
                  onChange={(event) =>
                    setLectureForm((current) => ({
                      ...current,
                      videoDurationSeconds: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {lectureForm.contentType === "VIDEO" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lecture-video">
                    {t("lectures.fields.videoUrl")}
                  </Label>
                  <Input
                    id="lecture-video"
                    value={lectureForm.videoUrl}
                    placeholder={t("lectures.placeholders.videoUrl")}
                    onChange={(event) =>
                      setLectureForm((current) => ({
                        ...current,
                        videoUrl: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecture-thumbnail">
                    {t("lectures.fields.videoThumbnailUrl")}
                  </Label>
                  <Input
                    id="lecture-thumbnail"
                    value={lectureForm.videoThumbnailUrl}
                    placeholder={t("lectures.placeholders.videoThumbnailUrl")}
                    onChange={(event) =>
                      setLectureForm((current) => ({
                        ...current,
                        videoThumbnailUrl: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecture-quality">
                    {t("lectures.fields.videoQuality")}
                  </Label>
                  <Input
                    id="lecture-quality"
                    value={lectureForm.videoQuality}
                    placeholder={t("lectures.placeholders.videoQuality")}
                    onChange={(event) =>
                      setLectureForm((current) => ({
                        ...current,
                        videoQuality: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecture-caption">
                    {t("lectures.fields.captionUrl")}
                  </Label>
                  <Input
                    id="lecture-caption"
                    value={lectureForm.captionUrl}
                    placeholder={t("lectures.placeholders.captionUrl")}
                    onChange={(event) =>
                      setLectureForm((current) => ({
                        ...current,
                        captionUrl: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            {lectureForm.contentType === "ARTICLE" ? (
              <div className="space-y-2">
                <Label htmlFor="lecture-text">
                  {t("lectures.fields.textContent")}
                </Label>
                <Textarea
                  id="lecture-text"
                  className="min-h-32"
                  value={lectureForm.textContent}
                  placeholder={t("lectures.placeholders.textContent")}
                  onChange={(event) =>
                    setLectureForm((current) => ({
                      ...current,
                      textContent: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}

            {lectureForm.contentType === "FILE" ? (
              <div className="space-y-2">
                <Label htmlFor="lecture-attachments">
                  {t("lectures.fields.attachments")}
                </Label>
                <Textarea
                  id="lecture-attachments"
                  value={lectureForm.attachments}
                  placeholder={t("lectures.placeholders.attachments")}
                  onChange={(event) =>
                    setLectureForm((current) => ({
                      ...current,
                      attachments: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}

            {lectureForm.contentType === "EXTERNAL_LINK" ? (
              <div className="space-y-2">
                <Label htmlFor="lecture-external">
                  {t("lectures.fields.externalUrl")}
                </Label>
                <Input
                  id="lecture-external"
                  value={lectureForm.externalUrl}
                  placeholder={t("lectures.placeholders.externalUrl")}
                  onChange={(event) =>
                    setLectureForm((current) => ({
                      ...current,
                      externalUrl: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow
                label={t("lectures.fields.preview")}
                hint={t("lectures.previewHint")}
                checked={lectureForm.isPreview}
                onCheckedChange={(checked) =>
                  setLectureForm((current) => ({
                    ...current,
                    isPreview: checked,
                  }))
                }
              />
              <ToggleRow
                label={t("lectures.fields.downloadable")}
                hint={t("lectures.downloadableHint")}
                checked={lectureForm.isDownloadable}
                onCheckedChange={(checked) =>
                  setLectureForm((current) => ({
                    ...current,
                    isDownloadable: checked,
                  }))
                }
              />
              <ToggleRow
                label={t("lectures.fields.hasCaptions")}
                hint={t("lectures.captionHint")}
                checked={lectureForm.hasCaptions}
                onCheckedChange={(checked) =>
                  setLectureForm((current) => ({
                    ...current,
                    hasCaptions: checked,
                  }))
                }
              />
              <ToggleRow
                label={t("lectures.fields.published")}
                hint={t("lectures.publishedHint")}
                checked={lectureForm.isPublished}
                onCheckedChange={(checked) =>
                  setLectureForm((current) => ({
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
                onClick={() => setLectureDialogOpen(false)}
              >
                {t("lectures.cancel")}
              </Button>
              <Button type="submit" className="!text-white" disabled={lectureSaving}>
                {lectureSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {editingLecture ? t("lectures.save") : t("lectures.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
