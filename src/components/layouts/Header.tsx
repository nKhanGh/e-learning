"use client";
import {
  faChevronRight,
  faCircleUser,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bell, ChevronDown, List, MessageCircleMore } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = ({openSidebar, setOpenSidebar} : {openSidebar: boolean, setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const [login, setLogin] = useState<boolean>(false);
  const [openBoard, setOpenBoard] = useState<boolean>(false);
  const t = useTranslations('Common');

  return (
    <div className="fixed top-0 left-0 w-full h-20 bg-white dark:bg-gray-900 shadow-md flex items-center z-50 px-4">
      <button
      onClick={() => setOpenSidebar(!openSidebar)}
      className="mr-8 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full cursor-pointer p-3 hover:text-primary focus:bg-blue-100 dark:focus:bg-gray-700 focus:text-primary">
        <List />
      </button>
      <Link href="/">
        <Image src="/logo_blue.png" alt="Logo" width={140} height={40} />
      </Link>
      <button className="ml-auto mr-4 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full cursor-pointer p-3 hover:text-primary focus:bg-blue-100 dark:focus:bg-gray-700 focus:text-primary">
        <Bell />
      </button>
      <button className="mr-6 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full cursor-pointer p-3 hover:text-primary focus:bg-blue-100 dark:focus:bg-gray-700 focus:text-primary">
        <MessageCircleMore />
      </button>
      {login ? (
        <div className="h-16 relative flex items-center rounded-xl bg-gray-100 dark:bg-gray-800 py-4 px-6 gap-4">
          <Image
            src="/default-avatar.jpg"
            alt="User Avatar"
            width={40}
            height={32}
            className="rounded-full border-4 box-content border-white"
          />
          <div>
            <p className="font-bold">Nguyen Huu Khang</p>
            <p className="text-sm font-bold text-primary">Student</p>
          </div>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full cursor-pointer"
            onClick={() => setOpenBoard(!openBoard)}
          >
            <ChevronDown />
          </button>
          {openBoard && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 mb-4 rounded-md min-w-80">
                <div className="flex gap-2 p-4">
                  <Image
                    src="/default-avatar.jpg"
                    alt="User Avatar"
                    width={40}
                    height={32}
                    className="rounded-full border-4 box-content border-white"
                  />
                  <div>
                    <p className="font-bold">Nguyen Huu Khang</p>
                    <p className="text-sm  text-gray-500 dark:text-gray-400">
                      huukhang855@gmail.com
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-300"></div>
                <button className="block w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-2xl mt-2 hover:bg-gray-300 dark:hover:bg-gray-500 justify-center">
                  <FontAwesomeIcon icon={faCircleUser} className="mr-2" />
                  {t('viewProfile')}
                </button>
              </div>
              <Link
                href="/settings"
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-500 mb-2 rounded-sm flex items-center "
              >
                <FontAwesomeIcon icon={faGear} className="mr-4" />
                {t('settings')}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="mr-2 ml-auto"
                />
              </Link>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-sm flex items-center justify-start">
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-4" />
                {t('logout')}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="mr-2 ml-auto"
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button className="bg-primary w-36 h-10 text-white rounded-2xl cursor-pointer mr-4 hover:bg-blue-600 justify-center">
            {t('signup')}
          </button>
          <button
            className="bg-gray-300 w-36 h-10 text-primary border-3 hover:border-blue-600 hover:text-white box-border rounded-2xl cursor-pointer mr-4 hover:bg-blue-600 justify-center"
            onClick={() => setLogin(!login)}
          >
            {t('login')}
          </button>
        </>
      )}
    </div>
  );
};
export default Header;
