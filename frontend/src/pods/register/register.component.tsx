import { Link } from "react-router";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { routes } from "@/router";
import type { RegisterComponentProps } from "@/interfaces/registerProps";
import { useTranslation } from "@/i18n";

export const RegisterComponent = ({
  formData,
  errors,
  loading,
  successMessage,
  captchaRef,
  onChange,
  onSubmit,
  onGoogleSignIn,
}: RegisterComponentProps) => {
  const { t } = useTranslation();
  const tr = t.register;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-dark dark:via-dark-lighter dark:to-dark flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Decorative */}
        <div className="hidden lg:block">
          <div className="relative bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 animate-pulse"></div>
            <div className="relative z-10 aspect-video flex items-center justify-center">
              <div className="text-9xl opacity-20">🧙</div>
              <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-primary/10 to-transparent"></div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-secondary rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
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
              <p className="text-gray-400">{tr.welcome}</p>
            </div>

            {/* Register Form */}
            <form className="space-y-5" onSubmit={onSubmit}>
              {successMessage && (
                <div className="p-3 bg-green-600/10 border border-green-500/40 rounded-lg text-green-400 text-sm">
                  {successMessage}
                </div>
              )}
              {errors.general && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                  {errors.general}
                </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  {tr.usernameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => onChange("username", e.target.value)}
                    placeholder={tr.usernamePlaceholder}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.username ? "border-error focus:border-error" : "border-dark-border focus:border-primary"}`}
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-error">{errors.username}</p>}
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                  {tr.displayNameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => onChange("displayName", e.target.value)}
                    placeholder={tr.displayNamePlaceholder}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.displayName ? "border-error focus:border-error" : "border-dark-border focus:border-primary"}`}
                  />
                </div>
                {errors.displayName && <p className="mt-1 text-sm text-error">{errors.displayName}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {tr.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="tu@email.com"
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.email ? "border-error focus:border-error" : "border-dark-border focus:border-primary"}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {tr.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => onChange("password", e.target.value)}
                    placeholder={tr.passwordPlaceholder}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.password ? "border-error focus:border-error" : "border-dark-border focus:border-primary"}`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  {tr.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => onChange("confirmPassword", e.target.value)}
                    placeholder={tr.confirmPasswordPlaceholder}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.confirmPassword ? "border-error focus:border-error" : "border-dark-border focus:border-primary"}`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>}
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
                    {tr.terms}{" "}
                    <a href="#" className="text-primary hover:text-primary-light">{tr.termsLink}</a>{" "}
                    {tr.and}{" "}
                    <a href="#" className="text-primary hover:text-primary-light">{tr.privacyLink}</a>
                  </label>
                </div>
                {errors.terms && <p className="mt-1 text-sm text-error">{errors.terms}</p>}
              </div>

              {/* hCaptcha */}
              <HCaptcha ref={captchaRef} sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY} size="invisible" />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark text-white font-bold rounded-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? tr.submitting : tr.submit}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400">{tr.divider}</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full py-3 flex items-center justify-center gap-3 bg-white dark:bg-dark border border-gray-300 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {tr.googleBtn}
            </button>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {tr.hasAccount}{" "}
                <Link to={routes.login} className="text-primary hover:text-primary-light font-semibold transition-colors">
                  {tr.loginLink}
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to={routes.root} className="text-gray-500 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {tr.backHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
