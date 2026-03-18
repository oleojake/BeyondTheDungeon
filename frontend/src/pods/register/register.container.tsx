import { useState } from "react";
import { useNavigate } from "react-router";
import { RegisterComponent } from "./register.component";
import { routes } from "@/router";
import type { FormData, FormErrors } from "@/interfaces/forms";
import { resendSignUpConfirmation, signUp } from "@/core/auth/supabaseAuth";

export const RegisterContainer = () => {
  const navigate = useNavigate();
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
      newErrors.username = "El nombre de usuario es requerido";
    else if (formData.username.length < 3)
      newErrors.username = "Mínimo 3 caracteres";

    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 8)
      newErrors.password = "Mínimo 8 caracteres";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    if (!formData.terms)
      newErrors.terms = "Debes aceptar los términos y condiciones";

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
        "Cuenta creada. Revisa tu email (incluida Spam/Promociones) para confirmar y luego inicia sesion."
      );
      setTimeout(
        () => navigate(routes.login, { state: { email: formData.email } }),
        2000
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrar usuario.";

      if (message.toLowerCase().includes("email ya esta registrado")) {
        try {
          await resendSignUpConfirmation(formData.email);
          setSuccess(
            "Ese email ya estaba registrado. Te hemos reenviado el correo de confirmacion. Revisa Spam/Promociones."
          );
          setErrors({});
          return;
        } catch {
          // Si falla el reenvio, mostramos el error original de registro.
        }
      }

      setErrors({
        general: message,
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
