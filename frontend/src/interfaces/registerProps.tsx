import type { FormErrors, FormData } from "./forms";

export interface RegisterComponentProps {
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  successMessage?: string | null;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}
