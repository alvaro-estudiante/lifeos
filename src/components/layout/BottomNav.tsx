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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/nutrition", label: "Nutri", icon: Utensils },
  { href: "ACTION", label: "", icon: Plus }, // Placeholder for FAB
  { href: "/fitness", label: "Fit", icon: Dumbbell },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isFabOpen, setIsFabOpen] = useState(false);

  const actions = [
    { icon: Utensils, label: "Comida", href: "/nutrition/meals", color: "bg-emerald-500" },
    { icon: CheckSquare, label: "Tarea", href: "/tasks", color: "bg-amber-500" },
    { icon: Dumbbell, label: "Entreno", href: "/fitness/workout", color: "bg-blue-500" },
  ];

  const handleAction = (href: string) => {
    setIsFabOpen(false);
    router.push(href);
  };

  return (
    <>
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
            <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-4 md:hidden pointer-events-none">
              {actions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  onClick={() => handleAction(action.href)}
                  className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full ${action.color} text-white shadow-lg`}
                >
                  <action.icon size={20} />
                  <span className="font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-end justify-around border-t border-border bg-background/80 px-2 backdrop-blur-xl pb-safe md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item, index) => {
          if (item.href === "ACTION") {
            return (
              <div key="fab" className="relative -top-5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFabOpen(!isFabOpen)}
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
                    isFabOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <motion.div
                    animate={{ rotate: isFabOpen ? 135 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={28} />
                  </motion.div>
                </motion.button>
              </div>
            );
          }

          const isActive =
            item.href === "/"
              ? pathname === "/"
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
                  className="absolute top-0 h-[2px] w-8 rounded-full bg-primary"
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