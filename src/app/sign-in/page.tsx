"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-600">
                Sign in to your MatchResume account
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <button
                type="submit"
                onClick={(e) => e.preventDefault()}
                className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
              >
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary-600 hover:text-primary-800"
              >
                Sign up
              </Link>
            </p>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="text-center text-xs text-gray-400">
                Auth service coming soon — for now, try the{" "}
                <Link
                  href="/dashboard"
                  className="text-primary-600 hover:underline"
                >
                  dashboard
                </Link>{" "}
                directly.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
