import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export function generateDocx(
  content: string,
  fileName: string = "tailored-resume.docx"
): Promise<Blob> {
  const lines = content.split("\n").filter((line) => line.trim());

  const children: Paragraph[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // Section headers (marked with ** or ALL CAPS common sections)
    if (
      (line.startsWith("**") && line.endsWith("**")) ||
      isSectionHeader(line)
    ) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/\*\*/g, ""),
              bold: true,
              size: 28,
            }),
          ],
        })
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      // Bullet points
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(2),
              size: 22,
            }),
          ],
          bullet: { level: 0 },
          spacing: { before: 80, after: 80 },
        })
      );
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22,
            }),
          ],
          spacing: { before: 120, after: 120 },
        })
      );
    }

    i++;
  }

  const doc = new Document({
    title: "Tailored Resume",
    description: "AI-tailored resume",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

function isSectionHeader(line: string): boolean {
  const headers = [
    "experience",
    "education",
    "skills",
    "summary",
    "professional summary",
    "work history",
    "projects",
    "certifications",
    "languages",
    "contact",
  ];
  const lower = line.toLowerCase().replace(/[:\s]/g, "");
  return headers.some((h) => lower === h);
}

export function downloadAsDocx(content: string, filename: string) {
  generateDocx(content, filename).then((blob) => {
    saveAs(blob, filename);
  });
}

export function generatePlainText(content: string): string {
  return content.replace(/\*\*/g, "").trim();
}
