"use client";
import { useOpenAuth } from "@/contexts/OpenAuthContext";
import {
  faChevronRight,
  faCircleUser,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bell, ChevronDown, List, MessageCircleMore } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import LogoutModal from "../auth/LogoutModal";

const Header = ({openSidebar, setOpenSidebar} : {openSidebar: boolean, setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const [openBoard, setOpenBoard] = useState<boolean>(false);
  const [openLogout, setOpenLogout] = useState<boolean>(false);
  const {isLoggedIn, user} = useAuth();

  const locale = useLocale();

  const {openLogin, setOpenLogin, openSignUp, setOpenSignUp} = useOpenAuth();
  const t = useTranslations('Common');

  return (
    <>
    <div className="fixed top-0 left-0 w-full h-14 bg-white dark:bg-gray-900 shadow-sm flex items-center z-40 px-3">
      <button
      onClick={() => setOpenSidebar(!openSidebar)}
      className="mr-4 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full cursor-pointer p-2 hover:text-primary focus:bg-blue-100 dark:focus:bg-gray-700 focus:text-primary">
        <List className="w-4 h-4" />
      </button>
      <Link href={`/${locale}`} className="flex items-center gap-1.5">
        <Image src="/logo_blue.png" alt="Logo" width={112} height={32} />
      </Link>
      <button className="ml-auto mr-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full cursor-pointer p-2 hover:text-primary focus:bg-blue-100 dark:focus:bg-gray-700 focus:text-primary">
        <Bell className="w-4 h-4" />
      </button>
      <Link href={`/${locale}/chat`}  className="mr-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full cursor-pointer p-2 hover:text-primary focus:bg-blue-100 dark:focus:bg-gray-700 focus:text-primary">
        <MessageCircleMore className="w-4 h-4" />
      </Link>
      {isLoggedIn && user ? (
        <div className="h-11 relative flex items-center rounded-md bg-gray-100 dark:bg-gray-800 py-2 px-3 gap-2.5">
          <Image
            src={user.profile?.avatarUrl || "/default-avatar.jpg"}
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full border-2 box-content border-white"
          />
          <div>
            <p className="text-sm font-bold leading-tight">{user?.firstName}{" "}{user?.lastName}</p>
            <p className="text-[11px] font-bold leading-tight text-primary">{user?.role}</p>
          </div>
          <button
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full cursor-pointer"
            onClick={() => setOpenBoard(!openBoard)}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {openBoard && (
            <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-1">
              <div className="bg-gray-100 dark:bg-gray-700 p-1 mb-2.5 rounded-md min-w-60">
                <div className="flex gap-1.5 p-2.5">
                  <Image
                    src={user.profile?.avatarUrl || "/default-avatar.jpg"}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full border-2 box-content border-white"
                  />
                  <div>
                    <p className="text-sm font-bold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-300"></div>
                <button className="block w-full text-left px-2.5 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg mt-1 hover:bg-gray-300 dark:hover:bg-gray-500 justify-center text-xs">
                  <FontAwesomeIcon icon={faCircleUser} className="mr-1.5 w-3 h-3" />
                  {t('viewProfile')}
                </button>
              </div>
              <Link
                href="/settings"
                className="w-full text-left px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 mb-1 rounded-sm flex items-center text-xs"
              >
                <FontAwesomeIcon icon={faGear} className="mr-2.5 w-3 h-3" />
                {t('settings')}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="mr-1 ml-auto w-3 h-3"
                />
              </Link>
              <button 
              className="w-full text-left px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-sm flex items-center justify-start text-xs"
              onClick={() => setOpenLogout(true)}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2.5 w-3 h-3" />
                {t('logout')}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="mr-1 ml-auto w-3 h-3"
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
          className="bg-primary w-24 h-8 text-white text-xs rounded-lg cursor-pointer mr-2.5 hover:bg-blue-600 justify-center"
            onClick={() => setOpenSignUp(true)}
          >
            {t('signup')}
          </button>
          <button
            className="bg-gray-300 w-24 h-8 text-primary text-xs border-2 hover:border-blue-600 hover:text-white box-border rounded-lg cursor-pointer mr-2.5 hover:bg-blue-600 justify-center"
            onClick={() => setOpenLogin(true)}
          >
            {t('login')}
          </button>
        </>
      )}
      {(openLogin || openSignUp) && <AuthModal />}
    </div>
    {openLogout && <LogoutModal open={openLogout} onClose={() => setOpenLogout(false)} />}
    </>
  );
};
export default Header;
