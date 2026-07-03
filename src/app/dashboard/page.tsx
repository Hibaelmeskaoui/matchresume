"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { Upload, FileText, Download, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDocx, generatePlainText } from "@/lib/documents";
import { extractTextFromFile } from "@/lib/file-parser";
import { saveAs } from "file-saver";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    tailoredResume: string;
    coverLetter: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [parsingFile, setParsingFile] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    plan: string;
    resumesLeft?: number;
  } | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);
  const [freeTrialReady, setFreeTrialReady] = useState(false);

  useEffect(() => {
    const used = localStorage.getItem("matchresume_free_trial") === "true";
    setFreeTrialUsed(used);
    setFreeTrialReady(true);
    fetch("/api/check-subscription")
      .then((r) => r.json())
      .then((data) => setSubscription(data))
      .catch(() => setSubscription({ subscribed: false, plan: "none" }))
      .finally(() => setCheckingSub(false));
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type.includes("pdf") || f.type.includes("document"))) {
      setFile(f);
      extractFile(f);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      extractFile(f);
    }
  };

  const extractFile = async (f: File) => {
    setParsingFile(true);
    setResumeText("");
    try {
      const text = await extractTextFromFile(f);
      setResumeText(text);
    } catch {
      setResumeText("[Could not extract text from this file]");
    }
    setParsingFile(false);
  };

  const canUseFreeTrial = !subscription?.subscribed && !freeTrialUsed;

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a resume");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description");
      return;
    }

    if (!subscription?.subscribed && freeTrialUsed) {
      setError("Free trial used — please subscribe to continue");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText,
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Generation failed");
      }

      const data = await res.json();
      setResult(data);

      // Mark free trial as used after successful generation
      if (!subscription?.subscribed && !freeTrialUsed) {
        localStorage.setItem("matchresume_free_trial", "true");
        setFreeTrialUsed(true);
      }
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

  const downloadAsPdf = async (content: string, filename:string) => {
    const { PDFDocument, StandardFonts } = await import("pdf-lib");

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 11;
    const boldSize = 14;
    const margin = 50;
    const pageWidth = 595; // A4
    const pageHeight = 842;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = fontSize * 1.5;

    // Split into lines with word wrapping
    const words = content.split(" ");
    const lines: { text: string; bold: boolean }[] = [];
    let currentLine = "";

    for (const word of words) {
      const isHeader = word.startsWith("**") && word.endsWith("**");
      const displayWord = word.replace(/\*\*/g, "");
      const testLine = currentLine ? currentLine + " " + displayWord : displayWord;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && currentLine) {
        lines.push({ text: currentLine.trim(), bold: false });
        currentLine = displayWord;
      } else {
        currentLine = testLine;
      }

      if (isHeader) {
        lines.push({ text: currentLine.trim().replace(/\*\*/g, ""), bold: true });
        currentLine = "";
      }
    }
    if (currentLine.trim()) {
      lines.push({ text: currentLine.trim(), bold: false });
    }

    // Render pages
    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const line of lines) {
      const f = line.bold ? boldFont : font;
      const s = line.bold ? boldSize : fontSize;
      const h = line.bold ? s * 1.4 : lineHeight;

      if (y - h < margin) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      page.drawText(line.text, {
        x: margin,
        y: y - h,
        size: s,
        font: f,
        color: { r: 0, g: 0, b: 0 } as any,
      });

      y -= h + (line.bold ? 6 : 2);
    }

    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    saveAs(blob, filename);
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

          {/* Subscription / Free trial status */}
          {checkingSub || !freeTrialReady ? null : !subscription?.subscribed && freeTrialUsed && (
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Subscribe to Continue
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You've used your free trial. Subscribe to keep tailoring resumes.
              </p>
              <a
                href="/pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-700"
              >
                View Plans
              </a>
            </div>
          )}

          {/* Free trial banner */}
          {checkingSub || !freeTrialReady ? null : !subscription?.subscribed && !freeTrialUsed && (
            <div className="mb-8 rounded-xl border border-accent-200 bg-accent-50 p-6 text-center">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                🎉 Free Trial — Try It Once!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                No credit card needed. Tailor one resume for free, then subscribe to unlock unlimited use.
              </p>
            </div>
          )}

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
                    {parsingFile && " • Parsing..."}
                    {!parsingFile && resumeText && " • Parsed ✓"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setResumeText("");
                      setPreviewOpen(false);
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

            {/* Job description */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" />
                Job Description
              </label>
              <textarea
                rows={10}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {/* Resume preview */}
          {file && resumeText && (
            <div className="mt-6">
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <FileText className="h-4 w-4" />
                {previewOpen ? "Hide" : "Preview"} resume text ({resumeText.split(" ").length} words)
                <span className="text-xs text-gray-400">{previewOpen ? "▲" : "▼"}</span>
              </button>
              {previewOpen && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
                  <pre className="whitespace-pre-wrap font-sans">{resumeText}</pre>
                </div>
              )}
            </div>
          )}

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
              disabled={loading || !file || (!subscription?.subscribed && freeTrialUsed)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-base font-semibold shadow-lg transition-all",
                loading || !file || (!subscription?.subscribed && freeTrialUsed)
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
                  <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-white p-6 text-sm leading-relaxed text-gray-800 shadow-inner">
                    <RenderPreview content={result.tailoredResume} />
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
                  <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-white p-6 text-sm leading-relaxed text-gray-800 shadow-inner">
                    <RenderPreview content={result.coverLetter} />
                  </div>
                </div>
              </div>

              {/* New one */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setResumeText("");
                    setPreviewOpen(false);
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

function RenderPreview({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-0">
      {lines.map((line, i) => {
        // Empty line → spacing
        if (!line.trim()) {
          return <div key={i} className="h-3" />;
        }

        // Bold markers → formatted heading
        const boldMatch = line.match(/^\*\*(.+?)\*\*$/);
        if (boldMatch) {
          return (
            <p key={i} className="mb-1 mt-2 font-bold text-gray-900 first:mt-0" style={{ fontSize: "1rem" }}>
              {boldMatch[1]}
            </p>
          );
        }

        // Bold markers at start of line (inline)
        const inlineBold = line.replace(/\*\*(.+?)\*\*/g, (_, boldText) => boldText);

        // Bullet points
        if (line.trimStart().startsWith("-") || line.trimStart().startsWith("•")) {
          const bulletText = line.trimStart().replace(/^[-•]\s*/, "");
          return (
            <div key={i} className="flex gap-2 pl-4">
              <span className="mt-0.5 text-gray-400">•</span>
              <span className="flex-1">{inlineBold}</span>
            </div>
          );
        }

        // Normal text
        return (
          <p key={i} className="text-gray-700">
            {inlineBold}
          </p>
        );
      })}
    </div>
  );
}
