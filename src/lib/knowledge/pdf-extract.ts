import "server-only";

import { PDFParse } from "pdf-parse";

export type ExtractedPage = { pageNumber: number; text: string };
export type ExtractedPdf = { pages: ExtractedPage[]; fullText: string };

export class PdfTextExtractionError extends Error {
  constructor(message = "לא ניתן לחלץ טקסט מהקובץ. ייתכן שה-PDF סרוק ודורש OCR.") {
    super(message);
    this.name = "PdfTextExtractionError";
  }
}

export async function extractPdfText(bytes: Buffer): Promise<ExtractedPdf> {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    const pages = result.pages
      .map((page) => ({ pageNumber: page.num, text: page.text.replace(/\s+/g, " ").trim() }))
      .filter((page) => page.text.length > 0);

    const fullText = pages.map((page) => page.text).join("\n\n");
    if (!fullText.trim()) {
      throw new PdfTextExtractionError();
    }

    return { pages, fullText };
  } finally {
    await parser.destroy();
  }
}
