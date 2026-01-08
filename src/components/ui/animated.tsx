"use client";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const FadeIn = ({ children, delay = 0, ...props }: FadeInProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const StaggerContainer = ({ children, ...props }: StaggerContainerProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: { transition: { staggerChildren: 0.05 } },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

interface SlideUpProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  isOpen: boolean;
}

export const SlideUp = ({ children, isOpen, ...props }: SlideUpProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        {...props}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const ScaleOnTap = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
  <motion.div whileTap={{ scale: 0.95 }} className={className} {...props}>
    {children}
  </motion.div>
);

interface CheckAnimationProps {
  checked: boolean;
  children: ReactNode;
}

export const CheckAnimation = ({ checked, children }: CheckAnimationProps) => (
  <motion.div
    initial={false}
    animate={checked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);