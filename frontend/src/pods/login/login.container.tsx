import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LoginComponent } from "./login.component";
import { routes } from "@/router";
import { signIn, signInWithGoogle } from "@/core/auth/supabaseAuth";

interface FormData {
	email: string;
	password: string;
}

export const LoginContainer = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const [formData, setFormData] = useState<FormData>({
		email: (location.state as { email?: string })?.email || "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (field: keyof FormData, value: string) => {
		setFormData((p) => ({ ...p, [field]: value }));
		if (error) setError(null);
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
			await signIn(formData.email, formData.password);
			navigate(routes.profileCampanas);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error desconocido");
		} finally {
			setLoading(false);
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
			onChange={handleChange}
			onSubmit={handleSubmit}
			onGoogleSignIn={handleGoogleSignIn}
		/>
	);
};
