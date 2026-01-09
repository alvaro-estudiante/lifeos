"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  
  // No mostrar en dashboard principal ni en páginas raíz de secciones principales
  const hideOnPaths = ["/", "/dashboard"];
  if (hideOnPaths.includes(pathname)) return null;
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => router.back()}
      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors -ml-2"
    >
      <ChevronLeft className="h-5 w-5" />
    </motion.button>
  );
}
