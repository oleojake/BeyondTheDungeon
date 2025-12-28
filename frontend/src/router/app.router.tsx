import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomeScene } from "@/scenes";
import { LoginScene } from "@/scenes/login.scene";
import { RegisterScene } from "@/scenes/register.scene";
import { switchRoutes } from "./routes";

export const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route path={switchRoutes.root} element={<HomeScene />} />
				<Route path={switchRoutes.login} element={<LoginScene />} />
				<Route path={switchRoutes.register} element={<RegisterScene />} />
			</Routes>
		</Router>
	);
};
