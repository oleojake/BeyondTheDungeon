import { type PropsWithChildren } from "react";

export const AppLayout = ({ children }: PropsWithChildren) => {
	return <div className="min-h-screen bg-[#0d0813] text-white">{children}</div>;
};
