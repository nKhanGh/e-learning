import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { getResourceName } from "./lecturePreviewUtils";

export function ResourceList({ attachments }: { attachments: string[] }) {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <a
          key={attachment}
          href={attachment}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-border dark:text-muted"
        >
          <span className="min-w-0 truncate">{getResourceName(attachment)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
            {t("preview.openResource")}
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </a>
      ))}
    </div>
  );
}
