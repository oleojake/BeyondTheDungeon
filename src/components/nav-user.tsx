"use client";

import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
import { useAuth } from "@/core/auth/useAuth";
import { useNavigate } from "react-router";

type NavUserProps = {
  fallbackUser?: {
    name: string;
    email: string;
    avatar?: string;
  };
};

export function NavUser({ fallbackUser }: NavUserProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nameFromEmail = (email?: string | null) =>
    email ? email.split("@")[0] : "Invitado";

  const displayName = user?.email
    ? nameFromEmail(user.email)
    : fallbackUser?.name || "Invitado";

  const displayEmail = user?.email || fallbackUser?.email || "";
  const displayAvatar = fallbackUser?.avatar || "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-fuchsia-600/20 border border-purple-500/50 px-4 py-2 text-sm hover:from-purple-500/30 hover:to-fuchsia-600/30 transition">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white font-semibold">
              {(displayName || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-semibold text-white">
              {displayName}
            </span>
            <span className="text-xs text-gray-400">{displayEmail}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl border-purple-500/30 bg-gradient-to-b from-[#1b1226] to-[#140d1d] shadow-xl shadow-purple-500/20"
        align="end"
        sideOffset={12}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white font-semibold">
                {(displayName || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white">
                {displayName}
              </span>
              <span className="text-xs text-gray-400">{displayEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-purple-500/20" />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-500/10 focus:bg-purple-500/10"
        >
          <LogOut className="mr-2 h-4 w-4 text-fuchsia-400" />
          Cerrar sesión
        </DropdownMenuItem>
        {!user && (
          <DropdownMenuItem
            onSelect={() => navigate("/login")}
            className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-500/10 focus:bg-purple-500/10"
          >
            <UserRound className="mr-2 h-4 w-4 text-purple-400" />
            Iniciar sesión
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
