"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, History, RotateCcw, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type QuizResultProps = {
  attempt: QuizAttemptResponse;
  attempts: QuizAttemptResponse[];
  canReview: boolean;
  canRetry: boolean;
  remainingAttempts: number | null;
  onReview: () => void;
  onRetry: () => void;
  onHistory: () => void;
};

export function QuizResult({
  attempt,
  attempts,
  canReview,
  canRetry,
  remainingAttempts,
  onReview,
  onRetry,
  onHistory,
}: QuizResultProps) {
  const t = useTranslations("StudentLecturePage.quiz");
  const bestPercentage = Math.max(
    0,
    ...attempts
      .filter((item) => item.status === "GRADED")
      .map((item) => Number(item.percentage ?? 0)),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-4">
      <section className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-border dark:bg-surface">
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
            attempt.passed
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600",
          )}
        >
          {attempt.passed ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
        </div>
        <p className="mt-4 text-xs font-semibold text-primary">
          {t("attemptNumber", { number: attempt.attemptNumber })}
        </p>
        <h2 className="mt-1 text-xl font-bold text-gray-950 dark:text-text">
          {t("resultTitle")}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-muted">
          {t("resultSubtitle")}
        </p>

        <div
          className={cn(
            "mx-auto mt-5 inline-flex rounded-lg border px-5 py-3 text-left",
            attempt.passed
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          <div>
            <p className="text-xs font-semibold opacity-75">
              {attempt.passed ? t("passed") : t("failed")}
            </p>
            <p className="mt-1 text-xl font-bold">
              {t("score", {
                score: Number(attempt.score ?? 0),
                percentage: Number(attempt.percentage ?? 0).toFixed(0),
              })}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-left">
          <ResultMeta label={t("timeTaken")} value={formatDuration(attempt.timeTakenSeconds, t("noDuration"))} />
          <ResultMeta label={t("bestScore")} value={`${bestPercentage.toFixed(0)}%`} />
          <ResultMeta
            label={t("attempts")}
            value={`${attempt.attemptNumber}/${attempt.quiz.maxAttempts ?? t("unlimited")}`}
          />
        </div>
      </section>

      <section className="flex flex-wrap justify-center gap-2">
        {canReview ? (
          <Button type="button" variant="outline" onClick={onReview}>
            {t("reviewAnswers")}
          </Button>
        ) : null}
        {canRetry ? (
          <Button type="button" className="!text-white" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" />
            {t("retry")}
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onHistory}>
          <History className="h-4 w-4" />
          {t("history")}
        </Button>
      </section>
      <p className="text-center text-xs font-medium text-gray-500 dark:text-muted">
        {remainingAttempts === null
          ? t("attemptUnlimited", { used: attempt.attemptNumber })
          : remainingAttempts > 0
            ? t("remainingAttempts", { count: remainingAttempts })
            : t("noAttemptsRemaining")}
      </p>
    </div>
  );
}

const ResultMeta = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md bg-gray-50 px-3 py-2 dark:bg-bg">
    <p className="text-xs text-gray-500 dark:text-muted">{label}</p>
    <p className="mt-1 text-sm font-bold text-gray-950 dark:text-text">{value}</p>
  </div>
);

const formatDuration = (seconds: number | null, empty: string) => {
  if (seconds === null || seconds === undefined) return empty;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};
