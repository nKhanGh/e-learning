"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type QuestionForm = {
  questionText: string;
  explanation: string;
  points: string;
  displayOrder: string;
  options: string[];
  correctAnswers: string[];
  imageUrl: string;
  videoUrl: string;
};

type QuizQuestionDialogProps = {
  open: boolean;
  question: QuizQuestionResponse | null;
  fallbackOrder: number;
  quizTitle: string;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: QuizQuestionUpdateRequest,
    question: QuizQuestionResponse | null,
  ) => Promise<void>;
};

const initialQuestionForm: QuestionForm = {
  questionText: "",
  explanation: "",
  points: "1",
  displayOrder: "1",
  options: ["", ""],
  correctAnswers: [],
  imageUrl: "",
  videoUrl: "",
};

const toQuestionForm = (
  question: QuizQuestionResponse | null,
  fallbackOrder: number,
): QuestionForm => {
  if (!question) {
    return {
      ...initialQuestionForm,
      displayOrder: String(fallbackOrder),
      options: [...initialQuestionForm.options],
      correctAnswers: [],
    };
  }

  return {
    questionText: question.questionText ?? "",
    explanation: question.explanation ?? "",
    points: String(question.points ?? 1),
    displayOrder: String(question.displayOrder ?? fallbackOrder),
    options:
      question.options && question.options.length >= 2
        ? [...question.options]
        : ["", ""],
    correctAnswers: [...(question.correctAnswers ?? [])],
    imageUrl: question.imageUrl ?? "",
    videoUrl: question.videoUrl ?? "",
  };
};

export function QuizQuestionDialog({
  open,
  question,
  fallbackOrder,
  quizTitle,
  isSaving,
  onOpenChange,
  onSubmit,
}: QuizQuestionDialogProps) {
  const t = useTranslations("InstructorCourseStudioPage");
  const [questionForm, setQuestionForm] = useState<QuestionForm>(
    toQuestionForm(null, fallbackOrder),
  );

  useEffect(() => {
    if (open) {
      setQuestionForm(toQuestionForm(question, fallbackOrder));
    }
  }, [fallbackOrder, open, question]);

  const updateOption = (index: number, value: string) => {
    setQuestionForm((current) => {
      const previousValue = current.options[index];
      const options = current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      );
      const correctAnswers = current.correctAnswers.map((answer) =>
        answer === previousValue ? value : answer,
      );

      return { ...current, options, correctAnswers };
    });
  };

  const addOption = () => {
    setQuestionForm((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm((current) => {
      if (current.options.length <= 2) return current;

      const removedOption = current.options[index];
      return {
        ...current,
        options: current.options.filter((_, optionIndex) => optionIndex !== index),
        correctAnswers: current.correctAnswers.filter(
          (answer) => answer !== removedOption,
        ),
      };
    });
  };

  const toggleCorrectAnswer = (option: string, checked: boolean) => {
    const normalizedOption = option.trim();
    if (!normalizedOption) return;

    setQuestionForm((current) => ({
      ...current,
      correctAnswers: checked
        ? Array.from(new Set([...current.correctAnswers, normalizedOption]))
        : current.correctAnswers.filter((answer) => answer !== normalizedOption),
    }));
  };

  const toQuestionPayload = (): QuizQuestionUpdateRequest => {
    const options = questionForm.options
      .map((option) => option.trim())
      .filter(Boolean);
    const correctAnswers = questionForm.correctAnswers
      .map((answer) => answer.trim())
      .filter((answer) => options.includes(answer));

    return {
      questionText: questionForm.questionText.trim(),
      explanation: questionForm.explanation.trim(),
      points: Number(questionForm.points) || 1,
      displayOrder: Math.max(
        1,
        Number(questionForm.displayOrder) || fallbackOrder,
      ),
      options,
      correctAnswers,
      imageUrl: questionForm.imageUrl.trim(),
      videoUrl: questionForm.videoUrl.trim(),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = toQuestionPayload();

    if (!payload.questionText) {
      toast.error(t("quiz.questions.validationText"));
      return;
    }

    if (payload.options.length < 2) {
      toast.error(t("quiz.questions.validationOptions"));
      return;
    }

    if (payload.correctAnswers.length < 1) {
      toast.error(t("quiz.questions.validationCorrect"));
      return;
    }

    await onSubmit(payload, question);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {question
              ? t("quiz.questions.editTitle")
              : t("quiz.questions.createTitle")}
          </DialogTitle>
          <DialogDescription>{quizTitle}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="question-text">
              {t("quiz.questions.fields.questionText")}
            </Label>
            <Textarea
              id="question-text"
              className="min-h-28"
              value={questionForm.questionText}
              placeholder={t("quiz.questions.placeholders.questionText")}
              onChange={(event) =>
                setQuestionForm((current) => ({
                  ...current,
                  questionText: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-points">
                {t("quiz.questions.fields.points")}
              </Label>
              <Input
                id="question-points"
                type="number"
                min={0}
                step="0.5"
                value={questionForm.points}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    points: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-order">
                {t("quiz.questions.fields.displayOrder")}
              </Label>
              <Input
                id="question-order"
                type="number"
                min={1}
                disabled={!question}
                value={questionForm.displayOrder}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    displayOrder: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-explanation">
              {t("quiz.questions.fields.explanation")}
            </Label>
            <Textarea
              id="question-explanation"
              value={questionForm.explanation}
              placeholder={t("quiz.questions.placeholders.explanation")}
              onChange={(event) =>
                setQuestionForm((current) => ({
                  ...current,
                  explanation: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>{t("quiz.questions.fields.options")}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-3.5 w-3.5" />
                {t("quiz.questions.addOption")}
              </Button>
            </div>
            <div className="space-y-2">
              {questionForm.options.map((option, index) => {
                const normalizedOption = option.trim();

                return (
                  <div
                    key={index}
                    className="grid gap-2 rounded-md border border-gray-200 p-2 sm:grid-cols-[auto_1fr_auto] sm:items-center dark:border-border"
                  >
                    <Checkbox
                      checked={
                        Boolean(normalizedOption) &&
                        questionForm.correctAnswers.includes(normalizedOption)
                      }
                      disabled={!normalizedOption}
                      onCheckedChange={(checked) =>
                        toggleCorrectAnswer(option, checked === true)
                      }
                    />
                    <Input
                      value={option}
                      placeholder={t("quiz.questions.placeholders.option", {
                        number: index + 1,
                      })}
                      onChange={(event) => updateOption(index, event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={questionForm.options.length <= 2}
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-muted">
              {t("quiz.questions.correctHint")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-image">
                {t("quiz.questions.fields.imageUrl")}
              </Label>
              <Input
                id="question-image"
                value={questionForm.imageUrl}
                placeholder={t("quiz.questions.placeholders.mediaUrl")}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-video">
                {t("quiz.questions.fields.videoUrl")}
              </Label>
              <Input
                id="question-video"
                value={questionForm.videoUrl}
                placeholder={t("quiz.questions.placeholders.mediaUrl")}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    videoUrl: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("quiz.questions.cancel")}
            </Button>
            <Button type="submit" className="text-white!" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {question ? t("quiz.questions.save") : t("quiz.questions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
