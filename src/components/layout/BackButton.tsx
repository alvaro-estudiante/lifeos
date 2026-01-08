"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  
  // No mostrar en dashboard principal
  if (pathname === "/") return null;
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => router.back()}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors pr-2"
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-sm hidden sm:inline">Atrás</span>
    </motion.button>
  );
}