export interface FormData {
  username: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export interface FormErrors {
  username?: string;
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  captcha?: string;
  general?: string;
}

export type { FormData as RegisterFormData };
