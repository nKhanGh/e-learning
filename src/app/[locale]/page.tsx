// app/page.tsx
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faArrowRight,
  faCheck,
  faStar,
  faQuoteLeft,
  faBookOpen,
  faGraduationCap,
  faCertificate,
  faChartLine,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { getLocale, getTranslations } from "next-intl/server";
import GetStatedButton from "@/components/home/GetStatedButton";

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  const res = await fetch(
    "http://localhost:8080/api/courses/search?page=0&size=6",
  );
  const data = await res.json();
  const locale = await getLocale();
  const courses = data.result.items as CourseResponse[];
  console.log(courses);

  const features = [
    {
      icon: faBookOpen,
      title: t('features.learnPace.title'),
      description:
        t('features.learnPace.description'),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: faGraduationCap,
      title: t('features.experts.title'),
      description:
        t('features.experts.description'),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: faCertificate,
      title: t('features.certified.title'),
      description:
        t('features.certified.description'),
      color: "from-orange-500 to-red-500",
    },
    {
      icon: faChartLine,
      title: t('features.progress.title'),
      description:
        t('features.progress.description'),
      color: "from-green-500 to-emerald-500",
    },
  ];

  const stats = [
    { value: "10K+", label: t('stats.students') },
    { value: "50+", label: t('stats.instructors') },
    { value: "99.9%", label: t('stats.courses') },
    { value: "24/7", label: t('stats.certificates') },
  ];

  const testimonials = [
    {
      name: "Michael Chen",
      role: "Software Engineer at Google",
      avatar: "MC",
      content:
        "The courses here changed my career trajectory. I went from a beginner to landing my dream job at Google in just 6 months!",
      rating: 5,
      course: "Web Development Bootcamp",
    },
    {
      name: "Sarah Williams",
      role: "UX Designer at Adobe",
      avatar: "SW",
      content:
        "Incredible instructors and comprehensive content. The UI/UX course gave me the skills I needed to break into the industry.",
      rating: 5,
      course: "UI/UX Design Masterclass",
    },
    {
      name: "David Kumar",
      role: "Data Scientist",
      avatar: "DK",
      content:
        "Best investment in my education. The Python course was thorough, practical, and the instructor was always helpful.",
      rating: 5,
      course: "Python for Data Science",
    },
  ];


  return (
    <div className="min-h-screen bg-white dark:bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-bg dark:via-surface dark:to-bg">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-text mb-6 leading-tight">
                {t('title')}
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                  {t('titleNext')}
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-muted mb-8 max-w-2xl mx-auto lg:mx-0">
                {t('subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <GetStatedButton />
                <Link
                  href={`/${locale}/courses`}
                  className="px-8 py-4 bg-white dark:bg-surface border-2 border-gray-200 dark:border-border hover:border-primary dark:hover:border-primary text-gray-900 dark:text-text font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {t('watchCourse')}
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary border-2 border-white dark:border-bg flex items-center justify-center text-white font-semibold text-sm"
                    >
                      {String.fromCodePoint(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {new Array(5).map((a) => (
                      <FontAwesomeIcon
                        key={a}
                        icon={faStar}
                        className="w-4 h-4 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-muted">
                    {t('love')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration/Image */}
            <div className="relative lg:h-125 hidden lg:block">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary/20 rounded-3xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-linear-to-tl from-accent/20 to-primary/20 rounded-3xl transform -rotate-3"></div>
              <div className="relative bg-white dark:bg-surface rounded-3xl shadow-2xl p-8 h-full flex items-center justify-center border border-gray-200 dark:border-border">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-linear-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <FontAwesomeIcon
                      icon={faRocket}
                      className="text-7xl text-white"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-text mb-2">
                    {t('ready')}
                  </h3>
                  <p className="text-gray-600 dark:text-muted">
                    {t('start')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-surface border-y border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-text mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-muted max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.color}
                className="group bg-white dark:bg-surface rounded-2xl p-6 border border-gray-200 dark:border-border hover:border-transparent dark:hover:border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="w-7 h-7 text-white"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-muted text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 bg-white dark:bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-text mb-2">
                {t('courses.title')}
              </h2>
              <p className="text-gray-600 dark:text-muted">
                {t('courses.subtitle')}
              </p>
            </div>
            <Link
              href="/courses"
              className="mt-4 md:mt-0 text-primary hover:text-primary/80 font-semibold flex items-center gap-2 group"
            >
              {t('courses.viewAll')}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group bg-white dark:bg-bg rounded-2xl border border-gray-200 dark:border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
                  <img src={course.thumbnailUrl ?? './default-course-background.png'} alt={course.title} className="w-full h-full object-cover" />
                  {(course.isBestseller || course.isFeatured || course.isFree) && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      {course.isBestseller && "Bestseller"}
                      {course.isFeatured && "Featured"}
                      {course.isFree && "Free"}
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-muted flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      {course.durationMinutes} minutes
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-muted mb-4">
                    {course.instructor.firstName} {" "} {course.instructor.lastName}
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="w-4 h-4 text-yellow-400"
                      />
                      <span className="font-semibold text-gray-900 dark:text-text">
                        {course.averageRating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-muted">
                      ({course.totalEnrollments.toLocaleString()} students)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-border">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-text">
                        {course.price}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-muted line-through ml-2">
                        {course.originalPrice}
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-text mb-4">
              {t('stories.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-muted">
              {t('stories.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white dark:bg-surface rounded-2xl p-6 border border-gray-200 dark:border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-1 mb-4">
                  {new Array(testimonial.rating).map((rating) => (
                    <FontAwesomeIcon
                      key={rating}
                      icon={faStar}
                      className="w-4 h-4 text-yellow-400"
                    />
                  ))}
                </div>

                <div className="relative mb-4">
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    className="absolute -top-2 -left-2 w-8 h-8 text-primary/20"
                  />
                  <p className="text-gray-700 dark:text-text relative z-10 pl-6 mb-3">
                    {testimonial.content}
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Course: {testimonial.course}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-border">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-text">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-accent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="text-5xl text-white"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
             {t('cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={() => setOpenSignUp(true)}
              className="px-8 py-4 bg-white hover:bg-gray-100 text-primary font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-xl inline-flex items-center justify-center gap-2"
            >
              {t('cta.getStarted')}
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button> */}
            <Link
              href={`/${locale}/courses`}
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              {t('cta.browseCourses')}
              <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              <span>{t('cta.noCard')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              <span>{t('cta.cancelAnytime')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
