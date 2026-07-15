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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminCourseReviewDetailQuery,
  useApproveCourseReviewMutation,
  useRejectCourseReviewMutation,
} from "@/hooks/queries/useCourseQueries";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Eye,
  History,
  ListChecks,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const statusStyles: Partial<Record<CourseStatus, string>> = {
  PENDING_REVIEW:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  PUBLISHED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  UNPUBLISHED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ARCHIVED:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const checklistStyles: Record<CoursePublishChecklistStatus, string> = {
  PASSED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  WARNING:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

const actionStyles: Record<CourseReviewAction, string> = {
  SUBMITTED:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  RESUBMITTED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  APPROVED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

const formatDate = (
  value: Date | string | null | undefined,
  locale: string,
  fallback: string,
) => {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getUserName = (user: UserResponse | null | undefined, fallback: string) => {
  if (!user) return fallback;
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
};

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value || "";

const AdminCourseReviewDetailPage = () => {
  const locale = useLocale();
  const params = useParams();
  const courseId = getParamValue(params.courseId);
  const t = useTranslations("AdminCourseReviewDetailPage");
  const statusT = useTranslations("CourseStatus");
  const { isLoggedIn, user } = useAuth();
  const canReviewCourses = isLoggedIn && user?.role === UserRole.ADMIN;
  const detailQuery = useAdminCourseReviewDetailQuery(courseId, canReviewCourses);
  const approveMutation = useApproveCourseReviewMutation(courseId);
  const rejectMutation = useRejectCourseReviewMutation(courseId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const detail = detailQuery.data;
  const course = detail?.course;
  const canDecide = course?.status === "PENDING_REVIEW";
  const checklistCounts = useMemo(() => {
    const items = detail?.checklist.groups.flatMap((group) => group.items) ?? [];
    return {
      passed: items.filter((item) => item.status === "PASSED").length,
      total: items.length,
    };
  }, [detail?.checklist.groups]);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      toast.success(t("toast.approved"));
    } catch (error) {
      toast.error(t("toast.approveFailed"));
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(t("toast.reasonRequired"));
      return;
    }

    try {
      await rejectMutation.mutateAsync({ reason: rejectReason.trim() });
      toast.success(t("toast.rejected"));
      setRejectOpen(false);
      setRejectReason("");
    } catch (error) {
      toast.error(t("toast.rejectFailed"));
      console.error(error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-950 dark:text-text">
          {t("auth.signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.signInSubtitle")}
        </p>
      </div>
    );
  }

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-950 dark:text-text">
          {t("auth.adminOnlyTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("auth.adminOnlySubtitle")}
        </p>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
        <div className="mx-auto max-w-7xl space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
            />
          ))}
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !detail || !course) {
    return (
      <div className="min-h-[70vh] rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-950 dark:text-text">
          {t("error.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">
          {t("error.subtitle")}
        </p>
        <Button
          type="button"
          onClick={() => detailQuery.refetch()}
          className="mt-4 !text-white"
        >
          {t("error.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl space-y-4">
        <Link
          href={`/${locale}/admin/course-reviews`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary dark:text-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>

        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    statusStyles[course.status] ?? statusStyles.DRAFT
                  }`}
                >
                  {statusT(course.status)}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {course.category?.name ?? t("unknown")}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-gray-950 dark:text-text">
                {course.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-muted">
                {course.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-muted">
                <span className="inline-flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" />
                  {getUserName(course.instructor, t("unknown"))}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDate(
                    course.lastUpdatedContent || course.publishedAt,
                    locale,
                    t("unknown"),
                  )}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("courseStats", {
                    sections: detail.curriculum.totalSections,
                    lectures: detail.curriculum.totalLectures,
                    duration: detail.curriculum.totalDurationMinutes,
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/${locale}/admin/studio/${course.id}`}>
                  <Eye className="h-4 w-4" />
                  {t("actions.openStudio")}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canDecide || rejectMutation.isPending}
                onClick={() => setRejectOpen(true)}
                className="border-red-200 text-red-700 hover:border-red-500 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
                {t("actions.reject")}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canDecide || approveMutation.isPending}
                onClick={handleApprove}
                className="!text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                {approveMutation.isPending
                  ? t("actions.approving")
                  : t("actions.approve")}
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-text">
                  {t("checklist.title")}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-muted">
                  {t("checklist.subtitle", {
                    passed: checklistCounts.passed,
                    total: checklistCounts.total,
                  })}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  detail.checklist.ready
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                }`}
              >
                {detail.checklist.ready
                  ? t("checklist.ready")
                  : t("checklist.notReady")}
              </span>
            </div>

            <div className="space-y-3">
              {detail.checklist.groups.map((group) => (
                <div
                  key={group.key}
                  className="rounded-lg border border-gray-200 p-3 dark:border-border"
                >
                  <h3 className="text-sm font-bold text-gray-950 dark:text-text">
                    {group.label}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={`${group.key}-${item.key}-${item.targetId}`}
                        className="flex items-start gap-2 rounded-md bg-gray-50 p-2 dark:bg-bg"
                      >
                        <span
                          className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${checklistStyles[item.status]}`}
                        >
                          {item.status}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
            <h2 className="text-lg font-bold text-gray-950 dark:text-text">
              {t("info.title")}
            </h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-border dark:bg-bg">
              <img
                src={course.thumbnailUrl || "/default-course-background.png"}
                alt={course.title}
                className="h-44 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/default-course-background.png";
                }}
              />
              <div className="grid grid-cols-2 gap-3 p-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted">
                    {t("info.level")}
                  </p>
                  <p className="font-semibold text-gray-950 dark:text-text">
                    {course.level ?? t("unknown")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted">
                    {t("info.language")}
                  </p>
                  <p className="font-semibold text-gray-950 dark:text-text">
                    {course.language ?? t("unknown")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted">
                    {t("info.price")}
                  </p>
                  <p className="font-semibold text-gray-950 dark:text-text">
                    {course.isFree ? t("info.free") : `${course.price} ${course.currency}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted">
                    {t("info.quiz")}
                  </p>
                  <p className="font-semibold text-gray-950 dark:text-text">
                    {course.hasQuizzes ? t("yes") : t("no")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-gray-950 dark:text-text">
              {t("curriculum.title")}
            </h2>
          </div>
          <div className="space-y-3">
            {detail.curriculum.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-gray-200 p-3 dark:border-border"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      {t("curriculum.section", { order: section.displayOrder })}
                    </p>
                    <h3 className="text-base font-bold text-gray-950 dark:text-text">
                      {section.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-muted">
                    {t("curriculum.lectureCount", {
                      count: section.lectures.length,
                    })}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {section.lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="flex flex-col gap-2 rounded-md bg-gray-50 p-2 dark:bg-bg sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-950 dark:text-text">
                          {lecture.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-muted">
                          {lecture.contentType} · {lecture.status}
                          {lecture.quiz
                            ? ` · ${t("curriculum.questions", {
                                count: lecture.quiz.totalQuestions,
                              })}`
                            : ""}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/${locale}/admin/studio/${course.id}/preview/lectures/${lecture.id}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("actions.preview")}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-gray-950 dark:text-text">
              {t("history.title")}
            </h2>
          </div>
          {detail.reviewHistory.length ? (
            <div className="space-y-2">
              {detail.reviewHistory.map((history) => (
                <div
                  key={history.id}
                  className="rounded-lg border border-gray-200 p-3 dark:border-border"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${actionStyles[history.action]}`}
                      >
                        {t(`history.actions.${history.action}`)}
                      </span>
                      <span className="text-sm font-semibold text-gray-950 dark:text-text">
                        {getUserName(history.reviewer, t("unknown"))}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-muted">
                      {formatDate(history.createdAt, locale, t("unknown"))}
                    </span>
                  </div>
                  {history.reason && (
                    <p className="mt-2 rounded-md bg-gray-50 p-2 text-sm text-gray-600 dark:bg-bg dark:text-gray-300">
                      {history.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-border dark:text-muted">
              {t("history.empty")}
            </p>
          )}
        </section>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("rejectDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder={t("rejectDialog.placeholder")}
            className="min-h-32"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
            >
              {t("rejectDialog.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
            >
              <Send className="h-4 w-4" />
              {rejectMutation.isPending
                ? t("rejectDialog.rejecting")
                : t("rejectDialog.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseReviewDetailPage;
