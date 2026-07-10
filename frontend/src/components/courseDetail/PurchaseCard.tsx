"use client";

import { useOpenAuth } from "@/contexts/OpenAuthContext";
import {
  faBookOpen,
  faCertificate,
  faCheck,
  faClock,
  faInfinity,
  faLock,
  faPlay,
  faQuestionCircle,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";

const PurchaseCard = ({
  course,
  discount,
  enrollmentStatus,
  enrolling,
  onEnroll,
}: {
  course: CourseResponse;
  discount: number;
  enrollmentStatus?: CourseEnrollmentStatusResponse;
  enrolling?: boolean;
  onEnroll: () => void;
}) => {
  const t = useTranslations("CourseDetailPage");
  const { setOpenLogin } = useOpenAuth();
  const completed = Boolean(enrollmentStatus?.completed);
  const enrolled = Boolean(enrollmentStatus?.enrolled);
  const locked = Boolean(enrollmentStatus?.locked);
  const authenticated = Boolean(enrollmentStatus?.authenticated);

  const getButtonContent = () => {
    if (completed) {
      return (
        <span className="flex items-center justify-center gap-1.5">
          <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }

    if (enrolled) {
      return (
        <span className="flex items-center justify-center gap-1.5">
          <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
          {t("enrolled")}
        </span>
      );
    }

    if (!authenticated) {
      return (
        <span className="flex items-center justify-center gap-1.5">
          <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5" />
          {course.isFree ? t("enrollFree") : t("enrollNow")}
        </span>
      );
    }

    return course.isFree ? t("enrollFree") : t("enrollNow");
  };

  const handleEnroll = () => {
    if (completed || enrolled || enrolling) return;
    if (!authenticated) {
      setOpenLogin(true);
      return;
    }

    onEnroll();
  };

  return (
    <div className="bg-white dark:bg-surface rounded-xl shadow-2xl border border-gray-200 dark:border-border overflow-hidden">
      <div className="relative h-40 bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
          <FontAwesomeIcon
            icon={locked ? faLock : faPlay}
            className="w-4 h-4 text-primary ml-1"
          />
        </div>
        <span className="absolute bottom-2.5 text-white/80 text-xs">
          {locked ? "Locked preview" : t("previewVideo")}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-2.5 mb-3.5">
          {course.isFree ? (
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              Free
            </span>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900 dark:text-text">
                ${course.price}
              </span>
              {course.originalPrice && (
                <span className="text-base text-gray-400 dark:text-muted line-through">
                  ${course.originalPrice}
                </span>
              )}
              {discount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded">
                  {discount}% off
                </span>
              )}
            </>
          )}
        </div>

        {enrollmentStatus && (
          <div className="mb-3.5 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-border dark:text-muted">
            {completed
              ? "Course completed"
              : enrolled
                ? `${Math.round(Number(enrollmentStatus.progressPercentage ?? 0))}% completed`
                : course.isFree
                  ? "Free course"
                  : "Enrollment required"}
          </div>
        )}

        <button
          type="button"
          onClick={handleEnroll}
          disabled={completed || enrolled || enrolling}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all mb-2.5 flex items-center justify-center disabled:cursor-default ${
            completed || enrolled
              ? "bg-emerald-500 text-white"
              : "bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/30"
          }`}
        >
          {enrolling ? "Enrolling..." : getButtonContent()}
        </button>

        {!course.isFree && (
          <p className="text-xs text-center text-gray-500 dark:text-muted mb-4">
            {t("moneyBack")}
          </p>
        )}

        <div className="space-y-2.5 pt-3.5 border-t border-gray-100 dark:border-border">
          <p className="font-semibold text-gray-900 dark:text-text text-xs">
            {t("includes")}
          </p>
          {[
            {
              icon: faClock,
              text: `${Math.floor(course.totalVideoLengthMinutes / 60)}h ${t("videoContent")}`,
            },
            { icon: faInfinity, text: t("fullAccess") },
            {
              icon: faBookOpen,
              text: `${course.totalLectures} ${t("lectures")}`,
            },
            ...(course.hasCertificate
              ? [{ icon: faCertificate, text: t("certificate") }]
              : []),
            ...(course.hasQuizzes
              ? [{ icon: faQuestionCircle, text: t("quizzes") }]
              : []),
          ].map((item) => (
            <div
              key={item.icon.iconName}
              className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-muted"
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="w-3.5 h-3.5 text-gray-400 dark:text-muted shrink-0"
              />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button className="w-full mt-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-gray-700 dark:text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5">
          <FontAwesomeIcon icon={faShareNodes} className="w-3 h-3" />
          {t("share")}
        </button>
      </div>
    </div>
  );
};

export default PurchaseCard;
