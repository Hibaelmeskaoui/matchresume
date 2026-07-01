"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle, Sparkles } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const plans = [
  {
    id: "oneTime",
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
    id: "monthly",
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
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">(
    "stripe"
  );

  async function handleStripeCheckout(priceId: string, planId: string) {
    setLoading(planId);
    try {
      // For now, redirect to a placeholder — webhook setup needed for full Stripe
      // In production, call your API to create a Stripe Checkout Session
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
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

          {/* Payment method toggle */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setPaymentMethod("stripe")}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-all",
                  paymentMethod === "stripe"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                💳 Card (Stripe)
              </button>
              <button
                onClick={() => setPaymentMethod("paypal")}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-all",
                  paymentMethod === "paypal"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                🅿️ PayPal
              </button>
            </div>
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
                    {plan.id === "oneTime" ? "one-time" : "/month"}
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
                  onClick={() => {
                    const pid =
                      plan.id === "oneTime"
                        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ONETIME_ID || "price_onetime"
                        : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID || "price_monthly";
                    handleStripeCheckout(pid, plan.id);
                  }}
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
              🔒 Secure checkout via {paymentMethod === "stripe" ? "Stripe" : "PayPal"}. 
              30-day satisfaction guarantee. No questions asked refunds.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
