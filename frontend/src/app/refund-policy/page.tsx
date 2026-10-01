import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Footer } from "@/landing/Footer";

export default function RefundPolicyPage() {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Cancellation & Refund Policy</h1>
              <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Refund Eligibility Window</h2>
              <p>
                At PrepPath, we are committed to providing top-tier technical education. We offer a transparent <strong>7-Day No-Questions-Asked Refund Window</strong> from the date of course purchase or cohort enrollment.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Conditions for Refund</h2>
              <p>To qualify for a 100% refund within the 7-day period:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Your refund request must be submitted via email within 7 calendar days of enrollment.</li>
                <li>Less than 25% of the course modules or video lectures have been consumed or marked completed.</li>
                <li>You have not downloaded proprietary offline assets or certificates.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Refund Processing Timeline</h2>
              <p>
                Once your refund request is received and verified by our billing team:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Approval will be processed within <strong>2 business days</strong>.</li>
                <li>Refund amounts are credited back directly to the original payment source (UPI, Credit/Debit Card, Net Banking) via Razorpay.</li>
                <li>Bank processing typically takes <strong>5 to 7 working days</strong> to reflect in your bank statement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. How to Request a Refund</h2>
              <p>
                To initiate a cancellation or refund, email our support team with your registered email address and Transaction/Order ID:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 text-sm">
                <p className="font-semibold text-slate-900">PrepPath Billing & Refunds</p>
                <p className="text-slate-600 mt-1">Email: <a href="mailto:support@preppath.net" className="text-blue-600 hover:underline">support@preppath.net</a></p>
                <p className="text-slate-600">Subject: <em>Refund Request - [Your Order ID]</em></p>
                <p className="text-slate-600 mt-1">Support Response Time: Within 24 hours</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
