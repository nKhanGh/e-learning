import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import {
  useCreateQuizMutation,
  useCreateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useImportQuizQuestionsMutation,
  useQuizByLectureQuery,
  useQuizQuestionsQuery,
  useUpdateQuizMutation,
  useUpdateQuizQuestionMutation,
} from "@/hooks/queries/useCourseQueries";
import { cn } from "@/lib/utils";
import { FileJson, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  QuizQuestionImportDialog,
  type QuizQuestionImportPayload,
} from "../../../../components/QuizQuestionImportDialog";
import { getErrorMessage } from "../../../../components/studioUtils";
import { EmptyContentMessage } from "./EmptyContentMessage";
import { isFullQuizResponse } from "./lecturePreviewUtils";
import { QuizConfigDialog } from "./QuizConfigDialog";
import { QuizQuestionDialog } from "./QuizQuestionDialog";

type QuizPreviewContentProps = {
  courseId: string;
  sectionId?: string;
  lectureId: string;
  lectureTitle: string;
  fallbackQuiz: QuizResponse | CourseCurriculumQuiz | null;
};

export function QuizPreviewContent({
  courseId,
  sectionId,
  lectureId,
  lectureTitle,
  fallbackQuiz,
}: QuizPreviewContentProps) {
  const t = useTranslations("InstructorCourseStudioPage");
  const quizQuery = useQuizByLectureQuery(lectureId);
  const quiz = quizQuery.data ?? fallbackQuiz;
  const quizId = quiz?.id ?? "";
  const questionsQuery = useQuizQuestionsQuery(quizId);
  const fallbackQuestions =
    isFullQuizResponse(quiz) && Array.isArray(quiz.questions)
      ? quiz.questions
      : [];
  const questions = Array.isArray(questionsQuery.data)
    ? questionsQuery.data
    : fallbackQuestions;
  const createQuizMutation = useCreateQuizMutation(courseId, lectureId, sectionId);
  const updateQuizMutation = useUpdateQuizMutation(courseId, lectureId, sectionId);
  const nextQuestionOrder =
    Math.max(0, ...questions.map((question) => question.displayOrder ?? 0)) + 1;
  const createQuestionMutation = useCreateQuizQuestionMutation(
    courseId,
    lectureId,
    quizId,
    sectionId,
  );
  const updateQuestionMutation = useUpdateQuizQuestionMutation(
    courseId,
    lectureId,
    quizId,
    sectionId,
  );
  const deleteQuestionMutation = useDeleteQuizQuestionMutation(
    courseId,
    lectureId,
    quizId,
    sectionId,
  );
  const importQuestionsMutation = useImportQuizQuestionsMutation(
    courseId,
    lectureId,
    quizId,
    sectionId,
  );
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [quizConfigDialogOpen, setQuizConfigDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<QuizQuestionResponse | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuizQuestionResponse | null>(null);
  const questionSaving =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;
  const quizSaving = createQuizMutation.isPending || updateQuizMutation.isPending;
  const totalPoints = questions.reduce(
    (total, question) => total + Number(question.points ?? 0),
    0,
  );

  const openCreateQuestionDialog = () => {
    if (!quizId) {
      toast.error(t("quiz.questions.selectQuizFirst"));
      return;
    }

    setEditingQuestion(null);
    setQuestionDialogOpen(true);
  };

  const openEditQuestionDialog = (question: QuizQuestionResponse) => {
    setEditingQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleQuestionSubmit = async (
    payload: QuizQuestionUpdateRequest,
    submittedQuestion: QuizQuestionResponse | null,
  ) => {
    if (!quizId) {
      toast.error(t("quiz.questions.selectQuizFirst"));
      return;
    }

    try {
      if (submittedQuestion) {
        await updateQuestionMutation.mutateAsync({
          questionId: submittedQuestion.id,
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
    try {
      await deleteQuestionMutation.mutateAsync(question.id);
      toast.success(t("quiz.questions.deleted"));
      setDeletingQuestion(null);
    } catch (error) {
      toast.error(getErrorMessage(error, t("quiz.questions.deleteFailed")));
    }
  };

  const handleImportQuestions = (payload: QuizQuestionImportPayload) =>
    importQuestionsMutation.mutateAsync(payload);

  const handleQuizConfigSubmit = async (
    payload: QuizUpdateRequest,
    submittedQuiz: QuizResponse | CourseCurriculumQuiz | null,
  ) => {
    try {
      if (submittedQuiz) {
        await updateQuizMutation.mutateAsync({
          quizId: submittedQuiz.id,
          request: payload,
        });
        toast.success(t("quiz.updated"));
      } else {
        await createQuizMutation.mutateAsync(payload);
        toast.success(t("quiz.created"));
      }

      setQuizConfigDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t("quiz.failed")));
    }
  };

  if (quizQuery.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
      <div id="quiz-config" className="scroll-mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-gray-950 dark:text-text">
            {t("preview.quizTitle")}
          </h3>
          <Button
            type="button"
            variant={quiz ? "outline" : "default"}
            size="sm"
            className={quiz ? undefined : "text-white!"}
            onClick={() => setQuizConfigDialogOpen(true)}
          >
            {quiz ? (
              <Pencil className="h-3.5 w-3.5" />
            ) : (
              <Settings2 className="h-3.5 w-3.5" />
            )}
            {quiz ? t("quiz.edit") : t("quiz.setup")}
          </Button>
        </div>
        {quiz ? (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-bg">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {quiz.description ? (
                <p className="text-sm text-gray-500 dark:text-muted">
                  {quiz.description}
                </p>
              ) : null}
              {"instructions" in quiz && quiz.instructions ? (
                <div className="mt-3 rounded-md border border-dashed border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-border dark:bg-surface dark:text-muted">
                  <p className="font-bold text-gray-900 dark:text-text">
                    {t("quiz.fields.instructions")}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{quiz.instructions}</p>
                </div>
              ) : null}
            </div>
            {"isPublished" in quiz ? (
              <span className="w-fit rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-surface dark:text-muted">
                {quiz.isPublished ? t("quiz.published") : t("quiz.unpublished")}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-4 dark:text-muted">
            <QuizPreviewMeta label={t("quiz.meta.questions")}>
              {questions.length || quiz.totalQuestions}
            </QuizPreviewMeta>
            <QuizPreviewMeta label={t("quiz.meta.points")}>
              {"totalPoints" in quiz ? quiz.totalPoints : totalPoints}
            </QuizPreviewMeta>
            <QuizPreviewMeta label={t("quiz.meta.passingScore")}>
              {"passingScore" in quiz ? `${quiz.passingScore}%` : "-"}
            </QuizPreviewMeta>
            <QuizPreviewMeta label={t("quiz.meta.timeLimit")}>
              {quiz.timeLimitMinutes
                ? t("preview.minutes", { count: quiz.timeLimitMinutes })
                : t("preview.unlimited")}
            </QuizPreviewMeta>
          </div>

          {"maxAttempts" in quiz ||
          "randomizeQuestions" in quiz ||
          "showCorrectAnswers" in quiz ||
          "showAnswersAfterSubmission" in quiz ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-muted">
              {"maxAttempts" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("preview.maxAttempts")}:{" "}
                  {quiz.maxAttempts ?? t("preview.unlimited")}
                </span>
              ) : null}
              {"randomizeQuestions" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("quiz.fields.randomizeQuestions")}:{" "}
                  {quiz.randomizeQuestions ? t("preview.yes") : t("preview.no")}
                </span>
              ) : null}
              {"showCorrectAnswers" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("quiz.fields.showCorrectAnswers")}:{" "}
                  {quiz.showCorrectAnswers ? t("preview.yes") : t("preview.no")}
                </span>
              ) : null}
              {"showAnswersAfterSubmission" in quiz ? (
                <span className="rounded-md bg-white px-2 py-1 dark:bg-surface">
                  {t("quiz.fields.showAnswersAfterSubmission")}:{" "}
                  {quiz.showAnswersAfterSubmission
                    ? t("preview.yes")
                    : t("preview.no")}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        ) : (
          <div className="mt-3">
            <EmptyContentMessage message={t("preview.quizEmpty")} />
          </div>
        )}
      </div>

      {quiz ? (
        <div id="quiz-questions" className="scroll-mt-6">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-950 dark:text-text">
              {t("preview.quizQuestions")}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-muted">
              {t("quiz.questions.subtitle")}
            </p>
          </div>
          {questionsQuery.isFetching ? (
            <span className="text-xs text-gray-400">
              {t("preview.loadingQuestions")}
            </span>
          ) : null}
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
              onClick={() => setImportDialogOpen(true)}
            >
              <FileJson className="h-4 w-4" />
              {t("quiz.questions.importJson")}
            </Button>
          </div>
        </div>

        {questionsQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
              />
            ))}
          </div>
        ) : questions.length ? (
          <div className="space-y-3">
            {questions
              .slice()
              .sort((first, second) => first.displayOrder - second.displayOrder)
              .map((question) => (
                <QuizQuestionPreview
                  key={question.id}
                  question={question}
                  isDeleting={deleteQuestionMutation.isPending}
                  onEdit={() => openEditQuestionDialog(question)}
                  onDelete={() => setDeletingQuestion(question)}
                />
              ))}
          </div>
        ) : (
          <EmptyContentMessage message={t("preview.quizQuestionsEmpty")} />
        )}
      </div>
      ) : null}
    </div>

      <QuizConfigDialog
        open={quizConfigDialogOpen}
        quiz={quiz}
        lectureTitle={lectureTitle}
        isSaving={quizSaving}
        onOpenChange={setQuizConfigDialogOpen}
        onSubmit={handleQuizConfigSubmit}
      />

      <QuizQuestionDialog
        open={questionDialogOpen}
        question={editingQuestion}
        fallbackOrder={nextQuestionOrder}
        quizTitle={lectureTitle}
        isSaving={questionSaving}
        onOpenChange={setQuestionDialogOpen}
        onSubmit={handleQuestionSubmit}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingQuestion)}
        title={t("quiz.questions.deleteConfirm")}
        description={t("deleteDialog.description")}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        isPending={deleteQuestionMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingQuestion(null);
        }}
        onConfirm={() => {
          if (deletingQuestion) void handleDeleteQuestion(deletingQuestion);
        }}
      />

      <QuizQuestionImportDialog
        open={importDialogOpen}
        isImporting={importQuestionsMutation.isPending}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportQuestions}
      />
    </>
  );
}

const QuizQuestionPreview = ({
  question,
  isDeleting,
  onEdit,
  onDelete,
}: {
  question: QuizQuestionResponse;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const t = useTranslations("InstructorCourseStudioPage");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">
            {t("quiz.questions.order", {
              order: question.displayOrder,
            })}
            <span className="mx-2 text-gray-300">.</span>
            {question.points} {t("quiz.questions.points")}
          </p>
          <h5 className="mt-1 text-sm font-bold text-gray-950 dark:text-text">
            {question.questionText}
          </h5>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="w-fit rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            {(question.correctAnswers ?? []).length} {t("quiz.questions.correct")}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            {t("quiz.questions.edit")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="text-white!"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("quiz.questions.delete")}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {(question.options ?? []).map((option, index) => {
          const isCorrect = question.correctAnswers?.includes(option);

          return (
            <div
              key={`${question.id}-${option}-${index}`}
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200"
                  : "border-gray-200 text-gray-600 dark:border-border dark:text-muted",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  isCorrect
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-bg",
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </div>
          );
        })}
      </div>

      {question.explanation ? (
        <div className="mt-3 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-border dark:bg-bg dark:text-muted">
          <span className="font-bold text-gray-900 dark:text-text">
            {t("quiz.questions.fields.explanation")}:
          </span>{" "}
          {question.explanation}
        </div>
      ) : null}

      {question.imageUrl || question.videoUrl ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {question.imageUrl ? (
            <a
              href={question.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {t("preview.openImage")}
            </a>
          ) : null}
          {question.videoUrl ? (
            <a
              href={question.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {t("preview.openVideo")}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const QuizPreviewMeta = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
    <p className="text-gray-400">{label}</p>
    <p className="mt-1 font-bold text-gray-950 dark:text-text">{children}</p>
  </div>
);
