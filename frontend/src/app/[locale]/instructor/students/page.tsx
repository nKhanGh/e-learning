"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCoursesQuery } from "@/hooks/queries/useCourseQueries";
import { useCourseEnrollmentsQuery } from "@/hooks/queries/useEnrollmentQueries";
import { UserRole } from "@/types/enums/UserRole.enum";
import { BookOpen, CalendarClock, GraduationCap, SearchX, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 100;

const InstructorStudentsPage = () => {
  const locale = useLocale();
  const t = useTranslations("InstructorStudentsPage");
  const { isLoggedIn, user } = useAuth();
  const [courseId, setCourseId] = useState("");
  const coursesQuery = useMyCoursesQuery(0, PAGE_SIZE, "", undefined);
  const courses = coursesQuery.data?.items ?? [];

  useEffect(() => {
    if (!courseId && courses.length) {
      setCourseId(courses[0].id);
    }
  }, [courseId, courses]);

  const enrollmentsQuery = useCourseEnrollmentsQuery(
    courseId,
    Boolean(courseId && isLoggedIn && user?.role === UserRole.INSTRUCTOR),
  );
  const enrollments = enrollmentsQuery.data ?? [];
  const selectedCourse = courses.find((course) => course.id === courseId);
  const stats = useMemo(() => getEnrollmentStats(enrollments), [enrollments]);

  if (!isLoggedIn) {
    return <StateMessage title={t("auth.signInTitle")} subtitle={t("auth.signInSubtitle")} />;
  }

  if (user?.role !== UserRole.INSTRUCTOR) {
    return (
      <StateMessage
        title={t("auth.instructorOnlyTitle")}
        subtitle={t("auth.instructorOnlySubtitle")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-950 dark:text-text">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-muted">
              {t("subtitle")}
            </p>
          </div>

          <div className="w-full md:w-80">
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-muted">
              {t("course")}
            </label>
            <Select value={courseId} onValueChange={setCourseId} disabled={!courses.length}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectCourse")} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {coursesQuery.isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
              />
            ))}
          </div>
        ) : coursesQuery.isError ? (
          <StateMessage
            title={t("error.coursesTitle")}
            subtitle={t("error.subtitle")}
            action={
              <Button
                type="button"
                className="mx-auto mt-4 !text-white"
                onClick={() => coursesQuery.refetch()}
              >
                {t("error.retry")}
              </Button>
            }
          />
        ) : courses.length === 0 ? (
          <StateMessage
            title={t("emptyCourses.title")}
            subtitle={t("emptyCourses.subtitle")}
            action={
              <Button asChild className="mx-auto mt-4 !text-white">
                <Link href={`/${locale}/instructor/courses/new`}>
                  {t("emptyCourses.create")}
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <MetricCard
                icon={<Users className="h-4 w-4" />}
                label={t("metrics.students")}
                value={stats.total.toString()}
              />
              <MetricCard
                icon={<GraduationCap className="h-4 w-4" />}
                label={t("metrics.completed")}
                value={stats.completed.toString()}
              />
              <MetricCard
                icon={<BookOpen className="h-4 w-4" />}
                label={t("metrics.active")}
                value={stats.active.toString()}
              />
              <MetricCard
                icon={<CalendarClock className="h-4 w-4" />}
                label={t("metrics.avgProgress")}
                value={`${stats.avgProgress}%`}
              />
            </div>

            <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-950 dark:text-text">
                    {selectedCourse?.title ?? t("students")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-muted">
                    {t("listSubtitle")}
                  </p>
                </div>
                {selectedCourse ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/${locale}/instructor/studio/${selectedCourse.id}`}>
                      {t("openStudio")}
                    </Link>
                  </Button>
                ) : null}
              </div>

              {enrollmentsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-border"
                    />
                  ))}
                </div>
              ) : enrollmentsQuery.isError ? (
                <StateMessage
                  title={t("error.studentsTitle")}
                  subtitle={t("error.subtitle")}
                  action={
                    <Button
                      type="button"
                      className="mx-auto mt-4 !text-white"
                      onClick={() => enrollmentsQuery.refetch()}
                    >
                      {t("error.retry")}
                    </Button>
                  }
                />
              ) : enrollments.length ? (
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <StudentRow
                      key={`${enrollment.id.userId}-${enrollment.id.courseId}`}
                      enrollment={enrollment}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-10 text-center dark:border-border">
                  <SearchX className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-3 text-base font-bold text-gray-950 dark:text-text">
                    {t("emptyStudents.title")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-muted">
                    {t("emptyStudents.subtitle")}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const StudentRow = ({
  enrollment,
  locale,
}: {
  enrollment: EnrollmentResponse;
  locale: string;
}) => {
  const t = useTranslations("InstructorStudentsPage");
  const user = enrollment.user;
  const name =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    t("unknownStudent");
  const progress = clampProgress(enrollment.progressPercentage);

  return (
    <article className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-border md:grid-cols-[minmax(0,1fr)_160px_120px] md:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {getInitials(user)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-gray-950 dark:text-text">
              {name}
            </h3>
            <p className="truncate text-xs text-gray-500 dark:text-muted">
              {user?.email ?? t("noEmail")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-500 dark:text-muted">{t("progress")}</span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-bg">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-muted">
          {enrollment.completedLectures ?? 0} {t("completedLectures")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-bg dark:text-muted">
          {String(enrollment.status)}
        </span>
        <span className="text-xs text-gray-500 dark:text-muted">
          {formatDate(enrollment.enrolledAt, locale)}
        </span>
      </div>
    </article>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface">
    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </div>
    <p className="text-xs text-gray-500 dark:text-muted">{label}</p>
    <p className="mt-1 text-xl font-bold text-gray-950 dark:text-text">{value}</p>
  </div>
);

const StateMessage = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
    <h1 className="text-xl font-bold text-gray-950 dark:text-text">{title}</h1>
    <p className="mt-2 text-sm text-gray-500 dark:text-muted">{subtitle}</p>
    {action}
  </div>
);

const getEnrollmentStats = (enrollments: EnrollmentResponse[]) => {
  const total = enrollments.length;
  const completed = enrollments.filter(
    (enrollment) => String(enrollment.status) === "COMPLETED",
  ).length;
  const active = total - completed;
  const avgProgress = total
    ? Math.round(
        enrollments.reduce(
          (sum, enrollment) => sum + clampProgress(enrollment.progressPercentage),
          0,
        ) / total,
      )
    : 0;

  return { total, completed, active, avgProgress };
};

const clampProgress = (value: number | null | undefined) =>
  Math.max(0, Math.min(100, Math.round(Number(value ?? 0))));

const getInitials = (user?: UserResponse) =>
  `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
  "ST";

const formatDate = (value: Date | string | null | undefined, locale: string) => {
  if (!value) return "";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default InstructorStudentsPage;
