import { NextRequest, NextResponse } from "next/server";
import { generateTailoredContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription, jobTitle, companyName } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { message: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    const result = await generateTailoredContent({
      resumeText,
      jobDescription,
      jobTitle,
      companyName,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}
