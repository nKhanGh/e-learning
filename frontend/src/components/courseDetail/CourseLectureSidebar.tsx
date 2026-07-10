"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CourseLectureSidebarLabels = {
  title: string;
  lectures: string;
  empty: string;
  collapse: string;
  expand: string;
};

type CourseLectureSidebarProps = {
  sections: CourseCurriculumSection[];
  activeLectureId: string;
  totalLectures: number;
  collapsed: boolean;
  labels: CourseLectureSidebarLabels;
  buildLectureHref: (lectureId: string) => string;
  onCollapsedChange: (collapsed: boolean) => void;
  className?: string;
};

const contentIcons: Record<LectureContentType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  FILE: Download,
  EXTERNAL_LINK: ExternalLink,
};

const getLectureMinutes = (lecture: CourseCurriculumLecture) => {
  const seconds = lecture.videoDurationSeconds ?? lecture.durationMinutes * 60;
  return Math.max(0, Math.round(seconds / 60));
};

export function CourseLectureSidebar({
  sections,
  activeLectureId,
  totalLectures,
  collapsed,
  labels,
  buildLectureHref,
  onCollapsedChange,
  className,
}: CourseLectureSidebarProps) {
  const activeSectionId = useMemo(() => {
    return sections.find((section) =>
      section.lectures.some((lecture) => lecture.id === activeLectureId),
    )?.id;
  }, [activeLectureId, sections]);

  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(
    () => new Set(activeSectionId ? [activeSectionId] : sections[0]?.id ? [sections[0].id] : []),
  );

  useEffect(() => {
    if (!activeSectionId) return;

    setOpenSectionIds((current) => {
      if (current.has(activeSectionId)) return current;

      const next = new Set(current);
      next.add(activeSectionId);
      return next;
    });
  }, [activeSectionId]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((current) => {
      const next = new Set(current);

      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }

      return next;
    });
  };

  if (collapsed) {
    return (
      <aside
        className={cn(
          "lg:sticky lg:top-16 flex h-fit flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 dark:border-border dark:bg-surface",
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.expand}
          title={labels.expand}
          onClick={() => onCollapsedChange(false)}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "lg:sticky lg:top-16 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-3 dark:border-border dark:bg-surface",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.collapse}
          title={labels.collapse}
          onClick={() => onCollapsedChange(true)}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-bold text-gray-950 dark:text-text">
            {labels.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-muted">
            {totalLectures} {labels.lectures}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {sections.length ? (
          sections.map((section) => {
            const isOpen = openSectionIds.has(section.id);
            const hasActiveLecture = section.id === activeSectionId;

            return (
              <section key={section.id} className="rounded-md border border-gray-100 dark:border-border">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors",
                    hasActiveLecture
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 dark:text-muted dark:hover:bg-bg",
                  )}
                  aria-expanded={isOpen}
                  onClick={() => toggleSection(section.id)}
                >
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", `${isOpen ? "rotate-90" : ""}`)} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 font-bold">
                      {section.displayOrder}. {section.title}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {section.lectures.length} {labels.lectures}
                    </span>
                  </span>
                </button>

                {isOpen ? (
                  <div className="space-y-1 border-t border-gray-100 p-1 dark:border-border">
                    {section.lectures.map((lecture) => {
                      const LectureIcon = contentIcons[lecture.contentType];
                      const isCurrent = lecture.id === activeLectureId;

                      return (
                        <Link
                          key={lecture.id}
                          href={buildLectureHref(lecture.id)}
                          className={cn(
                            "flex gap-2 rounded-md px-2 py-2 text-xs transition-colors",
                            isCurrent
                              ? "bg-primary text-white"
                              : "text-gray-600 hover:bg-gray-100 dark:text-muted dark:hover:bg-bg",
                          )}
                        >
                          <LectureIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 font-semibold">
                              {lecture.title}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 flex items-center gap-1",
                                isCurrent ? "text-white/80" : "text-gray-400",
                              )}
                            >
                              {lecture.status === "LOCKED" ? (
                                <Lock className="h-3 w-3" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {getLectureMinutes(lecture)}m
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })
        ) : (
          <p className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500 dark:border-border dark:text-muted">
            {labels.empty}
          </p>
        )}
      </div>
    </aside>
  );
}
