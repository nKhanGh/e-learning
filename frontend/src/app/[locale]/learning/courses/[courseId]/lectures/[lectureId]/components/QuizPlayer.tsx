"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { QuizSubmitDialog } from "./QuizSubmitDialog";

type QuizPlayerProps = {
  questions: QuizQuestionResponse[];
  attempt: QuizAttemptResponse;
  selectedAnswers: Record<string, string[]>;
  currentQuestionIndex: number;
  remainingSeconds: number | null;
  isSaving: boolean;
  isSubmitting: boolean;
  onSelectQuestion: (index: number) => void;
  onToggleAnswer: (questionId: string, option: string) => void;
  onSubmit: () => Promise<void>;
};

export function QuizPlayer({
  questions,
  attempt,
  selectedAnswers,
  currentQuestionIndex,
  remainingSeconds,
  isSaving,
  isSubmitting,
  onSelectQuestion,
  onToggleAnswer,
  onSubmit,
}: QuizPlayerProps) {
  const t = useTranslations("StudentLecturePage.quiz");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];
  const unansweredCount = useMemo(
    () =>
      questions.filter((question) => !(selectedAnswers[question.id]?.length))
        .length,
    [questions, selectedAnswers],
  );

  const requestSubmit = () => {
    if (unansweredCount > 0) {
      setSubmitDialogOpen(true);
      return;
    }

    void onSubmit();
  };

  const confirmSubmit = async () => {
    await onSubmit();
    setSubmitDialogOpen(false);
  };

  if (!currentQuestion) {
    return null;
  }

  const currentAnswers = selectedAnswers[currentQuestion.id] ?? [];
  const timeExpired = remainingSeconds !== null && remainingSeconds <= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-border dark:bg-bg">
        <div>
          <p className="text-xs font-semibold text-primary">
            {t("attemptNumber", { number: attempt.attemptNumber })}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-muted">
            {isSaving ? t("savingAnswers") : t("saveStatus")}
          </p>
        </div>
        {remainingSeconds !== null ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold",
              timeExpired
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-800 dark:border-border dark:bg-surface dark:text-text",
            )}
          >
            <Clock3 className="h-4 w-4" />
            <span className="text-xs font-medium opacity-70">{t("timeRemaining")}</span>
            <span>{formatCountdown(remainingSeconds)}</span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_196px]">
        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-primary">
                {t("questionOrder", { order: currentQuestionIndex + 1 })} - {" "}
                {t("pointCount", { count: currentQuestion.points })}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-7 text-gray-950 dark:text-text">
                {currentQuestion.questionText}
              </h3>
            </div>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              {t("selectAnswers")}
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected = currentAnswers.includes(option);
              return (
                <button
                  key={`${currentQuestion.id}-${option}-${optionIndex}`}
                  type="button"
                  disabled={timeExpired || isSubmitting}
                  onClick={() => onToggleAnswer(currentQuestion.id, option)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-700 hover:border-primary/50 dark:border-border dark:text-muted",
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
                    {selected ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-border">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("questionOrder", { order: currentQuestionIndex })}
              title={t("questionOrder", { order: currentQuestionIndex })}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              onClick={() => onSelectQuestion(currentQuestionIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t("questionOrder", { order: currentQuestionIndex + 2 })}
                title={t("questionOrder", { order: currentQuestionIndex + 2 })}
                disabled={isSubmitting}
                onClick={() => onSelectQuestion(currentQuestionIndex + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="!text-white"
                disabled={isSubmitting}
                onClick={requestSubmit}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("submit")}
              </Button>
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-950 dark:text-text">
              {t("questionNavigator")}
            </h3>
            <span className="text-xs text-gray-500 dark:text-muted">
              {questions.length - unansweredCount}/{questions.length}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5 lg:grid-cols-4">
            {questions.map((question, index) => {
              const answered = Boolean(selectedAnswers[question.id]?.length);
              const active = index === currentQuestionIndex;
              return (
                <button
                  key={question.id}
                  type="button"
                  aria-label={t("questionOrder", { order: index + 1 })}
                  onClick={() => onSelectQuestion(index)}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-white"
                      : answered
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-primary/50 dark:border-border dark:bg-bg dark:text-muted",
                  )}
                >
                  {answered && !active ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </button>
              );
            })}
          </div>
          {unansweredCount ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <Circle className="h-3 w-3" />
              {unansweredCount} {t("unanswered").toLowerCase()}
            </p>
          ) : null}
          <Button
            type="button"
            className="mt-4 w-full !text-white"
            size="sm"
            disabled={isSubmitting}
            onClick={requestSubmit}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("submit")}
          </Button>
        </aside>
      </div>

      <QuizSubmitDialog
        open={submitDialogOpen}
        unansweredCount={unansweredCount}
        isSubmitting={isSubmitting}
        onOpenChange={setSubmitDialogOpen}
        onConfirm={confirmSubmit}
      />
    </div>
  );
}

const formatCountdown = (seconds: number) => {
  const normalizedSeconds = Math.max(0, seconds);
  const minutes = Math.floor(normalizedSeconds / 60);
  const remainingSeconds = normalizedSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};
