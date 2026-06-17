"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white border-transparent hover:bg-teal-500 shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md",
  ghost: "bg-transparent text-slate-600 border-transparent hover:bg-slate-100",
  danger:
    "bg-rose-600 text-white border-transparent hover:bg-rose-500 shadow-sm hover:shadow-md",
  outline: "bg-transparent text-teal-600 border-teal-600 hover:bg-teal-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2.5",
};

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
}
