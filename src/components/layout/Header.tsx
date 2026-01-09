"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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

const getPageTitle = (pathname: string) => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("/nutrition/meals")) return "Comidas";
  if (pathname.includes("/nutrition/pantry")) return "Despensa";
  if (pathname.includes("/nutrition/recipes")) return "Recetas";
  if (pathname.includes("/nutrition/history")) return "Historial";
  if (pathname.includes("/nutrition/goals")) return "Objetivos";
  if (pathname.includes("/nutrition")) return "Nutrición";
  if (pathname.includes("/fitness/workout")) return "Entrenar";
  if (pathname.includes("/fitness/routines")) return "Rutinas";
  if (pathname.includes("/fitness/exercises")) return "Ejercicios";
  if (pathname.includes("/fitness/progress")) return "Progreso";
  if (pathname.includes("/fitness/history")) return "Historial";
  if (pathname.includes("/fitness")) return "Fitness";
  if (pathname.includes("/tasks/today")) return "Vista Hoy";
  if (pathname.includes("/tasks/calendar")) return "Calendario";
  if (pathname.includes("/tasks")) return "Tareas";
  if (pathname.includes("/habits/stats")) return "Estadísticas";
  if (pathname.includes("/habits")) return "Hábitos";
  if (pathname.includes("/finance")) return "Finanzas";
  if (pathname.includes("/reports")) return "Reportes";
  if (pathname.includes("/profile")) return "Perfil";
  if (pathname.includes("/settings")) return "Ajustes";
  return "Life OS";
};

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { user, logout } = useUser();
  const isDashboard = pathname === "/dashboard";

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 pt-safe backdrop-blur-xl transition-all lg:px-6">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <BackButton />
        {isDashboard ? (
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold tracking-tight md:hidden truncate">Life OS</h1>
            <span className="text-[10px] text-muted-foreground md:hidden">by Álvaro Fernández</span>
          </div>
        ) : (
          <h1 className="text-lg font-semibold tracking-tight md:hidden truncate">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
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
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link href="/dashboard/profile">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link href="/dashboard/settings">Ajustes</Link>
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
