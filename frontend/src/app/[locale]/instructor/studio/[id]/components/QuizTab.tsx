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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useQuizByLectureQuery,
  useUpdateQuizMutation,
} from "@/hooks/queries/useCourseQueries";
import {
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  Shuffle,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyStudioState } from "./EmptyStudioState";
import { getErrorMessage } from "./studioUtils";
import { ToggleRow } from "./ToggleRow";
import type { StudioSection } from "./types";

type QuizForm = {
  title: string;
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

type QuizTabProps = {
  courseId: string;
  sections: StudioSection[];
};

const initialQuizForm: QuizForm = {
  title: "",
  description: "",
  instructions: "",
  timeLimitMinutes: "",
  passingScore: "70",
  maxAttempts: "",
  totalPoints: "0",
  randomizeQuestions: false,
  showCorrectAnswers: true,
  showAnswersAfterSubmission: true,
  isPublished: true,
};

const toQuizForm = (quiz: QuizResponse | null): QuizForm => {
  if (!quiz) return initialQuizForm;

  return {
    title: quiz.title ?? "",
    description: quiz.description ?? "",
    instructions: quiz.instructions ?? "",
    timeLimitMinutes:
      quiz.timeLimitMinutes === null || quiz.timeLimitMinutes === undefined
        ? ""
        : String(quiz.timeLimitMinutes),
    passingScore: String(quiz.passingScore ?? 70),
    maxAttempts:
      quiz.maxAttempts === null || quiz.maxAttempts === undefined
        ? ""
        : String(quiz.maxAttempts),
    totalPoints: String(quiz.totalPoints ?? 0),
    randomizeQuestions: quiz.randomizeQuestions ?? false,
    showCorrectAnswers: quiz.showCorrectAnswers ?? true,
    showAnswersAfterSubmission: quiz.showAnswersAfterSubmission ?? true,
    isPublished: quiz.isPublished ?? true,
  };
};

const toNullableNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  return Number(trimmed);
};

export const QuizTab = ({ courseId, sections }: QuizTabProps) => {
  const t = useTranslations("InstructorCourseStudioPage");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const selectedSection = sections.find(
    (section) => section.id === selectedSectionId,
  );
  const lectures = selectedSection?.lectures ?? [];
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const selectedLecture = lectures.find(
    (lecture) => lecture.id === selectedLectureId,
  );
  const quizQuery = useQuizByLectureQuery(selectedLectureId);
  const quiz = quizQuery.data ?? null;
  const createQuizMutation = useCreateQuizMutation(
    courseId,
    selectedLectureId,
    selectedSectionId,
  );
  const updateQuizMutation = useUpdateQuizMutation(
    courseId,
    selectedLectureId,
    selectedSectionId,
  );
  const deleteQuizMutation = useDeleteQuizMutation(
    courseId,
    selectedLectureId,
    selectedSectionId,
  );
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizForm, setQuizForm] = useState<QuizForm>(initialQuizForm);
  const quizSaving = createQuizMutation.isPending || updateQuizMutation.isPending;
  const totalLectures = useMemo(
    () => sections.reduce((total, section) => total + section.lectures.length, 0),
    [sections],
  );

  useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
      setSelectedSectionId(sections[0].id);
      return;
    }

    if (
      selectedSectionId &&
      sections.length > 0 &&
      !sections.some((section) => section.id === selectedSectionId)
    ) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  useEffect(() => {
    if (!selectedSection) {
      setSelectedLectureId("");
      return;
    }

    if (!selectedLectureId && selectedSection.lectures.length > 0) {
      setSelectedLectureId(selectedSection.lectures[0].id);
      return;
    }

    if (
      selectedLectureId &&
      selectedSection.lectures.length > 0 &&
      !selectedSection.lectures.some((lecture) => lecture.id === selectedLectureId)
    ) {
      setSelectedLectureId(selectedSection.lectures[0].id);
    }
  }, [selectedLectureId, selectedSection]);

  const openCreateQuizDialog = () => {
    if (!selectedLectureId) {
      toast.error(t("quiz.selectLectureFirst"));
      return;
    }

    setQuizForm(toQuizForm(null));
    setQuizDialogOpen(true);
  };

  const openEditQuizDialog = () => {
    setQuizForm(toQuizForm(quiz));
    setQuizDialogOpen(true);
  };

  const toQuizPayload = (): QuizUpdateRequest => ({
    title: quizForm.title.trim(),
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

  const handleQuizSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLectureId) {
      toast.error(t("quiz.selectLectureFirst"));
      return;
    }

    if (!quizForm.title.trim()) {
      toast.error(t("quiz.validationTitle"));
      return;
    }

    const payload = toQuizPayload();

    try {
      if (quiz) {
        await updateQuizMutation.mutateAsync({
          quizId: quiz.id,
          request: payload,
        });
        toast.success(t("quiz.updated"));
      } else {
        await createQuizMutation.mutateAsync(payload);
        toast.success(t("quiz.created"));
      }

      setQuizDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t("quiz.failed")));
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quiz) return;
    if (!globalThis.confirm(t("quiz.deleteConfirm"))) return;

    try {
      await deleteQuizMutation.mutateAsync(quiz.id);
      toast.success(t("quiz.deleted"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("quiz.deleteFailed")));
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label>{t("quiz.sectionLabel")}</Label>
            <Select
              value={selectedSectionId}
              onValueChange={(value) => {
                setSelectedSectionId(value);
                setSelectedLectureId("");
              }}
              disabled={!sections.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("quiz.sectionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.displayOrder}. {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("quiz.lectureLabel")}</Label>
            <Select
              value={selectedLectureId}
              onValueChange={setSelectedLectureId}
              disabled={!lectures.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("quiz.lecturePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {lectures.map((lecture) => (
                  <SelectItem key={lecture.id} value={lecture.id}>
                    {lecture.displayOrder}. {lecture.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            size="sm"
            className="!text-white"
            disabled={!selectedLectureId || Boolean(quiz)}
            onClick={openCreateQuizDialog}
          >
            <Plus className="h-4 w-4" />
            {t("quiz.add")}
          </Button>
        </div>

        {!sections.length ? (
          <EmptyStudioState
            icon={<FileQuestion className="h-5 w-5" />}
            title={t("quiz.noSectionTitle")}
            subtitle={t("quiz.noSectionSubtitle")}
          />
        ) : totalLectures === 0 ? (
          <EmptyStudioState
            icon={<FileQuestion className="h-5 w-5" />}
            title={t("quiz.noLectureTitle")}
            subtitle={t("quiz.noLectureSubtitle")}
          />
        ) : quizQuery.isLoading ? (
          <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        ) : quiz ? (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-border">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">
                  {selectedLecture?.title ?? t("quiz.lectureLabel")}
                  <span className="mx-2 text-gray-300">.</span>
                  <span
                    className={
                      quiz.isPublished ? "text-emerald-600" : "text-amber-600"
                    }
                  >
                    {quiz.isPublished
                      ? t("quiz.published")
                      : t("quiz.unpublished")}
                  </span>
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-950 dark:text-text">
                  {quiz.title}
                </h3>
                {quiz.description ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                    {quiz.description}
                  </p>
                ) : null}
                <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-4 dark:text-muted">
                  <QuizMeta label={t("quiz.meta.questions")}>
                    {quiz.totalQuestions ?? 0}
                  </QuizMeta>
                  <QuizMeta label={t("quiz.meta.points")}>
                    {quiz.totalPoints ?? 0}
                  </QuizMeta>
                  <QuizMeta label={t("quiz.meta.passingScore")}>
                    {quiz.passingScore ?? 0}%
                  </QuizMeta>
                  <QuizMeta label={t("quiz.meta.timeLimit")}>
                    {quiz.timeLimitMinutes
                      ? `${quiz.timeLimitMinutes}m`
                      : t("quiz.unlimited")}
                  </QuizMeta>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={openEditQuizDialog}>
                  <Pencil className="h-3.5 w-3.5" />
                  {t("quiz.edit")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="!text-white"
                  disabled={deleteQuizMutation.isPending}
                  onClick={handleDeleteQuiz}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("quiz.delete")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyStudioState
            icon={<FileQuestion className="h-5 w-5" />}
            title={t("quiz.emptyTitle")}
            subtitle={t("quiz.emptySubtitle")}
          />
        )}
      </div>

      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {quiz ? t("quiz.editTitle") : t("quiz.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {selectedLecture
                ? t("quiz.dialogDescription", {
                    lecture: selectedLecture.title,
                  })
                : t("quiz.lecturePlaceholder")}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleQuizSubmit}>
            <div className="space-y-2">
              <Label htmlFor="quiz-title">{t("quiz.fields.title")}</Label>
              <Input
                id="quiz-title"
                value={quizForm.title}
                placeholder={t("quiz.placeholders.title")}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>

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
              <ToggleRow
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
              <ToggleRow
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
              <ToggleRow
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
              <ToggleRow
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

            <div className="flex items-center gap-2 rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500 dark:border-border dark:text-muted">
              <Shuffle className="h-4 w-4 text-primary" />
              {t("quiz.questionsHint")}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuizDialogOpen(false)}
              >
                {t("quiz.cancel")}
              </Button>
              <Button type="submit" className="!text-white" disabled={quizSaving}>
                {quizSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {quiz ? t("quiz.save") : t("quiz.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const QuizMeta = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md bg-gray-50 p-2 dark:bg-bg">
    <p className="text-[11px] text-gray-500 dark:text-muted">{label}</p>
    <p className="mt-1 font-bold text-gray-900 dark:text-text">{children}</p>
  </div>
);
