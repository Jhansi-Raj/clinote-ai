import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import WhySafetyMatters from "@/components/landing/WhySafetyMatters";
import CallToAction from "@/components/landing/CallToAction";

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhySafetyMatters />
      <CallToAction />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 Clinote AI. All outputs are drafts for clinician review.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
              Terms
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
              HIPAA
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
