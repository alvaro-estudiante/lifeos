"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/useUser";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackButton } from "@/components/layout/BackButton";
import { cn } from "@/lib/utils";

const getPageTitle = (pathname: string) => {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/nutrition")) return "Nutrición";
  if (pathname.startsWith("/fitness")) return "Fitness";
  if (pathname.startsWith("/tasks")) return "Tareas";
  if (pathname.startsWith("/habits")) return "Hábitos";
  if (pathname.startsWith("/notes")) return "Notas";
  if (pathname.startsWith("/settings")) return "Ajustes";
  return "LifeOS";
};

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { user, logout } = useUser();

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 pt-safe backdrop-blur-xl transition-all lg:px-6">
      <div className="flex items-center gap-2 flex-1">
        <BackButton />
        <h1 className="text-lg font-semibold tracking-tight md:hidden">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/20">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Mi Cuenta</span>
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              Ajustes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}