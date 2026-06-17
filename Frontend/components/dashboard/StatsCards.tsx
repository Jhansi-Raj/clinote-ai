"use client";

import { motion } from "framer-motion";
import { BarChart3, AlertCircle, Flag, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { statCards } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  AlertCircle,
  Flag,
  Zap,
};

const colorMap: Record<string, { bg: string; icon: string; trend: string }> = {
  teal: { bg: "bg-teal-50", icon: "text-teal-600", trend: "text-teal-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", trend: "text-amber-600" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", trend: "text-rose-600" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", trend: "text-indigo-600" },
};

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, i) => {
        const Icon = iconMap[card.icon] ?? BarChart3;
        const colors = colorMap[card.color] ?? colorMap.teal;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="bg-white rounded-xl border border-slate-200 shadow-card p-5 hover:shadow-card-hover transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  colors.bg
                )}
              >
                <Icon className={cn("w-5 h-5", colors.icon)} />
              </div>
              {card.trendUp ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{card.value}</p>
            <p className="text-sm font-medium text-slate-600 mb-2">{card.label}</p>
            <p className={cn("text-xs font-medium", colors.trend)}>{card.trend}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
