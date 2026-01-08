"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  CheckSquare,
  StickyNote,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/nutrition",
    label: "Nutrición",
    icon: Utensils,
    subItems: [
      { href: "/nutrition", label: "Dashboard" },
      { href: "/nutrition/pantry", label: "Despensa" },
      { href: "/nutrition/meals", label: "Comidas" },
      { href: "/nutrition/equipment", label: "Equipamiento" },
      { href: "/nutrition/recipes", label: "Recetas" },
    ],
  },
  {
    href: "/fitness",
    label: "Fitness",
    icon: Dumbbell,
    subItems: [
      { href: "/fitness", label: "Dashboard" },
      { href: "/fitness/workout", label: "Entrenar" },
      { href: "/fitness/routines", label: "Rutinas" },
      { href: "/fitness/exercises", label: "Ejercicios" },
      { href: "/fitness/history", label: "Historial" },
      { href: "/fitness/progress", label: "Progreso" },
    ],
  },
  {
    href: "/tasks",
    label: "Productividad",
    icon: CheckSquare,
    subItems: [
      { href: "/tasks/today", label: "Vista Hoy" },
      { href: "/tasks", label: "Tareas" },
      { href: "/habits", label: "Hábitos" },
    ],
  },
  {
    href: "/finance",
    label: "Finanzas",
    icon: Wallet,
    subItems: [
      { href: "/finance", label: "Dashboard" },
      { href: "/finance/transactions", label: "Transacciones" },
      { href: "/finance/budgets", label: "Presupuestos" },
    ],
  },
  { href: "/notes", label: "Notas", icon: StickyNote },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && <span className="font-bold text-xl">LifeOS</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          
          if (item.subItems && !collapsed) {
            return (
              <Collapsible key={item.href} defaultOpen={isActive}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between px-3 py-2 h-auto text-sm font-medium",
                      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown size={16} className={cn("transition-transform", isActive ? "rotate-180" : "")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-9 pr-2 space-y-1 pt-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === subItem.href
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}