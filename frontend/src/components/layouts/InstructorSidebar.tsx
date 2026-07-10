"use client";

import {
  faBookOpen,
  faChartLine,
  faChevronRight,
  faComments,
  faDollarSign,
  faGear,
  faHome,
  faMessage,
  faPenToSquare,
  faRightFromBracket,
  faStar,
  faUserCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutModal from "../auth/LogoutModal";

type InstructorSidebarProps = {
  open: boolean;
};

const instructorItems = [
  {
    key: "home",
    icon: faHome,
    link: "/",
  },
  {
    key: "dashboard",
    icon: faChartLine,
    link: "/instructor/dashboard",
  },
  {
    key: "myCourses",
    icon: faBookOpen,
    link: "/instructor/courses",
  },
  {
    key: "courseStudio",
    icon: faPenToSquare,
    link: "/instructor/studio",
  },
  {
    key: "students",
    icon: faUsers,
    link: "/instructor/students",
  },
  {
    key: "discussions",
    icon: faComments,
    link: "/instructor/discussions",
  },
  {
    key: "reviews",
    icon: faStar,
    link: "/instructor/reviews",
  },
  {
    key: "revenue",
    icon: faDollarSign,
    link: "/instructor/revenue",
  },
  {
    key: "messages",
    icon: faMessage,
    link: "/chat",
  },
  {
    key: "profile",
    icon: faUserCheck,
    link: "/profile",
  },
];

const isActivePath = (pathname: string, locale: string, link: string) => {
  const localizedPath = `/${locale}${link}`;
  return pathname === localizedPath || pathname.startsWith(`${localizedPath}/`);
};

const InstructorSidebar = ({ open }: InstructorSidebarProps) => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Common");
  const instructorT = useTranslations("InstructorSidebar");
  const [openLogout, setOpenLogout] = useState(false);
  const settingsActive = isActivePath(pathname, locale, "/instructor/settings");

  return (
    <>
      <div
        className={`fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col border-r border-gray-100 bg-white px-2.5 py-4 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          open ? "w-48" : "w-14"
        }`}
      >
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-3">
          {instructorItems.map((item) => {
            const active = isActivePath(pathname, locale, item.link);

            return (
              <Link
                key={item.key}
                href={`/${locale}${item.link}`}
                title={open ? undefined : instructorT(`items.${item.key}`)}
                className={`group flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`h-3.5 w-3.5 shrink-0 ${
                    active
                      ? "text-primary"
                      : "text-gray-500 group-hover:text-primary dark:text-gray-400"
                  }`}
                />
                {open && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold leading-tight">
                        {instructorT(`items.${item.key}`)}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="h-3 w-3 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pb-10">
          <Link
            href={`/${locale}/settings`}
            title={open ? undefined : t("settings")}
            className={`group flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors ${
              settingsActive
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <FontAwesomeIcon
              icon={faGear}
              className={`h-3.5 w-3.5 shrink-0 ${
                settingsActive
                  ? "text-primary"
                  : "text-gray-500 group-hover:text-primary dark:text-gray-400"
              }`}
            />
            {open && (
              <div className="flex min-w-0 flex-1 items-center">
                <span className="truncate text-xs font-semibold">
                  {t("settings")}
                </span>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="ml-auto h-3 w-3 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
            )}
          </Link>
          <button
            type="button"
            title={open ? undefined : t("logout")}
            onClick={() => setOpenLogout(true)}
            className="group flex h-9 items-center gap-2 rounded-md px-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="h-3.5 w-3.5 shrink-0 text-gray-500 group-hover:text-primary dark:text-gray-400"
            />
            {open && (
              <span className="truncate text-xs font-semibold">
                {t("logout")}
              </span>
            )}
          </button>
        </div>
      </div>
      <LogoutModal open={openLogout} onClose={() => setOpenLogout(false)} />
    </>
  );
};

export default InstructorSidebar;
