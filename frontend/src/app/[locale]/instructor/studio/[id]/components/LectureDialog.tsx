"use client";

import { RichMarkdownEditor } from "@/components/markdown/RichMarkdownEditor";
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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { ToggleRow } from "./ToggleRow";

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

type LectureDialogProps = {
  open: boolean;
  lecture: LectureResponse | null;
  fallbackOrder: number;
  sectionTitle?: string;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: LectureUpdateRequest,
    lecture: LectureResponse | null,
  ) => Promise<void>;
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

const missingTextContentPlaceholderKey =
  "InstructorCourseStudioPage.lectures.placeholders.textContent";

const fallbackTextContentPlaceholder =
  "# Lesson title\n\nWrite the article content here.\n\n- Use lists for steps\n- Use **bold** for key terms\n\n<u>Underline important notes</u>";

const normalizeTextContent = (value: string | null | undefined) =>
  value === missingTextContentPlaceholderKey ? "" : (value ?? "");

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
    textContent: normalizeTextContent(lecture.textContent),
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

export function LectureDialog({
  open,
  lecture,
  fallbackOrder,
  sectionTitle,
  saving,
  onOpenChange,
  onSubmit,
}: LectureDialogProps) {
  const t = useTranslations("InstructorCourseStudioPage");
  const textContentPlaceholder = t("lectures.placeholders.textContent");
  const safeTextContentPlaceholder =
    textContentPlaceholder === missingTextContentPlaceholderKey
      ? fallbackTextContentPlaceholder
      : textContentPlaceholder;
  const [lectureForm, setLectureForm] = useState<LectureForm>(
    toLectureForm(lecture, fallbackOrder),
  );

  useEffect(() => {
    if (!open) return;
    setLectureForm(toLectureForm(lecture, fallbackOrder));
  }, [fallbackOrder, lecture, open]);

  const toLecturePayload = (): LectureUpdateRequest => ({
    title: lectureForm.title.trim(),
    description: lectureForm.description.trim(),
    contentType: lectureForm.contentType,
    textContent: normalizeTextContent(lectureForm.textContent).trim(),
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
    displayOrder: Math.max(1, Number(lectureForm.displayOrder) || fallbackOrder),
    isPublished: lectureForm.isPublished,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!lectureForm.title.trim()) {
      toast.error(t("lectures.validationTitle"));
      return;
    }

    await onSubmit(toLecturePayload(), lecture);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {lecture ? t("lectures.editTitle") : t("lectures.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {sectionTitle
              ? t("lectures.dialogDescription", { section: sectionTitle })
              : t("lectures.sectionPlaceholder")}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
                disabled={!lecture}
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
            <RichMarkdownEditor
              id="lecture-text"
              label={t("lectures.fields.textContent")}
              value={lectureForm.textContent}
              placeholder={safeTextContentPlaceholder}
              labels={{
                write: t("lectures.editor.write"),
                preview: t("lectures.editor.preview"),
                split: t("lectures.editor.split"),
                paragraph: t("lectures.editor.paragraph"),
                heading1: t("lectures.editor.heading1"),
                heading2: t("lectures.editor.heading2"),
                heading3: t("lectures.editor.heading3"),
                bold: t("lectures.editor.bold"),
                italic: t("lectures.editor.italic"),
                underline: t("lectures.editor.underline"),
                strike: t("lectures.editor.strike"),
                inlineCode: t("lectures.editor.inlineCode"),
                codeBlock: t("lectures.editor.codeBlock"),
                bulletList: t("lectures.editor.bulletList"),
                numberedList: t("lectures.editor.numberedList"),
                quote: t("lectures.editor.quote"),
                link: t("lectures.editor.link"),
                divider: t("lectures.editor.divider"),
                writingGuide: t("lectures.editor.writingGuide"),
                guideHeading: t("lectures.editor.guideHeading"),
                guideList: t("lectures.editor.guideList"),
                guideEmphasis: t("lectures.editor.guideEmphasis"),
                guideCode: t("lectures.editor.guideCode"),
                emptyPreview: t("lectures.editor.emptyPreview"),
              }}
              onChange={(nextValue) =>
                setLectureForm((current) => ({
                  ...current,
                  textContent: nextValue,
                }))
              }
            />
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
              onClick={() => onOpenChange(false)}
            >
              {t("lectures.cancel")}
            </Button>
            <Button type="submit" className="!text-white" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {lecture ? t("lectures.save") : t("lectures.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
