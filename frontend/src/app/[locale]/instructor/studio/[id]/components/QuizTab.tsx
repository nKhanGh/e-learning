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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateQuizQuestionMutation,
  useCreateQuizMutation,
  useDeleteQuizQuestionMutation,
  useDeleteQuizMutation,
  useImportQuizQuestionsMutation,
  useQuizByLectureQuery,
  useQuizQuestionsQuery,
  useUpdateQuizQuestionMutation,
  useUpdateQuizMutation,
} from "@/hooks/queries/useCourseQueries";
import {
  FileJson,
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyStudioState } from "./EmptyStudioState";
import {
  QuizQuestionImportDialog,
  type QuizQuestionImportPayload,
} from "./QuizQuestionImportDialog";
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
  const quizId = quiz?.id ?? "";
  const questionsQuery = useQuizQuestionsQuery(quizId);
  const questions = questionsQuery.data ?? quiz?.questions ?? [];
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
  const nextQuestionOrder =
    Math.max(0, ...questions.map((question) => question.displayOrder ?? 0)) + 1;
  const createQuestionMutation = useCreateQuizQuestionMutation(
    courseId,
    selectedLectureId,
    quizId,
    selectedSectionId,
  );
  const updateQuestionMutation = useUpdateQuizQuestionMutation(
    courseId,
    selectedLectureId,
    quizId,
    selectedSectionId,
  );
  const deleteQuestionMutation = useDeleteQuizQuestionMutation(
    courseId,
    selectedLectureId,
    quizId,
    selectedSectionId,
  );
  const importQuestionsMutation = useImportQuizQuestionsMutation(
    courseId,
    selectedLectureId,
    quizId,
    selectedSectionId,
  );
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<QuizQuestionResponse | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(
    toQuestionForm(null, nextQuestionOrder),
  );
  const questionSaving =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;
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

  const openCreateQuestionDialog = () => {
    if (!quiz) {
      toast.error(t("quiz.questions.selectQuizFirst"));
      return;
    }

    setEditingQuestion(null);
    setQuestionForm(toQuestionForm(null, nextQuestionOrder));
    setQuestionDialogOpen(true);
  };

  const openImportQuestionDialog = () => {
    if (!quiz) {
      toast.error(t("quiz.questions.selectQuizFirst"));
      return;
    }

    setImportDialogOpen(true);
  };

  const handleImportQuestions = (payload: QuizQuestionImportPayload) =>
    importQuestionsMutation.mutateAsync(payload);

  const openEditQuestionDialog = (question: QuizQuestionResponse) => {
    setEditingQuestion(question);
    setQuestionForm(toQuestionForm(question, nextQuestionOrder));
    setQuestionDialogOpen(true);
  };

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
        Number(questionForm.displayOrder) || nextQuestionOrder,
      ),
      options,
      correctAnswers,
      imageUrl: questionForm.imageUrl.trim(),
      videoUrl: questionForm.videoUrl.trim(),
    };
  };

  const handleQuestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quiz) {
      toast.error(t("quiz.questions.selectQuizFirst"));
      return;
    }

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

    try {
      if (editingQuestion) {
        await updateQuestionMutation.mutateAsync({
          questionId: editingQuestion.id,
          request: payload,
        });
        toast.success(t("quiz.questions.updated"));
      } else {
        const { displayOrder: _displayOrder, ...createPayload } = payload;
        await createQuestionMutation.mutateAsync(createPayload);
        toast.success(t("quiz.questions.created"));
      }

      setQuestionDialogOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      toast.error(getErrorMessage(error, t("quiz.questions.failed")));
    }
  };

  const handleDeleteQuestion = async (question: QuizQuestionResponse) => {
    if (!globalThis.confirm(t("quiz.questions.deleteConfirm"))) return;

    try {
      await deleteQuestionMutation.mutateAsync(question.id);
      toast.success(t("quiz.questions.deleted"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("quiz.questions.deleteFailed")));
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
            className="text-white!"
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
          <>
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
                      {questions.length}
                    </QuizMeta>
                    <QuizMeta label={t("quiz.meta.points")}>
                      {questions.reduce(
                        (total, question) => total + Number(question.points ?? 0),
                        0,
                      )}
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openEditQuizDialog}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("quiz.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="text-white!"
                    disabled={deleteQuizMutation.isPending}
                    onClick={handleDeleteQuiz}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("quiz.delete")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-border">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                    {t("quiz.questions.title")}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                    {t("quiz.questions.subtitle")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="text-white!"
                    onClick={openCreateQuestionDialog}
                  >
                    <Plus className="h-4 w-4" />
                    {t("quiz.questions.add")}
                  </Button>
                  <span className="text-xs text-gray-400">
                    {t("quiz.questions.or")}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openImportQuestionDialog}
                  >
                    <FileJson className="h-4 w-4" />
                    {t("quiz.questions.importJson")}
                  </Button>
                </div>
              </div>

              {questionsQuery.isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
                    />
                  ))}
                </div>
              ) : questions.length ? (
                <div className="space-y-2">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="rounded-lg border border-gray-200 p-3 dark:border-border"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary">
                            {t("quiz.questions.order", {
                              order: question.displayOrder ?? 0,
                            })}
                            <span className="mx-2 text-gray-300">.</span>
                            {question.points ?? 0} {t("quiz.questions.points")}
                          </p>
                          <h4 className="mt-1 text-sm font-bold text-gray-950 dark:text-text">
                            {question.questionText}
                          </h4>
                          <p className="mt-1 text-xs text-gray-500 dark:text-muted">
                            {question.options?.length ?? 0}{" "}
                            {t("quiz.questions.options")}
                            <span className="mx-2">.</span>
                            {(question.correctAnswers ?? []).length}{" "}
                            {t("quiz.questions.correct")}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditQuestionDialog(question)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {t("quiz.questions.edit")}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="text-white!"
                            disabled={deleteQuestionMutation.isPending}
                            onClick={() => handleDeleteQuestion(question)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("quiz.questions.delete")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStudioState
                  icon={<FileQuestion className="h-5 w-5" />}
                  title={t("quiz.questions.emptyTitle")}
                  subtitle={t("quiz.questions.emptySubtitle")}
                />
              )}
            </div>
          </>
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
              <Button type="submit" className="text-white!" disabled={quizSaving}>
                {quizSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {quiz ? t("quiz.save") : t("quiz.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion
                ? t("quiz.questions.editTitle")
                : t("quiz.questions.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {quiz?.title ?? t("quiz.title")}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleQuestionSubmit}>
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
                  disabled={!editingQuestion}
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
                onClick={() => setQuestionDialogOpen(false)}
              >
                {t("quiz.questions.cancel")}
              </Button>
              <Button
                type="submit"
                className="text-white!"
                disabled={questionSaving}
              >
                {questionSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {editingQuestion
                  ? t("quiz.questions.save")
                  : t("quiz.questions.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <QuizQuestionImportDialog
        open={importDialogOpen}
        isImporting={importQuestionsMutation.isPending}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportQuestions}
      />
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
