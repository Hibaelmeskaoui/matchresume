import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Built with Splic for job seekers
            </span>
          </div>
          <div className="flex gap-8">
            <Link
              href="/#how-it-works"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MatchResume. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
