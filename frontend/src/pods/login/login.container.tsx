import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import type HCaptcha from "@hcaptcha/react-hcaptcha";
import { LoginComponent } from "./login.component";
import { routes } from "@/router";
import { signIn, signInWithGoogle, resendSignUpConfirmation } from "@/core/auth/supabaseAuth";

interface FormData {
	email: string;
	password: string;
}

export const LoginContainer = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const captchaRef = useRef<HCaptcha>(null);

	const [formData, setFormData] = useState<FormData>({
		email: (location.state as { email?: string })?.email || "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);

	const handleChange = (field: keyof FormData, value: string) => {
		setFormData((p) => ({ ...p, [field]: value }));
		if (error) setError(null);
		if (emailNotConfirmed) setEmailNotConfirmed(false);
		setResendSuccess(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!formData.email || !formData.password) {
			setError("Email y contraseña son requeridos");
			return;
		}

		setLoading(true);
		try {
			// El captcha solo se ejecuta si hay una site key configurada
			let captchaToken: string | undefined;
			const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
			if (siteKey) {
				if (!captchaRef.current) {
					throw new Error("El captcha no ha cargado aún. Espera un momento y vuelve a intentarlo.");
				}
				try {
					const result = await captchaRef.current.execute({ async: true });
					captchaToken = result?.response;
					if (!captchaToken) {
						throw new Error("El captcha no devolvió un token. Recarga la página.");
					}
				} catch (captchaErr) {
					if (captchaErr instanceof Error) throw captchaErr;
					throw new Error("El captcha no pudo completarse. Recarga la página e inténtalo de nuevo.");
				}
			}
			await signIn(formData.email, formData.password, captchaToken);
			navigate(routes.profileCampanas);
		} catch (err) {
			captchaRef.current?.resetCaptcha();
			const msg = err instanceof Error ? err.message : "Error desconocido";
			if (msg.toLowerCase().includes("confirmar tu email")) {
				setEmailNotConfirmed(true);
			}
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleResendConfirmation = async () => {
		if (!formData.email) return;
		setResendLoading(true);
		try {
			await resendSignUpConfirmation(formData.email);
			setResendSuccess(true);
			setError(null);
		} catch {
			setError("No se pudo reenviar el email. Inténtalo de nuevo.");
		} finally {
			setResendLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setError(null);
		try {
			await signInWithGoogle();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error desconocido");
		}
	};

	return (
		<LoginComponent
			formData={formData}
			loading={loading}
			error={error}
			emailNotConfirmed={emailNotConfirmed}
			resendLoading={resendLoading}
			resendSuccess={resendSuccess}
			captchaRef={captchaRef}
			onChange={handleChange}
			onSubmit={handleSubmit}
			onGoogleSignIn={handleGoogleSignIn}
			onResendConfirmation={handleResendConfirmation}
		/>
	);
};
