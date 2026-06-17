"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Clinote AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Safety", "Pricing"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </a>
            <Link href="/dashboard">
              <Button size="sm" variant="primary">
                Get Access
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 py-4 space-y-3"
          >
            {["Features", "How It Works", "Safety", "Pricing"].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-sm font-medium text-slate-700 hover:text-teal-600 py-1"
              >
                {item}
              </a>
            ))}
            <Link href="/dashboard" className="block">
              <Button variant="primary" className="w-full">
                Get Access
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
