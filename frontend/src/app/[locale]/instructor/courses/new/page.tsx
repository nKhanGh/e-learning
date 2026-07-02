"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  useCourseCategoriesQuery,
  useCreateCourseMutation,
} from "@/hooks/queries/useCourseQueries";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import { UserRole } from "@/types/enums/UserRole.enum";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  BadgeDollarSign,
  BookOpen,
  CheckCircle2,
  FilePlus2,
  Globe2,
  ImageIcon,
  Loader2,
  Tag,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CourseCreateForm = {
  title: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  language: string;
  isFree: boolean;
  price: string;
  originalPrice: string;
  thumbnailUrl: string;
};

const initialForm: CourseCreateForm = {
  title: "",
  description: "",
  categoryId: "",
  level: CourseLevel.BEGINNER,
  language: "en",
  isFree: true,
  price: "0",
  originalPrice: "",
  thumbnailUrl: "",
};

const languages = [
  { value: "en", labelKey: "languages.en" },
  { value: "vi", labelKey: "languages.vi" },
];

const courseLevels = [
  CourseLevel.BEGINNER,
  CourseLevel.INTERMEDIATE,
  CourseLevel.ADVANCED,
  CourseLevel.ALL_LEVELS,
];

const toSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

const flattenCategories = (
  categories: CourseCategoryResponse[] = [],
  depth = 0,
): Array<CourseCategoryResponse & { depth: number }> =>
  categories.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const CourseCreatePage = () => {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("InstructorCourseCreatePage");
  const { isLoggedIn, user } = useAuth();
  const [form, setForm] = useState<CourseCreateForm>(initialForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const categoriesQuery = useCourseCategoriesQuery();
  const createCourseMutation = useCreateCourseMutation();

  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  const slug = useMemo(() => toSlug(form.title), [form.title]);

  const updateForm = <Key extends keyof CourseCreateForm>(
    key: Key,
    value: CourseCreateForm[Key],
  ) => {
    setFieldError(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateForm = () => {
    if (form.title.trim().length < 3) {
      return t("errors.title");
    }

    if (!slug) {
      return t("errors.slug");
    }

    if (!form.categoryId) {
      return t("errors.category");
    }

    if (form.description.trim().length < 10) {
      return t("errors.description");
    }

    if (!form.isFree && Number(form.price) <= 0) {
      return t("errors.price");
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextError = validateForm();
    if (nextError) {
      setFieldError(nextError);
      return;
    }

    const price = form.isFree ? 0 : Number(form.price);
    const originalPrice = form.isFree
      ? 0
      : Number(form.originalPrice || form.price);
    const description = form.description.trim();
    const title = form.title.trim();

    const request: CourseCreationRequest = {
      categoryId: form.categoryId,
      title,
      slug,
      description,
      whatYouWillLearn: [],
      requirements: [],
      targetAudience: [],
      thumbnailUrl: form.thumbnailUrl.trim(),
      promotionalVideoUrl: "",
      price,
      originalPrice,
      currency: "USD",
      isFree: form.isFree,
      level: form.level,
      language: form.language,
      hasCaptions: false,
      durationMinutes: 0,
      status: "DRAFT",
      lastUpdatedContent: new Date(),
      hasCertificate: true,
      hasQuizzes: false,
      metaTitle: title,
      metaDescription: description.slice(0, 180),
      metaKeywords: [],
      tagNames: [],
    };

    try {
      await createCourseMutation.mutateAsync(request);
      toast.success(t("toast.created"));
      router.push(`/${locale}/instructor/courses`);
    } catch (error) {
      toast.error(getErrorMessage(error, t("toast.failed")));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.signInSubtitle")}
        </p>
      </div>
    );
  }

  if (user?.role !== UserRole.INSTRUCTOR) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.instructorOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.instructorOnlySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/${locale}/instructor/courses`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("back")}
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-950 dark:text-text">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {t("subtitle")}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {t("draftBadge")}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-gray-950 dark:text-text">
                  {t("sections.basic")}
                </h2>
              </div>

              <div className="grid gap-4">
                <Label className="grid gap-1.5">
                  <span>
                    {t("fields.title")}
                  </span>
                  <Input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder={t("placeholders.title")}
                  />
                </Label>

                <Label className="grid gap-1.5">
                  <span>
                    {t("fields.slug")}
                  </span>
                  <Input
                    value={slug}
                    readOnly
                    placeholder={t("placeholders.slug")}
                    className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none dark:border-border dark:bg-bg/60 dark:text-muted"
                  />
                </Label>

                <Label className="grid gap-1.5">
                  <span>
                    {t("fields.description")}
                  </span>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder={t("placeholders.description")}
                    rows={5}
                  />
                </Label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-gray-950 dark:text-text">
                  {t("sections.classification")}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5 md:col-span-3">
                  <Label>
                    {t("fields.category")}
                  </Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => updateForm("categoryId", value)}
                    disabled={categoriesQuery.isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categoriesQuery.isLoading
                            ? t("placeholders.categoryLoading")
                            : t("placeholders.category")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {"- ".repeat(category.depth)}
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>
                    {t("fields.level")}
                  </Label>
                  <Select
                    value={form.level}
                    onValueChange={(value) =>
                      updateForm("level", value as CourseLevel)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {t(`levels.${level}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>
                    {t("fields.language")}
                  </Label>
                  <Select
                    value={form.language}
                    onValueChange={(value) => updateForm("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {t(language.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Label className="grid gap-1.5">
                  <span>
                    {t("fields.thumbnailUrl")}
                  </span>
                  <Input
                    value={form.thumbnailUrl}
                    onChange={(event) =>
                      updateForm("thumbnailUrl", event.target.value)
                    }
                    placeholder={t("placeholders.thumbnailUrl")}
                  />
                </Label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-gray-950 dark:text-text">
                  {t("sections.pricing")}
                </h2>
              </div>

              <div className="grid gap-4">
                <div className="grid w-85 grid-cols-2 gap-2 rounded-md bg-gray-100 p-1 dark:bg-bg">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => updateForm("isFree", true)}
                    className={`flex h-9 w-full items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                      form.isFree
                        ? "bg-white text-primary shadow-sm dark:bg-surface"
                        : "text-gray-500 hover:text-primary dark:text-muted"
                    }`}
                  >
                    {t("pricing.free")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => updateForm("isFree", false)}
                    className={`flex h-9 w-full items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                      form.isFree
                        ? "text-gray-500 hover:text-primary dark:text-muted"
                        : "bg-white text-primary shadow-sm dark:bg-surface"
                    }`}
                  >
                    {t("pricing.paid")}
                  </Button>
                </div>

                {!form.isFree && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Label className="grid gap-1.5">
                      <span>
                        {t("fields.price")}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(event) =>
                          updateForm("price", event.target.value)
                        }
                      />
                    </Label>
                    <Label className="grid gap-1.5">
                      <span>
                        {t("fields.originalPrice")}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.originalPrice}
                        onChange={(event) =>
                          updateForm("originalPrice", event.target.value)
                        }
                        placeholder={form.price}
                      />
                    </Label>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <h2 className="text-base font-bold text-gray-950 dark:text-text">
                {t("summary.title")}
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-muted">
                  <FilePlus2 className="h-4 w-4 text-primary" />
                  <span>{t("summary.status")}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-muted">
                  <Globe2 className="h-4 w-4 text-primary" />
                  <span>{t(`languages.${form.language}`)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-muted">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>
                    {form.thumbnailUrl
                      ? t("summary.thumbnailReady")
                      : t("summary.thumbnailLater")}
                  </span>
                </div>
              </div>
            </section>

            {fieldError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-300">
                {fieldError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={createCourseMutation.isPending}
                className="!text-white"
              >
                {createCourseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FilePlus2 className="h-4 w-4" />
                )}
                {t("actions.create")}
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/instructor/courses`}>
                  {t("actions.cancel")}
                </Link>
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CourseCreatePage;
