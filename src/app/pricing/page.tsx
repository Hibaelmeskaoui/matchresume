"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "singleResume",
    variantKey: "singleResume" as const,
    name: "Single Resume",
    price: 9.99,
    description: "Perfect for one-off tailoring needs.",
    features: [
      "1 tailored resume",
      "Matching cover letter",
      "DOCX + PDF download",
      "ATS-optimized",
      "No account required",
    ],
    highlighted: false,
    cta: "Get One Resume",
  },
  {
    id: "unlimitedMonthly",
    variantKey: "unlimitedMonthly" as const,
    name: "Unlimited",
    price: 19.0,
    description: "For active job seekers applying everywhere.",
    features: [
      "Unlimited resumes",
      "Unlimited cover letters",
      "DOCX + PDF download",
      "ATS-optimized",
      "Priority AI processing",
      "Cancel anytime",
    ],
    highlighted: true,
    cta: "Start Unlimited",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(variantKey: string, planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantKey }),
      });

      if (res.status === 401) {
        // Redirect to sign in
        window.location.href = "/sign-in?redirect=/pricing";
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              Simple Pricing
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              One Resume or Unlimited?
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Pick what fits your job hunt. No hidden fees, no surprise charges.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-6 lg:mx-auto lg:max-w-4xl">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border p-8 shadow-sm transition-all hover:shadow-lg",
                  plan.highlighted
                    ? "border-primary-200 bg-white ring-1 ring-primary-500"
                    : "border-gray-100 bg-white"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {plan.id === "singleResume" ? "one-time" : "/month"}
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan.variantKey, plan.id)}
                  disabled={loading === plan.id}
                  className={cn(
                    "mt-8 w-full rounded-full py-3 text-sm font-semibold transition-all",
                    plan.highlighted
                      ? "bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:shadow-lg"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? "Processing..." : plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              🔒 Secure checkout powered by Lemon Squeezy. 30-day satisfaction guarantee.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
