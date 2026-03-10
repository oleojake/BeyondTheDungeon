"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    subtitle?: string;
    badge?: string | number;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            location.pathname === item.url ||
            (item.url !== "/" && location.pathname.startsWith(item.url + "/"));

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="w-full h-16"
              >
                <Link
                  to={item.url}
                  className={cn(
                    "nav-item w-full",
                    isActive && "nav-item-active",
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div className="nav-item-icon text-black">
                    {item.icon ? <item.icon /> : <ChevronRight />}
                  </div>
                  <div className="flex-1">
                    <div className="nav-item-title">{item.title}</div>
                  </div>
                  {item.badge && (
                    <div className="text-xs font-medium">{item.badge}</div>
                  )}
                  <ChevronRight className="ml-3 opacity-60" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
