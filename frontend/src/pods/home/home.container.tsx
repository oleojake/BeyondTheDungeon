import { HomeComponent } from "./home.component";

// Intentional: authenticated users are NOT redirected away from Home,
// allowing them to navigate back to the main page at any time.
export const HomeContainer = () => {
	return <HomeComponent />;
};
