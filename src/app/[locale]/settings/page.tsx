"use client";
import { faCircleHalfStroke, faLanguage, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const SettingPage = () => {
  const [openTheme, setOpenTheme] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>("light");
  const t = useTranslations('Settings');
  const locale = useLocale();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
    console.log("Current locale:", locale);
    console.log('📦 Settings.title:', t('title'));
    console.log('📦 Has translation?:', t.has('title'));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="min-h-screen ">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[25%_73%] gap-6">
          {/* Sidebar */}
          <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-fit">
            <div className="space-y-2">
              <button
                onClick={() => setOpenTheme(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  openTheme
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FontAwesomeIcon
                  icon={faCircleHalfStroke}
                  className="w-5 h-5"
                />
                <span>{t('appearance')}</span>
              </button>

              <button
                onClick={() => setOpenTheme(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  !openTheme
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FontAwesomeIcon 
                  icon={faLanguage} 
                  className="w-5 h-5" 
                />
                <span>{t('language')}</span>
              </button>
            </div>
          </nav>

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {openTheme ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('appearance')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('appearanceDescription')}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {t('themeMode')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('currentlyUsing')}{" "}
                        <span className="font-medium capitalize">{theme}</span> {t('mode')}
                      </p>
                    </div>

                    <button
                      onClick={toggleTheme}
                      className="relative inline-flex h-11 w-20 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none"
                    >
                      <span
                        className={`h-9 w-9 transform rounded-full bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 flex items-center justify-center ${
                          theme === "dark" ? "translate-x-10" : "translate-x-1"
                        }`}
                      >
                        {theme === "dark" ? <FontAwesomeIcon icon={faMoon} className="text-yellow-300" /> : <FontAwesomeIcon className="text-yellow-300" icon={faSun} />}
                      </span>
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        if (theme === "dark") toggleTheme();
                      }}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        theme === "light"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FontAwesomeIcon icon={faSun} className="text-yellow-300" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {t('lightMode')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('lightModeDescription')}
                          </div>
                        </div>
                      </div>
                      <div className="h-16 bg-white rounded border border-gray-200 shadow-sm"></div>
                    </div>

                    <div
                      onClick={() => {
                        if (theme === "light") toggleTheme();
                      }}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        theme === "dark"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FontAwesomeIcon icon={faMoon} className="text-yellow-300" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {t('darkMode')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('darkModeDescription')}
                          </div>
                        </div>
                      </div>
                      <div className="h-16 bg-gray-900 rounded border border-gray-700 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('language')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('selectLanguage')}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="space-y-3">
                    {["English", "Tiếng Việt", "中文", "日本語", "한국어"].map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="language"
                          defaultChecked={lang === "English"}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {lang}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default SettingPage;