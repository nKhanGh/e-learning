"use client";

import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faLock,
  faPlay,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

function formatDuration(minutes: number): string {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const getStatusLabel = (status: LearningItemStatus) => {
  const labels: Record<LearningItemStatus, string> = {
    FREE_PREVIEW: "Preview",
    AVAILABLE: "Available",
    LOCKED: "Locked",
    COMPLETED: "Completed",
  };
  return labels[status];
};

const getStatusIcon = (status: LearningItemStatus) => {
  if (status === "LOCKED") return faLock;
  if (status === "COMPLETED") return faCheck;
  return faPlay;
};

const getStatusClass = (status: LearningItemStatus) => {
  if (status === "LOCKED") {
    return "bg-gray-100 text-gray-500 dark:bg-border dark:text-muted";
  }
  if (status === "COMPLETED") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }
  if (status === "FREE_PREVIEW") {
    return "bg-primary/10 text-primary";
  }
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
};

const canOpenLecture = (status: LearningItemStatus) =>
  status === "AVAILABLE" || status === "COMPLETED" || status === "FREE_PREVIEW";

const SectionAccordion = ({
  section,
  courseId,
  locale,
}: {
  section: CourseCurriculumSection;
  courseId: string;
  locale: string;
}) => {
  const [open, setOpen] = useState(false);
  const lectureCount = section.lectures.length;
  const sectionDuration =
    section.durationMinutes ||
    section.lectures.reduce((total, lecture) => total + lecture.durationMinutes, 0);

  return (
    <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-3.5 bg-gray-50 dark:bg-surface hover:bg-gray-100 dark:hover:bg-border transition-colors text-left"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <FontAwesomeIcon
            icon={open ? faChevronUp : faChevronDown}
            className="w-3 h-3 text-gray-400 flex-shrink-0"
          />
          <span className="truncate font-semibold text-gray-900 dark:text-text text-xs">
            {section.title}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-muted flex-shrink-0">
          {lectureCount} lectures - {formatDuration(sectionDuration)}
        </span>
      </button>

      {open && (
        <div className="p-3.5 space-y-1.5">
          {section.lectures.length > 0 ? (
            section.lectures.map((lecture) => {
              const accessible = canOpenLecture(lecture.status);
              const lectureRow = (
                <div className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-surface group">
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-border flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10">
                    <FontAwesomeIcon
                      icon={getStatusIcon(lecture.status)}
                      className="w-2 h-2 text-gray-500 dark:text-muted group-hover:text-primary"
                    />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-muted flex-1 line-clamp-1">
                    {lecture.title}
                  </span>
                  {lecture.preview && lecture.status !== "COMPLETED" && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">
                      Preview
                    </span>
                  )}
                  <span
                    className={`hidden sm:inline-flex px-1.5 py-0.5 text-xs rounded font-medium ${getStatusClass(
                      lecture.status,
                    )}`}
                  >
                    {getStatusLabel(lecture.status)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-muted">
                    {formatDuration(lecture.durationMinutes)}
                  </span>
                </div>
              );

              return (
                <div key={lecture.id} className="space-y-1">
                  {accessible ? (
                    <Link
                      href={`/${locale}/learning/courses/${courseId}/lectures/${lecture.id}`}
                      className="block"
                    >
                      {lectureRow}
                    </Link>
                  ) : (
                    lectureRow
                  )}

                {lecture.quiz && (
                  <div className="ml-8 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-600 dark:text-muted">
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="h-3 w-3 text-primary"
                    />
                    <span className="flex-1 line-clamp-1">{lecture.quiz.title}</span>
                    <span className={`px-1.5 py-0.5 rounded ${getStatusClass(lecture.quiz.status)}`}>
                      {getStatusLabel(lecture.quiz.status)}
                    </span>
                  </div>
                )}
              </div>
              );
            })
          ) : (
            <p className="py-2 text-center text-xs text-gray-500 dark:text-muted">
              No published lectures yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionAccordion;
