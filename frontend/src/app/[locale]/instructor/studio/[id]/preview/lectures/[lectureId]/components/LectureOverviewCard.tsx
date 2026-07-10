import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  getLectureDownloadable,
  getLectureMinutes,
  getLecturePreview,
  getLecturePublished,
} from "./lecturePreviewUtils";

type LectureOverviewCardProps = {
  displayLecture: LectureResponse | CourseCurriculumLecture;
  section?: CourseSectionResponse | CourseCurriculumSection;
  contentType: LectureContentType;
};

const contentIcons: Record<LectureContentType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  FILE: Download,
  EXTERNAL_LINK: ExternalLink,
};

export function LectureOverviewCard({
  displayLecture,
  section,
  contentType,
}: LectureOverviewCardProps) {
  const t = useTranslations("InstructorCourseStudioPage");
  const ContentIcon = contentIcons[contentType];

  return (
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
              getLecturePreview(displayLecture) ? t("preview.yes") : t("preview.no")
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
  );
}

const PreviewMeta = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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
