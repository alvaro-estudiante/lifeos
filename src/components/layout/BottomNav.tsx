"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  CheckSquare,
  Plus,
  MoreHorizontal,
  Wallet,
  FileText,
  User,
  Settings,
  X,
  Target,
  Calendar,
  History,
  Sparkles,
  ShoppingBasket,
  Trophy,
  ListTodo,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const mainNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/nutrition", label: "Nutri", icon: Utensils },
  { href: "ACTION", label: "", icon: Plus },
  { href: "/dashboard/fitness", label: "Fit", icon: Dumbbell },
  { href: "MORE", label: "Más", icon: MoreHorizontal },
];

const moreMenuSections = [
  {
    title: "Productividad",
    items: [
      { href: "/dashboard/tasks/today", label: "Vista Hoy", icon: Sparkles },
      { href: "/dashboard/tasks", label: "Todas las Tareas", icon: ListTodo },
      { href: "/dashboard/tasks/calendar", label: "Calendario", icon: Calendar },
      { href: "/dashboard/habits", label: "Hábitos", icon: Target },
      { href: "/dashboard/habits/stats", label: "Estadísticas Hábitos", icon: Trophy },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/dashboard/finance", label: "Dashboard Finanzas", icon: Wallet },
    ],
  },
  {
    title: "Otros",
    items: [
      { href: "/dashboard/reports", label: "Reportes", icon: FileText },
      { href: "/dashboard/profile", label: "Perfil", icon: User },
      { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
    ],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const quickActions = [
    { icon: Utensils, label: "Registrar Comida", href: "/dashboard/nutrition/meals", color: "bg-emerald-500" },
    { icon: CheckSquare, label: "Nueva Tarea", href: "/dashboard/tasks", color: "bg-amber-500" },
    { icon: Dumbbell, label: "Empezar Entreno", href: "/dashboard/fitness/workout", color: "bg-blue-500" },
  ];

  const handleAction = (href: string) => {
    setIsFabOpen(false);
    router.push(href);
  };

  const handleMoreNavigation = (href: string) => {
    setIsMoreOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* FAB Quick Actions Overlay */}
      <AnimatePresence>
        {isFabOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsFabOpen(false)}
            />
            <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-3 md:hidden pointer-events-none">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => handleAction(action.href)}
                  className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full ${action.color} text-white shadow-lg active:scale-95 transition-transform`}
                >
                  <action.icon size={20} />
                  <span className="font-medium text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* More Menu Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0 md:hidden">
          <SheetHeader className="px-6 pb-4 border-b">
            <SheetTitle className="text-left text-xl">Menú</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full pb-20">
            {moreMenuSections.map((section) => (
              <div key={section.title} className="py-4">
                <h3 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMoreNavigation(item.href)}
                        className={cn(
                          "w-full flex items-center gap-4 px-6 py-3 text-left transition-colors active:bg-muted/80",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-foreground hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-xl",
                          isActive ? "bg-primary/20" : "bg-muted"
                        )}>
                          <item.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                        </div>
                        <span className={cn(
                          "font-medium",
                          isActive && "text-primary"
                        )}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-end justify-around border-t border-border bg-background/95 px-2 backdrop-blur-xl pb-safe md:hidden shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
        {mainNavItems.map((item) => {
          // FAB Button
          if (item.href === "ACTION") {
            return (
              <div key="fab" className="relative -top-5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFabOpen(!isFabOpen)}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
                    isFabOpen 
                      ? "bg-muted text-foreground rotate-45" 
                      : "bg-primary text-primary-foreground"
                  )}
                  style={{ transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  <Plus size={28} strokeWidth={2.5} />
                </motion.button>
              </div>
            );
          }

          // More Button
          if (item.href === "MORE") {
            return (
              <button
                key="more"
                onClick={() => setIsMoreOpen(true)}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-transform h-full pb-3"
              >
                <div className="rounded-xl p-1 text-muted-foreground">
                  <item.icon size={24} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </button>
            );
          }

          // Regular Nav Items
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-transform h-full pb-3"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 h-[3px] w-10 rounded-full bg-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "rounded-xl p-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all"
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
