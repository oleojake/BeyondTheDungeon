import type { RefObject } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { FormErrors, FormData } from "./forms";

export interface RegisterComponentProps {
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  successMessage?: string | null;
  captchaRef: RefObject<TurnstileInstance | null>;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
}
