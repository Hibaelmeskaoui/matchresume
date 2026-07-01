import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GenerateInput {
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
}

export interface GenerateOutput {
  tailoredResume: string;
  coverLetter: string;
}

export async function generateTailoredContent(
  input: GenerateInput
): Promise<GenerateOutput> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const resumePrompt = `
You are an expert career coach and resume writer. Your task is to tailor a resume to a specific job description.

RESUME TO TAILOR:
"""
${input.resumeText}
"""

JOB DESCRIPTION:
"""
${input.jobDescription}
"""

${input.jobTitle ? `JOB TITLE: ${input.jobTitle}` : ""}
${input.companyName ? `COMPANY: ${input.companyName}` : ""}

INSTRUCTIONS:
1. Rewrite the resume to highlight skills and experiences most relevant to this job
2. Use keywords from the job description naturally throughout
3. Keep the same basic structure (work history, education, skills) but optimize content
4. Use strong action verbs and quantifiable achievements
5. Keep it to ONE page
6. Output ONLY the tailored resume content in plain text format — no commentary
7. Format with clear section headers using **Section Name** pattern
`;

  const coverLetterPrompt = `
You are an expert career coach and cover letter writer. Your task is to write a compelling, tailored cover letter.

RESUME:
"""
${input.resumeText}
"""

JOB DESCRIPTION:
"""
${input.jobDescription}
"""

${input.companyName ? `COMPANY: ${input.companyName}` : ""}

INSTRUCTIONS:
1. Write a professional cover letter (3-4 paragraphs)
2. Open with a strong hook mentioning the role and company
3. Connect the candidate's experience to the job requirements
4. Show enthusiasm and specific knowledge about the company/role
5. End with a confident call to action
6. Keep it under 400 words
7. Output ONLY the cover letter content — no subject line or "Dear Hiring Manager" commentary
8. Use "Dear Hiring Manager" as the salutation
`;

  try {
    const [resumeResult, coverResult] = await Promise.all([
      model.generateContent(resumePrompt),
      model.generateContent(coverLetterPrompt),
    ]);

    const tailoredResume =
      resumeResult.response.text() || "Failed to generate resume.";
    const coverLetter =
      coverResult.response.text() || "Failed to generate cover letter.";

    return { tailoredResume, coverLetter };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
}
