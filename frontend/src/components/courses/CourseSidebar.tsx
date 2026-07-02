import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Loading from "../ui/Loading";

const getLevelLabel = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    ALL_LEVELS: "All Levels",
  };
  return map[level];
};

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-border pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-2.5 group"
      >
        <span className="font-semibold text-gray-900 dark:text-text text-xs">
          {title}
        </span>

        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-2.5 h-2.5 text-gray-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-1.5">{children}</div>
      </div>
    </div>
  );
};

const CourseSidebar = ({
  filters,
  setFilters,
  courseCategories,
  onApplyFilters,
  loading,
}: {
  filters: CourseSearchRequest;
  setFilters: React.Dispatch<React.SetStateAction<CourseSearchRequest>>;
  courseCategories: CourseCategoryResponse[];
  onApplyFilters: () => void;
  loading: boolean;
}) => {
  const t = useTranslations("CoursesPage");

  const toggleCategory = (id: string) => {
    setFilters((f) => ({
      ...f,
      categoryId: f.categoryId.includes(id)
        ? f.categoryId.filter((c) => c !== id)
        : [...f.categoryId, id],
    }));
  };

  return (
    <div className="space-y-0">
      {/* Category */}
      <FilterSection title={t("filter.category")}>
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {courseCategories?.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.categoryId.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-gray-700 dark:text-muted group-hover:text-gray-900 dark:group-hover:text-text transition-colors">
                {cat.iconUrl} {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Level */}
      <FilterSection title={t("filter.level")}>
        <div className="space-y-1.5">
          {(
            [null, "BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"] as const
          )?.map((lvl) => (
            <label
              key={lvl ?? "all"}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="level"
                checked={filters.level === lvl}
                onChange={() => setFilters((f) => ({ ...f, level: lvl }))}
                className="w-3.5 h-3.5 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-gray-700 dark:text-muted group-hover:text-gray-900 dark:group-hover:text-text transition-colors">
                {lvl === null
                  ? t("filter.allLevels")
                  : getLevelLabel(lvl as CourseLevel)}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title={t("filter.price")}>
        <div className="space-y-1.5">
          {([null, true, false] as const).map((val) => (
            <label
              key={String(val)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="isFree"
                checked={filters.isFree === val}
                onChange={() => setFilters((f) => ({ ...f, isFree: val }))}
                className="w-3.5 h-3.5 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-gray-700 dark:text-muted group-hover:text-gray-900 dark:group-hover:text-text transition-colors">
                {val === null
                  ? t("filter.allPrices")
                  : val
                    ? t("filter.free")
                    : t("filter.paid")}
              </span>
            </label>
          ))}
          {filters.isFree === false && (
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {/* MIN */}
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full bg-transparent border border-primary rounded-lg px-2.5 py-1 focus:outline-none focus:border-green-primary hover:border-green-primary"
                min={0}
              />

              {/* MAX */}
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full bg-transparent border border-primary rounded-lg px-2.5 py-1 focus:outline-none focus:border-green-primary hover:border-green-primary"
                min={filters.maxPrice || 0}
              />
            </div>
          )}
        </div>
      </FilterSection>
      <FilterSection title={t("filter.rating")} defaultOpen={false}>
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {/* MIN */}
              <input
                type="number"
                placeholder="Min"
                value={filters.minAverageRating || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minAverageRating: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full bg-transparent border border-primary rounded-lg px-2.5 py-1 focus:outline-none focus:border-green-primary hover:border-green-primary"
                min={0}
              />

              {/* MAX */}
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAverageRating || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxAverageRating: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full bg-transparent border border-primary rounded-lg px-2.5 py-1 focus:outline-none focus:border-green-primary hover:border-green-primary"
                min={filters.maxAverageRating || 0}
              />
            </div>
      </FilterSection>

      {/* Features */}
      <FilterSection title={t("filter.features")} defaultOpen={false}>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.hasQuiz === true}
              onChange={() =>
                setFilters((f) => ({
                  ...f,
                  hasQuiz: f.hasQuiz === true ? null : true,
                }))
              }
              className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-xs text-gray-700 dark:text-muted group-hover:text-gray-900 dark:group-hover:text-text transition-colors">
              {t("filter.hasQuiz")}
            </span>
          </label>
        </div>
      </FilterSection>
      <button
        onClick={onApplyFilters}
        className="w-full mt-5 py-2.5 bg-primary text-white rounded-lg font-semibold flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {loading ? <Loading size="smd" color="blue" /> :
          t("filter.search")
        }
      </button>
    </div>
  );
};

export default CourseSidebar;
