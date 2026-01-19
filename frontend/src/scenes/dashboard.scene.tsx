import { AppLayout } from "@/layout/app.layout";
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
import { Outlet } from "react-router-dom";

export const DashboardScene = () => {
  const { user } = useAuth();

  const displayName = user?.email ? user.email.split("@")[0] : "Invitado";

  return (
    <AppLayout>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-[#0d0813] text-white">
          <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-[#120c1b]">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList className="text-sm text-gray-300">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Inicio</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="text-white font-semibold">
                    Mis Campañas
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

          <main className="px-6 py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppLayout>
  );
};

export default DashboardScene;
