"use client";

import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/core/auth/useAuth";
import { useNavigate } from "react-router";
import { useTranslation } from "@/i18n";

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
  const { t } = useTranslation();

  const nameFromEmail = (email?: string | null) =>
    email ? email.split("@")[0] : t.navUser.guest;

  const displayName = user?.email
    ? nameFromEmail(user.email)
    : fallbackUser?.name || t.navUser.guest;

  const displayEmail = user?.email || fallbackUser?.email || "";
  const displayAvatar = fallbackUser?.avatar || "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300/20 to-amber-500/10 border border-amber-300/30 px-4 py-2 text-sm hover:from-amber-300/30 hover:to-amber-500/20 transition">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-amber-400 to-amber-600  font-semibold">
              {(displayName || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm italic">{displayName}</span>
            <span className="text-xs text-gray-400">{displayEmail}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl border-amber-300/30 bg-dark-card shadow-xl shadow-amber-300/12"
        align="end"
        sideOffset={12}
      >
        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer text-white hover:text-white hover:bg-amber-300/10 focus:bg-amber-300/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.navUser.logout}
        </DropdownMenuItem>
        {!user && (
          <DropdownMenuItem
            onSelect={() => navigate("/login")}
            className="cursor-pointer text-amber-800 hover:text-white hover:bg-amber-300/10 focus:bg-amber-300/10"
          >
            <UserRound className="mr-2 h-4 w-4 text-amber-500" />
            {t.navUser.login}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
