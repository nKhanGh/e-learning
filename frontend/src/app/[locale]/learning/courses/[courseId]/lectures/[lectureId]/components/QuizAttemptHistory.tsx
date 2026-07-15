"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, Eye, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type QuizAttemptHistoryProps = {
  attempts: QuizAttemptResponse[];
  canReview: boolean;
  onBack: () => void;
  onReview: (attempt: QuizAttemptResponse) => void;
};

export function QuizAttemptHistory({
  attempts,
  canReview,
  onBack,
  onReview,
}: QuizAttemptHistoryProps) {
  const t = useTranslations("StudentLecturePage.quiz");
  const locale = useLocale();
  const completedAttempts = attempts
    .filter((attempt) => attempt.status === "GRADED")
    .slice()
    .sort((first, second) => second.attemptNumber - first.attemptNumber);

  return (
    <div className="mx-auto max-w-3xl space-y-4 py-2">
      <div className="flex items-start gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-950 dark:text-text">
            {t("historyTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-muted">
            {t("historySubtitle")}
          </p>
        </div>
      </div>

      {completedAttempts.length ? (
        <div className="space-y-2">
          {completedAttempts.map((attempt) => (
            <article
              key={attempt.attemptNumber}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-border dark:bg-surface"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                    attempt.passed
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600",
                  )}
                >
                  {attempt.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-950 dark:text-text">
                    {t("attemptNumber", { number: attempt.attemptNumber })}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                    {attempt.submittedAt
                      ? `${t("submittedAt")}: ${new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(attempt.submittedAt))}`
                      : t("noDuration")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:text-right">
                <div>
                  <p className="text-sm font-bold text-gray-950 dark:text-text">
                    {t("score", {
                      score: Number(attempt.score ?? 0),
                      percentage: Number(attempt.percentage ?? 0).toFixed(0),
                    })}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs font-semibold",
                      attempt.passed ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {attempt.passed ? t("passed") : t("failed")}
                  </p>
                </div>
                {canReview ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onReview(attempt)}
                  >
                    <Eye className="h-4 w-4" />
                    {t("reviewAnswers")}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 p-7 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
          {t("noAttempts")}
        </div>
      )}
    </div>
  );
}
