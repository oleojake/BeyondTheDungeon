import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { RegisterComponent } from "./register.component";
import { routes } from "@/router";
import type { FormData, FormErrors } from "@/interfaces/forms";
import { resendSignUpConfirmation, signUp } from "@/core/auth/supabaseAuth";

export const RegisterContainer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim())
      newErrors.username = t("auth.register.errors.usernameRequired");
    else if (formData.username.length < 3)
      newErrors.username = t("auth.register.errors.usernameMin");

    if (!formData.email.trim()) newErrors.email = t("auth.register.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("auth.register.errors.emailInvalid");

    if (!formData.password) newErrors.password = t("auth.register.errors.passwordRequired");
    else if (formData.password.length < 8)
      newErrors.password = t("auth.register.errors.passwordMin");

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t("auth.register.errors.passwordMismatch");

    if (!formData.terms)
      newErrors.terms = t("auth.register.errors.termsRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSuccess(null);
    setLoading(true);
    setErrors({});

    try {
      await signUp({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName || formData.username,
      });

      setSuccess(
        t("auth.register.success")
      );
      setTimeout(
        () => navigate(routes.login, { state: { email: formData.email } }),
        2000
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("auth.register.errors.registerFailed");

      if (message.toLowerCase().includes("email ya esta registrado")) {
        try {
          await resendSignUpConfirmation(formData.email);
          setSuccess(
            t("auth.register.errors.emailResent")
          );
          setErrors({});
          return;
        } catch {
          // Si falla el reenvio, mostramos el error original de registro.
        }
      }

      setErrors({
        general: message || t("auth.register.errors.unknown"),
      });
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterComponent
      formData={formData}
      errors={errors}
      loading={loading}
      successMessage={success}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
};
