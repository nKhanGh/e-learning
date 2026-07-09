"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyStudioState } from "./EmptyStudioState";

export const ResourcesTab = () => {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <EmptyStudioState
      icon={<FileText className="h-5 w-5" />}
      title={t("resources.title")}
      subtitle={t("resources.subtitle")}
    />
  );
};
