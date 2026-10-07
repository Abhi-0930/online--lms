import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Footer } from "@/landing/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to PrepPath</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-bold font-display text-slate-900">PrepPath</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Terms of Service</h1>
              <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
              <p>
                By creating an account, browsing, or purchasing any educational course or cohort on PrepPath (<a href="https://www.preppath.net" className="text-blue-600 hover:underline">https://www.preppath.net</a>), you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Eligibility & Account Security</h2>
              <p>
                You must provide accurate and complete registration details. You are responsible for maintaining the confidentiality of your login credentials and are fully responsible for all activities that occur under your account. Sharing accounts or redistributing proprietary course videos is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Intellectual Property Rights</h2>
              <p>
                All course content, problem sets, video recordings, code starter kits, visual assets, diagrams, and brand logos on PrepPath are the exclusive intellectual property of PrepPath. Enrolled students are granted a personal, non-exclusive, non-transferable license to access the materials solely for individual educational learning.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Purchases & Payments</h2>
              <p>
                Course fees are clearly displayed on the platform in INR (₹) or supported local currencies. Payments are processed in real-time through verified PCI-DSS compliant payment gateways (Razorpay). Upon successful payment, instant course access is granted to your registered account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. User Code of Conduct</h2>
              <p>
                Learners must maintain professional and respectful behavior in all community chat channels, live session Q&As, and 1:1 mentorship meetings. Harassment, spamming, unauthorized commercial solicitation, or malicious code submissions will lead to immediate account termination without refund.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">6. Limitation of Liability</h2>
              <p>
                PrepPath provides training and interview preparation resources designed to elevate technical skills. While we offer rigorous placement guidance and mock interview rubrics, employment outcomes depend on individual learner performance, industry hiring market dynamics, and independent employer evaluations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">7. Contact Details</h2>
              <p>
                For questions regarding our terms, write to us at:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 text-sm">
                <p className="font-semibold text-slate-900">PrepPath Legal Team</p>
                <p className="text-slate-600 mt-1">Email: <a href="mailto:hello@preppath.net" className="text-blue-600 hover:underline">hello@preppath.net</a></p>
                <p className="text-slate-600">Phone: <a href="tel:+916302160783" className="text-blue-600 hover:underline">+91 6302160783</a></p>
                <p className="text-slate-600">Location: Hyderabad, Telangana, India</p>
                <p className="text-slate-600">Platform: <a href="https://www.preppath.net" className="text-blue-600 hover:underline">https://www.preppath.net</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
