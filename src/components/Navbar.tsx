"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Match<span className="text-primary-600">Resume</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Pricing
            </Link>

            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
              >
                Get Started
              </Link>
            </SignedOut>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-100 transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-2 px-4 py-4">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Pricing
          </Link>

          <SignedIn>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Dashboard
            </Link>
            <hr className="border-gray-100" />
            <div className="px-3 py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full bg-primary-600 px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
