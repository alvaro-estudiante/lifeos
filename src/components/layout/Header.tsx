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
import { LogOut, User, Settings } from "lucide-react";

const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
  if (pathname === "/dashboard") return { title: "Life OS", subtitle: "by Álvaro Fernández" };
  if (pathname.includes("/nutrition/meals")) return { title: "Comidas" };
  if (pathname.includes("/nutrition/pantry")) return { title: "Despensa" };
  if (pathname.includes("/nutrition/recipes")) return { title: "Recetas" };
  if (pathname.includes("/nutrition/history")) return { title: "Historial" };
  if (pathname.includes("/nutrition/goals")) return { title: "Objetivos" };
  if (pathname.includes("/nutrition")) return { title: "Nutrición" };
  if (pathname.includes("/fitness/workout")) return { title: "Entrenamiento" };
  if (pathname.includes("/fitness/routines")) return { title: "Rutinas" };
  if (pathname.includes("/fitness/exercises")) return { title: "Ejercicios" };
  if (pathname.includes("/fitness/progress")) return { title: "Progreso" };
  if (pathname.includes("/fitness/history")) return { title: "Historial" };
  if (pathname.includes("/fitness")) return { title: "Fitness" };
  if (pathname.includes("/tasks/today")) return { title: "Mi Día" };
  if (pathname.includes("/tasks/calendar")) return { title: "Calendario" };
  if (pathname.includes("/tasks")) return { title: "Tareas" };
  if (pathname.includes("/habits/stats")) return { title: "Estadísticas" };
  if (pathname.includes("/habits")) return { title: "Hábitos" };
  if (pathname.includes("/finance")) return { title: "Finanzas" };
  if (pathname.includes("/reports")) return { title: "Reportes" };
  if (pathname.includes("/profile")) return { title: "Mi Perfil" };
  if (pathname.includes("/settings")) return { title: "Ajustes" };
  return { title: "Life OS" };
};

export function Header() {
  const pathname = usePathname();
  const { title, subtitle } = getPageTitle(pathname);
  const { user, logout } = useUser();
  const isDashboard = pathname === "/dashboard";

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4 pt-safe">
        {/* Left side - Back button & Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <BackButton />
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate md:hidden">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground -mt-0.5 md:hidden">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative focus:outline-none">
                <Avatar className="h-8 w-8 ring-2 ring-border hover:ring-primary/50 transition-all">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg p-1">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Mi Cuenta</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 gap-3">
                <Link href="/dashboard/profile">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 gap-3">
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  <span>Ajustes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer rounded-lg p-3 gap-3 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
