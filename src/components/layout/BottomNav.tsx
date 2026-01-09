"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  Plus,
  MoreHorizontal,
  Wallet,
  FileText,
  User,
  Settings,
  Target,
  Calendar,
  Sparkles,
  Trophy,
  ListTodo,
  X,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const mainNavItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/nutrition", label: "Nutri", icon: Utensils },
  { href: "ACTION", label: "", icon: Plus },
  { href: "/dashboard/fitness", label: "Fitness", icon: Dumbbell },
  { href: "MORE", label: "Más", icon: MoreHorizontal },
];

const moreMenuSections = [
  {
    title: "Productividad",
    items: [
      { href: "/dashboard/tasks/today", label: "Vista Hoy", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
      { href: "/dashboard/tasks", label: "Todas las Tareas", icon: ListTodo, color: "text-blue-500", bg: "bg-blue-500/10" },
      { href: "/dashboard/tasks/calendar", label: "Calendario", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
      { href: "/dashboard/habits", label: "Hábitos", icon: Target, color: "text-pink-500", bg: "bg-pink-500/10" },
      { href: "/dashboard/habits/stats", label: "Estadísticas", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/dashboard/finance", label: "Mis Finanzas", icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { href: "/dashboard/reports", label: "Reportes", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-500/10" },
      { href: "/dashboard/profile", label: "Mi Perfil", icon: User, color: "text-cyan-500", bg: "bg-cyan-500/10" },
      { href: "/dashboard/settings", label: "Ajustes", icon: Settings, color: "text-gray-500", bg: "bg-gray-500/10" },
    ],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const quickActions = [
    { icon: Utensils, label: "Añadir Comida", href: "/dashboard/nutrition/meals", color: "bg-emerald-500", emoji: "🍽️" },
    { icon: CheckSquare, label: "Nueva Tarea", href: "/dashboard/tasks", color: "bg-amber-500", emoji: "✅" },
    { icon: Dumbbell, label: "Entrenar", href: "/dashboard/fitness/workout", color: "bg-blue-500", emoji: "💪" },
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsFabOpen(false)}
            />
            <div className="fixed bottom-28 left-0 right-0 z-50 flex flex-col items-center gap-3 md:hidden pointer-events-none px-4">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.8 }}
                  transition={{ delay: (quickActions.length - 1 - i) * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => handleAction(action.href)}
                  className={cn(
                    "pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl text-white shadow-2xl active:scale-95 transition-transform w-full max-w-[280px]",
                    action.color
                  )}
                >
                  <span className="text-2xl">{action.emoji}</span>
                  <span className="font-semibold">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* More Menu Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-[28px] px-0 md:hidden">
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mb-2" />
          <SheetHeader className="px-5 pb-3">
            <SheetTitle className="text-left text-lg font-bold">Menú</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full pb-24 px-4">
            {moreMenuSections.map((section, sectionIndex) => (
              <div key={section.title} className={cn("pb-4", sectionIndex > 0 && "pt-2")}>
                <h3 className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMoreNavigation(item.href)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "p-2.5 rounded-xl",
                          isActive ? "bg-primary-foreground/20" : item.bg
                        )}>
                          <item.icon 
                            size={22} 
                            className={isActive ? "text-primary-foreground" : item.color} 
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-medium text-center leading-tight",
                          isActive ? "text-primary-foreground" : "text-foreground"
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl border-t border-border" />
        
        {/* Nav content */}
        <div className="relative flex h-16 items-end justify-around px-2 pb-safe">
          {mainNavItems.map((item) => {
            // FAB Button
            if (item.href === "ACTION") {
              return (
                <div key="fab" className="relative -top-4 mx-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsFabOpen(!isFabOpen);
                      setIsMoreOpen(false);
                    }}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
                      isFabOpen 
                        ? "bg-foreground text-background" 
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <motion.div
                      animate={{ rotate: isFabOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus size={26} strokeWidth={2.5} />
                    </motion.div>
                  </motion.button>
                </div>
              );
            }

            // More Button
            if (item.href === "MORE") {
              const hasActiveInMore = moreMenuSections.some(section => 
                section.items.some(menuItem => pathname.startsWith(menuItem.href))
              );
              
              return (
                <button
                  key="more"
                  onClick={() => {
                    setIsMoreOpen(true);
                    setIsFabOpen(false);
                  }}
                  className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 active:scale-95 transition-transform h-full max-w-[72px]"
                >
                  {hasActiveInMore && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute top-0 h-[3px] w-8 rounded-full bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    hasActiveInMore ? "text-primary" : "text-muted-foreground"
                  )}>
                    <item.icon size={22} strokeWidth={hasActiveInMore ? 2.5 : 2} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    hasActiveInMore ? "text-primary" : "text-muted-foreground"
                  )}>
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
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 active:scale-95 transition-transform h-full max-w-[72px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 h-[3px] w-8 rounded-full bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
