import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomeScene } from "@/scenes";
import { switchRoutes } from "./routes";

export const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route path={switchRoutes.root} element={<HomeScene />} />
			</Routes>
		</Router>
	);
};
