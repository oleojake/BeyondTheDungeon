import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { routes } from "@/router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export const AuthCallbackScene = () => {
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("Confirmando tu email...");

	useEffect(() => {
		const handleEmailConfirmation = async () => {
			try {
				// Supabase automáticamente procesa el hash de confirmación en la URL
				const { data, error } = await supabase.auth.getSession();

				if (error) {
					throw error;
				}

				if (data.session) {
					setStatus("success");
					setMessage("¡Email confirmado correctamente! Redirigiendo...");
					setTimeout(() => navigate(routes.profile), 2000);
				} else {
					// Si no hay sesión pero tampoco error, verifica si hay un código en la URL
					const hashParams = new URLSearchParams(
						window.location.hash.substring(1),
					);
					const accessToken = hashParams.get("access_token");

					if (accessToken) {
						// Supabase ya debe haber procesado el token
						setStatus("success");
						setMessage("¡Email confirmado! Redirigiendo al login...");
						setTimeout(() => navigate(routes.login), 2000);
					} else {
						throw new Error(
							"No se pudo verificar el email. Por favor, intenta de nuevo.",
						);
					}
				}
			} catch (err) {
				console.error("Error en confirmación de email:", err);
				setStatus("error");
				setMessage(
					err instanceof Error
						? err.message
						: "Error al confirmar el email. Por favor, contacta con soporte.",
				);
			}
		};

		handleEmailConfirmation();
	}, [navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Confirmación de Email</CardTitle>
					<CardDescription>
						Procesando tu solicitud de confirmación
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{status === "loading" && (
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
							<p className="text-sm text-muted-foreground">{message}</p>
						</div>
					)}

					{status === "success" && (
						<Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
							<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
							<AlertDescription className="text-green-800 dark:text-green-200">
								{message}
							</AlertDescription>
						</Alert>
					)}

					{status === "error" && (
						<Alert variant="destructive">
							<XCircle className="h-4 w-4" />
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}

					{status === "error" && (
						<div className="text-center">
							<button
								onClick={() => navigate(routes.login)}
								className="text-sm text-primary hover:underline"
							>
								Volver al login
							</button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
