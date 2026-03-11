import { type PropsWithChildren, useEffect } from "react";
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

  // Dashboard siempre en dark mode (colores fijos de dungeon)
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.add("dark");
    return () => {
      if (!wasDark) html.classList.remove("dark");
    };
  }, []);

  const displayName = user?.email ? user.email.split("@")[0] : "Invitado";

  return (
    <div
      className="min-h-screen bg-[#1a0e06] text-amber-100 transition-colors duration-300"
      style={{ fontFamily: "'Cinzel Decorative', 'Uncial Antiqua', serif" }}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-[#1a0e06]">
          <header className="flex items-center justify-between px-6 py-4 border-b border-amber-900/30 bg-[#2b1608] transition-colors duration-300">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-amber-300 hover:text-amber-100" />
              <Breadcrumb>
                <BreadcrumbList className="text-sm text-amber-400">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="hover:text-amber-200 transition-colors"
                    >
                      Inicio
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-amber-700" />
                  <BreadcrumbItem className="text-amber-200 font-semibold">
                    Dashboard
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
