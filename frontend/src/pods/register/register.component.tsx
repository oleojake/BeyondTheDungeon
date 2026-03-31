import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { routes } from "@/router";
import type { RegisterComponentProps } from "@/interfaces/registerProps";

export const RegisterComponent = ({
  formData,
  errors,
  loading,
  successMessage,
  onChange,
  onSubmit,
}: RegisterComponentProps) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-dark dark:via-dark-lighter dark:to-dark flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Decorative World Map */}
        <div className="hidden lg:block">
          <div className="relative bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-8 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 animate-pulse"></div>

            {/* Map placeholder with glow effect */}
            <div className="relative z-10 aspect-video flex items-center justify-center">
              <div className="text-9xl opacity-20">🧙</div>
              <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-primary/10 to-transparent"></div>
            </div>

            {/* Floating connection dots */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping"></div>
            <div
              className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-secondary rounded-full animate-ping"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full max-w-md mx-auto lg:order-first">
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🎲</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Beyond the Dungeon
                </h1>
              </div>
              <p className="text-gray-400">{t("auth.register.welcome")}</p>
            </div>

            {/* Register Form */}
            <form className="space-y-5" onSubmit={onSubmit}>
              {/* Success General */}
              {successMessage && (
                <div className="p-3 bg-green-600/10 border border-green-500/40 rounded-lg text-green-400 text-sm">
                  {successMessage}
                </div>
              )}

              {/* Error General */}
              {errors.general && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                  {errors.general}
                </div>
              )}

              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {t("auth.register.username")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => onChange("username", e.target.value)}
                    placeholder={t("auth.register.usernamePlaceholder")}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.username
                        ? "border-error focus:border-error"
                        : "border-dark-border focus:border-primary"
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-error">{errors.username}</p>
                )}
              </div>

              {/* Nombre a mostrar */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {t("auth.register.displayName")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => onChange("displayName", e.target.value)}
                    placeholder={t("auth.register.displayNamePlaceholder")}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.displayName
                        ? "border-error focus:border-error"
                        : "border-dark-border focus:border-primary"
                    }`}
                  />
                </div>
                {errors.displayName && (
                  <p className="mt-1 text-sm text-error">
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {t("auth.register.email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder={t("auth.register.emailPlaceholder")}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.email
                        ? "border-error focus:border-error"
                        : "border-dark-border focus:border-primary"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {t("auth.register.password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => onChange("password", e.target.value)}
                    placeholder={t("auth.register.passwordPlaceholder")}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.password
                        ? "border-error focus:border-error"
                        : "border-dark-border focus:border-primary"
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {t("auth.register.confirmPassword")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      onChange("confirmPassword", e.target.value)
                    }
                    placeholder={t("auth.register.confirmPasswordPlaceholder")}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.confirmPassword
                        ? "border-error focus:border-error"
                        : "border-dark-border focus:border-primary"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={(e) => onChange("terms", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-dark-border bg-dark text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    {t("auth.register.termsPrefix")}{" "}
                    <a
                      href="#"
                      className="text-primary hover:text-primary-light"
                    >
                      {t("auth.register.terms")}
                    </a>{" "}
                    {t("auth.register.termsAnd")}{" "}
                    <a
                      href="#"
                      className="text-primary hover:text-primary-light"
                    >
                      {t("auth.register.privacy")}
                    </a>
                  </label>
                </div>
                {errors.terms && (
                  <p className="mt-1 text-sm text-error">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark text-white font-bold rounded-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t("auth.register.submitting") : t("auth.register.submit")}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {t("auth.register.hasAccount")}{" "}
                <Link
                  to={routes.login}
                  className="text-primary hover:text-primary-light font-semibold transition-colors"
                >
                  {t("auth.register.login")}
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to={routes.root}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t("auth.register.backToHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
