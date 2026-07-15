"use client";

import {
  useMyQuizAttemptsQuery,
  usePublicQuizByLectureQuery,
  useQuizAttemptAnswersQuery,
  useQuizAttemptReviewQuery,
  useSaveQuizAttemptAnswersMutation,
  useStartQuizAttemptMutation,
  useSubmitQuizMutation,
} from "@/hooks/queries/useCourseQueries";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { QuizAttemptHistory } from "./QuizAttemptHistory";
import { QuizAttemptReview } from "./QuizAttemptReview";
import { QuizIntro } from "./QuizIntro";
import { QuizPlayer } from "./QuizPlayer";
import { QuizResult } from "./QuizResult";

type QuizScreen = "intro" | "player" | "result" | "history" | "review";

type StudentQuizContentProps = {
  lectureId: string;
  lectureTitle: string;
  fallbackQuiz: QuizResponse | CourseCurriculumQuiz | null;
  canAttempt: boolean;
};

export function StudentQuizContent({
  lectureId,
  lectureTitle,
  fallbackQuiz,
  canAttempt,
}: StudentQuizContentProps) {
  const t = useTranslations("StudentLecturePage");
  const quizQuery = usePublicQuizByLectureQuery(lectureId);
  const quiz = quizQuery.data ?? fallbackQuiz;
  const quizId = quiz?.id ?? "";
  const attemptsQuery = useMyQuizAttemptsQuery(quizId, Boolean(quizId && canAttempt));
  const startAttemptMutation = useStartQuizAttemptMutation(quizId);
  const saveAnswersMutation = useSaveQuizAttemptAnswersMutation(quizId);
  const submitQuizMutation = useSubmitQuizMutation(quizId);

  const [screen, setScreen] = useState<QuizScreen>("intro");
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttemptResponse | null>(
    null,
  );
  const [reviewAttemptNumber, setReviewAttemptNumber] = useState<number>();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>(
    {},
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [hydratedAttemptNumber, setHydratedAttemptNumber] = useState<number>();
  const initializedQuizIdRef = useRef<string | undefined>(undefined);
  const lastSavedPayloadRef = useRef<string>("");
  const timeExpiredAttemptRef = useRef<number | undefined>(undefined);

  const questions = useMemo(() => {
    if (quiz && "questions" in quiz && Array.isArray(quiz.questions)) {
      return quiz.questions
        .slice()
        .sort((first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0));
    }
    return [];
  }, [quiz]);

  const attempts = useMemo(() => {
    const byNumber = new Map(
      (attemptsQuery.data ?? []).map((attempt) => [attempt.attemptNumber, attempt]),
    );
    if (currentAttempt) {
      byNumber.set(currentAttempt.attemptNumber, currentAttempt);
    }
    return [...byNumber.values()].sort(
      (first, second) => first.attemptNumber - second.attemptNumber,
    );
  }, [attemptsQuery.data, currentAttempt]);

  const activeAttempt = useMemo(
    () =>
      currentAttempt?.status === "IN_PROGRESS"
        ? currentAttempt
        : attempts
            .filter((attempt) => attempt.status === "IN_PROGRESS")
            .at(-1) ?? null,
    [attempts, currentAttempt],
  );
  const latestCompletedAttempt = useMemo(
    () => attempts.filter((attempt) => attempt.status === "GRADED").at(-1) ?? null,
    [attempts],
  );
  const displayedResult =
    currentAttempt?.status === "GRADED" ? currentAttempt : latestCompletedAttempt;
  const reviewQuery = useQuizAttemptReviewQuery(
    quizId,
    reviewAttemptNumber,
    screen === "review",
  );
  const attemptAnswersQuery = useQuizAttemptAnswersQuery(
    quizId,
    activeAttempt?.attemptNumber,
    Boolean(activeAttempt),
  );

  const configuredQuiz = quiz && "maxAttempts" in quiz ? quiz : null;
  const maxAttempts = configuredQuiz?.maxAttempts ?? null;
  const completedAttempts = attempts.filter((attempt) => attempt.status === "GRADED");
  const remainingAttempts =
    maxAttempts === null ? null : Math.max(0, maxAttempts - completedAttempts.length);
  const canRetry = remainingAttempts === null || remainingAttempts > 0;
  const canReview = Boolean(configuredQuiz?.showAnswersAfterSubmission);

  useEffect(() => {
    if (!quizId || initializedQuizIdRef.current === quizId) return;
    if (attemptsQuery.isLoading) return;

    initializedQuizIdRef.current = quizId;
    setScreen(activeAttempt ? "player" : latestCompletedAttempt ? "result" : "intro");
    setCurrentAttempt(activeAttempt ?? latestCompletedAttempt);
  }, [activeAttempt, attemptsQuery.isLoading, latestCompletedAttempt, quizId]);

  useEffect(() => {
    if (!activeAttempt) {
      setHydratedAttemptNumber(undefined);
      return;
    }
    if (attemptAnswersQuery.isLoading) return;

    const restoredAnswers = Object.fromEntries(
      (attemptAnswersQuery.data ?? []).map((answer) => [
        answer.questionId,
        answer.answers,
      ]),
    );
    const payload = JSON.stringify({
      answers: questions.map((question) => ({
        questionId: question.id,
        answers: restoredAnswers[question.id] ?? [],
      })),
    });
    setSelectedAnswers(restoredAnswers);
    setCurrentQuestionIndex(0);
    lastSavedPayloadRef.current = payload;
    setHydratedAttemptNumber(activeAttempt.attemptNumber);
  }, [activeAttempt, attemptAnswersQuery.data, attemptAnswersQuery.isLoading, questions]);

  const submitQuiz = useCallback(async () => {
    if (!quizId || !activeAttempt || !questions.length) return;

    try {
      const attempt = await submitQuizMutation.mutateAsync({
        answers: questions.map((question) => ({
          questionId: question.id,
          answers: selectedAnswers[question.id] ?? [],
        })),
      });
      setCurrentAttempt(attempt);
      setScreen("result");
      toast.success(t("quiz.submitted"));
    } catch {
      toast.error(t("quiz.submitFailed"));
    }
  }, [activeAttempt, questions, quizId, selectedAnswers, submitQuizMutation, t]);

  useEffect(() => {
    const timeLimitMinutes = quiz?.timeLimitMinutes;
    if (!activeAttempt || !timeLimitMinutes) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemainingTime = () => {
      const startedAt = new Date(activeAttempt.startedAt).getTime();
      const deadline = startedAt + timeLimitMinutes * 60 * 1000;
      const nextRemainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(nextRemainingSeconds);

      if (
        nextRemainingSeconds === 0 &&
        hydratedAttemptNumber === activeAttempt.attemptNumber &&
        timeExpiredAttemptRef.current !== activeAttempt.attemptNumber
      ) {
        timeExpiredAttemptRef.current = activeAttempt.attemptNumber;
        toast.info(t("quiz.timeExpired"));
        void submitQuiz();
      }
    };

    updateRemainingTime();
    const timer = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(timer);
  }, [activeAttempt, hydratedAttemptNumber, quiz, submitQuiz, t]);

  useEffect(() => {
    if (
      !activeAttempt ||
      hydratedAttemptNumber !== activeAttempt.attemptNumber ||
      !questions.length
    ) {
      return;
    }

    const request: QuizSubmitRequest = {
      answers: questions.map((question) => ({
        questionId: question.id,
        answers: selectedAnswers[question.id] ?? [],
      })),
    };
    const payload = JSON.stringify(request);
    if (payload === lastSavedPayloadRef.current) return;

    const timer = window.setTimeout(() => {
      lastSavedPayloadRef.current = payload;
      saveAnswersMutation.mutate(request, {
        onError: () => {
          lastSavedPayloadRef.current = "";
          toast.error(t("quiz.saveAnswersFailed"));
        },
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    activeAttempt,
    hydratedAttemptNumber,
    questions,
    saveAnswersMutation,
    selectedAnswers,
    t,
  ]);

  const handleStart = async () => {
    if (!quizId) return;
    try {
      const attempt = await startAttemptMutation.mutateAsync();
      setCurrentAttempt(attempt);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setHydratedAttemptNumber(undefined);
      lastSavedPayloadRef.current = "";
      timeExpiredAttemptRef.current = undefined;
      setScreen("player");
      toast.success(t("quiz.started"));
    } catch {
      toast.error(t("quiz.startFailed"));
    }
  };

  const toggleAnswer = (questionId: string, option: string) => {
    setSelectedAnswers((current) => {
      const existing = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: existing.includes(option)
          ? existing.filter((item) => item !== option)
          : [...existing, option],
      };
    });
  };

  const openReview = (attempt: QuizAttemptResponse) => {
    setReviewAttemptNumber(attempt.attemptNumber);
    setScreen("review");
  };

  if (quizQuery.isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

  if (!canAttempt) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
        {t("quiz.enrollRequired")}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
        {t("quiz.noQuestions")}
      </div>
    );
  }

  if (screen === "player" && activeAttempt) {
    return (
      <QuizPlayer
        questions={questions}
        attempt={activeAttempt}
        selectedAnswers={selectedAnswers}
        currentQuestionIndex={currentQuestionIndex}
        remainingSeconds={remainingSeconds}
        isSaving={saveAnswersMutation.isPending}
        isSubmitting={submitQuizMutation.isPending}
        onSelectQuestion={setCurrentQuestionIndex}
        onToggleAnswer={toggleAnswer}
        onSubmit={submitQuiz}
      />
    );
  }

  if (screen === "review" && reviewAttemptNumber) {
    return (
      <QuizAttemptReview
        review={reviewQuery.data}
        isLoading={reviewQuery.isLoading}
        isError={reviewQuery.isError}
        onBack={() => setScreen("result")}
        onRetry={() => reviewQuery.refetch()}
      />
    );
  }

  if (screen === "history") {
    return (
      <QuizAttemptHistory
        attempts={attempts}
        canReview={canReview}
        onBack={() => setScreen(displayedResult ? "result" : "intro")}
        onReview={openReview}
      />
    );
  }

  if (screen === "result" && displayedResult) {
    return (
      <QuizResult
        attempt={displayedResult}
        attempts={attempts}
        canReview={canReview}
        canRetry={canRetry}
        remainingAttempts={remainingAttempts}
        onReview={() => openReview(displayedResult)}
        onRetry={handleStart}
        onHistory={() => setScreen("history")}
      />
    );
  }

  return (
    <QuizIntro
      lectureTitle={lectureTitle}
      quiz={quiz}
      attempts={attempts}
      activeAttempt={activeAttempt}
      isStarting={startAttemptMutation.isPending}
      onStart={handleStart}
      onHistory={() => setScreen("history")}
    />
  );
}
