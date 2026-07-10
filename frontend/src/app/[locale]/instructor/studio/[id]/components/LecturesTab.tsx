"use client";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateLectureMutation,
  useDeleteLectureMutation,
  useLecturesBySectionQuery,
  useUpdateLectureMutation,
} from "@/hooks/queries/useCourseQueries";
import {
  BookOpen,
  Clock3,
  Eye,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyStudioState } from "./EmptyStudioState";
import { LectureDialog } from "./LectureDialog";
import { getErrorMessage } from "./studioUtils";
import type { StudioSection } from "./types";

type LecturesTabProps = {
  courseId: string;
  sections: StudioSection[];
};

export const LecturesTab = ({ courseId, sections }: LecturesTabProps) => {
  const locale = useLocale();
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
  const [deletingLecture, setDeletingLecture] = useState<LectureResponse | null>(
    null,
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
    setLectureDialogOpen(true);
  };

  const openEditLectureDialog = (lecture: LectureResponse) => {
    setEditingLecture(lecture);
    setLectureDialogOpen(true);
  };

  const handleLectureDialogOpenChange = (open: boolean) => {
    setLectureDialogOpen(open);
    if (!open) {
      setEditingLecture(null);
    }
  };

  const handleLectureSubmit = async (
    payload: LectureUpdateRequest,
    submittedLecture: LectureResponse | null,
  ) => {
    if (!selectedSectionId) {
      toast.error(t("lectures.selectSectionFirst"));
      return;
    }

    try {
      if (submittedLecture) {
        await updateLectureMutation.mutateAsync({
          lectureId: submittedLecture.id,
          request: payload,
        });
        toast.success(t("lectures.updated"));
      } else {
        const { displayOrder: _displayOrder, ...createPayload } = payload;
        await createLectureMutation.mutateAsync(createPayload);
        toast.success(t("lectures.created"));
      }

      handleLectureDialogOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t("lectures.failed")));
    }
  };

  const handleDeleteLecture = async (lecture: LectureResponse) => {
    try {
      await deleteLectureMutation.mutateAsync(lecture.id);
      toast.success(t("lectures.deleted"));
      setDeletingLecture(null);
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
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link
                        href={`/${locale}/instructor/studio/${courseId}/preview/lectures/${lecture.id}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("lectures.previewAction")}
                      </Link>
                    </Button>
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
                      className="text-white!"
                      disabled={deleteLectureMutation.isPending}
                      onClick={() => setDeletingLecture(lecture)}
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

      <LectureDialog
        open={lectureDialogOpen}
        lecture={editingLecture}
        fallbackOrder={nextLectureOrder}
        sectionTitle={selectedSection?.title}
        saving={lectureSaving}
        onOpenChange={handleLectureDialogOpenChange}
        onSubmit={handleLectureSubmit}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingLecture)}
        title={t("lectures.deleteConfirm")}
        description={t("deleteDialog.description")}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        isPending={deleteLectureMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingLecture(null);
        }}
        onConfirm={() => {
          if (deletingLecture) void handleDeleteLecture(deletingLecture);
        }}
      />
    </>
  );
};
