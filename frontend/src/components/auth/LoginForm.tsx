// components/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import { useTranslations } from "next-intl";
import Loading from "../ui/Loading";
import { login } from "@/utils/auth";
import { useOpenAuth } from "@/contexts/OpenAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { OAuthProvider, startOAuthLogin } from "@/lib/oauth";

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

const LoginForm = ({ onSwitchToSignUp }: LoginFormProps) => {
  const { setOpenLogin } = useOpenAuth();
  const { fetchUserInfo, setAccessToken } = useAuth();
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!formData.email) {
      newErrors.email = t("emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("passwordInvalid");
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      setAccessToken(result.accessToken);
      await fetchUserInfo();
      toast.success(t("loginSuccess"));
      setOpenLogin(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("loginFailed");

      toast.error(message);

      setErrors((prev) => ({
        ...prev,
        password: message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: OAuthProvider) => {
    startOAuthLogin(provider);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
          {t("title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-2.5 mb-5">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 font-medium"
        >
          <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-red-500" />
          {t("loginWithGoogle")}
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 font-medium"
        >
          <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
          {t("loginWithGithub")}
        </button>
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-1.5 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            {t("or")}
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {t("email")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-gray-400 w-4 h-4"
              />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-9 pr-3.5 py-2.5 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-primary"
              }`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {t("password")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faLock}
                className="text-gray-400 w-4 h-4"
              />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-9 pr-10 py-2.5 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-primary"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="w-4 h-4"
              />
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="ml-1.5 text-xs text-gray-600 dark:text-gray-400">
              {t("rememberMe")}
            </span>
          </label>
          <button
            type="button"
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            {t("forgotPassword")}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <Loading size="sm" color="gray" />
              {t("loggingIn")}
            </div>
          ) : (
            t("loginButton")
          )}
        </button>
      </form>

      <div className="mt-5 flex items-center flex-col text-xs text-gray-600 dark:text-gray-400">
        {t("noAccount")}{" "}
        <div className="w-[50%] h-px dark:bg-gray-500 my-1.5"></div>
        <button
          onClick={onSwitchToSignUp}
          className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all"
        >
          {t("signup")}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
