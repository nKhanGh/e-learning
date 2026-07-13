"use client";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/enums/UserRole.enum";
import {
  faBook,
  faChartBar,
  faChevronRight,
  faGear,
  faGraduationCap,
  faHome,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import InstructorSidebar from "./InstructorSidebar";

const Sidebar = ({ open }: { open: boolean }) => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Common');
  const { user } = useAuth();

  if (user?.role === UserRole.INSTRUCTOR) {
    return <InstructorSidebar open={open} />;
  }

  if (user?.role === UserRole.ADMIN) {
    return <AdminSidebar open={open} />;
  }

  const sidebarItems = [
  {
    title: t('home'),
    icon: faHome,
    link: "/",
  },
  {
    title: t('dashboard'),
    icon: faChartBar,
    link: "/dashboard",
  },
  {
    title: t('courses'),
    icon: faBook,
    link: "/courses",
  },
  {
    title: t('myLearning'),
    icon: faGraduationCap,
    link: "/learning",
  },
  {
    title: t('profile'),
    icon: faUser,
    link: "/profile",
  },
];

  return (
    <div
      className={`px-2.5 py-5 fixed top-14 left-0 ${open ? "w-48" : "w-14"} transition-all duration-300 h-full bg-white dark:bg-gray-900 shadow-sm flex flex-col`}
    >
      {sidebarItems.map((item) => (
        <Link
          key={item.title}
          href={`/${locale}${item.link}`}
          className={`flex items-center gap-2.5 mb-2.5 p-2 rounded-md cursor-pointer group text-sm
                ${pathname.endsWith(item.link) || (item.link === "/" && pathname === `/${locale}`) ? "bg-blue-50 dark:bg-gray-700 text-primary" : "text-gray-600 dark:text-gray-300"}
                `}
        >
          <i>
            <FontAwesomeIcon
              icon={item.icon}
              className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 group-hover:text-primary"
            />
          </i>
          {open && (
            <div className="text-gray-800 dark:text-gray-200 font-medium flex items-center w-full group-hover:text-primary transition-all duration-300">
              {item.title}
              <FontAwesomeIcon
                icon={faChevronRight}
                className="w-3 h-3 text-gray-600 dark:text-gray-300 ml-auto transition-transform group-hover:translate-x-1 group-hover:text-primary"
              />
            </div>
          )}
        </Link>
      ))}
      <Link href={`/${locale}/settings`} className="mt-auto h-8">
        <div
          className={`flex items-center gap-2.5 mt-auto p-2 rounded-md cursor-pointer group text-sm
                ${pathname === "/settings" ? "bg-blue-50 dark:bg-gray-700 text-primary" : "text-gray-600 dark:text-gray-300"}
                `}
        >
          <i>
            <FontAwesomeIcon
              icon={faGear}
              className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 group-hover:text-primary"
            />
          </i>
          {open && (
            <div className="text-gray-800 dark:text-gray-200 font-medium flex items-center w-full group-hover:text-primary">
              {t('settings')}
              <FontAwesomeIcon
                icon={faChevronRight}
                className="w-3 h-3 text-gray-600 dark:text-gray-300 ml-auto transition-transform group-hover:translate-x-1 group-hover:text-primary"
              />
            </div>
          )}
        </div>
      </Link>
      <button className="flex items-center gap-2.5 mt-1 mb-12 p-2 rounded-md cursor-pointer group h-8 text-sm">
        <i>
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 group-hover:text-primary"
          />
        </i>
        {open && (
          <div className="text-gray-800 dark:text-gray-200 font-medium flex items-center w-full group-hover:text-primary">
            {t('logout')}
          </div>
        )}
      </button>
    </div>
  );
};

export default Sidebar;
