"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { checklistItems, type StudioChecklist } from "./types";

type ChecklistTabProps = {
  checklist: StudioChecklist;
};

export const ChecklistTab = ({ checklist }: ChecklistTabProps) => {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <div className="space-y-2">
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
    </div>
  );
};
