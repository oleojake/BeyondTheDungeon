import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { HomeComponent } from "./home.component";

export const HomeContainer = () => {
	const navigate = useNavigate();

	useEffect(() => {
		// Redirect to campaigns if user is already logged in
		const checkAuth = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (session) {
				navigate("/mis-campanas", { replace: true });
			}
		};

		checkAuth();
	}, [navigate]);

	return <HomeComponent />;
};
