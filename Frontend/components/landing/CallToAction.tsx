"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CallToAction() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-indigo-700" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Animated glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ready for clinical workflows
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
            Start building safer
            <br />
            clinical summaries today.
          </h2>

          <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join clinical teams who trust Clinote AI to surface what matters, flag what&apos;s
            uncertain, and leave every decision with the clinician.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-teal-700 hover:bg-teal-50 border-transparent shadow-lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Dashboard
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-transparent text-white border-white/40 hover:bg-white/10"
                variant="outline"
              >
                Try New Analysis
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
