export const checklistItems = [
  "basicInfo",
  "thumbnail",
  "sections",
  "lectures",
  "pricing",
] as const;

export type ChecklistItem = (typeof checklistItems)[number];

export type StudioChecklist = Record<ChecklistItem, boolean>;

export type StudioSection = CourseSectionResponse & {
  lectures: CourseCurriculumLecture[];
};
