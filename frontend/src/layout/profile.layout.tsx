import { type PropsWithChildren } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/core/auth/useAuth";

export const ProfileLayout = ({ children }: PropsWithChildren) => {
	const { user } = useAuth();

	const displayName = user?.email ? user.email.split("@")[0] : "Invitado";

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-[#0d0813] text-gray-900 dark:text-white transition-colors duration-300">
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="bg-gray-50 dark:bg-[#0d0813]">
					<header className="flex items-center justify-between px-6 py-4 border-b border-stone-300 dark:border-dark-border bg-white dark:bg-[#120c1b] transition-colors duration-300">
						<div className="flex items-center gap-3">
							<SidebarTrigger className="-ml-1" />
							<Breadcrumb>
								<BreadcrumbList className="text-sm text-stone-600 dark:text-gray-300">
									<BreadcrumbItem>
										<BreadcrumbLink
											href="/"
											className="hover:text-primary dark:hover:text-amber-300"
										>
											Inicio
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem className="text-stone-900 dark:text-white font-semibold">
										Mi Perfil
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<NavUser
							fallbackUser={{
								name: displayName,
								email: user?.email || "",
								avatar: "",
							}}
						/>
					</header>

					<main className="px-6 py-8">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
};
