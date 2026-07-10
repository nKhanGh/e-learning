"use client";

import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourseCategoriesQuery,
  useCourseQuery,
  useUpdateCourseMutation,
} from "@/hooks/queries/useCourseQueries";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import { UserRole } from "@/types/enums/UserRole.enum";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  BadgeDollarSign,
  BookOpen,
  GraduationCap,
  ImageIcon,
  Loader2,
  Save,
  Tag,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CourseEditForm = {
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  level: CourseLevel;
  language: string;
  isFree: boolean;
  price: string;
  originalPrice: string;
  thumbnailUrl: string;
};

const initialForm: CourseEditForm = {
  title: "",
  description: "",
  categoryId: "",
  categoryName: "",
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


const normalizeLanguage = (value: string | null | undefined) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) return "en";
  if (normalized === "english") return "en";
  if (normalized === "vietnamese" || normalized === "tiếng việt") return "vi";

  return languages.some((language) => language.value === normalized)
    ? normalized
    : "en";
};

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

const normalizeLookupValue = (value: string | null | undefined) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const getCourseCategoryId = (course: CourseResponse | null | undefined) =>
  String(
    course?.category?.id
  );

const getCourseCategoryName = (course: CourseResponse | null | undefined) =>
  course?.category?.name ??
  undefined;

const toForm = (course: CourseResponse): CourseEditForm => ({
  title: course.title ?? "",
  description: course.description ?? "",
  categoryId: getCourseCategoryId(course),
  categoryName: getCourseCategoryName(course) ?? "",
  level: course.level,
  language: normalizeLanguage(course.language),
  isFree: Boolean(course.isFree),
  price: String(course.price ?? 0),
  originalPrice: course.originalPrice ? String(course.originalPrice) : "",
  thumbnailUrl: course.thumbnailUrl ?? "",
});

const toUpdateRequest = (
  course: CourseResponse,
  form: CourseEditForm,
): CourseUpdateRequest => {
  const title = form.title.trim();
  const description = form.description.trim();
  const price = form.isFree ? 0 : Number(form.price);

  return {
    categoryId: form.categoryId,
    title,
    slug: toSlug(title),
    description,
    whatYouWillLearn: course.whatYouWillLearn ?? [],
    requirements: course.requirements ?? [],
    targetAudience: course.targetAudience ?? [],
    thumbnailUrl: form.thumbnailUrl.trim(),
    promotionalVideoUrl: course.promotionalVideoUrl ?? "",
    price,
    originalPrice: form.isFree ? 0 : Number(form.originalPrice || form.price),
    currency: course.currency || "USD",
    isFree: form.isFree,
    level: form.level,
    language: form.language,
    hasCaptions: Boolean(course.hasCaptions),
    durationMinutes: course.durationMinutes ?? 0,
    status: course.status,
    lastUpdatedContent: new Date(),
    hasCertificate: Boolean(course.hasCertificate),
    hasQuizzes: Boolean(course.hasQuizzes),
    metaTitle: course.metaTitle || title,
    metaDescription: course.metaDescription || description.slice(0, 180),
    metaKeywords: course.metaKeywords ?? [],
    tagNames: course.tags?.map((tag) => tag.name) ?? [],
  };
};

const CourseEditPage = () => {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const t = useTranslations("InstructorCourseEditPage");
  const createT = useTranslations("InstructorCourseCreatePage");
  const { isLoggedIn, user } = useAuth();
  const [form, setForm] = useState<CourseEditForm>(initialForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loadedCourse, setLoadedCourse] = useState<CourseResponse | null>(null);
  const courseQuery = useCourseQuery(courseId);
  const categoriesQuery = useCourseCategoriesQuery();
  const updateCourseMutation = useUpdateCourseMutation(courseId);
  const course = courseQuery.data ?? loadedCourse;

  const categories = useMemo(
    () => {
      const flattened = flattenCategories(categoriesQuery.data ?? []);
      const currentCategoryId = getCourseCategoryId(course);
      const currentCategoryName = getCourseCategoryName(course);

      if (
        currentCategoryId &&
        currentCategoryName &&
        !flattened.some((category) => String(category.id) === currentCategoryId)
      ) {
        return [
          {
            id: currentCategoryId,
            name: currentCategoryName,
            description: "",
            parent: null,
            children: [],
            iconUrl: "",
            displayOrder: 0,
            isActive: true,
            depth: 0,
          },
          ...flattened,
        ];
      }

      return flattened;
    },
    [categoriesQuery.data, course],
  );

  const slug = useMemo(() => toSlug(form.title), [form.title]);
  const resolvedCategory = useMemo(() => {
    const categoryById = categories.find(
      (category) => String(category.id) === form.categoryId,
    );
    if (categoryById) return categoryById;

    const courseCategoryId = getCourseCategoryId(course);
    const categoryByCourseId = categories.find(
      (category) => String(category.id) === courseCategoryId,
    );
    if (categoryByCourseId) return categoryByCourseId;

    const categoryName = form.categoryName || getCourseCategoryName(course);
    const normalizedCategoryName = normalizeLookupValue(categoryName);

    if (normalizedCategoryName) {
      return categories.find(
        (category) =>
          normalizeLookupValue(category.name) === normalizedCategoryName,
      );
    }

    return undefined;
  }, [categories, course, form.categoryId, form.categoryName]);
  const resolvedCategoryId =
    form.categoryId || (resolvedCategory ? String(resolvedCategory.id) : "");
  const selectedCategoryName =
    resolvedCategory?.name || form.categoryName || getCourseCategoryName(course);
  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.INSTRUCTOR && course?.instructor?.id === user.id);

  useEffect(() => {
    if (courseQuery.data) {
      setLoadedCourse(courseQuery.data);
      console.log("Course data loaded:", courseQuery.data);
      setForm(toForm(courseQuery.data));
      console.log("Form initialized with:", toForm(courseQuery.data));

    }
  }, [courseQuery.data]);

  useEffect(() => {
    if (!form.categoryId && resolvedCategory) {
      setForm((current) => ({
        ...current,
        categoryId: String(resolvedCategory.id),
        categoryName: resolvedCategory.name,
      }));
    }
  }, [form.categoryId, resolvedCategory]);

  const updateForm = <Key extends keyof CourseEditForm>(
    key: Key,
    value: CourseEditForm[Key],
  ) => {
    setFieldError(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateForm = () => {
    if (form.title.trim().length < 3) return createT("errors.title");
    if (!slug) return createT("errors.slug");
    if (!resolvedCategoryId) return createT("errors.category");
    if (form.description.trim().length < 10) return createT("errors.description");
    if (!form.isFree && Number(form.price) <= 0) return createT("errors.price");
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!course) return;

    const nextError = validateForm();
    if (nextError) {
      setFieldError(nextError);
      return;
    }

    const nextForm = {
      ...form,
      categoryId: resolvedCategoryId,
      categoryName: selectedCategoryName || form.categoryName,
    };

    try {
      await updateCourseMutation.mutateAsync(toUpdateRequest(course, nextForm));
      toast.success(t("toast.updated"));
      router.push(`/${locale}/instructor/courses`);
    } catch (error) {
      toast.error(getErrorMessage(error, t("toast.failed")));
    }
  };

  useEffect(() => {
    console.log("Form state updated:", form);
  }, [form]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {createT("auth.signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {createT("auth.signInSubtitle")}
        </p>
      </div>
    );
  }

  if (courseQuery.isLoading) {
    return (
      <div className="grid gap-4 p-4">
        <div className="h-28 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
        <div className="h-80 animate-pulse rounded-lg bg-gray-100 dark:bg-border" />
      </div>
    );
  }

  if (courseQuery.isError || !course) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("error.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("error.subtitle")}
        </p>
        <Button
          type="button"
          onClick={() => courseQuery.refetch()}
          className="mx-auto mt-4 text-white!"
        >
          {t("error.retry")}
        </Button>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {t("auth.ownerOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.ownerOnlySubtitle")}
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
          <Button asChild variant="outline">
            <Link href={`/${locale}/instructor/studio/${course.id}`}>
              <GraduationCap className="h-4 w-4" />
              {t("openStudio")}
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-gray-950 dark:text-text">
                  {createT("sections.basic")}
                </h2>
              </div>

              <div className="grid gap-4">
                <Label className="grid gap-1.5">
                  <span>{createT("fields.title")}</span>
                  <Input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder={createT("placeholders.title")}
                  />
                </Label>

                <Label className="grid gap-1.5">
                  <span>{createT("fields.slug")}</span>
                  <Input
                    value={slug}
                    readOnly
                    placeholder={createT("placeholders.slug")}
                    className="bg-gray-50 text-gray-500 dark:bg-bg/60 dark:text-muted"
                  />
                </Label>

                <Label className="grid gap-1.5">
                  <span>{createT("fields.description")}</span>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder={createT("placeholders.description")}
                    rows={5}
                  />
                </Label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-gray-950 dark:text-text">
                  {createT("sections.classification")}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5 md:col-span-3">
                  <Label>{createT("fields.category")}</Label>
                  <Select
                    value={resolvedCategoryId || undefined}
                    onValueChange={(value) => {
                      const nextCategory = categories.find(
                        (category) => String(category.id) === value,
                      );

                      setFieldError(null);
                      setForm((current) => ({
                        ...current,
                        categoryId: value,
                        categoryName: nextCategory?.name ?? current.categoryName,
                      }));
                    }}
                    disabled={categoriesQuery.isLoading && !form.categoryId}
                  >
                    <SelectTrigger>
                      {selectedCategoryName ? (
                        <span className="truncate">{selectedCategoryName}</span>
                      ) : (
                        <SelectValue
                          placeholder={
                            categoriesQuery.isLoading
                              ? createT("placeholders.categoryLoading")
                              : createT("placeholders.category")
                          }
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={String(category.id)}
                          value={String(category.id)}
                        >
                          {"- ".repeat(category.depth)}
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>{createT("fields.level")}</Label>
                  <Select
                    value={form.level}
                    onValueChange={(value) =>{
                      if (!value) return;
                      updateForm("level", value as CourseLevel)
                    }
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {createT(`levels.${level}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>{createT("fields.language")}</Label>
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
                          {createT(language.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Label className="grid gap-1.5">
                  <span>{createT("fields.thumbnailUrl")}</span>
                  <Input
                    value={form.thumbnailUrl}
                    onChange={(event) =>
                      updateForm("thumbnailUrl", event.target.value)
                    }
                    placeholder={createT("placeholders.thumbnailUrl")}
                  />
                </Label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-gray-950 dark:text-text">
                  {createT("sections.pricing")}
                </h2>
              </div>

              <div className="grid gap-4">
                <div className="grid w-full max-w-sm grid-cols-2 gap-2 rounded-md bg-gray-100 p-1 dark:bg-bg">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => updateForm("isFree", true)}
                    className={`h-9 w-full ${
                      form.isFree
                        ? "bg-white text-primary shadow-sm dark:bg-surface"
                        : "text-gray-500 hover:text-primary dark:text-muted"
                    }`}
                  >
                    {createT("pricing.free")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => updateForm("isFree", false)}
                    className={`h-9 w-full ${
                      form.isFree
                        ? "text-gray-500 hover:text-primary dark:text-muted"
                        : "bg-white text-primary shadow-sm dark:bg-surface"
                    }`}
                  >
                    {createT("pricing.paid")}
                  </Button>
                </div>

                {!form.isFree && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Label className="grid gap-1.5">
                      <span>{createT("fields.price")}</span>
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
                      <span>{createT("fields.originalPrice")}</span>
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
              <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-muted">
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-primary" />
                  <span>{t("summary.quickEdit")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>
                    {form.thumbnailUrl
                      ? createT("summary.thumbnailReady")
                      : createT("summary.thumbnailLater")}
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>{t("summary.studioHint")}</span>
                </div> */}
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
                disabled={updateCourseMutation.isPending}
                className="text-white!"
              >
                {updateCourseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("actions.save")}
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

export default CourseEditPage;
