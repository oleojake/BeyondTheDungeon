import { type PropsWithChildren } from "react";

export const AppLayout = ({ children }: PropsWithChildren) => {
	return <div className="min-h-screen bg-gray-50 dark:bg-[#0d0813] text-gray-900 dark:text-white transition-colors duration-300">{children}</div>;
};
