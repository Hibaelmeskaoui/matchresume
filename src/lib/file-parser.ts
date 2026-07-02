import * as pdfjs from "pdfjs-dist";

// Set worker path — copied from node_modules during build
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return extractFromPdf(file);
    case "docx":
      return extractFromDocx(file);
    default:
      // Try reading as plain text (for .txt fallback)
      return file.text();
  }
}

async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const doc = await pdfjs.getDocument(data).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is { str: string } & typeof item => "str" in item)
      .map((item) => item.str)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
