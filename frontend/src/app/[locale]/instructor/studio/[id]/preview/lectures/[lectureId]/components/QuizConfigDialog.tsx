"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type QuizForm = {
  description: string;
  instructions: string;
  timeLimitMinutes: string;
  passingScore: string;
  maxAttempts: string;
  totalPoints: string;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  showAnswersAfterSubmission: boolean;
  isPublished: boolean;
};

type QuizConfigDialogProps = {
  open: boolean;
  quiz: QuizResponse | CourseCurriculumQuiz | null;
  lectureTitle: string;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: QuizUpdateRequest,
    quiz: QuizResponse | CourseCurriculumQuiz | null,
  ) => Promise<void>;
};

const initialQuizForm: QuizForm = {
  description: "",
  instructions: "",
  timeLimitMinutes: "10",
  passingScore: "70",
  maxAttempts: "1",
  totalPoints: "0",
  randomizeQuestions: false,
  showCorrectAnswers: true,
  showAnswersAfterSubmission: true,
  isPublished: true,
};

const toNullableNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  return Number(trimmed);
};

const toQuizForm = (quiz: QuizResponse | CourseCurriculumQuiz | null): QuizForm => {
  if (!quiz) return initialQuizForm;

  const fullQuiz = "passingScore" in quiz ? quiz : null;

  return {
    description: quiz.description ?? "",
    instructions: fullQuiz?.instructions ?? "",
    timeLimitMinutes:
      quiz.timeLimitMinutes === null || quiz.timeLimitMinutes === undefined
        ? "10"
        : String(quiz.timeLimitMinutes),
    passingScore: String(fullQuiz?.passingScore ?? 70),
    maxAttempts:
      fullQuiz?.maxAttempts === null || fullQuiz?.maxAttempts === undefined
        ? "1"
        : String(fullQuiz.maxAttempts),
    totalPoints: String(fullQuiz?.totalPoints ?? 0),
    randomizeQuestions: fullQuiz?.randomizeQuestions ?? false,
    showCorrectAnswers: fullQuiz?.showCorrectAnswers ?? true,
    showAnswersAfterSubmission: fullQuiz?.showAnswersAfterSubmission ?? true,
    isPublished: fullQuiz?.isPublished ?? true,
  };
};

export function QuizConfigDialog({
  open,
  quiz,
  lectureTitle,
  isSaving,
  onOpenChange,
  onSubmit,
}: QuizConfigDialogProps) {
  const t = useTranslations("InstructorCourseStudioPage");
  const [quizForm, setQuizForm] = useState<QuizForm>(toQuizForm(null));

  useEffect(() => {
    if (open) {
      setQuizForm(toQuizForm(quiz));
    }
  }, [open, quiz]);

  const toQuizPayload = (): QuizUpdateRequest => ({
    title: lectureTitle.trim() || quiz?.title || "Quiz",
    description: quizForm.description.trim(),
    instructions: quizForm.instructions.trim(),
    timeLimitMinutes: toNullableNumber(quizForm.timeLimitMinutes),
    passingScore: Number(quizForm.passingScore) || 70,
    maxAttempts: toNullableNumber(quizForm.maxAttempts),
    randomizeQuestions: quizForm.randomizeQuestions,
    showCorrectAnswers: quizForm.showCorrectAnswers,
    showAnswersAfterSubmission: quizForm.showAnswersAfterSubmission,
    totalPoints: Number(quizForm.totalPoints) || 0,
    isPublished: quizForm.isPublished,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = toQuizPayload();

    if (
      payload.timeLimitMinutes === null ||
      !Number.isFinite(payload.timeLimitMinutes) ||
      payload.timeLimitMinutes <= 0
    ) {
      toast.error(t("quiz.validationTimeLimit"));
      return;
    }

    if (
      !Number.isFinite(payload.passingScore) ||
      payload.passingScore < 0 ||
      payload.passingScore > 100
    ) {
      toast.error(t("quiz.validationPassingScore"));
      return;
    }

    if (
      payload.maxAttempts === null ||
      !Number.isFinite(payload.maxAttempts) ||
      payload.maxAttempts <= 0
    ) {
      toast.error(t("quiz.validationMaxAttempts"));
      return;
    }

    if (!Number.isFinite(payload.totalPoints) || payload.totalPoints < 0) {
      toast.error(t("quiz.validationTotalPoints"));
      return;
    }

    await onSubmit(payload, quiz);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {quiz ? t("quiz.editTitle") : t("quiz.setupTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("quiz.configDescription", { lecture: lectureTitle })}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiz-description">
                {t("quiz.fields.description")}
              </Label>
              <Textarea
                id="quiz-description"
                value={quizForm.description}
                placeholder={t("quiz.placeholders.description")}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-instructions">
                {t("quiz.fields.instructions")}
              </Label>
              <Textarea
                id="quiz-instructions"
                value={quizForm.instructions}
                placeholder={t("quiz.placeholders.instructions")}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    instructions: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-time">
                {t("quiz.fields.timeLimitMinutes")}
              </Label>
              <Input
                id="quiz-time"
                type="number"
                min={0}
                value={quizForm.timeLimitMinutes}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    timeLimitMinutes: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-passing">
                {t("quiz.fields.passingScore")}
              </Label>
              <Input
                id="quiz-passing"
                type="number"
                min={0}
                max={100}
                value={quizForm.passingScore}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    passingScore: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-attempts">
                {t("quiz.fields.maxAttempts")}
              </Label>
              <Input
                id="quiz-attempts"
                type="number"
                min={0}
                value={quizForm.maxAttempts}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    maxAttempts: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-points">
                {t("quiz.fields.totalPoints")}
              </Label>
              <Input
                id="quiz-points"
                type="number"
                min={0}
                value={quizForm.totalPoints}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    totalPoints: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuizSwitch
              label={t("quiz.fields.randomizeQuestions")}
              hint={t("quiz.randomizeHint")}
              checked={quizForm.randomizeQuestions}
              onCheckedChange={(checked) =>
                setQuizForm((current) => ({
                  ...current,
                  randomizeQuestions: checked,
                }))
              }
            />
            <QuizSwitch
              label={t("quiz.fields.showCorrectAnswers")}
              hint={t("quiz.correctAnswersHint")}
              checked={quizForm.showCorrectAnswers}
              onCheckedChange={(checked) =>
                setQuizForm((current) => ({
                  ...current,
                  showCorrectAnswers: checked,
                }))
              }
            />
            <QuizSwitch
              label={t("quiz.fields.showAnswersAfterSubmission")}
              hint={t("quiz.afterSubmissionHint")}
              checked={quizForm.showAnswersAfterSubmission}
              onCheckedChange={(checked) =>
                setQuizForm((current) => ({
                  ...current,
                  showAnswersAfterSubmission: checked,
                }))
              }
            />
            <QuizSwitch
              label={t("quiz.fields.published")}
              hint={t("quiz.publishedHint")}
              checked={quizForm.isPublished}
              onCheckedChange={(checked) =>
                setQuizForm((current) => ({
                  ...current,
                  isPublished: checked,
                }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("quiz.cancel")}
            </Button>
            <Button type="submit" className="text-white!" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {quiz ? t("quiz.save") : t("quiz.setup")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const QuizSwitch = ({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-border">
    <div>
      <p className="text-sm font-semibold text-gray-950 dark:text-text">{label}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-muted">{hint}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
