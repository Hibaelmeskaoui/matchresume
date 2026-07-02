import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Upload,
  Link2,
  Wand2,
  Download,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100 via-white to-white" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
                <Sparkles className="h-4 w-4" />
                AI-Powered Resume Tailoring
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Land More Interviews with{" "}
                <span className="text-primary-600">AI-Tailored</span> Resumes
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
                Upload your resume, paste a job link, and get a perfectly
                tailored resume + cover letter in seconds. No more manual
                tweaking for every application.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
                >
                  Tailor Your Resume Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
                >
                  See How It Works
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-accent-500" />
                  Privacy guaranteed
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-accent-500" />
                  Takes 10 seconds
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-accent-500" />
                  Docx + PDF output
                </span>
              </div>
            </div>
          </div>
          {/* Decorative gradient */}
          <div className="absolute -bottom-20 left-1/2 h-80 w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-100/50 to-transparent blur-3xl" />
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Three Simple Steps
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                No account needed to try. Just upload, paste, and download.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Upload,
                  title: "Upload Your Resume",
                  desc: "Upload your existing resume (PDF or DOCX). We'll extract and analyze your experience.",
                  step: "01",
                },
                {
                  icon: Link2,
                  title: "Paste a Job Link",
                  desc: "Drop the job description URL or paste the text. Our AI analyzes what the employer wants.",
                  step: "02",
                },
                {
                  icon: Wand2,
                  title: "Get Tailored Results",
                  desc: "Download your optimized resume and a compelling cover letter — ready to submit.",
                  step: "03",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary-100"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="mb-2 block text-sm font-semibold text-primary-600">
                    Step {item.step}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why MatchResume?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Because generic resumes don&apos;t get callbacks.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "ATS-Optimized",
                  desc: "Our AI naturally incorporates keywords from the job description so your resume passes automated screening systems.",
                },
                {
                  title: "Cover Letter Included",
                  desc: "Get a matching cover letter every time — no more staring at a blank page wondering what to write.",
                },
                {
                  title: "10 Seconds Flat",
                  desc: "Manual tailoring takes 20-30 minutes per application. We do it in 10 seconds. That's 200x faster.",
                },
                {
                  title: "Privacy First",
                  desc: "Your data is encrypted and never stored longer than needed. We don't train on your resume.",
                },
                {
                  title: "Editable Output",
                  desc: "Download as DOCX to make final tweaks in Word or Google Docs. Full control, zero lock-in.",
                },
                {
                  title: "Works for Any Role",
                  desc: "From entry-level to executive, tech to healthcare — our AI handles any industry and any seniority level.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-2xl bg-primary-600 px-8 py-12 text-center sm:grid-cols-3 sm:py-16">
              <div>
                <p className="text-4xl font-bold text-white">10x</p>
                <p className="mt-2 text-primary-100">More interview callbacks</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">10s</p>
                <p className="mt-2 text-primary-100">Per tailored resume</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">$9.99</p>
                <p className="mt-2 text-primary-100">One-time, no subscription</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to Land Your Next Role?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Stop sending generic resumes that get ignored. Start tailoring
                each application in seconds.
              </p>
              <div className="mt-10">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
                >
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
