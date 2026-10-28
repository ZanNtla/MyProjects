import fs from "node:fs/promises";

const { PDFParse } = require("pdf-parse");

export class ResumeParserService {
  async extractTextFromPdf(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: fileBuffer });
    const parsed = await parser.getText();
    const extracted = parsed.text?.trim() ?? "";

    if (!extracted) {
      throw new Error("Resume extraction failed");
    }

    return extracted;
  }
}
