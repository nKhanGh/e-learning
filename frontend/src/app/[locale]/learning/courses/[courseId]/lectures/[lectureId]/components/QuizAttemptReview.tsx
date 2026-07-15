"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Circle, RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";

type QuizAttemptReviewProps = {
  review: QuizAttemptReviewResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onRetry: () => void;
};

export function QuizAttemptReview({
  review,
  isLoading,
  isError,
  onBack,
  onRetry,
}: QuizAttemptReviewProps) {
  const t = useTranslations("StudentLecturePage.quiz");

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <div className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-44 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-7 text-center dark:border-border">
        <p className="text-sm text-gray-500 dark:text-muted">{t("reviewFailed")}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            {t("backToResult")}
          </Button>
          <Button type="button" className="!text-white" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold text-primary">
            {t("attemptNumber", { number: review.attempt.attemptNumber })}
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-950 dark:text-text">
            {t("reviewTitle")}
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {review.questions.map((question, index) => (
          <article
            key={question.questionId}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-primary">
                  {t("questionOrder", { order: index + 1 })}
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-950 dark:text-text">
                  {question.questionText}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600 dark:text-muted">
                  {t("questionScore", {
                    score: Number(question.score),
                    points: Number(question.points),
                  })}
                </p>
                {review.showCorrectAnswers ? (
                  <p
                    className={cn(
                      "mt-1 text-xs font-semibold",
                      question.correct ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {question.correct ? t("correct") : t("incorrect")}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {question.options.map((option, optionIndex) => {
                const selected = question.selectedAnswers.includes(option);
                const correct = review.showCorrectAnswers && question.correctAnswers.includes(option);
                const selectedWrong = selected && review.showCorrectAnswers && !correct;
                return (
                  <div
                    key={`${question.questionId}-${option}-${optionIndex}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                      correct
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : selectedWrong
                          ? "border-red-200 bg-red-50 text-red-800"
                          : selected
                            ? "border-primary/30 bg-primary/5 text-primary"
                            : "border-gray-200 text-gray-600 dark:border-border dark:text-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        correct
                          ? "bg-emerald-600 text-white"
                          : selectedWrong
                            ? "bg-red-600 text-white"
                            : selected
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-500 dark:bg-bg",
                      )}
                    >
                      {correct ? <Check className="h-3.5 w-3.5" /> : selectedWrong ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span>{option}</span>
                    {selected ? (
                      <span className="ml-auto text-xs font-semibold opacity-75">
                        {t("yourAnswer")}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {!question.selectedAnswers.length ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted">
                <Circle className="h-3 w-3" />
                {t("unanswered")}
              </p>
            ) : null}

            {review.showCorrectAnswers && question.explanation ? (
              <div className="mt-4 border-l-2 border-primary/40 bg-primary/5 px-3 py-2 text-sm text-gray-700 dark:text-muted">
                <span className="font-semibold text-gray-950 dark:text-text">{t("explanation")}: </span>
                {question.explanation}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
