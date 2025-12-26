import { type PropsWithChildren } from "react";

export const AppLayout = ({ children }: PropsWithChildren) => {
	return <div className="min-h-screen">{children}</div>;
};
