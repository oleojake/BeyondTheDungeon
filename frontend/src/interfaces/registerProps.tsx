import type { FormErrors, FormData } from "./forms";

export interface RegisterComponentProps {
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  successMessage?: string | null;
  captchaQuestion: string;
  captchaValue: string;
  captchaError?: string;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onCaptchaChange: (value: string) => void;
  onCaptchaRefresh: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
}
