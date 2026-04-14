import { type PropsWithChildren } from "react";
import { Navbar } from "@/pods/home/components/navbar.component";
import { PendingInvitationsBanner } from "@/components/PendingInvitationsBanner";

export const AppLayout = ({ children }: PropsWithChildren) => {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white transition-colors duration-300">
			<Navbar />
			<div className="pt-[73px]">
				<PendingInvitationsBanner />
				{children}
			</div>
		</div>
	);
};
