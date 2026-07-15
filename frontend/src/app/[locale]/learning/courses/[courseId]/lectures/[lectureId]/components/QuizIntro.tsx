"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardList, History, Loader2, PlayCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type QuizIntroProps = {
  lectureTitle: string;
  quiz: QuizResponse | CourseCurriculumQuiz;
  attempts: QuizAttemptResponse[];
  activeAttempt: QuizAttemptResponse | null;
  isStarting: boolean;
  onStart: () => void;
  onHistory: () => void;
};

export function QuizIntro({
  lectureTitle,
  quiz,
  attempts,
  activeAttempt,
  isStarting,
  onStart,
  onHistory,
}: QuizIntroProps) {
  const t = useTranslations("StudentLecturePage.quiz");
  const completedAttempts = attempts.filter(
    (attempt) => attempt.status === "GRADED",
  );
  const maxAttempts = "maxAttempts" in quiz ? quiz.maxAttempts : null;
  const hasRemainingAttempts =
    maxAttempts === null || completedAttempts.length < maxAttempts;
  const latestResult = completedAttempts.at(-1) ?? null;
  const totalPoints = "totalPoints" in quiz ? quiz.totalPoints : "-";
  const passingScore = "passingScore" in quiz ? `${quiz.passingScore}%` : "-";

  const actionLabel = activeAttempt
    ? t("resume")
    : completedAttempts.length
      ? t("retry")
      : t("start");

  return (
    <div className="mx-auto max-w-3xl space-y-4 py-2">
      <section className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-border dark:bg-bg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ClipboardList className="h-4 w-4" />
              {t("attempts")}
            </div>
            <h2 className="mt-2 text-xl font-bold text-gray-950 dark:text-text">
              {lectureTitle}
            </h2>
            {quiz.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-muted">
                {quiz.description}
              </p>
            ) : null}
            {"instructions" in quiz && quiz.instructions ? (
              <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm leading-6 text-gray-600 dark:text-muted">
                {quiz.instructions}
              </p>
            ) : null}
          </div>
          {completedAttempts.length ? (
            <Button type="button" variant="outline" size="sm" onClick={onHistory}>
              <History className="h-4 w-4" />
              {t("history")}
            </Button>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <QuizMeta label={t("questions")}>{quiz.totalQuestions}</QuizMeta>
          <QuizMeta label={t("points")}>{totalPoints}</QuizMeta>
          <QuizMeta label={t("passingScore")}>{passingScore}</QuizMeta>
          <QuizMeta label={t("timeLimit")}>
            {quiz.timeLimitMinutes
              ? t("minutes", { count: quiz.timeLimitMinutes })
              : t("unlimited")}
          </QuizMeta>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-border">
          <p className="text-xs font-medium text-gray-500 dark:text-muted">
            {maxAttempts === null
              ? t("attemptUnlimited", { used: completedAttempts.length })
              : t("attemptProgress", {
                  used: completedAttempts.length,
                  max: maxAttempts,
                })}
          </p>
          {hasRemainingAttempts || activeAttempt ? (
            <Button
              type="button"
              className="!text-white"
              disabled={isStarting}
              onClick={onStart}
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : activeAttempt ? (
                <PlayCircle className="h-4 w-4" />
              ) : completedAttempts.length ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              {actionLabel}
            </Button>
          ) : (
            <span className="text-xs font-semibold text-gray-500 dark:text-muted">
              {t("noAttemptsRemaining")}
            </span>
          )}
        </div>
      </section>

      {latestResult ? (
        <section
          className={cn(
            "rounded-lg border p-4",
            latestResult.passed
              ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10"
              : "border-red-200 bg-red-50/70 dark:border-red-500/30 dark:bg-red-500/10",
          )}
        >
          <p className="text-xs font-semibold text-gray-600 dark:text-muted">
            {t("latestScore")}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-950 dark:text-text">
            {t("score", {
              score: Number(latestResult.score ?? 0),
              percentage: Number(latestResult.percentage ?? 0).toFixed(0),
            })}
          </p>
        </section>
      ) : null}
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
  <div className="rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-border dark:bg-surface">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-bold text-gray-950 dark:text-text">{children}</p>
  </div>
);
