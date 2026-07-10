import {
  useQuizByLectureQuery,
  useQuizQuestionsQuery,
} from "@/hooks/queries/useCourseQueries";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { EmptyContentMessage } from "./EmptyContentMessage";
import { isFullQuizResponse } from "./lecturePreviewUtils";

type QuizPreviewContentProps = {
  lectureId: string;
  fallbackQuiz: QuizResponse | CourseCurriculumQuiz | null;
};

export function QuizPreviewContent({
  lectureId,
  fallbackQuiz,
}: QuizPreviewContentProps) {
  const t = useTranslations("InstructorCourseStudioPage");
  const quizQuery = useQuizByLectureQuery(lectureId);
  const quiz = quizQuery.data ?? fallbackQuiz;
  const quizId = quiz?.id ?? "";
  const questionsQuery = useQuizQuestionsQuery(quizId);
  const fallbackQuestions = isFullQuizResponse(quiz) ? quiz.questions : [];
  const questions = questionsQuery.data ?? fallbackQuestions;
  const totalPoints = questions.reduce(
    (total, question) => total + Number(question.points ?? 0),
    0,
  );

  if (quizQuery.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  if (!quiz) {
    return <EmptyContentMessage message={t("preview.quizEmpty")} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-950 dark:text-text">
          {t("preview.quizTitle")}
        </h3>
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-bg">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-950 dark:text-text">
                {quiz.title}
              </p>
              {quiz.description ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-muted">
                  {quiz.description}
                </p>
              ) : null}
              {"instructions" in quiz && quiz.instructions ? (
                <div className="mt-3 rounded-md border border-dashed border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-border dark:bg-surface dark:text-muted">
                  <p className="font-bold text-gray-900 dark:text-text">
                    {t("quiz.fields.instructions")}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{quiz.instructions}</p>
                </div>
              ) : null}
            </div>
            {"isPublished" in quiz ? (
              <span className="w-fit rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-surface dark:text-muted">
                {quiz.isPublished ? t("quiz.published") : t("quiz.unpublished")}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-4 dark:text-muted">
            <QuizPreviewMeta label={t("quiz.meta.questions")}>
              {questions.length || quiz.totalQuestions}
            </QuizPreviewMeta>
            <QuizPreviewMeta label={t("quiz.meta.points")}>
              {"totalPoints" in quiz ? quiz.totalPoints : totalPoints}
            </QuizPreviewMeta>
            <QuizPreviewMeta label={t("quiz.meta.passingScore")}>
              {"passingScore" in quiz ? `${quiz.passingScore}%` : "-"}
            </QuizPreviewMeta>
            <QuizPreviewMeta label={t("quiz.meta.timeLimit")}>
              {quiz.timeLimitMinutes
                ? t("preview.minutes", { count: quiz.timeLimitMinutes })
                : t("preview.unlimited")}
            </QuizPreviewMeta>
          </div>

          {"maxAttempts" in quiz ||
          "randomizeQuestions" in quiz ||
          "showCorrectAnswers" in quiz ||
          "showAnswersAfterSubmission" in quiz ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-muted">
              {"maxAttempts" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("preview.maxAttempts")}:{" "}
                  {quiz.maxAttempts ?? t("preview.unlimited")}
                </span>
              ) : null}
              {"randomizeQuestions" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("quiz.fields.randomizeQuestions")}:{" "}
                  {quiz.randomizeQuestions ? t("preview.yes") : t("preview.no")}
                </span>
              ) : null}
              {"showCorrectAnswers" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("quiz.fields.showCorrectAnswers")}:{" "}
                  {quiz.showCorrectAnswers ? t("preview.yes") : t("preview.no")}
                </span>
              ) : null}
              {"showAnswersAfterSubmission" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("quiz.fields.showAnswersAfterSubmission")}:{" "}
                  {quiz.showAnswersAfterSubmission
                    ? t("preview.yes")
                    : t("preview.no")}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-gray-950 dark:text-text">
            {t("preview.quizQuestions")}
          </h4>
          {questionsQuery.isFetching ? (
            <span className="text-xs text-gray-400">
              {t("preview.loadingQuestions")}
            </span>
          ) : null}
        </div>

        {questionsQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
              />
            ))}
          </div>
        ) : questions.length ? (
          <div className="space-y-3">
            {questions
              .slice()
              .sort((first, second) => first.displayOrder - second.displayOrder)
              .map((question) => (
                <QuizQuestionPreview key={question.id} question={question} />
              ))}
          </div>
        ) : (
          <EmptyContentMessage message={t("preview.quizQuestionsEmpty")} />
        )}
      </div>
    </div>
  );
}

const QuizQuestionPreview = ({
  question,
}: {
  question: QuizQuestionResponse;
}) => {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">
            {t("quiz.questions.order", {
              order: question.displayOrder,
            })}
            <span className="mx-2 text-gray-300">.</span>
            {question.points} {t("quiz.questions.points")}
          </p>
          <h5 className="mt-1 text-sm font-bold text-gray-950 dark:text-text">
            {question.questionText}
          </h5>
        </div>
        <span className="w-fit rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          {(question.correctAnswers ?? []).length} {t("quiz.questions.correct")}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {(question.options ?? []).map((option, index) => {
          const isCorrect = question.correctAnswers?.includes(option);

          return (
            <div
              key={`${question.id}-${option}-${index}`}
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200"
                  : "border-gray-200 text-gray-600 dark:border-border dark:text-muted",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  isCorrect
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-bg",
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </div>
          );
        })}
      </div>

      {question.explanation ? (
        <div className="mt-3 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-border dark:bg-bg dark:text-muted">
          <span className="font-bold text-gray-900 dark:text-text">
            {t("quiz.questions.fields.explanation")}:
          </span>{" "}
          {question.explanation}
        </div>
      ) : null}

      {question.imageUrl || question.videoUrl ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {question.imageUrl ? (
            <a
              href={question.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {t("preview.openImage")}
            </a>
          ) : null}
          {question.videoUrl ? (
            <a
              href={question.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {t("preview.openVideo")}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const QuizPreviewMeta = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
    <p className="text-gray-400">{label}</p>
    <p className="mt-1 font-bold text-gray-950 dark:text-text">{children}</p>
  </div>
);
