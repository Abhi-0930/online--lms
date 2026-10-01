import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Footer } from "@/landing/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Simple Header */}
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Privacy Policy</h1>
              <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Overview</h2>
              <p>
                PrepPath (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by PrepPath when you access or use our website (
                <a href="https://preppath.net" className="text-blue-600 hover:underline">https://preppath.net</a>), learning platform, and related educational services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Information We Collect</h2>
              <p>We collect information you provide directly to us when registering an account, purchasing courses, or contacting our support team:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Account Credentials:</strong> Full name, email address, profile avatar, and encrypted password.</li>
                <li><strong>Learning Progress:</strong> Completed lessons, code submissions, practice problem metrics, assignment scores, and attendance records.</li>
                <li><strong>Transaction & Payment Records:</strong> Billing name, transaction identifiers, payment timestamps, and receipt records handled securely via our verified payment gateway partner (Razorpay). We do NOT store full credit/debit card numbers or CVVs on our servers.</li>
                <li><strong>Communication Data:</strong> Feedback forms, live chat queries, and email correspondence.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide, personalize, and improve course materials, interactive IDE execution, and mentorship sessions.</li>
                <li>Process payments, issue automated invoices, and prevent fraudulent transactions.</li>
                <li>Send vital operational notifications, live class reminders, and syllabus updates.</li>
                <li>Analyze aggregate usage patterns and telemetry to enhance platform speed and security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Data Sharing & Third-Party Services</h2>
              <p>
                We do not sell, rent, or trade your personal information to third parties. We may share data strictly with trusted service providers under confidentiality agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Payment Processors:</strong> Razorpay for secure checkout and invoicing.</li>
                <li><strong>Analytics Providers:</strong> Google Analytics (GA4) for aggregated site performance metrics.</li>
                <li><strong>Cloud Infrastructure:</strong> AWS and secure cloud hosting providers for database storage and code execution sandboxes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Data Retention & Security</h2>
              <p>
                We employ industry-standard encryption protocols (TLS/HTTPS in transit and AES-256 at rest) to safeguard your data. You may request account deletion or data export at any time by contacting our privacy officer.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contact Information</h2>
              <p>
                If you have questions or concerns regarding this Privacy Policy, please reach out to:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 text-sm">
                <p className="font-semibold text-slate-900">PrepPath Privacy Support</p>
                <p className="text-slate-600 mt-1">Email: <a href="mailto:support@preppath.net" className="text-blue-600 hover:underline">support@preppath.net</a></p>
                <p className="text-slate-600">Website: <a href="https://preppath.net" className="text-blue-600 hover:underline">https://preppath.net</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
