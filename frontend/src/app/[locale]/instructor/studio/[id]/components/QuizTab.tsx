"use client";

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
  useLecturesBySectionQuery,
  useQuizByLectureQuery,
  useQuizQuestionsQuery,
} from "@/hooks/queries/useCourseQueries";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileQuestion,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyStudioState } from "./EmptyStudioState";
import type { StudioSection } from "./types";

type QuizTabProps = {
  courseId: string;
  sections: StudioSection[];
};

type QuizOverviewCardProps = {
  courseId: string;
  lecture: CourseCurriculumLecture | LectureResponse;
};

export const QuizTab = ({ courseId, sections }: QuizTabProps) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const selectedSection = sections.find(
    (section) => section.id === selectedSectionId,
  );
  const lecturesQuery = useLecturesBySectionQuery(selectedSectionId);
  const lectures = lecturesQuery.data ?? selectedSection?.lectures ?? [];
  const quizLectures = useMemo(
    () =>
      lectures.filter(
        (lecture) => lecture.contentType === "QUIZ",
      ),
    [lectures],
  );

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

  if (!sections.length) {
    return (
      <EmptyStudioState
        icon={<FileQuestion className="h-5 w-5" />}
        title={t("quiz.noSectionTitle")}
        subtitle={t("quiz.noSectionSubtitle")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h3 className="text-sm font-bold text-gray-950 dark:text-text">
            {t("quiz.title")}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-muted">
            {t("quiz.subtitle")}
          </p>
        </div>

        <div className="w-full space-y-2 lg:w-80">
          <Label>{t("quiz.sectionLabel")}</Label>
          <Select
            value={selectedSectionId}
            onValueChange={setSelectedSectionId}
            disabled={!sections.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("quiz.sectionPlaceholder")} />
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
      </div>

      {lecturesQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
            />
          ))}
        </div>
      ) : quizLectures.length ? (
        <div className="space-y-3">
          {quizLectures.map((lecture) => (
            <QuizOverviewCard
              key={lecture.id}
              courseId={courseId}
              lecture={lecture}
            />
          ))}
        </div>
      ) : (
        <EmptyStudioState
          icon={<FileQuestion className="h-5 w-5" />}
          title={t("quiz.noQuizLecturesTitle")}
          subtitle={t("quiz.noQuizLecturesSubtitle")}
        />
      )}
    </div>
  );
};

const QuizOverviewCard = ({ courseId, lecture }: QuizOverviewCardProps) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const locale = useLocale();
  const quizQuery = useQuizByLectureQuery(lecture.id);
  const quiz = quizQuery.data ?? lecture.quiz ?? null;
  const fullQuiz = quiz && "isPublished" in quiz ? quiz : null;
  const quizId = quiz?.id ?? "";
  const questionsQuery = useQuizQuestionsQuery(quizId);
  const questions = questionsQuery.data ?? [];
  const previewHref = `/${locale}/instructor/studio/${courseId}/preview/lectures/${lecture.id}`;
  const questionCount =
    questions.length || ("totalQuestions" in (quiz ?? {}) ? quiz?.totalQuestions ?? 0 : 0);
  const totalPoints =
    questions.length > 0
      ? questions.reduce((total, question) => total + Number(question.points ?? 0), 0)
      : fullQuiz
        ? Number(fullQuiz.totalPoints ?? 0)
        : 0;
  const isPublished = fullQuiz ? Boolean(fullQuiz.isPublished) : false;
  const missingItems = [
    !quiz ? t("quiz.status.missingConfig") : null,
    quiz && questionCount === 0 ? t("quiz.status.missingQuestions") : null,
    quiz && !isPublished ? t("quiz.status.unpublished") : null,
  ].filter(Boolean);
  const isReady = quiz && missingItems.length === 0;

  return (
    <article className="rounded-lg border border-gray-200 p-4 dark:border-border">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              {lecture.displayOrder}. {lecture.title}
            </span>
            <span
              className={
                isReady
                  ? "inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"
                  : "inline-flex items-center gap-1 text-xs font-semibold text-amber-600"
              }
            >
              {isReady ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {isReady ? t("quiz.status.ready") : t("quiz.status.needsWork")}
            </span>
          </div>

          <h4 className="mt-3 text-base font-bold text-gray-950 dark:text-text">
            {lecture.title}
          </h4>
          {quiz ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-muted">
              {quiz.description || t("quiz.status.configured")}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-muted">
              {t("quiz.status.noConfigTitle")}
            </p>
          )}

          {quizQuery.isLoading ? (
            <div className="mt-3 h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
          ) : (
            <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-5 dark:text-muted">
              <QuizMeta label={t("quiz.meta.questions")}>{questionCount}</QuizMeta>
              <QuizMeta label={t("quiz.meta.points")}>{totalPoints}</QuizMeta>
              <QuizMeta label={t("quiz.meta.passingScore")}>
                {fullQuiz ? `${fullQuiz.passingScore ?? 0}%` : "-"}
              </QuizMeta>
              <QuizMeta label={t("quiz.meta.timeLimit")}>
                {quiz?.timeLimitMinutes
                  ? t("preview.minutes", { count: quiz.timeLimitMinutes })
                  : t("quiz.unlimited")}
              </QuizMeta>
              <QuizMeta label={t("quiz.meta.published")}>
                {isPublished ? t("quiz.published") : t("quiz.unpublished")}
              </QuizMeta>
            </div>
          )}

          {missingItems.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {missingItems.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-200"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild type="button" size="sm" className="text-white!">
            <Link href={previewHref}>
              <Eye className="h-3.5 w-3.5" />
              {t("quiz.actions.preview")}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

const QuizMeta = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md bg-gray-50 p-2 dark:bg-bg">
    <p className="text-[11px] text-gray-500 dark:text-muted">{label}</p>
    <p className="mt-1 font-bold text-gray-900 dark:text-text">{children}</p>
  </div>
);
