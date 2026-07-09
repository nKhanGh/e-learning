"use client";

import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyStudioState } from "./EmptyStudioState";

export const QuizTab = () => {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <EmptyStudioState
      icon={<FileQuestion className="h-5 w-5" />}
      title={t("quiz.title")}
      subtitle={t("quiz.subtitle")}
    />
  );
};
