import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faClock,
  faUsers,
  faGraduationCap,
  faCheck,
  faLanguage,
  faClosedCaptioning,
  faBookOpen,
  faListCheck,
  faUserTie,
  faTag,
  faBolt,
  faMedal,
} from "@fortawesome/free-solid-svg-icons";
import { getTranslations, getLocale } from "next-intl/server";
import { CourseLevel } from "@/types/enums/CourseLevel.enum";
import SectionAccordion from "@/components/courseDetail/SectionAcordion";
import PurchaseCard from "@/components/courseDetail/PurchaseCard";
import { getServerApiBaseUrl } from "@/lib/apiClient";

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

const MOCK_REVIEWS = [
  { id: "r1", name: "Michael Chen", avatar: "MC", rating: 5, date: "2 weeks ago", content: "This is absolutely the best web development course I've ever taken. Angela's teaching style is so clear and engaging. I went from zero to building full-stack apps!" },
  { id: "r2", name: "Priya Patel", avatar: "PP", rating: 5, date: "1 month ago", content: "Incredible value for money. The projects are real-world and the instructor explains everything so well. Got my first dev job after finishing this course." },
  { id: "r3", name: "Thomas Mueller", avatar: "TM", rating: 4, date: "3 months ago", content: "Great course overall. Some sections could be a bit more concise but the depth of content is unmatched. Highly recommend for beginners." },
];

const getLevelLabel = (level: CourseLevel): string => {
  const map: Record<CourseLevel, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced", ALL_LEVELS: "All Levels" };
  return map[level];
};

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
  const cls = size === "lg" ? "w-4 h-4" : size === "md" ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon key={i} icon={faStar} className={`${cls} ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
      ))}
    </div>
  );
}

const CourseDetailPage = async ({params}: {params: Promise<{id: string}>}) => {
  const t = await getTranslations("CourseDetailPage");
  const locale = await getLocale();
  const { id } = await params;

  const courseResponse = await fetch(`${getServerApiBaseUrl()}/courses/${id}`, {
    next: { revalidate: 60 },
  });
  const data = await courseResponse.json();
  const course = data.result as CourseResponse;
  console.log("Fetched course data:", course);

  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-white dark:bg-bg">
      {/* Breadcrumb + Hero */}
      <div className="bg-gray-900 dark:bg-surface text-white">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 pt-5 pb-7">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">{t("breadcrumb.home")}</Link>
            <span>/</span>
            <Link href={`/${locale}/courses`} className="hover:text-white transition-colors">{t("breadcrumb.courses")}</Link>
            <span>/</span>
            <span className="text-gray-300">{course.category.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_380px] gap-7 items-start">
            {/* Left: Course Info */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {course.isBestseller && (
                  <span className="px-2.5 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                    <FontAwesomeIcon icon={faMedal} className="w-2.5 h-2.5" /> Bestseller
                  </span>
                )}
                {course.isNew && (
                  <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <FontAwesomeIcon icon={faBolt} className="w-2.5 h-2.5" /> New
                  </span>
                )}
                <span className="px-2.5 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                  {course.category.name}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3.5 leading-tight">
                {course.title}
              </h1>

              <p className="text-gray-300 mb-5 text-sm leading-relaxed max-w-xl">
                {course.description}
              </p>

              {/* Rating Row */}
              <div className="flex flex-wrap items-center gap-3.5 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 font-bold text-base">{course.averageRating.toFixed(1)}</span>
                  <StarRating rating={course.averageRating} size="md" />
                  <span className="text-gray-400 text-xs">({course.totalReviews.toLocaleString()} {t("reviews")})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                  <span>{course.totalStudents.toLocaleString()} {t("students")}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-1.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                  {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t("createdBy")}</p>
                  <p className="text-primary font-medium text-xs">{course.instructor.firstName} {course.instructor.lastName}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faGraduationCap} className="w-3 h-3" />
                  {getLevelLabel(course.level)}
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                  {formatDuration(course.durationMinutes)} {t("totalHours")}
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faLanguage} className="w-3 h-3" />
                  {course.language}
                </span>
                {course.hasCaptions && (
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClosedCaptioning} className="w-3 h-3" />
                    CC
                  </span>
                )}
              </div>
            </div>

            {/* Right: Purchase Card — hidden on mobile (shown below) */}
            {/* <div className="hidden lg:block">
              <PurchaseCard course={course} enrolled={enrolled} setEnrolled={setEnrolled} discount={discount} t={t} />
            </div> */}
          </div>
        </div>
      </div>

      {/* Mobile Purchase Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-surface border-b border-gray-200 dark:border-border shadow-md px-3.5 py-2.5 flex items-center justify-between">
        <div>
          {course.isFree ? (
            <span className="text-lg font-bold text-emerald-600">Free</span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900 dark:text-text">${course.price}</span>
              <span className="text-xs text-gray-400 line-through">${course.originalPrice}</span>
            </div>
          )}
        </div>
        {/* <button
          onClick={() => setEnrolled(true)}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${enrolled ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
        >
          {enrolled ? t("enrolled") : course.isFree ? t("enrollFree") : t("enrollNow")}
        </button> */}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-9">
        <div className="grid lg:grid-cols-[1fr_380px] gap-9">
          {/* Left Column */}
          <div className="space-y-9">
            {/* What you'll learn */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-4 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faListCheck} className="w-4 h-4 text-primary" />
                {t("whatYouLearn")}
              </h2>
              <div className="bg-gray-50 dark:bg-surface border border-gray-200 dark:border-border rounded-xl p-5 grid sm:grid-cols-2 gap-2.5">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FontAwesomeIcon icon={faCheck} className="w-2 h-2 text-primary" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-primary" />
                {t("courseContent")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-muted mb-4">
                {course.totalSections} {t("sections")} • {course.totalLectures} {t("lectures")} • {formatDuration(course.totalVideoLengthMinutes)} {t("totalLength")}
              </p>
              <div className="space-y-1.5">
                {MOCK_SECTIONS.map((section) => (
                  <SectionAccordion key={section.id} section={section} />
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-3.5">{t("requirements")}</h2>
              <ul className="space-y-1.5">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-muted">
                    <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-4 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUserTie} className="w-4 h-4 text-primary" />
                {t("instructor")}
              </h2>
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-text">{course.instructor.firstName} {course.instructor.lastName}</h3>
                  <p className="text-primary text-xs mb-2.5">Senior Web Developer & Instructor</p>
                  <div className="flex flex-wrap gap-3.5 text-xs text-gray-600 dark:text-muted mb-2.5">
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-400" />4.8 Rating</span>
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faUsers} className="w-3 h-3" />100K+ Students</span>
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faBookOpen} className="w-3 h-3" />12 Courses</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-muted leading-relaxed">
                    An experienced developer and instructor with over 10 years of industry experience. Known for clear, project-based teaching and an ability to make complex topics approachable for beginners and seasoned developers alike.
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text mb-4">{t("studentReviews")}</h2>

              {/* Rating Summary */}
              <div className="flex items-center gap-5 mb-7 p-4 bg-gray-50 dark:bg-surface rounded-xl border border-gray-200 dark:border-border">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-text">{course.averageRating.toFixed(1)}</div>
                  <StarRating rating={course.averageRating} size="lg" />
                  <p className="text-xs text-gray-500 dark:text-muted mt-1">Course Rating</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 2}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 w-14">
                        <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-yellow-400" />
                        <span className="text-xs text-gray-600 dark:text-muted">{star}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="flex gap-3.5 pb-4 border-b border-gray-100 dark:border-border last:border-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-text text-xs">{review.name}</span>
                        <span className="text-xs text-gray-400 dark:text-muted">{review.date}</span>
                      </div>
                      <StarRating rating={review.rating} />
                      <p className="text-xs text-gray-700 dark:text-muted mt-1.5 leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tags */}
            <section>
              <h2 className="text-base font-bold text-gray-900 dark:text-text mb-2.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 text-primary" />
                {t("tags")}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {course.tags.map((tag) => (
                  <span key={tag.id} className="px-2.5 py-1 bg-gray-100 dark:bg-surface text-gray-700 dark:text-muted text-xs rounded-md border border-gray-200 dark:border-border hover:border-primary hover:text-primary transition-colors cursor-pointer">
                    {tag.name}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Sticky Purchase Card — Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-5">
              <PurchaseCard course={course} discount={discount} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
