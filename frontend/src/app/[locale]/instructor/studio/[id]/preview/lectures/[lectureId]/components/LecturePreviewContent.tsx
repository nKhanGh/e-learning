import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyContentMessage } from "./EmptyContentMessage";
import { QuizPreviewContent } from "./QuizPreviewContent";
import { ResourceList } from "./ResourceList";
import { isExternalUrl } from "./lecturePreviewUtils";

type LecturePreviewContentProps = {
  courseId: string;
  sectionId?: string;
  lectureTitle?: string;
  lecture?: LectureResponse;
  contentType: LectureContentType;
  quiz: QuizResponse | CourseCurriculumQuiz | null;
  attachments: string[];
};

export function LecturePreviewContent({
  courseId,
  sectionId,
  lectureTitle,
  lecture,
  contentType,
  quiz,
  attachments,
}: LecturePreviewContentProps) {
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
    <QuizPreviewContent
      courseId={courseId}
      sectionId={sectionId}
      lectureId={lecture?.id ?? ""}
      lectureTitle={lectureTitle ?? lecture?.title ?? ""}
      fallbackQuiz={quiz}
    />
  );
}
