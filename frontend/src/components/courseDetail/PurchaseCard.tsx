"use client";

import { enrollmentService } from "@/services/enrollment.service";
import {
  faPlay,
  faCheck,
  faClock,
  faInfinity,
  faBookOpen,
  faCertificate,
  faQuestionCircle,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { tr } from "framer-motion/m";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const PurchaseCard = ({
  course,
  discount,
}: {
  course: CourseResponse;
  discount: number;
}) => {
  const t = useTranslations("CourseDetailPage");
  const enrollButtonText = course.isFree ? t("enrollFree") : t("enrollNow");
  const [enrolled, setEnrolled] = useState(false);

  const fetchEnrollment = async () => {
    try{
      await enrollmentService.getMyEnrollment(course.id);
      setEnrolled(true);
    } catch(err){
      setEnrolled(false);
      console.log("Not enrolled or error fetching enrollment:", err);
    }
  }

  useEffect(() => {
    fetchEnrollment();
  },[])

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-border overflow-hidden">
      {/* Preview */}
      <div className="relative h-44 bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
          <FontAwesomeIcon
            icon={faPlay}
            className="w-5 h-5 text-primary ml-1"
          />
        </div>
        <span className="absolute bottom-3 text-white/80 text-xs">
          {t("previewVideo")}
        </span>
      </div>

      <div className="p-6">
        {/* Price */}
        <div className="flex items-baseline gap-3 mb-4">
          {course.isFree ? (
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              Free
            </span>
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-900 dark:text-text">
                ${course.price}
              </span>
              <span className="text-lg text-gray-400 dark:text-muted line-through">
                ${course.originalPrice}
              </span>
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setEnrolled(true)}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all mb-3 flex items-center justify-center ${
            enrolled
              ? "bg-emerald-500 text-white cursor-default"
              : "bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/30"
          }`}
        >
          {enrolled ? (
            <span className="flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />{" "}
              {t("enrolled")}
            </span>
          ) : (
            enrollButtonText
          )}
        </button>

        {!course.isFree && (
          <p className="text-xs text-center text-gray-500 dark:text-muted mb-5">
            {t("moneyBack")}
          </p>
        )}

        {/* Course Includes */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-border">
          <p className="font-semibold text-gray-900 dark:text-text text-sm">
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
          ].map((item, i) => (
            <div
              key={item.icon.iconName}
              className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted"
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="w-4 h-4 text-gray-400 dark:text-muted shrink-0"
              />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 rounded-xl border border-gray-200 dark:border-border text-sm text-gray-700 dark:text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faShareNodes} className="w-3.5 h-3.5" />
          {t("share")}
        </button>
      </div>
    </div>
  );
};

export default PurchaseCard;
