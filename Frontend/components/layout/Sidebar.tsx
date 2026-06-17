"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  History,
  FileText,
  Settings2,
  Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "New Analysis", icon: Plus },
  { href: "/results", label: "Past Runs", icon: History },
  { href: "/trace", label: "Audit Logs", icon: FileText },
  { href: "#", label: "Settings", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Clinote AI</span>
            <p className="text-slate-500 text-[10px] tracking-wider font-medium mt-0.5">
              SAFE AI. ALWAYS.
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 sidebar-scrollbar overflow-y-auto">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-300" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">SC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Dr. Sarah Chen</p>
            <p className="text-slate-500 text-xs truncate">Attending Physician</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
