import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({ children, className, hoverable = false, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-card",
        hoverable && "transition-shadow duration-200 hover:shadow-card-hover cursor-pointer",
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
