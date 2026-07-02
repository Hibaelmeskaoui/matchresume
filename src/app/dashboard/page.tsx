"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Upload, Link2, FileText, Download, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDocx, generatePlainText } from "@/lib/documents";
import { extractTextFromFile } from "@/lib/file-parser";
import { saveAs } from "file-saver";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobLink, setJobLink] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    tailoredResume: string;
    coverLetter: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type.includes("pdf") || f.type.includes("document"))) {
      setFile(f);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const readFileContent = async (file: File): Promise<string> => {
    try {
      return await extractTextFromFile(file);
    } catch {
      // Fallback: try plain text
      return file.text();
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a resume");
      return;
    }
    if (!jobLink && !jobDescription.trim()) {
      setError("Please paste a job link or description");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const resumeText = await readFileContent(file);
      const desc = jobDescription.trim() || `Job link: ${jobLink}`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: desc,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Generation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    if (!result) return;
    generateDocx(result.tailoredResume, "tailored-resume.docx").then((blob) => {
      saveAs(blob, "tailored-resume.docx");
    });
  };

  const downloadCoverLetter = () => {
    if (!result) return;
    generateDocx(result.coverLetter, "cover-letter.docx").then((blob) => {
      saveAs(blob, "cover-letter.docx");
    });
  };

  const downloadAsPdf = (content: string, filename: string) => {
    // Simple text fallback — real PDF gen would use an API
    const text = generatePlainText(content);
    const blob = new Blob([text], { type: "text/plain" });
    saveAs(blob, filename.replace(".pdf", ".txt"));
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tailor Your Resume
            </h1>
            <p className="mt-2 text-gray-600">
              Upload, paste, and let AI do the heavy lifting.
            </p>
          </div>

          {/* Upload + Input area */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Resume upload */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById("resume-upload")?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all",
                file
                  ? "border-accent-200 bg-accent-50"
                  : "border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50"
              )}
            >
              {file ? (
                <>
                  <FileText className="mb-3 h-10 w-10 text-accent-500" />
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-3 text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <Upload className="mb-3 h-10 w-10 text-gray-400" />
                  <p className="font-medium text-gray-700">
                    Drop your resume here
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    or click to browse (PDF, DOCX)
                  </p>
                </>
              )}
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Job input */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Link2 className="h-4 w-4" />
                  Job Link (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/..."
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Or paste the job description
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-base font-semibold shadow-lg transition-all",
                loading || !file
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tailoring...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Tailor My Resume
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-12 space-y-8">
              <div className="text-center">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700">
                  <Sparkles className="h-4 w-4" />
                  Ready! Download below
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Tailored Resume */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Tailored Resume
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Your resume rewritten for this specific role.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadResume}
                      className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                    >
                      <Download className="h-4 w-4" />
                      DOCX
                    </button>
                    <button
                      onClick={() =>
                        downloadAsPdf(
                          result.tailoredResume,
                          "tailored-resume.pdf"
                        )
                      }
                      className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </div>
                  <div className="mt-4 max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
                    <pre className="whitespace-pre-wrap font-sans">
                      {result.tailoredResume}
                    </pre>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Cover Letter
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    A matching cover letter for this application.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadCoverLetter}
                      className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                    >
                      <Download className="h-4 w-4" />
                      DOCX
                    </button>
                    <button
                      onClick={() =>
                        downloadAsPdf(
                          result.coverLetter,
                          "cover-letter.pdf"
                        )
                      }
                      className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </div>
                  <div className="mt-4 max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
                    <pre className="whitespace-pre-wrap font-sans">
                      {result.coverLetter}
                    </pre>
                  </div>
                </div>
              </div>

              {/* New one */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setJobLink("");
                    setJobDescription("");
                  }}
                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                  Tailor another resume →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
