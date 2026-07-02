import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MatchResume — AI Resume Tailor & Cover Letter Generator",
  description:
    "Upload your resume, paste a job link, and get a perfectly tailored resume + cover letter in seconds. Powered by AI.",
  openGraph: {
    title: "MatchResume — AI Resume Tailor",
    description: "Tailor your resume to any job in seconds with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
