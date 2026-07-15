"use client";

import { Button } from "@/components/ui/button";
import {
  useMyQuizAttemptsQuery,
  usePublicQuizByLectureQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizMutation,
} from "@/hooks/queries/useCourseQueries";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

type StudentQuizContentProps = {
  lectureId: string;
  fallbackQuiz: QuizResponse | CourseCurriculumQuiz | null;
  canAttempt: boolean;
};

export function StudentQuizContent({
  lectureId,
  fallbackQuiz,
  canAttempt,
}: StudentQuizContentProps) {
  const t = useTranslations("StudentLecturePage");
  const quizQuery = usePublicQuizByLectureQuery(lectureId);
  const quiz = quizQuery.data ?? fallbackQuiz;
  const quizId = quiz?.id ?? "";
  const attemptsQuery = useMyQuizAttemptsQuery(quizId, Boolean(quizId && canAttempt));
  const startAttemptMutation = useStartQuizAttemptMutation(quizId);
  const submitQuizMutation = useSubmitQuizMutation(quizId);
  const [localStarted, setLocalStarted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>(
    {},
  );
  const [submittedResult, setSubmittedResult] =
    useState<QuizAttemptResponse | null>(null);

  const questions = useMemo(() => {
    if (quiz && "questions" in quiz && Array.isArray(quiz.questions)) {
      return quiz.questions.slice().sort(
        (first, second) =>
          (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
      );
    }

    return [];
  }, [quiz]);

  const latestAttempt = useMemo(() => {
    const attempts = attemptsQuery.data ?? [];
    return attempts
      .slice()
      .sort((first, second) => second.attemptNumber - first.attemptNumber)[0];
  }, [attemptsQuery.data]);

  const activeAttempt = latestAttempt?.status === "IN_PROGRESS";
  const hasStarted = localStarted || activeAttempt;
  const result = submittedResult ?? (latestAttempt?.status === "GRADED" ? latestAttempt : null);
  const totalQuestions = questions.length || quiz?.totalQuestions || 0;

  const handleStart = async () => {
    if (!quizId) return;

    try {
      await startAttemptMutation.mutateAsync();
      setLocalStarted(true);
      setSubmittedResult(null);
      setSelectedAnswers({});
      toast.success(t("quiz.started"));
    } catch {
      await attemptsQuery.refetch();
      toast.error(t("quiz.startFailed"));
    }
  };

  const toggleAnswer = (questionId: string, option: string) => {
    setSelectedAnswers((current) => {
      const existing = current[questionId] ?? [];
      const next = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];

      return {
        ...current,
        [questionId]: next,
      };
    });
  };

  const handleSubmit = async () => {
    if (!quizId || !questions.length) return;

    const unanswered = questions.filter(
      (question) => !(selectedAnswers[question.id]?.length),
    );

    if (unanswered.length) {
      toast.error(t("quiz.answerAll"));
      return;
    }

    try {
      const attempt = await submitQuizMutation.mutateAsync({
        answers: questions.map((question) => ({
          questionId: question.id,
          answers: selectedAnswers[question.id] ?? [],
        })),
      });
      setSubmittedResult(attempt);
      setLocalStarted(false);
      toast.success(t("quiz.submitted"));
    } catch {
      toast.error(t("quiz.submitFailed"));
    }
  };

  if (quizQuery.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-52 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
        {t("quiz.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-bg">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-950 dark:text-text">
              {quiz.title}
            </h2>
            {quiz.description ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-muted">
                {quiz.description}
              </p>
            ) : null}
            {"instructions" in quiz && quiz.instructions ? (
              <p className="mt-3 rounded-md border border-dashed border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-border dark:bg-surface dark:text-muted">
                {quiz.instructions}
              </p>
            ) : null}
          </div>
          <div className="grid min-w-56 grid-cols-2 gap-2 text-xs">
            <QuizMeta label={t("quiz.questions")}>{totalQuestions}</QuizMeta>
            <QuizMeta label={t("quiz.points")}>
              {"totalPoints" in quiz ? quiz.totalPoints : "-"}
            </QuizMeta>
            <QuizMeta label={t("quiz.passingScore")}>
              {"passingScore" in quiz ? `${quiz.passingScore}%` : "-"}
            </QuizMeta>
            <QuizMeta label={t("quiz.timeLimit")}>
              {quiz.timeLimitMinutes
                ? t("quiz.minutes", { count: quiz.timeLimitMinutes })
                : t("quiz.unlimited")}
            </QuizMeta>
          </div>
        </div>

        {result ? (
          <div
            className={cn(
              "mt-4 rounded-md border px-3 py-2 text-sm font-semibold",
              result.passed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {result.passed ? t("quiz.passed") : t("quiz.failed")} ·{" "}
            {t("quiz.score", {
              score: Number(result.score ?? 0),
              percentage: Number(result.percentage ?? 0).toFixed(0),
            })}
          </div>
        ) : null}
      </div>

      {!canAttempt ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
          {t("quiz.enrollRequired")}
        </div>
      ) : !hasStarted && !result ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center dark:border-border">
          <PlayCircle className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-3 text-base font-bold text-gray-950 dark:text-text">
            {t("quiz.readyTitle")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-muted">
            {t("quiz.readySubtitle")}
          </p>
          <Button
            type="button"
            className="mt-4 !text-white"
            disabled={startAttemptMutation.isPending || attemptsQuery.isFetching}
            onClick={handleStart}
          >
            {startAttemptMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            {t("quiz.start")}
          </Button>
        </div>
      ) : questions.length ? (
        <div className="space-y-3">
          {questions.map((question, questionIndex) => (
            <div
              key={question.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {t("quiz.questionOrder", { order: questionIndex + 1 })} ·{" "}
                    {t("quiz.pointCount", { count: question.points })}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-gray-950 dark:text-text">
                    {question.questionText}
                  </h3>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {t("quiz.selectAnswers")}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const selected = selectedAnswers[question.id]?.includes(option);
                  const disabled = Boolean(result);

                  return (
                    <button
                      key={`${question.id}-${option}-${optionIndex}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleAnswer(question.id, option)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-700 hover:border-primary/50 dark:border-border dark:text-muted",
                        disabled && "cursor-default",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          selected
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-bg",
                        )}
                      >
                        {selected ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          String.fromCharCode(65 + optionIndex)
                        )}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!result ? (
            <div className="flex justify-end">
              <Button
                type="button"
                className="!text-white"
                disabled={submitQuizMutation.isPending}
                onClick={handleSubmit}
              >
                {submitQuizMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {t("quiz.submit")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
          {t("quiz.noQuestions")}
        </div>
      )}
    </div>
  );
}

const QuizMeta = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="rounded-md border border-gray-200 bg-white p-2 dark:border-border dark:bg-surface">
    <p className="text-gray-400">{label}</p>
    <p className="mt-0.5 font-bold text-gray-950 dark:text-text">{children}</p>
  </div>
);
