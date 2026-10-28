import { cleanResumeText } from "../utils/textCleaner";

export interface ResumeIngestionRepositoryLike {
  insertResume(document: Record<string, unknown>): Promise<{ acknowledged: boolean; insertedId?: unknown }>;
}

export interface ResumeParserLike {
  parseResume(rawText: string): Record<string, unknown>;
}

export interface EmbeddingServiceLike {
  generateEmbedding(inputText: string): Promise<{ embedding: number[]; model: string; dimension: number }>;
}

export interface PdfExtractorLike {
  extractTextFromPdf(filePath: string): Promise<string>;
}

export interface IngestResumeResult {
  success: boolean;
  message: string;
  resumeId?: string;
  data?: Record<string, unknown>;
  timings: {
    extractMs: number;
    cleanMs: number;
    parseMs: number;
    embeddingMs: number;
    mongoInsertMs: number;
    totalMs: number;
  };
}

export class ResumeIngestionService {
  constructor(
    private readonly repository: ResumeIngestionRepositoryLike,
    private readonly pdfExtractor: PdfExtractorLike,
    private readonly parser: ResumeParserLike,
    private readonly embeddingService: EmbeddingServiceLike,
  ) {}

  async ingestResume(file: { path: string }): Promise<IngestResumeResult> {
    const startedAt = Date.now();
    const extractStarted = Date.now();
    const rawText = await this.pdfExtractor.extractTextFromPdf(file.path);
    const extractMs = Date.now() - extractStarted;

    const cleanStarted = Date.now();
    const cleanText = cleanResumeText(rawText);
    const cleanMs = Date.now() - cleanStarted;

    const parseStarted = Date.now();
    const resume = this.parser.parseResume(cleanText);
    const parseMs = Date.now() - parseStarted;

    const embeddingStarted = Date.now();
    const embeddingResult = await this.embeddingService.generateEmbedding(
      [
        String((resume as any).name ?? ""),
        String((resume as any).role ?? ""),
        Array.isArray((resume as any).skills) ? (resume as any).skills.join(", ") : "",
        String((resume as any).company ?? ""),
        String(cleanText),
      ].filter(Boolean).join("\n"),
    );
    const embeddingMs = Date.now() - embeddingStarted;

    const document = {
      fileName: file.path.split(/[\\/]/).pop() ?? "resume.pdf",
      rawText: cleanText,
      name: (resume as any).name,
      email: (resume as any).email ?? null,
      phone: (resume as any).phone ?? null,
      location: (resume as any).location ?? null,
      company: (resume as any).company,
      role: (resume as any).role,
      education: (resume as any).education,
      totalExperience: (resume as any).totalExperience ?? null,
      relevantExperience: (resume as any).relevantExperience ?? null,
      skills: Array.isArray((resume as any).skills) ? (resume as any).skills : [],
      jobTitles: Array.isArray((resume as any).jobTitles) ? (resume as any).jobTitles : [],
      experienceSummary: (resume as any).experienceSummary,
      embedding: embeddingResult.embedding,
      embeddingModel: embeddingResult.model,
      embeddingDimension: embeddingResult.dimension,
    };

    const mongoStarted = Date.now();
    const insertResult = await this.repository.insertResume(document);
    const mongoInsertMs = Date.now() - mongoStarted;

    return {
      success: true,
      message: "Resume ingestion completed",
      resumeId: String(insertResult.insertedId ?? ""),
      data: {
        name: document.name,
        role: document.role,
        company: document.company,
        totalExperience: document.totalExperience,
        skillsCount: document.skills.length,
        embeddingModel: document.embeddingModel,
        embeddingDimension: document.embeddingDimension,
      },
      timings: {
        extractMs,
        cleanMs,
        parseMs,
        embeddingMs,
        mongoInsertMs,
        totalMs: Date.now() - startedAt,
      },
    };
  }
}
