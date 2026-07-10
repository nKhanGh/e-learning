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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileJson, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { getErrorMessage } from "./studioUtils";

export type QuizQuestionImportPayload = Omit<
  QuizQuestionImportRequest,
  "quizId"
>;

type QuizQuestionImportDialogProps = {
  open: boolean;
  isImporting: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    payload: QuizQuestionImportPayload,
  ) => Promise<QuizQuestionImportResponse>;
};

const importTemplate = JSON.stringify(
  [
    {
      questionText: "What does HTTP status code 201 mean?",
      explanation: "201 means the request succeeded and created a resource.",
      points: 1,
      options: ["OK", "Created", "Bad Request", "Unauthorized"],
      correctAnswers: ["Created"],
    },
    {
      questionText: "Which items are valid JavaScript primitive types?",
      explanation: "string and boolean are primitive types.",
      points: 2,
      options: ["string", "array", "boolean", "object literal"],
      correctAnswers: ["string", "boolean"],
    },
  ],
  null,
  2,
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeQuestions = (
  value: unknown,
): QuizQuestionImportItem[] | null => {
  if (Array.isArray(value)) {
    return value as QuizQuestionImportItem[];
  }

  if (isRecord(value) && Array.isArray(value.questions)) {
    return value.questions as QuizQuestionImportItem[];
  }

  return null;
};

export function QuizQuestionImportDialog({
  open,
  isImporting,
  onOpenChange,
  onImport,
}: QuizQuestionImportDialogProps) {
  const t = useTranslations("InstructorCourseStudioPage.quiz.questions");
  const [jsonText, setJsonText] = useState(importTemplate);
  const [mode, setMode] = useState<QuizQuestionImportMode>("APPEND");
  const [errors, setErrors] = useState<QuizQuestionImportError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textareaPlaceholder = useMemo(() => importTemplate, []);

  useEffect(() => {
    if (open) {
      setJsonText(importTemplate);
      setMode("APPEND");
      setErrors([]);
    }
  }, [open]);

  const validateQuestions = (
    questions: QuizQuestionImportItem[],
  ): QuizQuestionImportError[] =>
    questions.flatMap((questionValue, index) => {
      const rowErrors: QuizQuestionImportError[] = [];
      const question = isRecord(questionValue) ? questionValue : null;

      if (!question) {
        return [
          {
            index,
            message: t("importErrors.questionObject"),
          },
        ];
      }

      const options = Array.isArray(question.options)
        ? question.options
            .map((option) => String(option).trim())
            .filter(Boolean)
        : [];
      const correctAnswers = Array.isArray(question.correctAnswers)
        ? question.correctAnswers
            .map((answer) => String(answer).trim())
            .filter(Boolean)
        : [];
      const points = Number(question.points ?? 1);

      if (!String(question.questionText ?? "").trim()) {
        rowErrors.push({
          index,
          message: t("importErrors.questionText"),
        });
      }

      if (options.length < 2) {
        rowErrors.push({
          index,
          message: t("importErrors.options"),
        });
      }

      if (correctAnswers.length === 0) {
        rowErrors.push({
          index,
          message: t("importErrors.correctAnswers"),
        });
      }

      const missingAnswers = correctAnswers.filter(
        (answer) => !options.includes(answer),
      );

      if (missingAnswers.length > 0) {
        rowErrors.push({
          index,
          message: t("importErrors.correctAnswerNotInOptions", {
            answers: missingAnswers.join(", "),
          }),
        });
      }

      if (!Number.isFinite(points) || points <= 0) {
        rowErrors.push({
          index,
          message: t("importErrors.points"),
        });
      }

      return rowErrors;
    });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error(t("importFileInvalid"));
      return;
    }

    try {
      setJsonText(await file.text());
      setErrors([]);
    } catch {
      toast.error(t("importFileReadFailed"));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setErrors([{ index: null, message: t("importInvalidJson") }]);
      return;
    }

    const questions = normalizeQuestions(parsed);

    if (!questions) {
      setErrors([{ index: null, message: t("importInvalidRoot") }]);
      return;
    }

    const validationErrors = validateQuestions(questions);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await onImport({ mode, questions });

      if (response.errors?.length) {
        setErrors(response.errors);
        toast.error(t("importHasErrors"));
        return;
      }

      toast.success(t("imported", { count: response.importedCount }));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t("importFailed")));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-border">
          <DialogHeader>
            <DialogTitle>{t("importTitle")}</DialogTitle>
            <DialogDescription>{t("importDescription")}</DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-4 px-5 pb-5 pt-4" onSubmit={handleSubmit}>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-border dark:bg-bg dark:text-muted">
            <p className="font-semibold text-gray-900 dark:text-text">
              {t("importGuidelinesTitle")}
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 leading-5">
              <li>{t("importGuidelineQuestionOnly")}</li>
              <li>{t("importGuidelineOptions")}</li>
              <li>{t("importGuidelineCorrectAnswers")}</li>
              <li>{t("importGuidelineMediaLater")}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 dark:border-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full space-y-2 sm:w-44">
                <Label>{t("importMode")}</Label>
                <Select
                  value={mode}
                  onValueChange={(value) =>
                    setMode(value as QuizQuestionImportMode)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPEND">{t("importAppend")}</SelectItem>
                    <SelectItem value="REPLACE">
                      {t("importReplace")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {t("importFile")}
                </Button>
                
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="quiz-question-import-file"
              className="sr-only"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-border dark:bg-bg">
            <div className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50 px-3 py-2 dark:border-border dark:bg-surface sm:flex-row sm:items-center sm:justify-between">
              <Label htmlFor="quiz-question-import-json">
                {t("pasteHere")}
              </Label>
              <span className="text-[11px] text-gray-500 dark:text-muted">
                {t("importInvalidRoot")}
              </span>
            </div>
            <Textarea
              id="quiz-question-import-json"
              className="min-h-72 rounded-none border-0 font-mono text-xs leading-5 shadow-none focus:border-transparent focus:ring-0"
              placeholder={textareaPlaceholder}
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                setErrors([]);
              }}
            />
          </div>

          {errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <p className="font-semibold">{t("importErrorsTitle")}</p>
              <ul className="mt-2 space-y-1">
                {errors.map((error, index) => (
                  <li key={`${error.index ?? "global"}-${index}`}>
                    <span className="font-semibold">
                      {error.index === null || error.index === undefined
                        ? t("importGlobalError")
                        : t("importRow", { row: error.index + 1 })}
                      :
                    </span>{" "}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="border-t border-gray-100 pt-4 dark:border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isImporting}>
              {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isImporting ? t("importing") : t("import")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
