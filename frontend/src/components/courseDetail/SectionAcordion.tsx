"use client";

import { faChevronUp, faChevronDown, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const MOCK_SECTIONS = [
  { id: "s1", title: "Introduction to Web Development", lectures: 8, duration: 45, preview: true },
  { id: "s2", title: "HTML Fundamentals", lectures: 22, duration: 180, preview: false },
  { id: "s3", title: "CSS & Styling", lectures: 28, duration: 240, preview: false },
  { id: "s4", title: "JavaScript Basics", lectures: 35, duration: 300, preview: false },
  { id: "s5", title: "Advanced JavaScript", lectures: 42, duration: 360, preview: false },
  { id: "s6", title: "React Framework", lectures: 48, duration: 420, preview: false },
  { id: "s7", title: "Node.js & Express", lectures: 38, duration: 330, preview: false },
  { id: "s8", title: "Databases & SQL", lectures: 30, duration: 265, preview: false },
];

const SectionAccordion = ({ section }: { section: typeof MOCK_SECTIONS[0] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-surface hover:bg-gray-100 dark:hover:bg-border transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="font-semibold text-gray-900 dark:text-text text-xs">{section.title}</span>
          {section.preview && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">Preview</span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-muted flex-shrink-0 ml-3.5">
          {section.lectures} lectures • {formatDuration(section.duration)}
        </span>
      </button>
      {open && (
        <div className="p-3.5 space-y-1.5">
          {Array.from({ length: Math.min(section.lectures, 4) }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-surface group">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-border flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10">
                <FontAwesomeIcon icon={faPlay} className="w-2 h-2 text-gray-500 dark:text-muted group-hover:text-primary" />
              </div>
              <span className="text-xs text-gray-700 dark:text-muted flex-1">Lecture {i + 1}: {["Introduction", "Core Concepts", "Practice Exercise", "Summary"][i]}</span>
              <span className="text-xs text-gray-400 dark:text-muted">~{Math.floor(section.duration / section.lectures)}m</span>
            </div>
          ))}
          {section.lectures > 4 && (
            <p className="text-xs text-gray-500 dark:text-muted text-center py-1">+{section.lectures - 4} more lectures</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SectionAccordion;