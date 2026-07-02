"use client";
import { faCircleHalfStroke, faLanguage, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingPage = () => {
  const [theme, setTheme] = useState<string>("light");
  const t = useTranslations('Settings');

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const setThemeMode = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="min-h-screen ">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <Tabs defaultValue="appearance" className="grid grid-cols-1 gap-5 lg:grid-cols-[25%_73%]">
          {/* Sidebar */}
          <nav className="bg-white dark:bg-gray-900 rounded-md shadow-sm p-3.5 h-fit">
            <TabsList className="flex h-auto w-full flex-col items-stretch gap-1.5 bg-transparent p-0">
              <TabsTrigger
                value="appearance"
                className="h-10 w-full justify-start rounded-md px-3.5 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <FontAwesomeIcon
                  icon={faCircleHalfStroke}
                  className="w-4 h-4"
                />
                <span>{t('appearance')}</span>
              </TabsTrigger>

              <TabsTrigger
                value="language"
                className="h-10 w-full justify-start rounded-md px-3.5 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <FontAwesomeIcon 
                  icon={faLanguage} 
                  className="w-4 h-4" 
                />
                <span>{t('language')}</span>
              </TabsTrigger>
            </TabsList>
          </nav>

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-900 rounded-md shadow-sm p-5">
            <TabsContent value="appearance" className="mt-0 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                    {t('appearance')}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('appearanceDescription')}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('themeMode')}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t('currentlyUsing')}{" "}
                        <span className="font-medium capitalize">{theme}</span> {t('mode')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon className="text-yellow-300" icon={faSun} />
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={(checked) =>
                          setThemeMode(checked ? "dark" : "light")
                        }
                      />
                      <FontAwesomeIcon icon={faMoon} className="text-yellow-300" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div
                      onClick={() => {
                        if (theme === "dark") setThemeMode("light");
                      }}
                      className={`cursor-pointer border-2 rounded-md p-3.5 transition-all ${
                        theme === "light"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
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
                      <div className="h-14 bg-white rounded border border-gray-200 shadow-sm"></div>
                    </div>

                    <div
                      onClick={() => {
                        if (theme === "light") setThemeMode("dark");
                      }}
                      className={`cursor-pointer border-2 rounded-md p-3.5 transition-all ${
                        theme === "dark"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
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
                      <div className="h-14 bg-gray-900 rounded border border-gray-700 shadow-sm"></div>
                    </div>
                  </div>
                </div>
            </TabsContent>
            <TabsContent value="language" className="mt-0 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                    {t('language')}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('selectLanguage')}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                  <div className="space-y-2.5">
                    {["English", "Tiếng Việt", "中文", "日本語", "한국어"].map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center gap-2.5 p-3.5 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="language"
                          defaultChecked={lang === "English"}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {lang}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
};

export default SettingPage;
